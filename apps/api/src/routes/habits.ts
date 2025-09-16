import { Hono } from "hono";
import { z } from "zod";
import { HabitsListResponseSchema, HabitSchema, HabitScheduleSchema } from "@monte/shared";
import { withDbContext } from "@monte/database";
import { getServerSession } from "../lib/auth/session";

const CreateHabitBody = z.object({
  studentId: z.string().uuid(),
  name: z.string().min(1),
  schedule: HabitScheduleSchema,
});

const router = new Hono();

router.get("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const habits = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) =>
        trx
          .selectFrom("habits")
          .select([
            "id",
            "org_id",
            "student_id",
            "name",
            "schedule",
            "active",
            "created_at",
          ])
          .where("org_id", "=", session.session.orgId)
          .orderBy("created_at", "desc")
          .execute()
    );

    const response = HabitsListResponseSchema.parse({ habits });
    return c.json(response);
  } catch (error) {
    return c.json({ error: "Failed to load habits" }, 500);
  }
});

router.post("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = CreateHabitBody.parse(await c.req.json());

    const habit = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) =>
        trx
          .insertInto("habits")
          .values({
            id: crypto.randomUUID(),
            org_id: session.session.orgId,
            student_id: body.studentId,
            name: body.name.trim(),
            schedule: body.schedule,
            active: true,
            created_at: new Date().toISOString(),
          })
          .returning([
            "id",
            "org_id",
            "student_id",
            "name",
            "schedule",
            "active",
            "created_at",
          ])
          .executeTakeFirstOrThrow()
    );

    return c.json(HabitSchema.parse(habit), 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid request", details: error.errors }, 400);
    }
    return c.json({ error: "Failed to create habit" }, 500);
  }
});

export { router as habitsRouter };
