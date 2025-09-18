import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import type { LessonInstanceStatus, StudentLesson } from "@monte/shared";
import {
  ApiErrorSchema,
  StudentLessonDetailResponseSchema,
  StudentLessonsListResponseSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const routerBase = new OpenAPIHono();

const ListStudentLessonsQuery = z.object({
  studentId: z.string().uuid().optional(),
  status: z
    .enum(["unscheduled", "scheduled", "completed"])
    .optional()
    .transform((value) => value as LessonInstanceStatus | undefined),
  scheduledFrom: z.string().datetime({ offset: true }).optional(),
  scheduledTo: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

const CreateStudentLessonBody = z.object({
  studentId: z.string().uuid(),
  courseLessonId: z.string().uuid().nullable().optional(),
  customTitle: z.string().min(1).nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(["unscheduled", "scheduled", "completed"]).optional(),
  scheduledFor: z.string().datetime({ offset: true }).nullable().optional(),
  assignedByUserId: z.string().uuid().nullable().optional(),
  rescheduledFromId: z.string().uuid().nullable().optional(),
});

const UpdateStudentLessonBody = z
  .object({
    courseLessonId: z.string().uuid().nullable().optional(),
    customTitle: z.string().min(1).nullable().optional(),
    notes: z.string().nullable().optional(),
    status: z.enum(["unscheduled", "scheduled", "completed"]).optional(),
    scheduledFor: z.string().datetime({ offset: true }).nullable().optional(),
    assignedByUserId: z.string().uuid().nullable().optional(),
    rescheduledFromId: z.string().uuid().nullable().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required",
  });

const StudentLessonParam = z.object({
  id: z.string().uuid(),
});

type StudentLessonRow = Omit<
  StudentLesson,
  "created_at" | "updated_at" | "scheduled_for" | "completed_at"
> & {
  created_at: string | Date;
  updated_at: string | Date;
  scheduled_for: string | Date | null;
  completed_at: string | Date | null;
};

function normalizeLesson(row: StudentLessonRow): StudentLesson {
  let createdAt: string;
  if (typeof row.created_at === "string") {
    createdAt = row.created_at;
  } else {
    createdAt = row.created_at.toISOString();
  }

  let updatedAt: string;
  if (typeof row.updated_at === "string") {
    updatedAt = row.updated_at;
  } else {
    updatedAt = row.updated_at.toISOString();
  }

  const normalizeNullable = (value: string | Date | null): string | null => {
    if (value === null) {
      return null;
    }
    return typeof value === "string" ? value : value.toISOString();
  };

  return {
    ...row,
    created_at: createdAt,
    updated_at: updatedAt,
    scheduled_for: normalizeNullable(row.scheduled_for),
    completed_at: normalizeNullable(row.completed_at),
  };
}

const listStudentLessonsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Student Lessons"],
  request: {
    query: ListStudentLessonsQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List student lessons",
      content: {
        "application/json": {
          schema: StudentLessonsListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to load lessons",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithList = routerBase.openapi(
  listStudentLessonsRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        listStudentLessonsRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const query = c.req.valid("query");

    try {
      const lessons = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        async (trx) => {
          let builder = trx
            .selectFrom("student_lessons")
            .selectAll()
            .where("org_id", "=", session.session.orgId)
            .orderBy("updated_at", "desc")
            .limit(query.limit ?? 100);

          if (query.studentId) {
            builder = builder.where("student_id", "=", query.studentId);
          }
          if (query.status) {
            builder = builder.where("status", "=", query.status);
          }
          if (query.scheduledFrom) {
            builder = builder.where(
              "scheduled_for",
              ">=",
              new Date(query.scheduledFrom),
            );
          }
          if (query.scheduledTo) {
            builder = builder.where(
              "scheduled_for",
              "<=",
              new Date(query.scheduledTo),
            );
          }

          const rows = await builder.execute();
          return rows.map((row) => normalizeLesson(row as StudentLessonRow));
        },
      );

      const response = StudentLessonsListResponseSchema.parse({
        data: { lessons },
      });

      return respond(listStudentLessonsRoute, c, response);
    } catch (_error) {
      return respond(
        listStudentLessonsRoute,
        c,
        { error: "Failed to load lessons" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const createStudentLessonRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Student Lessons"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateStudentLessonBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Student lesson created",
      content: {
        "application/json": {
          schema: StudentLessonDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to create lesson",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithCreate = routerWithList.openapi(
  createStudentLessonRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        createStudentLessonRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const body = c.req.valid("json");

    const status: LessonInstanceStatus =
      (body.status as LessonInstanceStatus | undefined) ??
      (body.scheduledFor ? "scheduled" : "unscheduled");
    const timestamp = new Date(Date.now()).toISOString();

    try {
      const lesson = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        async (trx) =>
          trx
            .insertInto("student_lessons")
            .values({
              id: crypto.randomUUID(),
              org_id: session.session.orgId,
              student_id: body.studentId,
              course_lesson_id: body.courseLessonId ?? null,
              custom_title: body.customTitle ?? null,
              notes: body.notes ?? null,
              status,
              scheduled_for: body.scheduledFor ?? null,
              completed_at: status === "completed" ? timestamp : null,
              assigned_by_user_id:
                body.assignedByUserId ?? session.session.userId,
              rescheduled_from_id: body.rescheduledFromId ?? null,
              created_at: timestamp,
              updated_at: timestamp,
              oneroster_student_id: null,
            })
            .returningAll()
            .executeTakeFirstOrThrow(),
      );

      const normalized = normalizeLesson(lesson as StudentLessonRow);
      const response = StudentLessonDetailResponseSchema.parse({
        data: { lesson: normalized },
      });

      return respond(
        createStudentLessonRoute,
        c,
        response,
        HTTP_STATUS.created,
      );
    } catch (_error) {
      return respond(
        createStudentLessonRoute,
        c,
        { error: "Failed to create lesson" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const getStudentLessonRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Student Lessons"],
  request: {
    params: StudentLessonParam,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Get student lesson",
      content: {
        "application/json": {
          schema: StudentLessonDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Lesson not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithDetail = routerWithCreate.openapi(
  getStudentLessonRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        getStudentLessonRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");

    try {
      const lesson = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        (trx) =>
          trx
            .selectFrom("student_lessons")
            .selectAll()
            .where("id", "=", params.id)
            .where("org_id", "=", session.session.orgId)
            .executeTakeFirst(),
      );

      if (!lesson) {
        return respond(
          getStudentLessonRoute,
          c,
          { error: "Lesson not found" },
          HTTP_STATUS.notFound,
        );
      }

      const normalized = normalizeLesson(lesson as StudentLessonRow);
      const response = StudentLessonDetailResponseSchema.parse({
        data: { lesson: normalized },
      });

      return respond(getStudentLessonRoute, c, response);
    } catch (_error) {
      return respond(
        getStudentLessonRoute,
        c,
        { error: "Failed to load lesson" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const updateStudentLessonRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Student Lessons"],
  request: {
    params: StudentLessonParam,
    body: {
      content: {
        "application/json": {
          schema: UpdateStudentLessonBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Lesson updated",
      content: {
        "application/json": {
          schema: StudentLessonDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Lesson not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to update lesson",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const studentLessonsRouter = routerWithDetail.openapi(
  updateStudentLessonRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        updateStudentLessonRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");
    const body = c.req.valid("json");
    const timestamp = new Date(Date.now()).toISOString();

    try {
      const lesson = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        async (trx) => {
          const update: Record<string, unknown> = {
            updated_at: timestamp,
          };

          if (body.courseLessonId !== undefined) {
            update.course_lesson_id = body.courseLessonId;
          }
          if (body.customTitle !== undefined) {
            update.custom_title = body.customTitle;
          }
          if (body.notes !== undefined) {
            update.notes = body.notes;
          }
          if (body.scheduledFor !== undefined) {
            update.scheduled_for = body.scheduledFor;
          }
          if (body.assignedByUserId !== undefined) {
            update.assigned_by_user_id = body.assignedByUserId;
          }
          if (body.rescheduledFromId !== undefined) {
            update.rescheduled_from_id = body.rescheduledFromId;
          }
          if (body.status !== undefined) {
            update.status = body.status as LessonInstanceStatus;
            update.completed_at =
              body.status === "completed" ? timestamp : null;
          }

          const updated = await trx
            .updateTable("student_lessons")
            .set(update)
            .where("id", "=", params.id)
            .where("org_id", "=", session.session.orgId)
            .returningAll()
            .executeTakeFirst();

          return updated ?? null;
        },
      );

      if (!lesson) {
        return respond(
          updateStudentLessonRoute,
          c,
          { error: "Lesson not found" },
          HTTP_STATUS.notFound,
        );
      }

      const normalized = normalizeLesson(lesson as StudentLessonRow);
      const response = StudentLessonDetailResponseSchema.parse({
        data: { lesson: normalized },
      });

      return respond(updateStudentLessonRoute, c, response);
    } catch (_error) {
      return respond(
        updateStudentLessonRoute,
        c,
        { error: "Failed to update lesson" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

export { studentLessonsRouter };
