import "../lib/openapi";

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ActionsListResponseSchema, ApiErrorSchema } from "@monte/shared";

import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const routerBase = new OpenAPIHono();

const ListTasksQuery = z.object({
  type: z.enum(["task", "lesson"]).optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
});

const listTasksRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Tasks"],
  request: {
    query: ListTasksQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List tasks",
      content: {
        "application/json": {
          schema: ActionsListResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to load tasks",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const router = routerBase.openapi(listTasksRoute, (c) => {
  try {
    void c.req.valid("query");

    const response = ActionsListResponseSchema.parse({
      data: { actions: [] },
    });
    return respond(listTasksRoute, c, response);
  } catch (_error) {
    return respond(
      listTasksRoute,
      c,
      { error: "Failed to load tasks" },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { router as tasksRouter };
