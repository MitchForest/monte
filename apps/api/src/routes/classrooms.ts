import { Hono } from "hono";
import { z } from "zod";
import {
  ClassroomsListResponseSchema,
  ClassroomWithGuidesSchema,
} from "@monte/shared";
import { withDbContext } from "@monte/database";
import { getServerSession } from "../lib/auth/session";

const CreateClassroomBody = z.object({
  name: z.string().min(1),
  guideIds: z.array(z.string().uuid()).optional(),
});

const router = new Hono();

router.get("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const classrooms = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        const base = await trx
          .selectFrom("classrooms")
          .select(["id", "org_id", "name", "created_at"])
          .where("org_id", "=", session.session.orgId)
          .orderBy("name", "asc")
          .execute();

        if (base.length === 0) {
          return [] as Array<z.infer<typeof ClassroomWithGuidesSchema>>;
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

        const guidesByClassroom = new Map<string, Array<{ id: string; name: string | null; email: string }>>();
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
      }
    );

    const response = ClassroomsListResponseSchema.parse({ classrooms });
    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid data", details: error.errors }, 400);
    }
    return c.json({ error: "Failed to load classrooms" }, 500);
  }
});

router.post("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = CreateClassroomBody.parse(await c.req.json());
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
              }))
            )
            .onConflict((oc) =>
              oc
                .column("classroom_id")
                .column("user_id")
                .doNothing()
            )
            .execute();
        }

        const guides = body.guideIds && body.guideIds.length > 0
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
      }
    );

    return c.json(classroom, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid request", details: error.errors }, 400);
    }
    return c.json({ error: "Failed to create classroom" }, 500);
  }
});

export { router as classroomsRouter };
