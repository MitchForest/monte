import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsQtiV3p0Assessment_items_Body = z
  .object({
    identifier: z.string().min(1).max(255),
    title: z.string().min(1).max(500),
    label: z.string().optional(),
    language: z.string().default("en-US"),
    interactionType: z.enum([
      "choice",
      "textEntry",
      "extendedText",
      "match",
      "inlineChoice",
      "order",
      "associateInteraction",
      "gapMatch",
      "hottext",
      "hotspot",
      "graphicGapMatch",
      "graphicOrder",
      "graphicAssociate",
      "selectPoint",
      "positionObject",
      "slider",
      "custom",
      "portableCustom",
    ]),
    adaptive: z.boolean().default(false),
    timeDependent: z.boolean().default(false),
    xmlContent: z.string().optional(),
    responseProcessingUrl: z.string().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
    organizationId: z.string().optional(),
  })
  .strict();
const putImsQtiV3p0Assessment_itemsById_Body = z
  .object({
    title: z.string().min(1).max(500),
    label: z.string(),
    language: z.string(),
    interactionType: z.enum([
      "choice",
      "textEntry",
      "extendedText",
      "match",
      "inlineChoice",
      "order",
      "associateInteraction",
      "gapMatch",
      "hottext",
      "hotspot",
      "graphicGapMatch",
      "graphicOrder",
      "graphicAssociate",
      "selectPoint",
      "positionObject",
      "slider",
      "custom",
      "portableCustom",
    ]),
    adaptive: z.boolean(),
    timeDependent: z.boolean(),
    xmlContent: z.string(),
    responseProcessingUrl: z.string(),
    metadata: z.object({}).partial().strict().passthrough(),
    organizationId: z.string(),
    status: z.enum(["active", "inactive", "archived"]),
  })
  .partial()
  .strict();
const postImsQtiV3p0Assessment_itemsByIdStimuli_Body = z
  .object({
    stimulusId: z.string(),
    sequence: z.number().int().gte(0).lte(9007199254740991).default(0),
  })
  .strict();

