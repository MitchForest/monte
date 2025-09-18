import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ApiErrorSchema,
  type WorkPeriod,
  WorkPeriodDetailResponseSchema,
  WorkPeriodsListResponseSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const routerBase = new OpenAPIHono();

const ListAttendanceQuery = z.object({
  studentId: z.string().uuid().optional(),
  date: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

const CreateAttendanceBody = z.object({
  studentId: z.string().uuid(),
  startTime: z.string().datetime({ offset: true }).optional(),
  notes: z.string().nullable().optional(),
});

const UpdateAttendanceBody = z
  .object({
    startTime: z.string().datetime({ offset: true }).optional(),
    endTime: z.string().datetime({ offset: true }).optional(),
    notes: z.string().nullable().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required",
  });

const AttendanceParam = z.object({
  id: z.string().uuid(),
});

function normalizeWorkPeriod(
  row: Omit<WorkPeriod, "start_time" | "end_time"> & {
    start_time: string | Date;
    end_time: string | Date | null;
  },
): WorkPeriod {
  let startTime: string;
  if (typeof row.start_time === "string") {
    startTime = row.start_time;
  } else {
    startTime = row.start_time.toISOString();
  }

  let endTime: string | null;
  if (row.end_time === null) {
    endTime = null;
  } else if (typeof row.end_time === "string") {
    endTime = row.end_time;
  } else {
    endTime = row.end_time.toISOString();
  }

  return {
    ...row,
    start_time: startTime,
    end_time: endTime,
  };
}

function resolveDayRange(date?: string) {
  if (!date) {
    return null;
  }
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);
  return { start, end };
}

const listAttendanceRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Attendance"],
  request: {
    query: ListAttendanceQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List attendance records",
      content: {
        "application/json": {
          schema: WorkPeriodsListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to load attendance",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithList = routerBase.openapi(listAttendanceRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listAttendanceRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query");
  const range = resolveDayRange(query.date);

  try {
    const workPeriods = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        let builder = trx
          .selectFrom("work_periods")
          .selectAll()
          .where("org_id", "=", session.session.orgId)
          .orderBy("start_time", "desc")
          .limit(query.limit ?? 100);

        if (query.studentId) {
          builder = builder.where("student_id", "=", query.studentId);
        }
        if (range) {
          builder = builder.where("start_time", ">=", range.start);
          builder = builder.where("start_time", "<=", range.end);
        }

        const rows = await builder.execute();
        return rows.map((row) =>
          normalizeWorkPeriod(
            row as Omit<WorkPeriod, "start_time" | "end_time"> & {
              start_time: string | Date;
              end_time: string | Date | null;
            },
          ),
        );
      },
    );

    const response = WorkPeriodsListResponseSchema.parse({
      data: { workPeriods },
    });

    return respond(listAttendanceRoute, c, response);
  } catch (_error) {
    return respond(
      listAttendanceRoute,
      c,
      { error: "Failed to load attendance" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const createAttendanceRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Attendance"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateAttendanceBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Attendance recorded",
      content: {
        "application/json": {
          schema: WorkPeriodDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to record attendance",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithCreate = routerWithList.openapi(
  createAttendanceRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        createAttendanceRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const body = c.req.valid("json");
    const startTimeIso = body.startTime ?? new Date(Date.now()).toISOString();

    try {
      const student = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        (trx) =>
          trx
            .selectFrom("students")
            .select(["id", "org_id", "oneroster_user_id"])
            .where("id", "=", body.studentId)
            .where("org_id", "=", session.session.orgId)
            .executeTakeFirst(),
      );

      if (!student) {
        return respond(
          createAttendanceRoute,
          c,
          { error: "Student not found" },
          HTTP_STATUS.notFound,
        );
      }

      const workPeriod = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        async (trx) =>
          trx
            .insertInto("work_periods")
            .values({
              id: crypto.randomUUID(),
              org_id: session.session.orgId,
              student_id: student.id,
              oneroster_student_id: student.oneroster_user_id ?? null,
              start_time: startTimeIso,
              end_time: null,
              notes: body.notes ?? null,
            })
            .returningAll()
            .executeTakeFirstOrThrow(),
      );

      const normalized = normalizeWorkPeriod(
        workPeriod as WorkPeriod & {
          start_time: string | Date;
          end_time: string | Date | null;
        },
      );

      const response = WorkPeriodDetailResponseSchema.parse({
        data: { workPeriod: normalized },
      });

      return respond(createAttendanceRoute, c, response, HTTP_STATUS.created);
    } catch (_error) {
      return respond(
        createAttendanceRoute,
        c,
        { error: "Failed to record attendance" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const getAttendanceRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Attendance"],
  request: {
    params: AttendanceParam,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Get attendance record",
      content: {
        "application/json": {
          schema: WorkPeriodDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Attendance record not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithDetail = routerWithCreate.openapi(
  getAttendanceRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        getAttendanceRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");

    try {
      const workPeriod = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        (trx) =>
          trx
            .selectFrom("work_periods")
            .selectAll()
            .where("id", "=", params.id)
            .where("org_id", "=", session.session.orgId)
            .executeTakeFirst(),
      );

      if (!workPeriod) {
        return respond(
          getAttendanceRoute,
          c,
          { error: "Attendance record not found" },
          HTTP_STATUS.notFound,
        );
      }

      const normalized = normalizeWorkPeriod(
        workPeriod as WorkPeriod & {
          start_time: string | Date;
          end_time: string | Date | null;
        },
      );

      const response = WorkPeriodDetailResponseSchema.parse({
        data: { workPeriod: normalized },
      });

      return respond(getAttendanceRoute, c, response);
    } catch (_error) {
      return respond(
        getAttendanceRoute,
        c,
        { error: "Failed to load attendance" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const updateAttendanceRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Attendance"],
  request: {
    params: AttendanceParam,
    body: {
      content: {
        "application/json": {
          schema: UpdateAttendanceBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Attendance updated",
      content: {
        "application/json": {
          schema: WorkPeriodDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Attendance record not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to update attendance",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const attendanceRouter = routerWithDetail.openapi(
  updateAttendanceRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        updateAttendanceRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");
    const body = c.req.valid("json");

    try {
      const workPeriod = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        async (trx) => {
          const update: Record<string, unknown> = {};
          if (body.startTime !== undefined) {
            update.start_time = body.startTime;
          }
          if (body.endTime !== undefined) {
            update.end_time = body.endTime;
          }
          if (body.notes !== undefined) {
            update.notes = body.notes;
          }

          const updated = await trx
            .updateTable("work_periods")
            .set(update)
            .where("id", "=", params.id)
            .where("org_id", "=", session.session.orgId)
            .returningAll()
            .executeTakeFirst();

          return updated ?? null;
        },
      );

      if (!workPeriod) {
        return respond(
          updateAttendanceRoute,
          c,
          { error: "Attendance record not found" },
          HTTP_STATUS.notFound,
        );
      }

      const normalized = normalizeWorkPeriod(
        workPeriod as WorkPeriod & {
          start_time: string | Date;
          end_time: string | Date | null;
        },
      );

      const response = WorkPeriodDetailResponseSchema.parse({
        data: { workPeriod: normalized },
      });

      return respond(updateAttendanceRoute, c, response);
    } catch (_error) {
      return respond(
        updateAttendanceRoute,
        c,
        { error: "Failed to update attendance" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

export { attendanceRouter };
