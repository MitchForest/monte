import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db, withDbContext } from "@monte/database";
import { ApiErrorSchema, OrganizationSchema } from "@monte/shared";
import { sql } from "kysely";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const router = new OpenAPIHono();

const CreateOrganizationBody = z.object({
  name: z.string().min(1).max(120),
});

const CreateOrganizationResponseSchema = z.object({
  data: z.object({
    organization: OrganizationSchema,
  }),
});

const createOrganizationRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Organizations"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateOrganizationBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Organization created",
      content: {
        "application/json": {
          schema: CreateOrganizationResponseSchema as unknown as z.ZodTypeAny,
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

router.openapi(createOrganizationRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      createOrganizationRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const body = c.req.valid("json") as z.infer<typeof CreateOrganizationBody>;

  const [{ org_id: orgId }] = await db
    .selectFrom(
      sql<{
        org_id: string;
      }>`app.bootstrap_organization(${session.session.userId}, NULL, ${body.name})`.as(
        "result",
      ),
    )
    .select(["org_id"])
    .execute();

  const organization = await withDbContext(
    { userId: session.session.userId, orgId },
    (trx) =>
      trx
        .selectFrom("organizations")
        .selectAll()
        .where("id", "=", orgId)
        .executeTakeFirstOrThrow(),
  );

  const response = CreateOrganizationResponseSchema.parse({
    data: { organization },
  });

  return respond(createOrganizationRoute, c, response, HTTP_STATUS.created);
});

export { router as organizationsRouter };
