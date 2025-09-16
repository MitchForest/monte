import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postCoursesComponents_Body = z
  .object({
    title: z.string().min(1).max(255),
    courseId: z.string().min(1),
    parentId: z.string().optional(),
    sequence: z
      .number()
      .int()
      .gte(-9007199254740991)
      .lte(9007199254740991)
      .optional(),
    metadata: z
      .object({
        "timeback.estimatedDuration": z.number(),
        "timeback.prerequisites": z.array(z.string()),
        "timeback.learningObjectives": z.array(z.string()),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
  })
  .strict();
const putCoursesComponentsById_Body = z
  .object({
    title: z.string().min(1).max(255),
    sequence: z.number().int().gte(-9007199254740991).lte(9007199254740991),
    status: z.enum(["active", "tobedeleted"]),
    metadata: z
      .object({
        "timeback.estimatedDuration": z.number(),
        "timeback.prerequisites": z.array(z.string()),
        "timeback.learningObjectives": z.array(z.string()),
      })
      .partial()
      .strict()
      .passthrough(),
  })
  .partial()
  .strict();

export const schemas = {
  postCoursesComponents_Body,
  putCoursesComponentsById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/courses/components",
    alias: "getCoursesComponents",
    description: `List all course components (proprietary extension)`,
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
        name: "courseId",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "parentId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.object({ courseComponents: z.array(z.unknown()) }).strict(),
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
    path: "/courses/components",
    alias: "postCoursesComponents",
    description: `Create a new course component (proprietary extension)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postCoursesComponents_Body,
      },
    ],
    response: z.object({ courseComponent: z.unknown() }).strict(),
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
    path: "/courses/components/:id",
    alias: "getCoursesComponentsById",
    description: `Get a specific course component by ID (proprietary extension)`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ courseComponent: z.unknown() }).strict(),
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
    path: "/courses/components/:id",
    alias: "putCoursesComponentsById",
    description: `Update a course component (proprietary extension)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putCoursesComponentsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ courseComponent: z.unknown() }).strict(),
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
    path: "/courses/components/:id",
    alias: "deleteCoursesComponentsById",
    description: `Delete a course component (proprietary extension)`,
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

export const OneRoster_v1_2___Course_ComponentsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
