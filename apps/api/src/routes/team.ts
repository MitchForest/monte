import { withDbContext } from "@monte/database";
import { TeamListResponseSchema } from "@monte/shared";
import { Hono } from "hono";

import { getServerSession } from "../lib/auth/session";
import { HTTP_STATUS } from "../lib/http/status";

const router = new Hono();

router.get("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, HTTP_STATUS.unauthorized);
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
    return c.json(response);
  } catch {
    return c.json(
      { error: "Failed to load team" },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { router as teamRouter };
