import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import type { Student } from "@monte/shared";
import {
  ApiErrorSchema,
  StudentDashboardResponseSchema,
  StudentDetailResponseSchema,
  StudentSchema,
  StudentsListResponseSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";
import {
  getStudentXpSummary,
  StudentXpUnavailableError,
} from "../services/students/xp";
import {
  listStudentsForOrganization,
  syncStudentByRosterId,
} from "../services/timeback/roster";

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of items) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()];
}

function toIsoString(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

type StudentOverlayRow = {
  id: string;
  org_id: string;
  full_name: string;
  avatar_url: string | null;
  dob: Date | string | null;
  primary_classroom_id: string | null;
  created_at: Date | string;
  oneroster_user_id: string | null;
  classroom_id: string | null;
  classroom_name: string | null;
};

function mapOverlayRowToStudent(row: StudentOverlayRow): Student {
  return {
    id: row.id,
    org_id: row.org_id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    dob: row.dob ? toIsoString(row.dob) : null,
    primary_classroom_id: row.primary_classroom_id,
    created_at: toIsoString(row.created_at) ?? new Date().toISOString(),
    oneroster_user_id: row.oneroster_user_id,
    classroom: row.classroom_id
      ? { id: row.classroom_id, name: row.classroom_name ?? "" }
      : null,
  };
}

const GetStudentsQuery = z.object({
  search: z.string().optional(),
  classroomId: z.string().uuid().optional(),
});

const CreateStudentBody = z.object({
  full_name: z.string().min(1),
  dob: z.string().optional(),
  primary_classroom_id: z.string().uuid().optional(),
  avatar_url: z.string().optional(),
});

const StudentParam = z.object({
  id: z.string().min(1),
});

const DashboardQuery = z.object({
  range: z.enum(["daily", "weekly", "monthly"]).optional(),
  start: z.string().datetime({ offset: true }).optional(),
  end: z.string().datetime({ offset: true }).optional(),
});

const listStudentsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Students"],
  request: {
    query: GetStudentsQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List students",
      content: {
        "application/json": {
          schema: StudentsListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to fetch students",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const baseRouter = new OpenAPIHono();

const routerWithList = baseRouter.openapi(listStudentsRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listStudentsRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query");

  try {
    const students = await listStudentsForOrganization({
      session,
      search: query.search,
      classroomId: query.classroomId,
    });

    const response = StudentsListResponseSchema.parse({
      data: { students },
    });
    return respond(listStudentsRoute, c, response);
  } catch (_error) {
    return respond(
      listStudentsRoute,
      c,
      { error: "Failed to fetch students" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const createStudentRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Students"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateStudentBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Student created",
      content: {
        "application/json": {
          schema: StudentDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to create student",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithCreate = routerWithList.openapi(
  createStudentRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        createStudentRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const body = c.req.valid("json");

    try {
      const student = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        (trx) =>
          trx.transaction().execute(async (nested) => {
            const studentId = crypto.randomUUID();
            const inserted = await nested
              .insertInto("students")
              .values({
                id: studentId,
                org_id: session.session.orgId,
                full_name: body.full_name,
                dob: body.dob ?? null,
                primary_classroom_id: body.primary_classroom_id ?? null,
                avatar_url: body.avatar_url ?? null,
                created_at: new Date().toISOString(),
                oneroster_user_id: studentId,
                oneroster_org_id: session.session.orgId,
              })
              .returningAll()
              .executeTakeFirstOrThrow();
            return inserted;
          }),
      );

      const parsedStudent = StudentSchema.parse(student);
      const response = StudentDetailResponseSchema.parse({
        data: { student: parsedStudent },
      });

      return respond(createStudentRoute, c, response, HTTP_STATUS.created);
    } catch (_error) {
      return respond(
        createStudentRoute,
        c,
        { error: "Failed to create student" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const getStudentRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Students"],
  request: {
    params: StudentParam,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Get student detail",
      content: {
        "application/json": {
          schema: StudentDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Student not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to load student",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithDetail = routerWithCreate.openapi(
  getStudentRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        getStudentRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");

    try {
      const overlay = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        (trx) =>
          trx
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
            .where((eb) =>
              eb.or([
                eb("students.id", "=", params.id),
                eb("students.oneroster_user_id", "=", params.id),
              ]),
            )
            .executeTakeFirst(),
      );

      const rosterCandidates = new Set<string>();
      if (overlay?.oneroster_user_id) {
        rosterCandidates.add(overlay.oneroster_user_id);
      }
      rosterCandidates.add(params.id);

      let studentRecord: Student | null = null;
      let rosterUserId: string | null = null;

      for (const candidate of rosterCandidates) {
        if (!candidate) {
          continue;
        }
        const synced = await syncStudentByRosterId(session, candidate);
        if (synced) {
          studentRecord = synced;
          rosterUserId = candidate;
          break;
        }
      }

      if (!studentRecord && overlay) {
        studentRecord = mapOverlayRowToStudent(overlay);
      }

      if (!studentRecord) {
        return respond(
          getStudentRoute,
          c,
          { error: "Student not found" },
          HTTP_STATUS.notFound,
        );
      }

      const montessori = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        async (trx) => {
          const parents = overlay
            ? await trx
                .selectFrom("student_parents")
                .select([
                  "id",
                  "student_id",
                  "name",
                  "email",
                  "phone",
                  "relation",
                  "preferred_contact_method",
                  "created_at",
                ])
                .where("student_id", "=", overlay.id)
                .orderBy("created_at", "asc")
                .execute()
            : [];

          const habitRows =
            overlay?.id || rosterUserId
              ? await trx
                  .selectFrom("habits")
                  .selectAll()
                  .where((eb) => {
                    const overlayId = overlay?.id ?? null;
                    const rosterId = rosterUserId ?? null;
                    if (overlayId && rosterId) {
                      return eb.or([
                        eb("student_id", "=", overlayId),
                        eb("oneroster_student_id", "=", rosterId),
                      ]);
                    }
                    if (overlayId) {
                      return eb("student_id", "=", overlayId);
                    }
                    if (rosterId) {
                      return eb("oneroster_student_id", "=", rosterId);
                    }
                    return eb.lit(false);
                  })
                  .orderBy("created_at", "desc")
                  .execute()
              : [];

          const summaryRows =
            overlay?.id || rosterUserId
              ? await trx
                  .selectFrom("student_summaries")
                  .selectAll()
                  .where((eb) => {
                    const overlayId = overlay?.id ?? null;
                    const rosterId = rosterUserId ?? null;
                    if (overlayId && rosterId) {
                      return eb.or([
                        eb("student_id", "=", overlayId),
                        eb("oneroster_student_id", "=", rosterId),
                      ]);
                    }
                    if (overlayId) {
                      return eb("student_id", "=", overlayId);
                    }
                    if (rosterId) {
                      return eb("oneroster_student_id", "=", rosterId);
                    }
                    return eb.lit(false);
                  })
                  .orderBy("created_at", "desc")
                  .limit(5)
                  .execute()
              : [];

          const checkinRows =
            overlay?.id || rosterUserId
              ? await trx
                  .selectFrom("habit_checkin_events")
                  .innerJoin(
                    "habits",
                    "habits.id",
                    "habit_checkin_events.habit_id",
                  )
                  .selectAll("habit_checkin_events")
                  .where((eb) => {
                    const overlayId = overlay?.id ?? null;
                    const rosterId = rosterUserId ?? null;
                    if (overlayId && rosterId) {
                      return eb.or([
                        eb("habits.student_id", "=", overlayId),
                        eb("habits.oneroster_student_id", "=", rosterId),
                      ]);
                    }
                    if (overlayId) {
                      return eb("habits.student_id", "=", overlayId);
                    }
                    if (rosterId) {
                      return eb("habits.oneroster_student_id", "=", rosterId);
                    }
                    return eb.lit(false);
                  })
                  .orderBy("habit_checkin_events.date", "desc")
                  .limit(200)
                  .execute()
              : [];

          const habitCheckins = checkinRows.map((row) => ({
            ...row,
            date:
              row.date instanceof Date
                ? row.date.toISOString().slice(0, 10)
                : row.date,
            created_at:
              row.created_at instanceof Date
                ? row.created_at.toISOString()
                : row.created_at,
          }));

          return {
            parents,
            habits: dedupeById(habitRows),
            summaries: dedupeById(summaryRows),
            habitCheckins,
          };
        },
      );

      const response = StudentDetailResponseSchema.parse({
        data: {
          student: studentRecord,
          parents: montessori.parents,
          habits: montessori.habits,
          summaries: montessori.summaries,
          habitCheckins: montessori.habitCheckins,
        },
      });

      return respond(getStudentRoute, c, response);
    } catch (_error) {
      return respond(
        getStudentRoute,
        c,
        { error: "Failed to fetch student" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

function resolveDashboardWindow(query: z.infer<typeof DashboardQuery>) {
  if (query.start && query.end) {
    return { start: query.start, end: query.end };
  }

  const now = new Date();
  const toISOString = (date: Date) => date.toISOString();

  if (query.range === "weekly") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return { start: toISOString(start), end: toISOString(now) };
  }
  if (query.range === "monthly") {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    return { start: toISOString(start), end: toISOString(now) };
  }

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start: toISOString(start), end: toISOString(end) };
}

const dashboardRoute = createRoute({
  method: "get",
  path: "/:id/dashboard",
  tags: ["Students"],
  request: {
    params: StudentParam,
    query: DashboardQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Get student dashboard data",
      content: {
        "application/json": {
          schema: StudentDashboardResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Student not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const studentsRouter = routerWithDetail.openapi(dashboardRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      dashboardRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const params = c.req.valid("param");
  const query = c.req.valid("query");
  const window = resolveDashboardWindow(query);

  try {
    const studentDetail = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) =>
        trx
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
          .where("students.id", "=", params.id)
          .where("students.org_id", "=", session.session.orgId)
          .executeTakeFirst(),
    );

    if (!studentDetail) {
      return respond(
        dashboardRoute,
        c,
        { error: "Student not found" },
        HTTP_STATUS.notFound,
      );
    }

    const studentRecord = mapOverlayRowToStudent(studentDetail);

    const [habits, checkins] = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        const habitRows = await trx
          .selectFrom("habits")
          .selectAll()
          .where("student_id", "=", studentDetail.id)
          .orderBy("created_at", "desc")
          .execute();

        const checkinRows = await trx
          .selectFrom("habit_checkin_events")
          .selectAll()
          .where("student_id", "=", studentDetail.id)
          .where("date", ">=", new Date(window.start))
          .where("date", "<=", new Date(window.end))
          .orderBy("date", "desc")
          .limit(200)
          .execute();

        const normalizedCheckins = checkinRows.map((row) => ({
          ...row,
          date:
            row.date instanceof Date
              ? row.date.toISOString().slice(0, 10)
              : row.date,
          created_at:
            row.created_at instanceof Date
              ? row.created_at.toISOString()
              : row.created_at,
        }));

        return [dedupeById(habitRows), normalizedCheckins] as const;
      },
    );

    let xpSummary = null;

    try {
      xpSummary = await getStudentXpSummary({
        studentId: studentRecord.oneroster_user_id ?? studentRecord.id,
        startTime: window.start,
        endTime: window.end,
      });
    } catch (error) {
      if (!(error instanceof StudentXpUnavailableError)) {
        throw error;
      }
      xpSummary = null;
    }

    const response = StudentDashboardResponseSchema.parse({
      data: {
        student: studentRecord,
        habits,
        habitCheckins: checkins,
        xp: xpSummary,
      },
    });

    return respond(dashboardRoute, c, response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load dashboard";
    return respond(
      dashboardRoute,
      c,
      { error: message },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { studentsRouter };
