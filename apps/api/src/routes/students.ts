import { Hono } from "hono";
import { z } from "zod";
import { withDbContext } from "@monte/database";
import { getServerSession } from "../lib/auth/session";

const router = new Hono();

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

// GET /students
router.get("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const query = GetStudentsQuery.parse(c.req.query());

    const students = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        let queryBuilder = trx
          .selectFrom("students")
          .leftJoin("classrooms", "classrooms.id", "students.primary_classroom_id")
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
            `%${query.search.trim()}%`
          );
        }
        if (query.classroomId) {
          queryBuilder = queryBuilder.where(
            "primary_classroom_id",
            "=",
            query.classroomId
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
      }
    );

    return c.json({ students });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid query parameters", details: error.errors },
        400
      );
    }
    return c.json({ error: "Failed to fetch students" }, 500);
  }
});

// POST /students
router.post("/", async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = CreateStudentBody.parse(await c.req.json());

    const student = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        return trx
          .insertInto("students")
          .values({
            id: crypto.randomUUID(),
            org_id: session.session.orgId,
            full_name: body.full_name,
            dob: body.dob,
            primary_classroom_id: body.primary_classroom_id,
            avatar_url: body.avatar_url,
            created_at: new Date().toISOString()
          })
          .returningAll()
          .executeTakeFirstOrThrow();
      }
    );

    return c.json({ student }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request body", details: error.errors },
        400
      );
    }
    return c.json({ error: "Failed to create student" }, 500);
  }
});

export { router as studentsRouter };
