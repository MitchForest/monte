import "../lib/openapi";

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ApiErrorSchema, ObservationsListResponseSchema } from "@monte/shared";

import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const ListObservationsQuery = z.object({
  studentId: z.string().optional(),
});

const listObservationsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Observations"],
  request: {
    query: ListObservationsQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List observations",
      content: {
        "application/json": {
          schema: ObservationsListResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to load observations",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const observationsRouter = new OpenAPIHono().openapi(
  listObservationsRoute,
  (c) => {
    try {
      void c.req.valid("query");

      const response = ObservationsListResponseSchema.parse({
        data: { observations: [] },
      });
      return respond(listObservationsRoute, c, response);
    } catch (_error) {
      return respond(
        listObservationsRoute,
        c,
        { error: "Failed to load observations" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

export { observationsRouter };
