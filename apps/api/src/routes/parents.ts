import { createRoute, OpenAPIHono, type z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ApiErrorSchema,
  ParentsListResponseSchema,
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

  const parents = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("student_parents as sp")
        .innerJoin("students as s", "s.id", "sp.student_id")
        .select([
          "sp.id as id",
          "sp.student_id as student_id",
          "sp.name as name",
          "sp.email as email",
          "sp.phone as phone",
          "sp.relation as relation",
          "sp.preferred_contact_method as preferred_contact_method",
          "sp.created_at as created_at",
          "s.full_name as student_name",
        ])
        .where("s.org_id", "=", session.session.orgId)
        .orderBy("sp.created_at", "asc")
        .execute(),
  );

  const shaped = parents.map((parent) =>
    StudentParentOverviewSchema.parse({
      id: parent.id,
      student_id: parent.student_id,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      relation: parent.relation,
      preferred_contact_method: parent.preferred_contact_method,
      created_at: parent.created_at,
      studentId: parent.student_id,
      studentName: parent.student_name ?? null,
    }),
  );

  const response = ParentsListResponseSchema.parse({
    data: { parents: shaped },
  });

  return respond(listParentsRoute, c, response);
});

export { router as parentsRouter };
