import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { withDbContext } from "@/lib/db/context";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const data = await withDbContext(
    { userId: session.userId, orgId: session.orgId },
    async (trx) => {
      const rows = await trx.selectFrom("students").selectAll().execute();
      return rows;
    }
  );
  return Response.json({ students: data });
}

const CreateStudent = z.object({
  full_name: z.string().min(1),
  avatar_url: z.string().url().optional(),
  dob: z.string().optional(),
  primary_classroom_id: z.string().uuid().nullable().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = CreateStudent.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { full_name, avatar_url, dob, primary_classroom_id } = parsed.data;

  const created = await withDbContext(
    { userId: session.userId, orgId: session.orgId },
    async (trx) => {
      const row = await trx
        .insertInto("students")
        .values({
          id: crypto.randomUUID(),
          org_id: session.orgId,
          full_name,
          avatar_url: avatar_url ?? null,
          dob: dob ?? null,
          primary_classroom_id: primary_classroom_id ?? null,
          created_at: new Date().toISOString(),
        })
        .returningAll()
        .executeTakeFirst();
      return row ?? null;
    }
  );

  if (!created) {
    return Response.json({ error: "Failed to create" }, { status: 500 });
  }
  return Response.json({ student: created }, { status: 201 });
}
