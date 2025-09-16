import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

export const endpoints = makeApi([
  {
    method: "get",
    path: "/analytics/events",
    alias: "getAnalyticsevents",
    description: `Query stored Caliper events with filtering and pagination support`,
    requestFormat: "json",
    parameters: [
      {
        name: "actorId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "objectId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "eventType",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "startTime",
        type: "Query",
        schema: z.string().datetime({ offset: true }).optional(),
      },
      {
        name: "endTime",
        type: "Query",
        schema: z.string().datetime({ offset: true }).optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.string().regex(/^\d+$/).optional().default("20"),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.string().regex(/^\d+$/).optional().default("0"),
      },
    ],
    response: z
      .object({
        events: z.array(
          z
            .object({
              id: z.string(),
              type: z.string(),
              actor: z
                .object({ id: z.string(), type: z.string() })
                .strict()
                .passthrough(),
              action: z.string(),
              object: z
                .object({
                  id: z.string(),
                  type: z.string(),
                  name: z.string().optional(),
                })
                .strict()
                .passthrough(),
              eventTime: z.string(),
              storedAt: z.string(),
              sensor: z.string(),
            })
            .strict()
            .passthrough()
        ),
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
    path: "/analytics/events/:id",
    alias: "getAnalyticsevents_id",
    description: `Retrieve a single Caliper event by its ID`,
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
        type: z.string(),
        actor: z
          .object({ id: z.string(), type: z.string() })
          .strict()
          .passthrough(),
        action: z.string(),
        object: z
          .object({
            id: z.string(),
            type: z.string(),
            name: z.string().optional(),
          })
          .strict()
          .passthrough(),
        eventTime: z.string(),
        storedAt: z.string(),
        sensor: z.string(),
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
        description: `Event not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const AnalyticsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
