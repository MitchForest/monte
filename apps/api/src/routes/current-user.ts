import { createRoute, OpenAPIHono, type z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import { ApiErrorSchema, CurrentUserResponseSchema } from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const router = new OpenAPIHono();

const currentUserRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Current User"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Retrieve current user context",
      content: {
        "application/json": {
          schema: CurrentUserResponseSchema as unknown as z.ZodTypeAny,
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

router.openapi(currentUserRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      currentUserRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const organization = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("organizations")
        .selectAll()
        .where("id", "=", session.session.orgId)
        .executeTakeFirstOrThrow(),
  );

  const normalizedOrganization = {
    id: organization.id,
    name: organization.name,
    created_at:
      organization.created_at instanceof Date
        ? organization.created_at.toISOString()
        : (organization.created_at ?? new Date().toISOString()),
  };

  const response = CurrentUserResponseSchema.parse({
    user: session.user,
    organization: normalizedOrganization,
    role: session.session.role,
  });

  return respond(currentUserRoute, c, response);
});

export { router as currentUserRouter };
