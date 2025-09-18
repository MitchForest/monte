import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ApiErrorSchema } from "@monte/shared";
import { StudentXpSummaryResponseSchema } from "@monte/shared/student";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";
import {
  getStudentXpSummary,
  StudentXpUnavailableError,
} from "../services/students/xp";

const xpRouter = new OpenAPIHono();

const StudentXpQuerySchema = z.object({
  studentId: z.string().min(1).openapi({ description: "OneRoster student ID" }),
  startTime: z
    .string()
    .datetime({ offset: true })
    .optional()
    .openapi({ description: "ISO timestamp inclusive lower bound" }),
  endTime: z
    .string()
    .datetime({ offset: true })
    .optional()
    .openapi({ description: "ISO timestamp inclusive upper bound" }),
  eventType: z
    .string()
    .optional()
    .openapi({ description: "Optional event type" }),
  limit: z.coerce.number().int().min(1).max(500).optional().openapi({
    description: "Maximum number of events to include in the response",
  }),
});

const studentXpRoute = createRoute({
  method: "get",
  path: "/summary",
  tags: ["Student XP"],
  summary: "Summarise student XP activity",
  description:
    "Returns aggregated XP totals and the most recent learning events captured for a student.",
  request: {
    query: StudentXpQuerySchema,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "XP summary",
      content: {
        "application/json": {
          schema: StudentXpSummaryResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.unauthorized]: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.serviceUnavailable]: {
      description: "XP integration unavailable",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

xpRouter.openapi(studentXpRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      studentXpRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query");

  try {
    const summary = await getStudentXpSummary({
      studentId: query.studentId,
      startTime: query.startTime,
      endTime: query.endTime,
      eventType: query.eventType,
      limit: query.limit,
    });

    const responseBody = StudentXpSummaryResponseSchema.parse({
      data: summary,
    });
    return respond(studentXpRoute, c, responseBody);
  } catch (error) {
    if (error instanceof StudentXpUnavailableError) {
      return respond(
        studentXpRoute,
        c,
        { error: error.message },
        HTTP_STATUS.serviceUnavailable,
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch student XP summary";
    return respond(
      studentXpRoute,
      c,
      { error: message },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { xpRouter as studentXpRouter };
