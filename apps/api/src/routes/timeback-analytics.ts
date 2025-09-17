import "../lib/openapi";

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ApiErrorSchema } from "@monte/shared";
import {
  TimebackAnalyticsResponseSchema,
  TimebackAnalyticsSummarySchema,
} from "@monte/shared/timeback";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";
import { getStudentXpSummary } from "../services/timeback/analytics";

const AnalyticsQuerySchema = z.object({
  studentId: z.string().min(1, "studentId is required").openapi({
    description: "OneRoster user identifier",
    example: "student-123",
  }),
  startTime: z
    .string()
    .datetime({ offset: true })
    .optional()
    .openapi({ description: "ISO 8601 timestamp to filter from" }),
  endTime: z
    .string()
    .datetime({ offset: true })
    .optional()
    .openapi({ description: "ISO 8601 timestamp to filter to" }),
  eventType: z
    .string()
    .optional()
    .openapi({ description: "Optional Caliper event type filter" }),
  limit: z.coerce.number().int().min(1).max(500).optional().openapi({
    description: "Maximum number of events to return",
    example: 100,
  }),
});

type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

const analyticsRoute = createRoute({
  method: "get",
  path: "/xp",
  tags: ["Timeback Analytics"],
  summary: "Get student XP analytics",
  description:
    "Fetches Caliper analytics events for a student and aggregates XP earned.",
  request: {
    query: AnalyticsQuerySchema,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Timeback XP analytics",
      content: {
        "application/json": {
          schema: TimebackAnalyticsResponseSchema as unknown as z.ZodTypeAny,
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
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to fetch analytics",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const timebackAnalyticsRouter = new OpenAPIHono().openapi(
  analyticsRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        analyticsRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const query = c.req.valid("query") as AnalyticsQuery;

    try {
      const summary = await getStudentXpSummary({
        studentId: query.studentId,
        startTime: query.startTime,
        endTime: query.endTime,
        eventType: query.eventType,
        limit: query.limit,
      });

      const parsedSummary = TimebackAnalyticsSummarySchema.parse(summary);
      const responseBody = TimebackAnalyticsResponseSchema.parse({
        data: parsedSummary,
      });

      return respond(analyticsRoute, c, responseBody);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch Timeback analytics";
      return respond(
        analyticsRoute,
        c,
        { error: message },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

export { timebackAnalyticsRouter };
