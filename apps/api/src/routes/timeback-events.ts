import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { ApiErrorSchema } from "@monte/shared";
import { loadApiEnv } from "../lib/env";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";
import { ingestCaliperEvents } from "../services/timeback/caliper";
import { processTimebackQueueBatch } from "../services/timeback/worker";

const CaliperIngestResponseSchema = z.object({
  received: z.number(),
  stored: z.number(),
  dropped: z.record(z.string(), z.number()).optional(),
  errors: z
    .array(
      z.object({
        eventId: z.string().optional(),
        reason: z.string(),
        message: z.string().optional(),
      }),
    )
    .optional(),
});

const CaliperIngestRoute = createRoute({
  method: "post",
  path: "/caliper",
  tags: ["Timeback Events"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.union([z.array(z.unknown()), z.unknown()]),
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Caliper events processed",
      content: {
        "application/json": {
          schema: CaliperIngestResponseSchema as unknown as z.ZodTypeAny,
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
    [HTTP_STATUS.badRequest]: {
      description: "Invalid payload",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to process events",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const WorkerProcessResponseSchema = z.object({
  status: z.literal("ok"),
  claimed: z.number(),
  processed: z.number(),
  skipped: z.number(),
  failed: z.number(),
  pending: z.number(),
  processing: z.number(),
  dlq: z.number(),
  locked: z.boolean(),
});

const WorkerProcessRoute = createRoute({
  method: "post",
  path: "/process",
  tags: ["Timeback Events"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Process a batch of Timeback events",
      content: {
        "application/json": {
          schema: WorkerProcessResponseSchema as unknown as z.ZodTypeAny,
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

const timebackEventsRouter = new OpenAPIHono().openapi(
  CaliperIngestRoute,
  async (c) => {
    const secret = loadApiEnv().TIMEBACK_CALIPER_TOKEN;
    if (secret && !isAuthorized(c.req.header("authorization"), secret)) {
      return respond(
        CaliperIngestRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid JSON payload";
      return respond(
        CaliperIngestRoute,
        c,
        { error: message },
        HTTP_STATUS.badRequest,
      );
    }

    const events = Array.isArray(body) ? body : [body];
    const summary = await ingestCaliperEvents(events);

    return respond(CaliperIngestRoute, c, {
      received: events.length,
      stored: summary.stored,
      dropped: Object.keys(summary.dropped).length
        ? summary.dropped
        : undefined,
      errors: summary.errors.length > 0 ? summary.errors : undefined,
    });
  },
);

timebackEventsRouter.openapi(WorkerProcessRoute, async (c) => {
  const env = loadApiEnv();
  const secret = env.TIMEBACK_WORKER_TOKEN ?? env.TIMEBACK_CALIPER_TOKEN;
  if (secret && !isAuthorized(c.req.header("authorization"), secret)) {
    return respond(
      WorkerProcessRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const result = await processTimebackQueueBatch();

  return respond(WorkerProcessRoute, c, {
    status: "ok",
    claimed: result.claimed,
    processed: result.processed,
    skipped: result.skipped,
    failed: result.failed,
    pending: result.pending,
    processing: result.processing,
    dlq: result.dlq,
    locked: result.locked,
  });
});

function isAuthorized(authHeader: string | undefined, secret: string): boolean {
  if (!authHeader) {
    return false;
  }
  const value = authHeader.trim();
  if (value.toLowerCase().startsWith("bearer ")) {
    return value.slice("bearer ".length).trim() === secret;
  }
  return value === secret;
}

export { timebackEventsRouter };
