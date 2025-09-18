import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ApiErrorSchema,
  ClassroomCreatedResponseSchema,
  ClassroomsListResponseSchema,
  ClassroomWithGuidesSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const routerBase = new OpenAPIHono();

const ListClassroomsQuery = z.object({
  search: z.string().optional(),
});

const CreateClassroomBody = z.object({
  name: z.string().min(1),
  guideIds: z.array(z.string().uuid()).optional(),
});

const listClassroomsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Classrooms"],
  request: {
    query: ListClassroomsQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List classrooms",
      content: {
        "application/json": {
          schema: ClassroomsListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to load classrooms",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithList = routerBase.openapi(listClassroomsRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listClassroomsRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query");

  try {
    const classrooms = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        let queryBuilder = trx
          .selectFrom("classrooms")
          .select(["id", "org_id", "name", "created_at"])
          .where("org_id", "=", session.session.orgId)
          .orderBy("name", "asc");

        if (query.search && query.search.trim().length > 0) {
          queryBuilder = queryBuilder.where(
            "name",
            "ilike",
            `%${query.search.trim()}%`,
          );
        }

        const base = await queryBuilder.execute();

        if (base.length === 0) {
          return [] as z.infer<typeof ClassroomWithGuidesSchema>[];
        }

        const classroomIds = base.map((room) => room.id);

        const guideRows = await trx
          .selectFrom("classroom_guides")
          .innerJoin("users", "users.id", "classroom_guides.user_id")
          .select([
            "classroom_guides.classroom_id as classroom_id",
            "users.id as id",
            "users.name as name",
            "users.email as email",
          ])
          .where("classroom_guides.classroom_id", "in", classroomIds)
          .execute();

        const guidesByClassroom = new Map<
          string,
          { id: string; name: string | null; email: string }[]
        >();

        for (const guide of guideRows) {
          if (!guidesByClassroom.has(guide.classroom_id)) {
            guidesByClassroom.set(guide.classroom_id, []);
          }
          guidesByClassroom.get(guide.classroom_id)?.push({
            id: guide.id,
            name: guide.name,
            email: guide.email,
          });
        }

        return base.map((room) => ({
          ...room,
          guides: guidesByClassroom.get(room.id) ?? [],
        }));
      },
    );

    const response = ClassroomsListResponseSchema.parse({
      data: { classrooms },
    });
    return respond(listClassroomsRoute, c, response);
  } catch (_error) {
    return respond(
      listClassroomsRoute,
      c,
      { error: "Failed to load classrooms" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const createClassroomRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Classrooms"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateClassroomBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Classroom created",
      content: {
        "application/json": {
          schema: ClassroomCreatedResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to create classroom",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const router = routerWithList.openapi(createClassroomRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      createClassroomRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const body = c.req.valid("json");

  try {
    const classroom = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        const created = await trx
          .insertInto("classrooms")
          .values({
            id: crypto.randomUUID(),
            org_id: session.session.orgId,
            name: body.name.trim(),
            created_at: new Date().toISOString(),
          })
          .returning(["id", "org_id", "name", "created_at"])
          .executeTakeFirstOrThrow();

        if (body.guideIds && body.guideIds.length > 0) {
          await trx
            .insertInto("classroom_guides")
            .values(
              body.guideIds.map((guideId) => ({
                id: crypto.randomUUID(),
                classroom_id: created.id,
                user_id: guideId,
              })),
            )
            .onConflict((oc) =>
              oc.column("classroom_id").column("user_id").doNothing(),
            )
            .execute();
        }

        const guides =
          body.guideIds && body.guideIds.length > 0
            ? await trx
                .selectFrom("users")
                .select(["id", "name", "email"])
                .where("id", "in", body.guideIds)
                .execute()
            : [];

        return ClassroomWithGuidesSchema.parse({
          ...created,
          guides,
        });
      },
    );

    const response = ClassroomCreatedResponseSchema.parse({
      data: { classroom },
    });
    return respond(createClassroomRoute, c, response, HTTP_STATUS.created);
  } catch (_error) {
    return respond(
      createClassroomRoute,
      c,
      { error: "Failed to create classroom" },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { router as classroomsRouter };
