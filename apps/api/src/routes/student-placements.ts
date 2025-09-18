import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ApiErrorSchema } from "@monte/shared";
import {
  StudentNextPlacementResponseSchema,
  StudentPlacementLevelResponseSchema,
  StudentPlacementProgressResponseSchema,
  StudentPlacementTestsResponseSchema,
} from "@monte/shared/student";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";
import {
  getStudentNextPlacement,
  getStudentPlacementLevel,
  getStudentPlacementProgress,
  getStudentPlacementTests,
  StudentPlacementNotAllowedError,
  StudentPlacementRequestError,
  StudentPlacementUnavailableError,
} from "../services/students/placements";

const placementsRouter = new OpenAPIHono();

const PlacementQuerySchema = z.object({
  studentId: z.string().min(1).openapi({ description: "OneRoster student ID" }),
  subject: z
    .string()
    .nullable()
    .optional()
    .openapi({ description: "Optional subject filter" }),
});

const placementsRoute = createRoute({
  method: "get",
  path: "/progress",
  tags: ["Student Placements"],
  summary: "List placement course progress",
  description:
    "Returns PowerPath placement progress for the learner across the selected subject.",
  request: {
    query: PlacementQuerySchema,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Course progress",
      content: {
        "application/json": {
          schema:
            StudentPlacementProgressResponseSchema as unknown as z.ZodTypeAny,
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
  },
});

placementsRouter.openapi(placementsRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      placementsRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query");

  try {
    const courses = await getStudentPlacementProgress({
      studentId: query.studentId,
      subject: query.subject ?? null,
    });

    const body = StudentPlacementProgressResponseSchema.parse({
      data: { courses },
    });

    return respond(placementsRoute, c, body);
  } catch (error) {
    if (error instanceof StudentPlacementNotAllowedError) {
      return respond(
        placementsRoute,
        c,
        { error: error.message },
        HTTP_STATUS.forbidden,
      );
    }

    if (error instanceof StudentPlacementUnavailableError) {
      return respond(
        placementsRoute,
        c,
        { error: error.message },
        HTTP_STATUS.serviceUnavailable,
      );
    }

    if (error instanceof StudentPlacementRequestError) {
      return respond(
        placementsRoute,
        c,
        { error: error.message },
        HTTP_STATUS.badGateway,
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch placement progress";
    return respond(
      placementsRoute,
      c,
      { error: message },
      HTTP_STATUS.internalServerError,
    );
  }
});

const currentLevelRoute = createRoute({
  method: "get",
  path: "/current-level",
  tags: ["Student Placements"],
  summary: "Current placement level",
  description:
    "Returns the learner's current placement mastery level for the selected subject.",
  request: {
    query: PlacementQuerySchema,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Current level",
      content: {
        "application/json": {
          schema:
            StudentPlacementLevelResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

placementsRouter.openapi(currentLevelRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      currentLevelRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query");

  try {
    const currentLevel = await getStudentPlacementLevel({
      studentId: query.studentId,
      subject: query.subject ?? null,
    });

    const body = StudentPlacementLevelResponseSchema.parse({
      data: { currentLevel },
    });

    return respond(currentLevelRoute, c, body);
  } catch (error) {
    if (error instanceof StudentPlacementNotAllowedError) {
      return respond(
        currentLevelRoute,
        c,
        { error: error.message },
        HTTP_STATUS.forbidden,
      );
    }

    if (error instanceof StudentPlacementUnavailableError) {
      return respond(
        currentLevelRoute,
        c,
        { error: error.message },
        HTTP_STATUS.serviceUnavailable,
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch placement level";
    return respond(
      currentLevelRoute,
      c,
      { error: message },
      HTTP_STATUS.internalServerError,
    );
  }
});

const nextTestRoute = createRoute({
  method: "get",
  path: "/next-test",
  tags: ["Student Placements"],
  summary: "Next placement test",
  description: "Returns the next recommended placement test for the learner.",
  request: {
    query: PlacementQuerySchema,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Next placement",
      content: {
        "application/json": {
          schema: StudentNextPlacementResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

placementsRouter.openapi(nextTestRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      nextTestRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query");

  try {
    const nextPlacement = await getStudentNextPlacement({
      studentId: query.studentId,
      subject: query.subject ?? null,
    });

    const body = StudentNextPlacementResponseSchema.parse({
      data: { nextPlacement },
    });

    return respond(nextTestRoute, c, body);
  } catch (error) {
    if (error instanceof StudentPlacementNotAllowedError) {
      return respond(
        nextTestRoute,
        c,
        { error: error.message },
        HTTP_STATUS.forbidden,
      );
    }

    if (error instanceof StudentPlacementUnavailableError) {
      return respond(
        nextTestRoute,
        c,
        { error: error.message },
        HTTP_STATUS.serviceUnavailable,
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch next placement test";
    return respond(
      nextTestRoute,
      c,
      { error: message },
      HTTP_STATUS.internalServerError,
    );
  }
});

const testsRoute = createRoute({
  method: "get",
  path: "/tests",
  tags: ["Student Placements"],
  summary: "Placement test history",
  description:
    "Returns the most recent placement test attempts for the learner.",
  request: {
    query: PlacementQuerySchema,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Placement tests",
      content: {
        "application/json": {
          schema:
            StudentPlacementTestsResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

placementsRouter.openapi(testsRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      testsRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query");

  try {
    const tests = await getStudentPlacementTests({
      studentId: query.studentId,
      subject: query.subject ?? null,
    });

    const body = StudentPlacementTestsResponseSchema.parse({
      data: { tests },
    });

    return respond(testsRoute, c, body);
  } catch (error) {
    if (error instanceof StudentPlacementNotAllowedError) {
      return respond(
        testsRoute,
        c,
        { error: error.message },
        HTTP_STATUS.forbidden,
      );
    }

    if (error instanceof StudentPlacementUnavailableError) {
      return respond(
        testsRoute,
        c,
        { error: error.message },
        HTTP_STATUS.serviceUnavailable,
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch placement tests";
    return respond(
      testsRoute,
      c,
      { error: message },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { placementsRouter as studentPlacementsRouter };
