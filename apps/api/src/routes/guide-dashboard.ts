import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ActionSchema,
  ApiErrorSchema,
  GuideDashboardResponseSchema,
  StudentSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const router = new OpenAPIHono();

const guideDashboardRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Guide Dashboard"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Guide dashboard overview",
      content: {
        "application/json": {
          schema: GuideDashboardResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to load dashboard",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

function startOfDay(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function endOfDay(): Date {
  const start = startOfDay();
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

router.openapi(guideDashboardRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      guideDashboardRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  try {
    const result = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        const scheduleRows = await trx
          .selectFrom("actions")
          .selectAll()
          .where("org_id", "=", session.session.orgId)
          .where("status", "!=", "completed")
          .where((eb) =>
            eb.or([
              eb("due_date", "is", null),
              eb.and([
                eb("due_date", ">=", todayStart),
                eb("due_date", "<=", todayEnd),
              ]),
            ]),
          )
          .orderBy("due_date", "asc")
          .limit(200)
          .execute();

        const schedule = scheduleRows.map((row) =>
          ActionSchema.parse({
            ...row,
            due_date:
              row.due_date instanceof Date
                ? row.due_date.toISOString()
                : row.due_date,
            created_at:
              row.created_at instanceof Date
                ? row.created_at.toISOString()
                : row.created_at,
            updated_at:
              row.updated_at instanceof Date
                ? row.updated_at.toISOString()
                : row.updated_at,
            completed_at:
              row.completed_at instanceof Date
                ? row.completed_at.toISOString()
                : row.completed_at,
          }),
        );

        const students = await trx
          .selectFrom("students")
          .leftJoin(
            "classrooms",
            "classrooms.id",
            "students.primary_classroom_id",
          )
          .select([
            "students.id as id",
            "students.org_id as org_id",
            "students.full_name as full_name",
            "students.avatar_url as avatar_url",
            "students.dob as dob",
            "students.primary_classroom_id as primary_classroom_id",
            "students.created_at as created_at",
            "students.oneroster_user_id as oneroster_user_id",
            "classrooms.id as classroom_id",
            "classrooms.name as classroom_name",
          ])
          .where("students.org_id", "=", session.session.orgId)
          .orderBy("students.full_name", "asc")
          .execute();

        const habitsByStudent = await trx
          .selectFrom("habits")
          .select((eb) => [
            "student_id",
            eb.fn.countAll<string>().as("count"),
          ])
          .where("org_id", "=", session.session.orgId)
          .groupBy("student_id")
          .execute();

        const lastObservationByStudent = await trx
          .selectFrom("observations")
          .select((eb) => [
            "student_id",
            eb.fn.max("created_at").as("last_observation"),
          ])
          .where("org_id", "=", session.session.orgId)
          .groupBy("student_id")
          .execute();

        const lastSummaryByStudent = await trx
          .selectFrom("student_summaries")
          .select((eb) => [
            "student_id",
            eb.fn.max("created_at").as("last_summary"),
          ])
          .where("org_id", "=", session.session.orgId)
          .groupBy("student_id")
          .execute();

        const xpFacts = await trx
          .selectFrom("xp_facts_daily")
          .select([
            "student_id",
            "xp_total",
          ])
          .where("org_id", "=", session.session.orgId)
          .where("date_bucket", "=", todayStart.toISOString().slice(0, 10))
          .execute();

        const observationCountRow = await trx
          .selectFrom("observations")
          .select((eb) => eb.fn.countAll<string>().as("count"))
          .where("org_id", "=", session.session.orgId)
          .where("created_at", ">=", todayStart)
          .where("created_at", "<=", todayEnd)
          .executeTakeFirst();

        const summaryCountRow = await trx
          .selectFrom("student_summaries")
          .select((eb) => eb.fn.countAll<string>().as("count"))
          .where("org_id", "=", session.session.orgId)
          .where("created_at", ">=", todayStart)
          .where("created_at", "<=", todayEnd)
          .executeTakeFirst();

        return {
          schedule,
          students,
          habitsByStudent,
          lastObservationByStudent,
          lastSummaryByStudent,
          xpFacts,
          observationCount: Number.parseInt(observationCountRow?.count ?? "0", 10),
          summaryCount: Number.parseInt(summaryCountRow?.count ?? "0", 10),
        };
      },
    );

    const habitMap = new Map<string, number>();
    for (const habit of result.habitsByStudent) {
      habitMap.set(habit.student_id, Number.parseInt(habit.count, 10));
    }

    const observationMap = new Map<string, string | null>();
    for (const entry of result.lastObservationByStudent) {
      const value = entry.last_observation;
      observationMap.set(
        entry.student_id,
        value instanceof Date ? value.toISOString() : (value as string | null),
      );
    }

    const summaryMap = new Map<string, string | null>();
    for (const entry of result.lastSummaryByStudent) {
      const value = entry.last_summary;
      summaryMap.set(
        entry.student_id,
        value instanceof Date ? value.toISOString() : (value as string | null),
      );
    }

    const xpMap = new Map<string, number>();
    for (const entry of result.xpFacts) {
      const xp =
        typeof entry.xp_total === "number"
          ? entry.xp_total
          : Number.parseFloat(String(entry.xp_total ?? 0));
      xpMap.set(entry.student_id, xp);
    }

    const students = result.students.map((row) => {
      const studentObject = {
        id: row.id,
        org_id: row.org_id,
        full_name: row.full_name,
        avatar_url: row.avatar_url,
        dob:
          row.dob instanceof Date ? row.dob.toISOString().slice(0, 10) : row.dob,
        primary_classroom_id: row.primary_classroom_id,
        created_at:
          row.created_at instanceof Date
            ? row.created_at.toISOString()
            : row.created_at,
        oneroster_user_id: row.oneroster_user_id,
        classroom: row.classroom_id
          ? { id: row.classroom_id, name: row.classroom_name ?? "" }
          : null,
      };

      const student = StudentSchema.parse(studentObject);

      return {
        student,
        habitsCount: habitMap.get(row.id) ?? 0,
        lastObservationAt: observationMap.get(row.id) ?? null,
        lastSummaryAt: summaryMap.get(row.id) ?? null,
        xpToday: xpMap.get(row.id) ?? null,
      };
    });

    const response = GuideDashboardResponseSchema.parse({
      data: {
        schedule: result.schedule,
        students,
        observationCount: result.observationCount,
        summaryCount: result.summaryCount,
      },
    });

    return respond(guideDashboardRoute, c, response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load dashboard";
    return respond(
      guideDashboardRoute,
      c,
      { error: message },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { router as guideDashboardRouter };
