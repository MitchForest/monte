import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDbContext } from "@monte/database";
import {
  ApiErrorSchema,
  StudentSummariesListResponseSchema,
  StudentSummaryDetailResponseSchema,
  SummaryScopeSchema,
} from "@monte/shared";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";
import {
  createStudentSummary,
  sendExistingStudentSummary,
  type StudentSummaryRequest,
} from "../services/student-summaries";

const routerBase = new OpenAPIHono();

const SummaryDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .or(z.string().datetime({ offset: false }));

const CreateSummaryBody = z.object({
  studentId: z.string().uuid(),
  scope: SummaryScopeSchema.default("today"),
  from: SummaryDateSchema.optional(),
  to: SummaryDateSchema.optional(),
  includeObservations: z.boolean().optional(),
  includeTasks: z.boolean().optional(),
  includeLessons: z.boolean().optional(),
  includeHabits: z.boolean().optional(),
  manualNotes: z.string().max(2000).optional(),
  model: z.string().optional(),
  sendEmail: z
    .object({
      parentIds: z.array(z.string().uuid()).optional(),
      emails: z.array(z.string().email()).optional(),
    })
    .optional(),
});

const SummaryQuery = z.object({
  studentId: z.string().uuid().optional(),
});

const SummaryParam = z.object({
  id: z.string().uuid(),
});

const SendSummaryBody = z.object({
  parentIds: z.array(z.string().uuid()).optional(),
  emails: z.array(z.string().email()).optional(),
});

const listStudentSummariesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Student Summaries"],
  request: {
    query: SummaryQuery,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List student summaries",
      content: {
        "application/json": {
          schema: StudentSummariesListResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to load summaries",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithList = routerBase.openapi(
  listStudentSummariesRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        listStudentSummariesRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const query = c.req.valid("query");

    try {
      const summaries = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        (trx) => {
          let builder = trx
            .selectFrom("student_summaries")
            .selectAll()
            .where("org_id", "=", session.session.orgId)
            .orderBy("created_at", "desc")
            .limit(50);

          if (query.studentId) {
            builder = builder.where("student_id", "=", query.studentId);
          }

          return builder.execute();
        },
      );

      const response = StudentSummariesListResponseSchema.parse({
        data: { summaries: summaries.map((summary) => ({ ...summary })) },
      });

      return respond(listStudentSummariesRoute, c, response);
    } catch (_error) {
      return respond(
        listStudentSummariesRoute,
        c,
        { error: "Failed to load summaries" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const getStudentSummaryRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Student Summaries"],
  request: {
    params: SummaryParam,
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Get summary detail",
      content: {
        "application/json": {
          schema: StudentSummaryDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Summary not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.internalServerError]: {
      description: "Failed to load summary",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const routerWithDetail = routerWithList.openapi(
  getStudentSummaryRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        getStudentSummaryRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");

    try {
      const summary = await withDbContext(
        { userId: session.session.userId, orgId: session.session.orgId },
        async (trx) => {
          const record = await trx
            .selectFrom("student_summaries")
            .selectAll()
            .where("org_id", "=", session.session.orgId)
            .where("id", "=", params.id)
            .executeTakeFirst();

          if (!record) {
            return null;
          }

          const recipients = await trx
            .selectFrom("student_summary_recipients")
            .selectAll()
            .where("summary_id", "=", params.id)
            .execute();

          return { record, recipients };
        },
      );

      if (!summary) {
        return respond(
          getStudentSummaryRoute,
          c,
          { error: "Summary not found" },
          HTTP_STATUS.notFound,
        );
      }

      const parsed = StudentSummaryDetailResponseSchema.parse({
        data: {
          summary: summary.record,
          recipients: summary.recipients,
        },
      });

      return respond(getStudentSummaryRoute, c, parsed);
    } catch (_error) {
      return respond(
        getStudentSummaryRoute,
        c,
        { error: "Failed to load summary" },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const createStudentSummaryRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Student Summaries"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSummaryBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Student summary created",
      content: {
        "application/json": {
          schema: StudentSummaryDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to create summary",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const router = routerWithDetail.openapi(
  createStudentSummaryRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        createStudentSummaryRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const body = CreateSummaryBody.parse(c.req.valid("json"));
    const scope = SummaryScopeSchema.parse(body.scope);
    const payload: StudentSummaryRequest = {
      ...body,
      scope,
    };

    try {
      const { summary, recipients } = await createStudentSummary({
        session,
        payload,
      });

      const response = StudentSummaryDetailResponseSchema.parse({
        data: {
          summary,
          recipients,
        },
      });

      return respond(
        createStudentSummaryRoute,
        c,
        response,
        HTTP_STATUS.created,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create summary";
      return respond(
        createStudentSummaryRoute,
        c,
        { error: message },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

const sendStudentSummaryRoute = createRoute({
  method: "post",
  path: "/:id/send",
  tags: ["Student Summaries"],
  request: {
    params: SummaryParam,
    body: {
      content: {
        "application/json": {
          schema: SendSummaryBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Student summary sent",
      content: {
        "application/json": {
          schema: StudentSummaryDetailResponseSchema as unknown as z.ZodTypeAny,
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
      description: "Failed to send summary",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

const studentSummariesRouter = router.openapi(
  sendStudentSummaryRoute,
  async (c) => {
    const session = await getServerSession(c.req.raw);
    if (!session) {
      return respond(
        sendStudentSummaryRoute,
        c,
        { error: "Unauthorized" },
        HTTP_STATUS.unauthorized,
      );
    }

    const params = c.req.valid("param");
    const body = SendSummaryBody.parse(c.req.valid("json"));

    try {
      const result = await sendExistingStudentSummary({
        session,
        summaryId: params.id,
        parentIds: body.parentIds,
        emails: body.emails,
      });

      const response = StudentSummaryDetailResponseSchema.parse({
        data: {
          summary: result.summary,
          recipients: result.recipients,
        },
      });

      return respond(sendStudentSummaryRoute, c, response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send summary";
      return respond(
        sendStudentSummaryRoute,
        c,
        { error: message },
        HTTP_STATUS.internalServerError,
      );
    }
  },
);

export { studentSummariesRouter };
