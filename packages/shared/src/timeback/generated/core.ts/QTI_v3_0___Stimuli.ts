import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsQtiV3p0Stimuli_Body = z
  .object({
    identifier: z.string().min(1),
    title: z.string().min(1),
    contentType: z.string(),
    contentText: z.string().optional(),
    contentFile: z.string().optional(),
    altText: z.string().optional(),
    transcript: z.string().optional(),
    captions: z.object({}).partial().strict().passthrough().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putImsQtiV3p0StimuliById_Body = z
  .object({
    title: z.string().min(1),
    contentType: z.string(),
    content: z.string(),
    altText: z.string(),
    transcript: z.string(),
    captions: z.object({}).partial().strict().passthrough(),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();

export const schemas = {
  postImsQtiV3p0Stimuli_Body,
  putImsQtiV3p0StimuliById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/qti/v3p0/stimuli",
    alias: "getImsQtiV3p0Stimuli",
    description: `Get a paginated list of stimuli with optional content type filtering`,
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
        name: "contentType",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z.array(
          z
            .object({
              id: z
                .string()
                .regex(
                  /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
                )
                .uuid(),
              identifier: z.string(),
              title: z.string(),
              contentType: z.string(),
              contentUrl: z.union([z.string(), z.null()]),
              contentText: z.union([z.string(), z.null()]),
              altText: z.union([z.string(), z.null()]),
              transcript: z.union([z.string(), z.null()]),
              captions: z.union([
                z.object({}).partial().strict().passthrough(),
                z.null(),
              ]),
              metadata: z.union([
                z.object({}).partial().strict().passthrough(),
                z.null(),
              ]),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
            .strict()
        ),
        pagination: z
          .object({
            page: z.number(),
            pageSize: z.number(),
            totalItems: z.number(),
            totalPages: z.number(),
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
    path: "/ims/qti/v3p0/stimuli",
    alias: "postImsQtiV3p0Stimuli",
    description: `Create a new stimulus`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0Stimuli_Body,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            id: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            identifier: z.string(),
            title: z.string(),
            contentType: z.string(),
            contentUrl: z.union([z.string(), z.null()]),
            contentText: z.union([z.string(), z.null()]),
            altText: z.union([z.string(), z.null()]),
            transcript: z.union([z.string(), z.null()]),
            captions: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
            metadata: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
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
        status: 409,
        description: `Conflict - Stimulus identifier already exists`,
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
    path: "/ims/qti/v3p0/stimuli/:id",
    alias: "getImsQtiV3p0StimuliById",
    description: `Get a specific stimulus by ID`,
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
        success: z.boolean(),
        data: z
          .object({
            id: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            identifier: z.string(),
            title: z.string(),
            contentType: z.string(),
            contentUrl: z.union([z.string(), z.null()]),
            contentText: z.union([z.string(), z.null()]),
            altText: z.union([z.string(), z.null()]),
            transcript: z.union([z.string(), z.null()]),
            captions: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
            metadata: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
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
    path: "/ims/qti/v3p0/stimuli/:id",
    alias: "putImsQtiV3p0StimuliById",
    description: `Update an existing stimulus`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsQtiV3p0StimuliById_Body,
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
            id: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            identifier: z.string(),
            title: z.string(),
            contentType: z.string(),
            contentUrl: z.union([z.string(), z.null()]),
            contentText: z.union([z.string(), z.null()]),
            altText: z.union([z.string(), z.null()]),
            transcript: z.union([z.string(), z.null()]),
            captions: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
            metadata: z.union([
              z.object({}).partial().strict().passthrough(),
              z.null(),
            ]),
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
    path: "/ims/qti/v3p0/stimuli/:id",
    alias: "deleteImsQtiV3p0StimuliById",
    description: `Delete an existing stimulus`,
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
        description: `Bad Request - Stimulus is linked to items`,
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
    path: "/ims/qti/v3p0/stimuli/:id/items",
    alias: "getImsQtiV3p0StimuliByIdItems",
    description: `Get all assessment items linked to a specific stimulus`,
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
        success: z.boolean(),
        data: z.array(
          z
            .object({
              id: z.string(),
              identifier: z.string(),
              title: z.string(),
              interactionType: z.string(),
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

export const QTI_v3_0___StimuliApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
