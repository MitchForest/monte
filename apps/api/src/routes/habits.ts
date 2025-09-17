import "../lib/openapi";

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import type { HabitSchedule } from "@monte/shared";
import {
  ApiErrorSchema,
  HabitCheckinDeletionResponseSchema,
  HabitCheckinDetailResponseSchema,
  HabitDetailResponseSchema,
  HabitScheduleSchema,
  HabitSchema,
  HabitsListResponseSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const routerBase = new OpenAPIHono();

const CreateHabitBody = z.object({
  studentId: z.string().uuid(),
  name: z.string().min(1),
  schedule: HabitScheduleSchema,
});

const HabitParam = z.object({
  id: z.string().uuid(),
});

const HabitCheckinBody = z.object({
  date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
});

const HabitCheckinQuery = z.object({
  date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
});

const listHabitsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Habits"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List habits",
      content: {
        "application/json": {
          schema: HabitsListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to load habits",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithList = routerBase.openapi(listHabitsRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listHabitsRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
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
    return respond(listHabitsRoute, c, response);
  } catch (_error) {
    return respond(
      listHabitsRoute,
      c,
      { error: "Failed to load habits" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const createHabitRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Habits"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateHabitBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Habit created",
      content: {
        "application/json": {
          schema: HabitDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to create habit",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithCreate = routerWithList.openapi(createHabitRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      createHabitRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const body = CreateHabitBody.parse(c.req.valid("json"));

  try {
    const schedule: HabitSchedule = HabitScheduleSchema.parse(body.schedule);

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
            schedule,
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

    return respond(createHabitRoute, c, response, HTTP_STATUS.created);
  } catch (_error) {
    return respond(
      createHabitRoute,
      c,
      { error: "Failed to create habit" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const createHabitCheckinRoute = createRoute({
  method: "post",
  path: "/:id/check-ins",
  tags: ["Habits"],
  request: {
    params: HabitParam,
    body: {
      content: {
        "application/json": {
          schema: HabitCheckinBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Habit check-in recorded",
      content: {
        "application/json": {
          schema: HabitCheckinDetailResponseSchema as unknown as z.ZodTypeAny,
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
    [HTTP_STATUS.notFound]: {
      description: "Habit not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to record check-in",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithCheckin = routerWithCreate.openapi(
  createHabitCheckinRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        createHabitCheckinRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");
    const body = c.req.valid("json");

    try {
      const checkin = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        async (trx) => {
          const habit = await trx
            .selectFrom("habits")
            .select(["id", "org_id", "student_id"])
            .where("id", "=", params.id)
            .where("org_id", "=", session.session.orgId)
            .executeTakeFirst();

          if (!habit) {
            return null;
          }

          const inserted = await trx
            .insertInto("habit_checkin_events")
            .values({
              id: crypto.randomUUID(),
              org_id: habit.org_id,
              habit_id: habit.id,
              student_id: habit.student_id,
              date: body.date,
              checked: true,
              source: "manual",
              created_by: session.session.userId,
              created_at: new Date().toISOString(),
            })
            .onConflict((oc) =>
              oc.columns(["habit_id", "date"]).doUpdateSet({
                checked: true,
                created_by: session.session.userId,
              }),
            )
            .returning([
              "id",
              "habit_id",
              "student_id",
              "date",
              "checked",
              "source",
              "created_at",
            ])
            .executeTakeFirstOrThrow();

          return inserted;
        },
      );

      if (!checkin) {
        return respond(
          createHabitCheckinRoute,
          c,
          { error: "Habit not found" },
          HTTP_STATUS.notFound,
        );
      }

      const response = HabitCheckinDetailResponseSchema.parse({
        data: { checkin },
      });

      return respond(createHabitCheckinRoute, c, response);
    } catch (_error) {
      return respond(
        createHabitCheckinRoute,
        c,
        { error: "Failed to record check-in" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const deleteHabitCheckinRoute = createRoute({
  method: "delete",
  path: "/:id/check-ins",
  tags: ["Habits"],
  request: {
    params: HabitParam,
    query: HabitCheckinQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Habit check-in removed",
      content: {
        "application/json": {
          schema: HabitCheckinDeletionResponseSchema as unknown as z.ZodTypeAny,
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
    [HTTP_STATUS.notFound]: {
      description: "Check-in not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to remove check-in",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const router = routerWithCheckin.openapi(deleteHabitCheckinRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      deleteHabitCheckinRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const params = c.req.valid("param");
  const query = c.req.valid("query");

  try {
    const deleted = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        const deletionDate = new Date(`${query.date}T00:00:00.000Z`);
        const result = await trx
          .deleteFrom("habit_checkin_events")
          .where("habit_id", "=", params.id)
          .where("date", "=", deletionDate)
          .where("org_id", "=", session.session.orgId)
          .returning(["id"])
          .executeTakeFirst();

        return result;
      },
    );

    if (!deleted) {
      return respond(
        deleteHabitCheckinRoute,
        c,
        { error: "Check-in not found" },
        HTTP_STATUS.notFound,
      );
    }

    const response = HabitCheckinDeletionResponseSchema.parse({
      data: { deleted: true },
    });

    return respond(deleteHabitCheckinRoute, c, response);
  } catch (_error) {
    return respond(
      deleteHabitCheckinRoute,
      c,
      { error: "Failed to remove check-in" },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { router as habitsRouter };
