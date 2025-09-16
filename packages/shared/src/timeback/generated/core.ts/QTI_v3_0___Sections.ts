import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsQtiV3p0Sections_Body = z
  .object({
    testPartId: z.string(),
    parentSectionId: z.string().optional(),
    identifier: z.string().min(1),
    title: z.string().min(1),
    visible: z.boolean().default(true),
    required: z.boolean().default(true),
    fixed: z.boolean().default(false),
    rubricRefs: z.array(z.string()).optional(),
    sequence: z.number().gte(0).default(0),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putImsQtiV3p0SectionsById_Body = z
  .object({
    title: z.string().min(1),
    visible: z.boolean(),
    required: z.boolean(),
    fixed: z.boolean(),
    rubricRefs: z.array(z.string()),
    sequence: z.number().gte(0),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();
const postImsQtiV3p0SectionsByIdItems_Body = z
  .object({
    items: z
      .array(
        z
          .object({
            assessmentItemId: z.string(),
            sequence: z.number().optional(),
            weight: z
              .string()
              .regex(/^\d+(\.\d+)?$/)
              .default("1.0"),
            required: z.boolean().default(true),
            fixed: z.boolean().default(false),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const schemas = {
  postImsQtiV3p0Sections_Body,
  putImsQtiV3p0SectionsById_Body,
  postImsQtiV3p0SectionsByIdItems_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/qti/v3p0/sections",
    alias: "getImsQtiV3p0Sections",
    description: `Get a paginated list of sections with optional filtering`,
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
        name: "testPartId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "parentSectionId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "visible",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "required",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z
      .object({
        sections: z.array(
          z
            .object({
              id: z.string(),
              testPartId: z.union([z.string(), z.null()]),
              parentSectionId: z.union([z.string(), z.null()]),
              identifier: z.string(),
              title: z.string(),
              visible: z.boolean(),
              required: z.boolean(),
              fixed: z.boolean(),
              rubricRefs: z.union([z.array(z.string()), z.null()]),
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
    path: "/ims/qti/v3p0/sections",
    alias: "postImsQtiV3p0Sections",
    description: `Create a new section within a test part`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0Sections_Body,
      },
    ],
    response: z
      .object({
        section: z
          .object({
            id: z.string(),
            testPartId: z.union([z.string(), z.null()]),
            parentSectionId: z.union([z.string(), z.null()]),
            identifier: z.string(),
            title: z.string(),
            visible: z.boolean(),
            required: z.boolean(),
            fixed: z.boolean(),
            rubricRefs: z.union([z.array(z.string()), z.null()]),
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
        description: `Not Found - Test part or parent section not found`,
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
    path: "/ims/qti/v3p0/sections/:id",
    alias: "getImsQtiV3p0SectionsById",
    description: `Get a specific section by ID`,
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
        section: z
          .object({
            id: z.string(),
            testPartId: z.union([z.string(), z.null()]),
            parentSectionId: z.union([z.string(), z.null()]),
            identifier: z.string(),
            title: z.string(),
            visible: z.boolean(),
            required: z.boolean(),
            fixed: z.boolean(),
            rubricRefs: z.union([z.array(z.string()), z.null()]),
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
    path: "/ims/qti/v3p0/sections/:id",
    alias: "putImsQtiV3p0SectionsById",
    description: `Update an existing section`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsQtiV3p0SectionsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        section: z
          .object({
            id: z.string(),
            testPartId: z.union([z.string(), z.null()]),
            parentSectionId: z.union([z.string(), z.null()]),
            identifier: z.string(),
            title: z.string(),
            visible: z.boolean(),
            required: z.boolean(),
            fixed: z.boolean(),
            rubricRefs: z.union([z.array(z.string()), z.null()]),
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
    path: "/ims/qti/v3p0/sections/:id",
    alias: "deleteImsQtiV3p0SectionsById",
    description: `Delete an existing section`,
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
        description: `Bad Request - Section has child sections or items`,
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
    path: "/ims/qti/v3p0/sections/:id/items",
    alias: "getImsQtiV3p0SectionsByIdItems",
    description: `Get all items in a specific section`,
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
        items: z.array(
          z
            .object({
              id: z.string(),
              sectionId: z.union([z.string(), z.null()]),
              assessmentItemId: z.union([z.string(), z.null()]),
              sequence: z.number(),
              weight: z.string(),
              required: z.boolean(),
              fixed: z.boolean(),
              createdAt: z.string(),
              item: z
                .object({
                  id: z.string(),
                  identifier: z.string(),
                  title: z.string(),
                  interactionType: z.string(),
                })
                .strict()
                .optional(),
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
  {
    method: "post",
    path: "/ims/qti/v3p0/sections/:id/items",
    alias: "postImsQtiV3p0SectionsByIdItems",
    description: `Add one or more assessment items to a section`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0SectionsByIdItems_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        items: z.array(
          z
            .object({
              id: z.string(),
              sectionId: z.union([z.string(), z.null()]),
              assessmentItemId: z.union([z.string(), z.null()]),
              sequence: z.number(),
              weight: z.string(),
              required: z.boolean(),
              fixed: z.boolean(),
              createdAt: z.string(),
              item: z
                .object({
                  id: z.string(),
                  identifier: z.string(),
                  title: z.string(),
                  interactionType: z.string(),
                })
                .strict()
                .optional(),
            })
            .strict()
        ),
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
        description: `Not Found - Section or assessment item not found`,
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
    method: "delete",
    path: "/ims/qti/v3p0/sections/:id/items/:itemId",
    alias: "deleteImsQtiV3p0SectionsByIdItemsByItemId",
    description: `Remove an assessment item from a section`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "itemId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
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
        description: `Not Found - Section item association not found`,
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
]);

export type EndpointDefinitions = typeof endpoints;

export const QTI_v3_0___SectionsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
