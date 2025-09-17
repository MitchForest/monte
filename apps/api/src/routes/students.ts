import "../lib/openapi";

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ApiErrorSchema,
  StudentDetailResponseSchema,
  StudentSchema,
  StudentsListResponseSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

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
  id: z.string().uuid(),
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
    const students = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        let queryBuilder = trx
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
            "classrooms.id as classroom_id",
            "classrooms.name as classroom_name",
          ])
          .where("org_id", "=", session.session.orgId)
          .orderBy("full_name", "asc");

        if (query.search) {
          queryBuilder = queryBuilder.where(
            "full_name",
            "ilike",
            `%${query.search.trim()}%`,
          );
        }
        if (query.classroomId) {
          queryBuilder = queryBuilder.where(
            "primary_classroom_id",
            "=",
            query.classroomId,
          );
        }

        const rows = await queryBuilder.execute();

        return rows.map((row) => ({
          id: row.id,
          org_id: session.session.orgId,
          full_name: row.full_name,
          avatar_url: row.avatar_url,
          dob: row.dob,
          primary_classroom_id: row.primary_classroom_id,
          created_at: row.created_at,
          classroom: row.classroom_id
            ? { id: row.classroom_id, name: row.classroom_name ?? "" }
            : null,
        }));
      },
    );

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
          trx
            .insertInto("students")
            .values({
              id: crypto.randomUUID(),
              org_id: session.session.orgId,
              full_name: body.full_name,
              dob: body.dob ?? null,
              primary_classroom_id: body.primary_classroom_id ?? null,
              avatar_url: body.avatar_url ?? null,
              created_at: new Date().toISOString(),
            })
            .returningAll()
            .executeTakeFirstOrThrow(),
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

const studentsRouter = routerWithCreate.openapi(getStudentRoute, async (c) => {
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
    const detail = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        const row = await trx
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
            "classrooms.id as classroom_id",
            "classrooms.name as classroom_name",
          ])
          .where("students.id", "=", params.id)
          .where("students.org_id", "=", session.session.orgId)
          .executeTakeFirst();

        if (!row) {
          return null;
        }

        const student = {
          id: row.id,
          org_id: row.org_id,
          full_name: row.full_name,
          avatar_url: row.avatar_url,
          dob: row.dob,
          primary_classroom_id: row.primary_classroom_id,
          created_at: row.created_at,
          classroom: row.classroom_id
            ? { id: row.classroom_id, name: row.classroom_name ?? "" }
            : null,
        };

        const parents = await trx
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
          .where("student_id", "=", params.id)
          .orderBy("created_at", "asc")
          .execute();

        const habits = await trx
          .selectFrom("habits")
          .selectAll()
          .where("student_id", "=", params.id)
          .orderBy("created_at", "desc")
          .execute();

        const summaries = await trx
          .selectFrom("student_summaries")
          .selectAll()
          .where("student_id", "=", params.id)
          .orderBy("created_at", "desc")
          .limit(5)
          .execute();

        return {
          student,
          parents,
          habits,
          summaries,
        };
      },
    );

    if (!detail) {
      return respond(
        getStudentRoute,
        c,
        { error: "Student not found" },
        HTTP_STATUS.notFound,
      );
    }

    const response = StudentDetailResponseSchema.parse({
      data: {
        student: detail.student,
        parents: detail.parents,
        habits: detail.habits,
        summaries: detail.summaries,
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
});

export { studentsRouter };
