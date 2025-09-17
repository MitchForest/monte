import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postApiUsers_Body = z
  .object({
    id: z
      .string()
      .regex(
        /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
      )
      .uuid()
      .optional(),
    email: z
      .string()
      .regex(
        /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/,
      )
      .email(),
    name: z.string().min(1).max(255),
    cognitoId: z.string().min(1).max(255),
    role: z
      .enum(["user", "student", "teacher", "admin", "superadmin"])
      .optional(),
    onerosterId: z.union([z.string(), z.null()]).optional(),
    primaryOrgId: z.union([z.string(), z.null()]).optional(),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strict();
const putApiUsersById_Body = z
  .object({
    email: z
      .string()
      .regex(
        /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/,
      )
      .email(),
    name: z.string().min(1).max(255),
    role: z.enum(["user", "student", "teacher", "admin", "superadmin"]),
  })
  .partial()
  .strict();

export const schemas = {
  postApiUsers_Body,
  putApiUsersById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/users",
    alias: "getApiUsers",
    description: `Get a list of users. Regular users only see themselves, admins see all users.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().gte(1).default(1),
      },
      {
        name: "pageSize",
        type: "Query",
        schema: z.number().gte(1).lte(100).default(20),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            items: z.array(
              z
                .object({
                  id: z
                    .string()
                    .regex(
                      /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                    )
                    .uuid(),
                  email: z.string().max(255),
                  name: z.string().max(255),
                  cognitoId: z.string().max(255),
                  role: z.enum([
                    "user",
                    "student",
                    "teacher",
                    "admin",
                    "superadmin",
                  ]),
                  onerosterId: z.union([z.string(), z.null()]),
                  primaryOrgId: z.union([z.string(), z.null()]),
                  isActive: z.boolean(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                })
                .strict(),
            ),
            pagination: z
              .object({
                total: z.number(),
                page: z.number(),
                pageSize: z.number(),
                totalPages: z.number(),
              })
              .strict(),
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
    path: "/api/users",
    alias: "postApiUsers",
    description: `Create a new user`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiUsers_Body,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            user: z
              .object({
                id: z
                  .string()
                  .regex(
                    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                  )
                  .uuid(),
                email: z.string().max(255),
                name: z.string().max(255),
                cognitoId: z.string().max(255),
                role: z.enum([
                  "user",
                  "student",
                  "teacher",
                  "admin",
                  "superadmin",
                ]),
                onerosterId: z.union([z.string(), z.null()]),
                primaryOrgId: z.union([z.string(), z.null()]),
                isActive: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              })
              .strict(),
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
    ],
  },
  {
    method: "get",
    path: "/api/users/:id",
    alias: "getApiUsersById",
    description: `Get a user by ID. Users can only access their own data unless they are admin/superadmin.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z
          .string()
          .regex(
            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
          )
          .uuid(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            user: z
              .object({
                id: z
                  .string()
                  .regex(
                    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                  )
                  .uuid(),
                email: z.string().max(255),
                name: z.string().max(255),
                cognitoId: z.string().max(255),
                role: z.enum([
                  "user",
                  "student",
                  "teacher",
                  "admin",
                  "superadmin",
                ]),
                onerosterId: z.union([z.string(), z.null()]),
                primaryOrgId: z.union([z.string(), z.null()]),
                isActive: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              })
              .strict(),
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
        status: 403,
        description: `Forbidden`,
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
    path: "/api/users/:id",
    alias: "putApiUsersById",
    description: `Update a user by ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putApiUsersById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z
          .string()
          .regex(
            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
          )
          .uuid(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            user: z
              .object({
                id: z
                  .string()
                  .regex(
                    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                  )
                  .uuid(),
                email: z.string().max(255),
                name: z.string().max(255),
                cognitoId: z.string().max(255),
                role: z.enum([
                  "user",
                  "student",
                  "teacher",
                  "admin",
                  "superadmin",
                ]),
                onerosterId: z.union([z.string(), z.null()]),
                primaryOrgId: z.union([z.string(), z.null()]),
                isActive: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              })
              .strict(),
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
    method: "delete",
    path: "/api/users/:id",
    alias: "deleteApiUsersById",
    description: `Delete a user by ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z
          .string()
          .regex(
            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
          )
          .uuid(),
      },
    ],
    response: z.object({ success: z.boolean(), message: z.string() }).strict(),
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
    path: "/api/users/:id/associate-oneroster",
    alias: "postApiUsersByIdAssociate-oneroster",
    description: `Associate a system user with a OneRoster user by updating the onerosterId field`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ onerosterId: z.string().min(1) }).strict(),
      },
      {
        name: "id",
        type: "Path",
        schema: z
          .string()
          .regex(
            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
          )
          .uuid(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            user: z
              .object({
                id: z
                  .string()
                  .regex(
                    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                  )
                  .uuid(),
                email: z.string().max(255),
                name: z.string().max(255),
                cognitoId: z.string().max(255),
                role: z.enum([
                  "user",
                  "student",
                  "teacher",
                  "admin",
                  "superadmin",
                ]),
                onerosterId: z.union([z.string(), z.null()]),
                primaryOrgId: z.union([z.string(), z.null()]),
                isActive: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              })
              .strict(),
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
        status: 403,
        description: `Forbidden`,
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

export const UsersApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
