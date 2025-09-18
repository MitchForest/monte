import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import type { ActionStatus, ActionType } from "@monte/shared";
import {
  ActionDetailResponseSchema,
  ActionSchema,
  ActionStatusSchema,
  ActionsListResponseSchema,
  ActionTypeSchema,
  ApiErrorSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const routerBase = new OpenAPIHono();

const ListTasksQuery = z.object({
  type: ActionTypeSchema.optional(),
  status: ActionStatusSchema.optional(),
  assignedTo: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
});

const CreateTaskBody = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  studentId: z.string().uuid(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  type: ActionTypeSchema,
  assignedToUserId: z.string().uuid().nullable().optional(),
});

const UpdateTaskBody = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: ActionStatusSchema.optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    assignedToUserId: z.string().uuid().nullable().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required",
  });

type ListTasksQueryParams = z.infer<typeof ListTasksQuery>;
type CreateTaskInput = z.infer<typeof CreateTaskBody>;
type UpdateTaskInput = z.infer<typeof UpdateTaskBody>;

const listTasksRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Tasks"],
  request: {
    query: ListTasksQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List tasks",
      content: {
        "application/json": {
          schema: ActionsListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to load tasks",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const createTaskRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Tasks"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateTaskBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Task created",
      content: {
        "application/json": {
          schema: ActionDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to create task",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const TaskParam = z.object({
  id: z.string().uuid(),
});

const updateTaskRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Tasks"],
  request: {
    params: TaskParam,
    body: {
      content: {
        "application/json": {
          schema: UpdateTaskBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Task updated",
      content: {
        "application/json": {
          schema: ActionDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Task not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to update task",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

function toDateOnly(input: unknown) {
  if (input instanceof Date) {
    return input.toISOString().slice(0, 10);
  }
  return input ?? null;
}

function normalizeAction(action: unknown) {
  return ActionSchema.parse({
    ...(action as Record<string, unknown>),
    description: (action as { description?: unknown }).description ?? null,
    assigned_to_user_id:
      (action as { assigned_to_user_id?: unknown }).assigned_to_user_id ?? null,
    due_date: toDateOnly((action as { due_date?: unknown }).due_date),
    completed_at:
      (action as { completed_at?: unknown }).completed_at instanceof Date
        ? (
            (action as { completed_at?: Date }).completed_at as Date
          ).toISOString()
        : ((action as { completed_at?: unknown }).completed_at ?? null),
    created_at:
      (action as { created_at?: unknown }).created_at instanceof Date
        ? ((action as { created_at?: Date }).created_at as Date).toISOString()
        : (action as { created_at?: unknown }).created_at,
    updated_at:
      (action as { updated_at?: unknown }).updated_at instanceof Date
        ? ((action as { updated_at?: Date }).updated_at as Date).toISOString()
        : ((action as { updated_at?: unknown }).updated_at ?? null),
    completed_by: (action as { completed_by?: unknown }).completed_by ?? null,
    recurring_rule:
      (action as { recurring_rule?: unknown }).recurring_rule ?? null,
  });
}

const routerWithList = routerBase.openapi(listTasksRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listTasksRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query") as ListTasksQueryParams;

  try {
    const actions = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        let builder = trx
          .selectFrom("actions")
          .selectAll()
          .where("org_id", "=", session.session.orgId)
          .orderBy("created_at", "desc")
          .limit(200);

        const { type, status, assignedTo, studentId } = query;

        if (type) {
          builder = builder.where("type", "=", type as ActionType);
        }
        if (status) {
          builder = builder.where("status", "=", status as ActionStatus);
        }
        if (assignedTo) {
          builder = builder.where("assigned_to_user_id", "=", assignedTo);
        }
        if (studentId) {
          builder = builder.where("student_id", "=", studentId);
        }

        const rows = await builder.execute();
        return rows.map((row) => normalizeAction(row));
      },
    );

    const response = ActionsListResponseSchema.parse({
      data: { actions },
    });

    return respond(listTasksRoute, c, response);
  } catch (_error) {
    return respond(
      listTasksRoute,
      c,
      { error: "Failed to load tasks" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const routerWithCreate = routerWithList.openapi(createTaskRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      createTaskRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const body = c.req.valid("json") as CreateTaskInput;

  try {
    const action = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) =>
        trx
          .insertInto("actions")
          .values({
            id: crypto.randomUUID(),
            org_id: session.session.orgId,
            student_id: body.studentId,
            type: body.type as ActionType,
            title: body.title,
            description: body.description ?? null,
            assigned_to_user_id: body.assignedToUserId ?? null,
            due_date: body.dueDate ?? null,
            status: "pending" as ActionStatus,
            created_by: session.session.userId,
            created_at: new Date().toISOString(),
          })
          .returningAll()
          .executeTakeFirstOrThrow(),
    );

    const parsed = normalizeAction(action);
    const response = ActionDetailResponseSchema.parse({
      data: { action: parsed },
    });

    return respond(createTaskRoute, c, response, HTTP_STATUS.created);
  } catch (_error) {
    return respond(
      createTaskRoute,
      c,
      { error: "Failed to create task" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const tasksRouter = routerWithCreate.openapi(updateTaskRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      updateTaskRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const params = c.req.valid("param");
  const body = c.req.valid("json") as UpdateTaskInput;

  try {
    const action = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        const update: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
          updated_by: session.session.userId,
        };

        if (body.title !== undefined) {
          update.title = body.title;
        }
        if (body.description !== undefined) {
          update.description = body.description ?? null;
        }
        if (body.assignedToUserId !== undefined) {
          update.assigned_to_user_id = body.assignedToUserId ?? null;
        }
        if (body.dueDate !== undefined) {
          update.due_date = body.dueDate ?? null;
        }
        if (body.status !== undefined) {
          update.status = body.status as ActionStatus;
          if (body.status === "completed") {
            update.completed_at = new Date().toISOString();
            update.completed_by = session.session.userId;
          } else {
            update.completed_at = null;
            update.completed_by = null;
          }
        }

        const updated = await trx
          .updateTable("actions")
          .set(update)
          .where("id", "=", params.id)
          .where("org_id", "=", session.session.orgId)
          .returningAll()
          .executeTakeFirst();

        if (!updated) {
          return null;
        }

        return updated;
      },
    );

    if (!action) {
      return respond(
        updateTaskRoute,
        c,
        { error: "Task not found" },
        HTTP_STATUS.notFound,
      );
    }

    const parsed = normalizeAction(action);
    const response = ActionDetailResponseSchema.parse({
      data: { action: parsed },
    });

    return respond(updateTaskRoute, c, response);
  } catch (_error) {
    return respond(
      updateTaskRoute,
      c,
      { error: "Failed to update task" },
      HTTP_STATUS.internalServerError,
    );
  }
});

export { tasksRouter };
