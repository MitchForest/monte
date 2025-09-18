import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ApiErrorSchema,
  StudentParentDetailResponseSchema,
  StudentParentMutateResponseSchema,
  StudentParentsListResponseSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond, respondNoContent } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const routerBase = new OpenAPIHono();

const StudentParam = z.object({
  studentId: z.string().uuid(),
});

const ParentParam = StudentParam.extend({
  parentId: z.string().uuid(),
});

const CreateParentBody = z.object({
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  relation: z.string().nullable().optional(),
  preferredContactMethod: z.string().nullable().optional(),
});

const UpdateParentBody = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    relation: z.string().nullable().optional(),
    preferredContactMethod: z.string().nullable().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required",
  });

const listParentsRoute = createRoute({
  method: "get",
  path: "/:studentId/parents",
  tags: ["Student Parents"],
  request: {
    params: StudentParam,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List student parents",
      content: {
        "application/json": {
          schema: StudentParentsListResponseSchema as unknown as z.ZodTypeAny,
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
  },
});

const routerWithList = routerBase.openapi(listParentsRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listParentsRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const params = c.req.valid("param");

  const student = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("students")
        .select(["id"])
        .where("id", "=", params.studentId)
        .where("org_id", "=", session.session.orgId)
        .executeTakeFirst(),
  );

  if (!student) {
    return respond(
      listParentsRoute,
      c,
      { error: "Student not found" },
      HTTP_STATUS.notFound,
    );
  }

  const parents = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("student_parents")
        .selectAll()
        .where("student_id", "=", params.studentId)
        .orderBy("created_at", "asc")
        .execute(),
  );

  const response = StudentParentsListResponseSchema.parse({
    data: { parents },
  });

  return respond(listParentsRoute, c, response);
});

const createParentRoute = createRoute({
  method: "post",
  path: "/:studentId/parents",
  tags: ["Student Parents"],
  request: {
    params: StudentParam,
    body: {
      content: {
        "application/json": {
          schema: CreateParentBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Parent created",
      content: {
        "application/json": {
          schema: StudentParentMutateResponseSchema as unknown as z.ZodTypeAny,
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
  },
});

const routerWithCreate = routerWithList.openapi(createParentRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      createParentRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const student = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("students")
        .select(["id"])
        .where("id", "=", params.studentId)
        .where("org_id", "=", session.session.orgId)
        .executeTakeFirst(),
  );

  if (!student) {
    return respond(
      createParentRoute,
      c,
      { error: "Student not found" },
      HTTP_STATUS.notFound,
    );
  }

  try {
    const parent = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      (trx) =>
        trx
          .insertInto("student_parents")
          .values({
            id: crypto.randomUUID(),
            student_id: params.studentId,
            name: body.name,
            email: body.email ?? null,
            phone: body.phone ?? null,
            relation: body.relation ?? null,
            preferred_contact_method: body.preferredContactMethod ?? null,
            created_at: new Date().toISOString(),
          })
          .returningAll()
          .executeTakeFirstOrThrow(),
    );

    const response = StudentParentMutateResponseSchema.parse({
      data: { parent },
    });

    return respond(createParentRoute, c, response, HTTP_STATUS.created);
  } catch (_error) {
    return respond(
      createParentRoute,
      c,
      { error: "Failed to create parent" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const updateParentRoute = createRoute({
  method: "patch",
  path: "/:studentId/parents/:parentId",
  tags: ["Student Parents"],
  request: {
    params: ParentParam,
    body: {
      content: {
        "application/json": {
          schema: UpdateParentBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Parent updated",
      content: {
        "application/json": {
          schema: StudentParentMutateResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Parent not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithUpdate = routerWithCreate.openapi(updateParentRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      updateParentRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const params = c.req.valid("param");
  const body = c.req.valid("json");

  try {
    const parent = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        const studentExists = await trx
          .selectFrom("students")
          .select(["id"])
          .where("id", "=", params.studentId)
          .where("org_id", "=", session.session.orgId)
          .executeTakeFirst();

        if (!studentExists) {
          return null;
        }

        const update: Record<string, unknown> = {};
        if (body.name !== undefined) {
          update.name = body.name;
        }
        if (body.email !== undefined) {
          update.email = body.email;
        }
        if (body.phone !== undefined) {
          update.phone = body.phone;
        }
        if (body.relation !== undefined) {
          update.relation = body.relation;
        }
        if (body.preferredContactMethod !== undefined) {
          update.preferred_contact_method = body.preferredContactMethod;
        }

        const updated = await trx
          .updateTable("student_parents")
          .set(update)
          .where("id", "=", params.parentId)
          .where("student_id", "=", params.studentId)
          .returningAll()
          .executeTakeFirst();

        return updated ?? undefined;
      },
    );

    if (parent === null) {
      return respond(
        updateParentRoute,
        c,
        { error: "Student not found" },
        HTTP_STATUS.notFound,
      );
    }

    if (!parent) {
      return respond(
        updateParentRoute,
        c,
        { error: "Parent not found" },
        HTTP_STATUS.notFound,
      );
    }

    const response = StudentParentMutateResponseSchema.parse({
      data: { parent },
    });

    return respond(updateParentRoute, c, response);
  } catch (_error) {
    return respond(
      updateParentRoute,
      c,
      { error: "Failed to update parent" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const deleteParentRoute = createRoute({
  method: "delete",
  path: "/:studentId/parents/:parentId",
  tags: ["Student Parents"],
  request: {
    params: ParentParam,
  },
  responses: {
    [HTTP_STATUS.noContent]: {
      description: "Parent deleted",
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
      description: "Parent not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const studentParentsRouter = routerWithUpdate.openapi(
  deleteParentRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        deleteParentRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");

    const deleted = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      (trx) =>
        trx
          .deleteFrom("student_parents")
          .where("id", "=", params.parentId)
          .where("student_id", "=", params.studentId)
          .executeTakeFirst(),
    );

    if (!deleted) {
      return respond(
        deleteParentRoute,
        c,
        { error: "Parent not found" },
        HTTP_STATUS.notFound,
      );
    }

    return respondNoContent(deleteParentRoute, c);
  },
);

export { studentParentsRouter };
