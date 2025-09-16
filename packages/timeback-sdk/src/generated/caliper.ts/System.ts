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
    path: "/health",
    alias: "getHealth",
    description: `Returns the health status of the API`,
    requestFormat: "json",
    response: z
      .object({
        status: z.literal("ok"),
        timestamp: z.string().datetime({ offset: true }),
      })
      .strict()
      .passthrough(),
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const SystemApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
