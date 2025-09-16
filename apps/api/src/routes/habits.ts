import { withDbContext } from "@monte/database";
import {
  HabitDetailResponseSchema,
  HabitScheduleSchema,
  HabitSchema,
  HabitsListResponseSchema,
} from "@monte/shared";
import { Hono } from "hono";
import { z } from "zod";

import { getServerSession } from "../lib/auth/session";
import { HTTP_STATUS } from "../lib/http/status";

const CreateHabitBody = z.object({
  studentId: z.string().uuid(),
  name: z.string().min(1),
  schedule: HabitScheduleSchema,
});

const router = new Hono();

router.get("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, HTTP_STATUS.unauthorized);
  }

  try {
    const habits = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      (trx) =>
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
          .execute(),
    );

    const response = HabitsListResponseSchema.parse({
      data: { habits },
    });
    return c.json(response);
  } catch (_error) {
    return c.json(
      { error: "Failed to load habits" },
      HTTP_STATUS.internalServerError,
    );
  }
});

router.post("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, HTTP_STATUS.unauthorized);
  }

  try {
    const body = CreateHabitBody.parse(await c.req.json());

    const habit = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      (trx) =>
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
          .executeTakeFirstOrThrow(),
    );

    const parsedHabit = HabitSchema.parse(habit);
    const response = HabitDetailResponseSchema.parse({
      data: { habit: parsedHabit },
    });

    return c.json(response, HTTP_STATUS.created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request", details: error.errors },
        HTTP_STATUS.badRequest,
      );
    }
    return c.json(
      { error: "Failed to create habit" },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { router as habitsRouter };
