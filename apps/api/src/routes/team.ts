import "../lib/openapi";

import { createRoute, OpenAPIHono, type z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import { ApiErrorSchema, TeamListResponseSchema } from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const routerBase = new OpenAPIHono();

const listTeamRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Team"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List team members",
      content: {
        "application/json": {
          schema: TeamListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to load team",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const router = routerBase.openapi(listTeamRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listTeamRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  try {
    const members = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) =>
        trx
          .selectFrom("org_memberships")
          .innerJoin("users", "users.id", "org_memberships.user_id")
          .select([
            "users.id as id",
            "users.name as name",
            "users.email as email",
            "org_memberships.role as role",
          ])
          .where("org_memberships.org_id", "=", session.session.orgId)
          .orderBy("users.name", "asc")
          .execute(),
    );

    const response = TeamListResponseSchema.parse({
      data: { members },
    });
    return respond(listTeamRoute, c, response);
  } catch (_error) {
    return respond(
      listTeamRoute,
      c,
      { error: "Failed to load team" },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { router as teamRouter };
