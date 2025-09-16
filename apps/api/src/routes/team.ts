import { Hono } from "hono";
import { TeamListResponseSchema } from "@monte/shared";
import { withDbContext } from "@monte/database";
import { getServerSession } from "../lib/auth/session";

const router = new Hono();

router.get("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
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
          .execute()
    );

    const response = TeamListResponseSchema.parse({ members });
    return c.json(response);
  } catch {
    return c.json({ error: "Failed to load team" }, 500);
  }
});

export { router as teamRouter };
