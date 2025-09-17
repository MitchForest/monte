import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postWebhooks_Body = z
  .object({
    name: z.string().min(1).max(100),
    targetUrl: z.string().url(),
    description: z.string().optional(),
    filters: z
      .object({
        eventTypes: z
          .array(
            z.enum([
              "AnnotationEvent",
              "AssessmentEvent",
              "AssessmentItemEvent",
              "AssignableEvent",
              "FeedbackEvent",
              "ForumEvent",
              "ThreadEvent",
              "MessageEvent",
              "GradeEvent",
              "MediaEvent",
              "NavigationEvent",
              "ReadingEvent",
              "ResourceManagementEvent",
              "SearchEvent",
              "SessionEvent",
              "SurveyEvent",
              "QuestionnaireEvent",
              "SurveyInvitationEvent",
              "ToolUseEvent",
              "ViewEvent",
              "OutcomeEvent",
            ]),
          )
          .min(1),
        actorId: z.string(),
        objectType: z.string(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    active: z.boolean().optional().default(true),
    headers: z.record(z.string()).optional(),
  })
  .strict()
  .passthrough();
const putWebhooks_id_Body = z
  .object({
    name: z.string().min(1).max(100),
    targetUrl: z.string().url(),
    description: z.string(),
    filters: z
      .object({
        eventTypes: z
          .array(
            z.enum([
              "AnnotationEvent",
              "AssessmentEvent",
              "AssessmentItemEvent",
              "AssignableEvent",
              "FeedbackEvent",
              "ForumEvent",
              "ThreadEvent",
              "MessageEvent",
              "GradeEvent",
              "MediaEvent",
              "NavigationEvent",
              "ReadingEvent",
              "ResourceManagementEvent",
              "SearchEvent",
              "SessionEvent",
              "SurveyEvent",
              "QuestionnaireEvent",
              "SurveyInvitationEvent",
              "ToolUseEvent",
              "ViewEvent",
              "OutcomeEvent",
            ]),
          )
          .min(1),
        actorId: z.string(),
        objectType: z.string(),
      })
      .partial()
      .strict()
      .passthrough(),
    active: z.boolean().default(true),
    headers: z.record(z.string()),
  })
  .partial()
  .strict()
  .passthrough();

export const schemas = {
  postWebhooks_Body,
  putWebhooks_id_Body,
};

export const endpoints = makeApi([
  {
    method: "post",
    path: "/webhooks",
    alias: "postWebhooks",
    description: `Create a new webhook to receive Caliper events`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postWebhooks_Body,
      },
    ],
    response: z
      .object({
        id: z.string(),
        sensorId: z.string(),
        name: z.string(),
        targetUrl: z.string(),
        description: z.string().optional(),
        filters: z
          .object({
            eventTypes: z
              .array(
                z.enum([
                  "AnnotationEvent",
                  "AssessmentEvent",
                  "AssessmentItemEvent",
                  "AssignableEvent",
                  "FeedbackEvent",
                  "ForumEvent",
                  "ThreadEvent",
                  "MessageEvent",
                  "GradeEvent",
                  "MediaEvent",
                  "NavigationEvent",
                  "ReadingEvent",
                  "ResourceManagementEvent",
                  "SearchEvent",
                  "SessionEvent",
                  "SurveyEvent",
                  "QuestionnaireEvent",
                  "SurveyInvitationEvent",
                  "ToolUseEvent",
                  "ViewEvent",
                  "OutcomeEvent",
                ]),
              )
              .min(1),
            actorId: z.string(),
            objectType: z.string(),
          })
          .partial()
          .strict()
          .passthrough()
          .optional(),
        active: z.boolean(),
        headers: z.record(z.string()).optional(),
        secret: z.string(),
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
      })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid request`,
        schema: z
          .object({ error: z.string(), details: z.unknown().nullish() })
          .strict()
          .passthrough(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/webhooks",
    alias: "getWebhooks",
    description: `List all webhooks for the authenticated sensor`,
    requestFormat: "json",
    response: z
      .object({
        webhooks: z.array(
          z
            .object({
              id: z.string(),
              sensorId: z.string(),
              name: z.string(),
              targetUrl: z.string(),
              description: z.string().optional(),
              filters: z
                .object({
                  eventTypes: z
                    .array(
                      z.enum([
                        "AnnotationEvent",
                        "AssessmentEvent",
                        "AssessmentItemEvent",
                        "AssignableEvent",
                        "FeedbackEvent",
                        "ForumEvent",
                        "ThreadEvent",
                        "MessageEvent",
                        "GradeEvent",
                        "MediaEvent",
                        "NavigationEvent",
                        "ReadingEvent",
                        "ResourceManagementEvent",
                        "SearchEvent",
                        "SessionEvent",
                        "SurveyEvent",
                        "QuestionnaireEvent",
                        "SurveyInvitationEvent",
                        "ToolUseEvent",
                        "ViewEvent",
                        "OutcomeEvent",
                      ]),
                    )
                    .min(1),
                  actorId: z.string(),
                  objectType: z.string(),
                })
                .partial()
                .strict()
                .passthrough()
                .optional(),
              active: z.boolean(),
              headers: z.record(z.string()).optional(),
              secret: z.string(),
              createdAt: z.string().datetime({ offset: true }),
              updatedAt: z.string().datetime({ offset: true }),
            })
            .strict()
            .passthrough(),
        ),
        count: z.number(),
      })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/webhooks/:id",
    alias: "getWebhooks_id",
    description: `Get details of a specific webhook`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        id: z.string(),
        sensorId: z.string(),
        name: z.string(),
        targetUrl: z.string(),
        description: z.string().optional(),
        filters: z
          .object({
            eventTypes: z
              .array(
                z.enum([
                  "AnnotationEvent",
                  "AssessmentEvent",
                  "AssessmentItemEvent",
                  "AssignableEvent",
                  "FeedbackEvent",
                  "ForumEvent",
                  "ThreadEvent",
                  "MessageEvent",
                  "GradeEvent",
                  "MediaEvent",
                  "NavigationEvent",
                  "ReadingEvent",
                  "ResourceManagementEvent",
                  "SearchEvent",
                  "SessionEvent",
                  "SurveyEvent",
                  "QuestionnaireEvent",
                  "SurveyInvitationEvent",
                  "ToolUseEvent",
                  "ViewEvent",
                  "OutcomeEvent",
                ]),
              )
              .min(1),
            actorId: z.string(),
            objectType: z.string(),
          })
          .partial()
          .strict()
          .passthrough()
          .optional(),
        active: z.boolean(),
        headers: z.record(z.string()).optional(),
        secret: z.string(),
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
      })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Webhook not found`,
        schema: z
          .object({ error: z.literal("Webhook not found") })
          .strict()
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/webhooks/:id",
    alias: "putWebhooks_id",
    description: `Update an existing webhook`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putWebhooks_id_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        id: z.string(),
        sensorId: z.string(),
        name: z.string(),
        targetUrl: z.string(),
        description: z.string().optional(),
        filters: z
          .object({
            eventTypes: z
              .array(
                z.enum([
                  "AnnotationEvent",
                  "AssessmentEvent",
                  "AssessmentItemEvent",
                  "AssignableEvent",
                  "FeedbackEvent",
                  "ForumEvent",
                  "ThreadEvent",
                  "MessageEvent",
                  "GradeEvent",
                  "MediaEvent",
                  "NavigationEvent",
                  "ReadingEvent",
                  "ResourceManagementEvent",
                  "SearchEvent",
                  "SessionEvent",
                  "SurveyEvent",
                  "QuestionnaireEvent",
                  "SurveyInvitationEvent",
                  "ToolUseEvent",
                  "ViewEvent",
                  "OutcomeEvent",
                ]),
              )
              .min(1),
            actorId: z.string(),
            objectType: z.string(),
          })
          .partial()
          .strict()
          .passthrough()
          .optional(),
        active: z.boolean(),
        headers: z.record(z.string()).optional(),
        secret: z.string(),
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
      })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid request`,
        schema: z
          .object({ error: z.string(), details: z.unknown().nullish() })
          .strict()
          .passthrough(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Webhook not found`,
        schema: z
          .object({ error: z.literal("Webhook not found") })
          .strict()
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/webhooks/:id",
    alias: "deleteWebhooks_id",
    description: `Delete an existing webhook`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Webhook not found`,
        schema: z
          .object({ error: z.literal("Webhook not found") })
          .strict()
          .passthrough(),
      },
    ],
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const WebhooksApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
