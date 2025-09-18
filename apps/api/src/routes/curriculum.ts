import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ApiErrorSchema,
  ClassAreasListResponseSchema,
  CourseLessonsListResponseSchema,
  CoursesListResponseSchema,
  MaterialsListResponseSchema,
  SubjectsListResponseSchema,
  TopicsListResponseSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const routerBase = new OpenAPIHono();

const listClassAreasRoute = createRoute({
  method: "get",
  path: "/areas",
  tags: ["Curriculum"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List Montessori class areas",
      content: {
        "application/json": {
          schema: ClassAreasListResponseSchema as unknown as z.ZodTypeAny,
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
  },
});

const routerWithAreas = routerBase.openapi(listClassAreasRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listClassAreasRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const areas = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("class_areas")
        .selectAll()
        .orderBy("name", "asc")
        .execute(),
  );

  const response = ClassAreasListResponseSchema.parse({
    data: { classAreas: areas },
  });

  return respond(listClassAreasRoute, c, response);
});

const listSubjectsRoute = createRoute({
  method: "get",
  path: "/subjects",
  tags: ["Curriculum"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List subjects",
      content: {
        "application/json": {
          schema: SubjectsListResponseSchema as unknown as z.ZodTypeAny,
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
  },
});

const routerWithSubjects = routerWithAreas.openapi(
  listSubjectsRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        listSubjectsRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const subjects = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      (trx) =>
        trx
          .selectFrom("subjects")
          .selectAll()
          .where("org_id", "=", session.session.orgId)
          .orderBy("name", "asc")
          .execute(),
    );

    const response = SubjectsListResponseSchema.parse({
      data: { subjects },
    });

    return respond(listSubjectsRoute, c, response);
  },
);

const ListCoursesQuery = z.object({
  subjectId: z.string().uuid().optional(),
  search: z.string().min(1).optional(),
});

const listCoursesRoute = createRoute({
  method: "get",
  path: "/courses",
  tags: ["Curriculum"],
  request: {
    query: ListCoursesQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List courses",
      content: {
        "application/json": {
          schema: CoursesListResponseSchema as unknown as z.ZodTypeAny,
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
  },
});

const routerWithCourses = routerWithSubjects.openapi(
  listCoursesRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        listCoursesRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const query = c.req.valid("query");

    const courses = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        let builder = trx
          .selectFrom("courses")
          .selectAll()
          .where("org_id", "=", session.session.orgId)
          .orderBy("name", "asc");

        if (query.subjectId) {
          builder = builder.where("subject_id", "=", query.subjectId);
        }
        if (query.search) {
          builder = builder.where("name", "ilike", `%${query.search}%`);
        }

        return builder.execute();
      },
    );

    const response = CoursesListResponseSchema.parse({
      data: { courses },
    });

    return respond(listCoursesRoute, c, response);
  },
);

const CourseParam = z.object({
  id: z.string().uuid(),
});

const listCourseLessonsRoute = createRoute({
  method: "get",
  path: "/courses/:id/lessons",
  tags: ["Curriculum"],
  request: {
    params: CourseParam,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List lessons for a course",
      content: {
        "application/json": {
          schema: CourseLessonsListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Course not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithLessons = routerWithCourses.openapi(
  listCourseLessonsRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        listCourseLessonsRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");

    const course = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      (trx) =>
        trx
          .selectFrom("courses")
          .select(["id"])
          .where("id", "=", params.id)
          .where("org_id", "=", session.session.orgId)
          .executeTakeFirst(),
    );

    if (!course) {
      return respond(
        listCourseLessonsRoute,
        c,
        { error: "Course not found" },
        HTTP_STATUS.notFound,
      );
    }

    const lessons = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      (trx) =>
        trx
          .selectFrom("course_lessons")
          .selectAll()
          .where("course_id", "=", params.id)
          .where("org_id", "=", session.session.orgId)
          .orderBy("order_index", "asc")
          .execute(),
    );

    const response = CourseLessonsListResponseSchema.parse({
      data: { lessons },
    });

    return respond(listCourseLessonsRoute, c, response);
  },
);

const listMaterialsRoute = createRoute({
  method: "get",
  path: "/materials",
  tags: ["Curriculum"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List materials",
      content: {
        "application/json": {
          schema: MaterialsListResponseSchema as unknown as z.ZodTypeAny,
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
  },
});

const routerWithMaterials = routerWithLessons.openapi(
  listMaterialsRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        listMaterialsRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const materials = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      (trx) =>
        trx
          .selectFrom("materials")
          .selectAll()
          .where((eb) =>
            eb.or([
              eb("org_id", "is", null),
              eb("org_id", "=", session.session.orgId),
            ]),
          )
          .orderBy("name", "asc")
          .execute(),
    );

    const response = MaterialsListResponseSchema.parse({
      data: { materials },
    });

    return respond(listMaterialsRoute, c, response);
  },
);

const listTopicsRoute = createRoute({
  method: "get",
  path: "/topics",
  tags: ["Curriculum"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List topics",
      content: {
        "application/json": {
          schema: TopicsListResponseSchema as unknown as z.ZodTypeAny,
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
  },
});

const curriculumRouter = routerWithMaterials.openapi(
  listTopicsRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        listTopicsRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const topics = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      (trx) =>
        trx.selectFrom("topics").selectAll().orderBy("name", "asc").execute(),
    );

    const response = TopicsListResponseSchema.parse({
      data: { topics },
    });

    return respond(listTopicsRoute, c, response);
  },
);

export { curriculumRouter };
