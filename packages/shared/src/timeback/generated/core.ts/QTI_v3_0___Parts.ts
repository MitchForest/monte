import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsQtiV3p0Parts_Body = z
  .object({
    assessmentTestId: z.string(),
    identifier: z.string().min(1),
    navigationMode: z.enum(["linear", "nonlinear"]).default("linear"),
    submissionMode: z
      .enum(["individual", "simultaneous"])
      .default("individual"),
    itemSelectionRules: z
      .object({ select: z.number(), withReplacement: z.boolean() })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    timeLimits: z
      .object({
        minTime: z.number(),
        maxTime: z.number(),
        allowLateSubmission: z.boolean(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    sequence: z.number().gte(0).default(0),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putImsQtiV3p0PartsById_Body = z
  .object({
    navigationMode: z.enum(["linear", "nonlinear"]),
    submissionMode: z.enum(["individual", "simultaneous"]),
    itemSelectionRules: z
      .object({ select: z.number(), withReplacement: z.boolean() })
      .partial()
      .strict()
      .passthrough(),
    timeLimits: z
      .object({
        minTime: z.number(),
        maxTime: z.number(),
        allowLateSubmission: z.boolean(),
      })
      .partial()
      .strict()
      .passthrough(),
    sequence: z.number().gte(0),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();

export const schemas = {
  postImsQtiV3p0Parts_Body,
  putImsQtiV3p0PartsById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/qti/v3p0/parts",
    alias: "getImsQtiV3p0Parts",
    description: `Get a paginated list of test parts with optional filtering`,
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().gte(1).lte(100).default(20),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().gte(0).default(0),
      },
      {
        name: "assessmentTestId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "navigationMode",
        type: "Query",
        schema: z.enum(["linear", "nonlinear"]).optional(),
      },
      {
        name: "submissionMode",
        type: "Query",
        schema: z.enum(["individual", "simultaneous"]).optional(),
      },
    ],
    response: z
      .object({
        parts: z.array(
          z
            .object({
              id: z.string(),
              assessmentTestId: z.union([z.string(), z.null()]),
              identifier: z.string(),
              navigationMode: z.union([z.string(), z.null()]),
              submissionMode: z.union([z.string(), z.null()]),
              itemSelectionRules: z.union([
                z.object({}).partial().strict().passthrough(),
                z.null(),
              ]),
              timeLimits: z.union([
                z.object({}).partial().strict().passthrough(),
                z.null(),
              ]),
              sequence: z.number(),
              metadata: z.object({}).partial().strict().passthrough(),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
            .strict()
        ),
        pagination: z
          .object({
            limit: z.number(),
            offset: z.number(),
            total: z.number(),
            hasMore: z.boolean(),
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
    path: "/ims/qti/v3p0/parts",
    alias: "postImsQtiV3p0Parts",
    description: `Create a new test part`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0Parts_Body,
      },
    ],
    response: z
      .object({
        part: z
          .object({
            id: z.string(),
            assessmentTestId: z.union([z.string(), z.null()]),
            identifier: z.string(),
            navigationMode: z.union([z.string(), z.null()]),
            submissionMode: z.union([z.string(), z.null()]),
            itemSelectionRules: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
            timeLimits: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
            sequence: z.number(),
            metadata: z.object({}).partial().strict().passthrough(),
            createdAt: z.string(),
            updatedAt: z.string(),
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
        status: 404,
        description: `Not Found - Assessment test not found`,
        schema: z
          .object({
            success: z.boolean(),
            error: z.object({ message: z.string() }).strict(),
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
    path: "/ims/qti/v3p0/parts/:id",
    alias: "getImsQtiV3p0PartsById",
    description: `Get a specific test part by ID`,
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
        part: z
          .object({
            id: z.string(),
            assessmentTestId: z.union([z.string(), z.null()]),
            identifier: z.string(),
            navigationMode: z.union([z.string(), z.null()]),
            submissionMode: z.union([z.string(), z.null()]),
            itemSelectionRules: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
            timeLimits: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
            sequence: z.number(),
            metadata: z.object({}).partial().strict().passthrough(),
            createdAt: z.string(),
            updatedAt: z.string(),
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
    method: "put",
    path: "/ims/qti/v3p0/parts/:id",
    alias: "putImsQtiV3p0PartsById",
    description: `Update an existing test part`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsQtiV3p0PartsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        part: z
          .object({
            id: z.string(),
            assessmentTestId: z.union([z.string(), z.null()]),
            identifier: z.string(),
            navigationMode: z.union([z.string(), z.null()]),
            submissionMode: z.union([z.string(), z.null()]),
            itemSelectionRules: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
            timeLimits: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
            sequence: z.number(),
            metadata: z.object({}).partial().strict().passthrough(),
            createdAt: z.string(),
            updatedAt: z.string(),
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
    method: "delete",
    path: "/ims/qti/v3p0/parts/:id",
    alias: "deleteImsQtiV3p0PartsById",
    description: `Delete an existing test part`,
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
        status: 400,
        description: `Bad Request - Part has associated sections`,
        schema: z
          .object({
            success: z.boolean(),
            error: z.object({ message: z.string() }).strict(),
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
    path: "/ims/qti/v3p0/parts/:id/sections",
    alias: "getImsQtiV3p0PartsByIdSections",
    description: `Get all sections for a specific test part`,
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
        sections: z.array(
          z
            .object({
              id: z.string(),
              identifier: z.string(),
              title: z.string(),
              sequence: z.number(),
            })
            .strict()
        ),
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
]);

export type EndpointDefinitions = typeof endpoints;

export const QTI_v3_0___PartsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
