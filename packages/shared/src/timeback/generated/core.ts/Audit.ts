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
    path: "/api/audit-logs",
    alias: "getApiAudit-logs",
    description: `Get a paginated list of audit logs. Requires admin or superadmin role.`,
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
        type: "Query",
        schema: z
          .string()
          .regex(
            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
          )
          .uuid()
          .optional(),
      },
      {
        name: "apiKeyId",
        type: "Query",
        schema: z
          .string()
          .regex(
            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
          )
          .uuid()
          .optional(),
      },
      {
        name: "orgContext",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "method",
        type: "Query",
        schema: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).optional(),
      },
      {
        name: "path",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "startDate",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "endDate",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().gte(1).default(1),
      },
      {
        name: "pageSize",
        type: "Query",
        schema: z.number().gte(1).lte(100).default(50),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            logs: z.array(
              z
                .object({
                  id: z
                    .string()
                    .regex(
                      /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                    )
                    .uuid(),
                  userId: z.union([z.string(), z.null()]),
                  apiKeyId: z.union([z.string(), z.null()]),
                  authMethod: z.enum(["jwt", "api_key"]),
                  method: z.string(),
                  path: z.string(),
                  statusCode: z.number(),
                  orgContext: z.union([z.string(), z.null()]),
                  userRole: z.union([z.string(), z.null()]),
                  requestBody: z.union([z.unknown(), z.null()]),
                  responseTimeMs: z.union([z.number(), z.null()]),
                  createdAt: z.string(),
                  user: z.union([
                    z
                      .object({
                        id: z
                          .string()
                          .regex(
                            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                          )
                          .uuid(),
                        email: z.string(),
                        name: z.string(),
                      })
                      .strict(),
                    z.null(),
                  ]),
                  apiKey: z.union([
                    z
                      .object({
                        id: z
                          .string()
                          .regex(
                            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                          )
                          .uuid(),
                        name: z.string(),
                        keyPrefix: z.string(),
                      })
                      .strict(),
                    z.null(),
                  ]),
                })
                .strict(),
            ),
            pagination: z
              .object({
                page: z.number(),
                pageSize: z.number(),
                total: z.number(),
                totalPages: z.number(),
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
  {
    method: "get",
    path: "/api/audit-logs/stats",
    alias: "getApiAudit-logsStats",
    description: `Get statistics about API usage. Requires admin or superadmin role.`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            totalRequests: z.number(),
            requestsByMethod: z.record(z.number()),
            requestsByAuthMethod: z.record(z.number()),
            averageResponseTime: z.number(),
            topEndpoints: z.array(
              z
                .object({
                  path: z.string(),
                  count: z.number(),
                  averageResponseTime: z.number(),
                })
                .strict(),
            ),
            topUsers: z.array(
              z
                .object({
                  userId: z.string(),
                  email: z.string(),
                  count: z.number(),
                })
                .strict(),
            ),
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

export const AuditApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
