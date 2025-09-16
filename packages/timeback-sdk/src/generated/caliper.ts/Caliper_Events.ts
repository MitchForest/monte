import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const CaliperEnvelope = z
  .object({
    sensor: z.string(),
    sendTime: z.string().datetime({ offset: true }),
    dataVersion: z.literal("http://purl.imsglobal.org/ctx/caliper/v1p2"),
    data: z.array(z.record(z.unknown().nullable())),
  })
  .strict()
  .passthrough();

export const schemas = {
  CaliperEnvelope,
};

export const endpoints = makeApi([
  {
    method: "post",
    path: "/caliper/v1p2/events/validate",
    alias: "postCaliperv1p2eventsvalidate",
    description: `Validates Caliper events against the v1.2 specification without storing them`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Caliper envelope containing events to validate`,
        type: "Body",
        schema: CaliperEnvelope,
      },
    ],
    response: z
      .object({
        valid: z.boolean(),
        eventCount: z.number().optional(),
        errors: z
          .array(
            z
              .object({
                path: z.array(z.union([z.string(), z.number()])),
                message: z.string(),
                code: z.string().optional(),
              })
              .strict()
              .passthrough()
          )
          .optional(),
      })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Validation failed`,
        schema: z
          .object({
            valid: z.boolean(),
            eventCount: z.number().optional(),
            errors: z
              .array(
                z
                  .object({
                    path: z.array(z.union([z.string(), z.number()])),
                    message: z.string(),
                    code: z.string().optional(),
                  })
                  .strict()
                  .passthrough()
              )
              .optional(),
          })
          .strict()
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/caliper/v1p2/events",
    alias: "postCaliperv1p2events",
    description: `Stores Caliper events in DynamoDB for real-time access and archives them to S3 via Kinesis for long-term storage. Requires sensor authentication.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Caliper envelope containing events to store`,
        type: "Body",
        schema: CaliperEnvelope,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        eventsStored: z.number(),
        message: z.string().optional(),
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
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const Caliper_EventsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
