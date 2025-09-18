import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ApiErrorSchema,
  ObservationDetailResponseSchema,
  ObservationSchema,
  ObservationsListResponseSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";

const ListObservationsQuery = z.object({
  studentId: z.string().uuid().optional(),
});

const CreateObservationBody = z.object({
  content: z.string().min(1),
  studentId: z.string().uuid().nullable().optional(),
  audioUrl: z.string().url().nullable().optional(),
});

const routerBase = new OpenAPIHono();

type ListObservationsQueryParams = z.infer<typeof ListObservationsQuery>;
type CreateObservationInput = z.infer<typeof CreateObservationBody>;

const listObservationsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Observations"],
  request: {
    query: ListObservationsQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List observations",
      content: {
        "application/json": {
          schema: ObservationsListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to load observations",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithList = routerBase.openapi(listObservationsRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listObservationsRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const query = c.req.valid("query") as ListObservationsQueryParams;

  try {
    const observations = await withDbContext(
      { userId: session.session.userId, orgId: session.session.orgId },
      async (trx) => {
        let builder = trx
          .selectFrom("observations")
          .selectAll()
          .where("org_id", "=", session.session.orgId)
          .orderBy("created_at", "desc")
          .limit(100);

        if (query.studentId) {
          builder = builder.where("student_id", "=", query.studentId);
        }

        const rows = await builder.execute();

        return rows.map((row) =>
          ObservationSchema.parse({
            ...row,
            audio_url: row.audio_url ?? null,
            created_at:
              row.created_at instanceof Date
                ? row.created_at.toISOString()
                : row.created_at,
          }),
        );
      },
    );

    const response = ObservationsListResponseSchema.parse({
      data: { observations },
    });

    return respond(listObservationsRoute, c, response);
  } catch (_error) {
    return respond(
      listObservationsRoute,
      c,
      { error: "Failed to load observations" },
      HTTP_STATUS.internalServerError,
    );
  }
});

const createObservationRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Observations"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateObservationBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Observation created",
      content: {
        "application/json": {
          schema: ObservationDetailResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.badRequest]: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to create observation",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const observationsRouter = routerWithList.openapi(
  createObservationRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        createObservationRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const body = c.req.valid("json") as CreateObservationInput;

    const audioUrl: string | null = body.audioUrl ?? null;

    const studentId = body.studentId;

    if (!studentId) {
      return respond(
        createObservationRoute,
        c,
        { error: "studentId is required" },
        HTTP_STATUS.badRequest,
      );
    }

    try {
      const observation = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        async (trx) =>
          trx
            .insertInto("observations")
            .values({
              id: crypto.randomUUID(),
              org_id: session.session.orgId,
              student_id: studentId,
              created_by: session.session.userId,
              content: body.content,
              audio_url: audioUrl,
              created_at: new Date().toISOString(),
            })
            .returningAll()
            .executeTakeFirstOrThrow(),
      );

      const parsedObservation = ObservationSchema.parse({
        ...observation,
        audio_url: observation.audio_url ?? null,
        created_at:
          observation.created_at instanceof Date
            ? observation.created_at.toISOString()
            : observation.created_at,
      });

      const response = ObservationDetailResponseSchema.parse({
        data: { observation: parsedObservation },
      });

      return respond(createObservationRoute, c, response, HTTP_STATUS.created);
    } catch (_error) {
      return respond(
        createObservationRoute,
        c,
        { error: "Failed to create observation" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

export { observationsRouter };
