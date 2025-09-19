import { createRoute, OpenAPIHono, type z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ApiErrorSchema,
  ParentsListResponseSchema,
  type StudentParentOverview,
  StudentParentOverviewSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const router = new OpenAPIHono();

const listParentsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Parents"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List parents across the organization",
      content: {
        "application/json": {
          schema: ParentsListResponseSchema as unknown as z.ZodTypeAny,
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

router.openapi(listParentsRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listParentsRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const baseContext = {
    userId: session.session.userId,
    orgId: session.session.orgId,
  } as const;

  const guardianRows = await withDbContext(baseContext, (trx) =>
    trx
      .selectFrom("student_guardians as sg")
      .innerJoin("guardians as g", "g.id", "sg.guardian_id")
      .innerJoin(
        "students as s",
        "s.oneroster_user_id",
        "sg.student_sourced_id",
      )
      .select([
        "g.id as guardian_id",
        "g.sourced_id as guardian_sourced_id",
        "g.name as guardian_name",
        "g.email as guardian_email",
        "g.phone as guardian_phone",
        "g.relation as guardian_relation",
        "g.synced_at as guardian_synced_at",
        "sg.relation as link_relation",
        "s.id as student_id",
        "s.full_name as student_name",
      ])
      .where("s.org_id", "=", session.session.orgId)
      .where("s.status", "=", "active")
      .where("s.deleted_at", "is", null)
      .where("g.status", "=", "active")
      .where("g.deleted_at", "is", null)
      .execute(),
  );

  const legacyRows = await withDbContext(baseContext, (trx) =>
    trx
      .selectFrom("student_parents as sp")
      .innerJoin("students as s", "s.id", "sp.student_id")
      .select([
        "sp.id as parent_id",
        "sp.student_id as student_id",
        "s.full_name as student_name",
        "sp.name as name",
        "sp.email as email",
        "sp.phone as phone",
        "sp.relation as relation",
        "sp.preferred_contact_method as preferred_contact_method",
        "sp.created_at as created_at",
      ])
      .where("s.org_id", "=", session.session.orgId)
      .where("sp.status", "=", "active")
      .where("sp.deleted_at", "is", null)
      .execute(),
  );

  const parentsByKey = new Map<string, StudentParentOverview>();

  for (const row of guardianRows) {
    const preferredContact = resolvePreferredContact(
      row.guardian_email,
      row.guardian_phone,
    );
    const key = buildContactKey(
      row.guardian_email,
      row.guardian_phone,
      row.guardian_id,
    );
    parentsByKey.set(
      key,
      StudentParentOverviewSchema.parse({
        id: row.guardian_id,
        student_id: row.student_id,
        name: row.guardian_name,
        email: row.guardian_email,
        phone: row.guardian_phone,
        relation: row.link_relation ?? row.guardian_relation,
        preferred_contact_method: preferredContact,
        created_at: row.guardian_synced_at,
        studentId: row.student_id,
        studentName: row.student_name ?? null,
        source: "timeback",
      }),
    );
  }

  for (const row of legacyRows) {
    const key = buildContactKey(row.email, row.phone, row.parent_id);
    if (parentsByKey.has(key)) {
      continue;
    }
    parentsByKey.set(
      key,
      StudentParentOverviewSchema.parse({
        id: row.parent_id,
        student_id: row.student_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        relation: row.relation,
        preferred_contact_method: row.preferred_contact_method,
        created_at: row.created_at,
        studentId: row.student_id,
        studentName: row.student_name ?? null,
        source: "local",
      }),
    );
  }

  const parentsArray: StudentParentOverview[] = [...parentsByKey.values()];
  const parents = parentsArray.sort((a, b) => a.name.localeCompare(b.name));

  const response = ParentsListResponseSchema.parse({
    data: { parents },
  });

  return respond(listParentsRoute, c, response);
});

export function resolvePreferredContact(
  email: string | null,
  phone: string | null,
): string | null {
  if (email && email.trim().length > 0) {
    return "email";
  }
  if (phone && phone.trim().length > 0) {
    return "phone";
  }
  return null;
}

export function buildContactKey(
  email: string | null,
  phone: string | null,
  fallback: string,
): string {
  if (email && email.trim().length > 0) {
    return email.trim().toLowerCase();
  }
  if (phone && phone.trim().length > 0) {
    return phone.trim();
  }
  return fallback;
}

export { router as parentsRouter };
