import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postCoursesComponent_resources_Body = z
  .object({
    title: z.string().min(1).max(255),
    componentId: z.string().min(1),
    resourceId: z.string().min(1),
    sortOrder: z.number().int().gte(0).lte(9007199254740991).optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putCoursesComponent_resourcesById_Body = z
  .object({
    title: z.string().min(1).max(255),
    sortOrder: z.number().int().gte(0).lte(9007199254740991),
    status: z.enum(["active", "tobedeleted"]),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();

export const schemas = {
  postCoursesComponent_resources_Body,
  putCoursesComponent_resourcesById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/courses/component-resources",
    alias: "getCoursesComponent-resources",
    description: `List all component resources (proprietary extension)`,
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
        name: "status",
        type: "Query",
        schema: z.enum(["active", "tobedeleted"]).optional(),
      },
      {
        name: "componentId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "resourceId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.object({ componentResources: z.array(z.unknown()) }).strict(),
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
    path: "/courses/component-resources",
    alias: "postCoursesComponent-resources",
    description: `Create a new component resource (proprietary extension)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postCoursesComponent_resources_Body,
      },
    ],
    response: z.object({ componentResource: z.unknown() }).strict(),
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
    method: "get",
    path: "/courses/component-resources/:id",
    alias: "getCoursesComponent-resourcesById",
    description: `Get a specific component resource by ID (proprietary extension)`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ componentResource: z.unknown() }).strict(),
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
    path: "/courses/component-resources/:id",
    alias: "putCoursesComponent-resourcesById",
    description: `Update a component resource (proprietary extension)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putCoursesComponent_resourcesById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ componentResource: z.unknown() }).strict(),
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
    path: "/courses/component-resources/:id",
    alias: "deleteCoursesComponent-resourcesById",
    description: `Delete a component resource (proprietary extension)`,
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

export const OneRoster_v1_2___Component_ResourcesApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
