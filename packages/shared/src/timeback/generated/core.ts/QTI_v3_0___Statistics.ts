import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsQtiV3p0Assessment_itemsByIdStatistics_Body = z
  .object({
    pValue: z.number().gte(0).lte(1),
    discrimination: z.number(),
    pointBiserial: z.number().gte(-1).lte(1),
    irtDifficulty: z.number(),
    irtDiscrimination: z.number(),
    irtGuessing: z.number().gte(0).lte(1),
    exposureCount: z.number().gte(0),
    responseCount: z.number().gte(0),
    avgResponseTime: z.number().gte(0),
    medianResponseTime: z.number().gte(0),
  })
  .partial()
  .strict();

export const schemas = {
  postImsQtiV3p0Assessment_itemsByIdStatistics_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/qti/v3p0/assessment-items/:id/statistics",
    alias: "getImsQtiV3p0Assessment-itemsByIdStatistics",
    description: `Get performance statistics for a specific assessment item`,
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
        statistics: z
          .object({
            id: z.string(),
            pValue: z.union([z.string(), z.null()]),
            discrimination: z.union([z.string(), z.null()]),
            pointBiserial: z.union([z.string(), z.null()]),
            irtDifficulty: z.union([z.string(), z.null()]),
            irtDiscrimination: z.union([z.string(), z.null()]),
            irtGuessing: z.union([z.string(), z.null()]),
            exposureCount: z.number(),
            responseCount: z.number(),
            avgResponseTime: z.union([z.string(), z.null()]),
            medianResponseTime: z.union([z.string(), z.null()]),
            lastCalculated: z.union([z.string(), z.null()]),
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
        description: `Item or statistics not found`,
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
    path: "/ims/qti/v3p0/assessment-items/:id/statistics",
    alias: "postImsQtiV3p0Assessment-itemsByIdStatistics",
    description: `Create new statistics or update existing statistics for an assessment item`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0Assessment_itemsByIdStatistics_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        statistics: z
          .object({
            id: z.string(),
            pValue: z.union([z.string(), z.null()]),
            discrimination: z.union([z.string(), z.null()]),
            pointBiserial: z.union([z.string(), z.null()]),
            irtDifficulty: z.union([z.string(), z.null()]),
            irtDiscrimination: z.union([z.string(), z.null()]),
            irtGuessing: z.union([z.string(), z.null()]),
            exposureCount: z.number(),
            responseCount: z.number(),
            avgResponseTime: z.union([z.string(), z.null()]),
            medianResponseTime: z.union([z.string(), z.null()]),
            lastCalculated: z.union([z.string(), z.null()]),
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
    path: "/ims/qti/v3p0/statistics",
    alias: "getImsQtiV3p0Statistics",
    description: `Get a paginated list of item statistics with optional filtering`,
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
        name: "sort",
        type: "Query",
        schema: z
          .enum([
            "pValue",
            "discrimination",
            "exposureCount",
            "responseCount",
            "lastCalculated",
          ])
          .optional(),
      },
      {
        name: "order",
        type: "Query",
        schema: z.enum(["asc", "desc"]).default("desc"),
      },
      {
        name: "minPValue",
        type: "Query",
        schema: z.number().gte(0).lte(1).optional(),
      },
      {
        name: "maxPValue",
        type: "Query",
        schema: z.number().gte(0).lte(1).optional(),
      },
      {
        name: "minDiscrimination",
        type: "Query",
        schema: z.number().optional(),
      },
    ],
    response: z
      .object({
        statistics: z.array(
          z
            .object({
              id: z.string(),
              pValue: z.union([z.string(), z.null()]),
              discrimination: z.union([z.string(), z.null()]),
              pointBiserial: z.union([z.string(), z.null()]),
              irtDifficulty: z.union([z.string(), z.null()]),
              irtDiscrimination: z.union([z.string(), z.null()]),
              irtGuessing: z.union([z.string(), z.null()]),
              exposureCount: z.number(),
              responseCount: z.number(),
              avgResponseTime: z.union([z.string(), z.null()]),
              medianResponseTime: z.union([z.string(), z.null()]),
              lastCalculated: z.union([z.string(), z.null()]),
              createdAt: z.string(),
              updatedAt: z.string(),
              itemId: z.string(),
              itemIdentifier: z.string(),
              itemTitle: z.string(),
              interactionType: z.string(),
            })
            .strict(),
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

export const QTI_v3_0___StatisticsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