export const schemas = {
  postImsQtiV3p0Assessment_items_Body,
  putImsQtiV3p0Assessment_itemsById_Body,
  postImsQtiV3p0Assessment_itemsByIdStimuli_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/qti/v3p0/assessment-items",
    alias: "getImsQtiV3p0Assessment-items",
    description: `Retrieve a paginated list of assessment items with optional filtering`,
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().gte(1).lte(1000).optional().default(100),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().gte(0).optional().default(0),
      },
      {
        name: "interactionType",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "adaptive",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "organizationId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z
      .object({
        items: z.array(
          z
            .object({
              id: z.string(),
              identifier: z.string(),
              title: z.string(),
              label: z.union([z.string(), z.null()]),
              language: z.string(),
              interactionType: z.string(),
              adaptive: z.boolean(),
              timeDependent: z.boolean(),
              s3Id: z.union([z.string(), z.null()]),
              xmlHash: z.union([z.string(), z.null()]),
              responseProcessingUrl: z.union([z.string(), z.null()]),
              itemStatisticsId: z.union([z.string(), z.null()]),
              metadata: z.object({}).partial().strict().passthrough(),
              status: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
              createdBy: z.union([z.string(), z.null()]),
              organizationId: z.union([z.string(), z.null()]),
            })
            .strict()
        ),
        pagination: z
          .object({
            total: z.number(),
            limit: z.number(),
            offset: z.number(),
            hasMore: z.boolean(),
          })
          .strict(),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
    ],
  },
  {
    method: "post",
    path: "/ims/qti/v3p0/assessment-items",
    alias: "postImsQtiV3p0Assessment-items",
    description: `Create a new assessment item with optional QTI XML content`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0Assessment_items_Body,
      },
    ],
    response: z
      .object({
        item: z
          .object({
            id: z.string(),
            identifier: z.string(),
            title: z.string(),
            label: z.union([z.string(), z.null()]),
            language: z.string(),
            interactionType: z.string(),
            adaptive: z.boolean(),
            timeDependent: z.boolean(),
            s3Id: z.union([z.string(), z.null()]),
            xmlHash: z.union([z.string(), z.null()]),
            responseProcessingUrl: z.union([z.string(), z.null()]),
            itemStatisticsId: z.union([z.string(), z.null()]),
            metadata: z.object({}).partial().strict().passthrough(),
            status: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            createdBy: z.union([z.string(), z.null()]),
            organizationId: z.union([z.string(), z.null()]),
          })
          .strict(),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/qti/v3p0/assessment-items/:id",
    alias: "getImsQtiV3p0Assessment-itemsById",
    description: `Retrieve details of a specific assessment item by ID`,
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
        item: z
          .object({
            id: z.string(),
            identifier: z.string(),
            title: z.string(),
            label: z.union([z.string(), z.null()]),
            language: z.string(),
            interactionType: z.string(),
            adaptive: z.boolean(),
            timeDependent: z.boolean(),
            s3Id: z.union([z.string(), z.null()]),
            xmlHash: z.union([z.string(), z.null()]),
            responseProcessingUrl: z.union([z.string(), z.null()]),
            itemStatisticsId: z.union([z.string(), z.null()]),
            metadata: z.object({}).partial().strict().passthrough(),
            status: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            createdBy: z.union([z.string(), z.null()]),
            organizationId: z.union([z.string(), z.null()]),
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
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Assessment item not found`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
    ],
  },
  {
    method: "put",
    path: "/ims/qti/v3p0/assessment-items/:id",
    alias: "putImsQtiV3p0Assessment-itemsById",
    description: `Update an existing assessment item`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsQtiV3p0Assessment_itemsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        item: z
          .object({
            id: z.string(),
            identifier: z.string(),
            title: z.string(),
            label: z.union([z.string(), z.null()]),
            language: z.string(),
            interactionType: z.string(),
            adaptive: z.boolean(),
            timeDependent: z.boolean(),
            s3Id: z.union([z.string(), z.null()]),
            xmlHash: z.union([z.string(), z.null()]),
            responseProcessingUrl: z.union([z.string(), z.null()]),
            itemStatisticsId: z.union([z.string(), z.null()]),
            metadata: z.object({}).partial().strict().passthrough(),
            status: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            createdBy: z.union([z.string(), z.null()]),
            organizationId: z.union([z.string(), z.null()]),
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
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Assessment item not found`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
    ],
  },
  {
    method: "delete",
    path: "/ims/qti/v3p0/assessment-items/:id",
    alias: "deleteImsQtiV3p0Assessment-itemsById",
    description: `Delete an assessment item and its associated XML content`,
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
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Assessment item not found`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/qti/v3p0/assessment-items/:id/stimuli",
    alias: "getImsQtiV3p0Assessment-itemsByIdStimuli",
    description: `Retrieve all stimuli linked to a specific assessment item`,
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
        stimuli: z.array(
          z
            .object({
              id: z.string(),
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
              metadata: z.object({}).partial().strict().passthrough(),
              createdAt: z.string(),
              updatedAt: z.string(),
              createdBy: z.union([z.string(), z.null()]),
              organizationId: z.union([z.string(), z.null()]),
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
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Assessment item not found`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
    ],
  },
  {
    method: "post",
    path: "/ims/qti/v3p0/assessment-items/:id/stimuli",
    alias: "postImsQtiV3p0Assessment-itemsByIdStimuli",
    description: `Associate a stimulus with an assessment item`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0Assessment_itemsByIdStimuli_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        itemStimulus: z
          .object({
            id: z.string(),
            assessmentItemId: z.string(),
            stimulusId: z.string(),
            sequence: z.number(),
            createdAt: z.string(),
          })
          .strict(),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Item or stimulus not found`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            error: z
              .object({
                message: z.string(),
                details: z
                  .object({})
                  .partial()
                  .strict()
                  .passthrough()
                  .optional(),
              })
              .strict(),
          })
          .strict(),
      },
    ],
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const QTI_v3_0___ItemsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
