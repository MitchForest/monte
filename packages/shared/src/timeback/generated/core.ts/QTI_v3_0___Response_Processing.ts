import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsQtiV3p0ItemsByIdProcess_response_Body = z
  .object({
    responses: z.object({}).partial().strict().passthrough(),
    attemptId: z.string().optional(),
  })
  .strict();
const postImsQtiV3p0Process_response_Body = z
  .object({
    item: z
      .object({
        identifier: z.string(),
        responseDeclarations: z.array(z.unknown()).optional(),
        outcomeDeclarations: z.array(z.unknown()).optional(),
        responseProcessing: z.unknown().optional(),
        responseProcessingTemplate: z.string().optional(),
      })
      .strict(),
    responses: z.object({}).partial().strict().passthrough(),
    attemptId: z.string().optional(),
  })
  .strict();

export const schemas = {
  postImsQtiV3p0ItemsByIdProcess_response_Body,
  postImsQtiV3p0Process_response_Body,
};

export const endpoints = makeApi([
  {
    method: "post",
    path: "/ims/qti/v3p0/items/:id/process-response",
    alias: "postImsQtiV3p0ItemsByIdProcess-response",
    description: `Evaluates candidate responses against the item&#x27;s response processing rules and returns scores and feedback`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0ItemsByIdProcess_response_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            score: z.number(),
            maxScore: z.number().optional(),
            feedback: z.array(z.string()),
            outcomes: z.object({}).partial().strict().passthrough(),
            attemptId: z.string().optional(),
          })
          .strict(),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Not Found`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
    ],
  },
  {
    method: "post",
    path: "/ims/qti/v3p0/process-response",
    alias: "postImsQtiV3p0Process-response",
    description: `Process candidate responses using provided item definition and response processing rules`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0Process_response_Body,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            score: z.number(),
            maxScore: z.number().optional(),
            feedback: z.array(z.string()),
            outcomes: z.object({}).partial().strict().passthrough(),
            attemptId: z.string().optional(),
          })
          .strict(),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Not Found`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/qti/v3p0/response-processing/templates",
    alias: "getImsQtiV3p0Response-processingTemplates",
    description: `Returns a list of standard QTI response processing templates supported by the system`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            templates: z.array(
              z
                .object({
                  id: z.string(),
                  name: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      })
      .strict(),
  },
  {
    method: "post",
    path: "/ims/qti/v3p0/response-processing/validate",
    alias: "postImsQtiV3p0Response-processingValidate",
    description: `Validates QTI response processing rules for correctness`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ rules: z.unknown() }).strict(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({ valid: z.boolean(), errors: z.array(z.string()) })
          .strict(),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Not Found`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string(), details: z.unknown().optional() })
              .strict(),
          })
          .strict(),
      },
    ],
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const QTI_v3_0___Response_ProcessingApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
