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
    path: "/api/auth/me",
    alias: "getApiAuthMe",
    description: `Get information about the authenticated user`,
    requestFormat: "json",
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
                    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
                  )
                  .uuid(),
                email: z
                  .string()
                  .regex(
                    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
                  )
                  .email(),
                cognitoId: z.string(),
                role: z.enum([
                  "user",
                  "student",
                  "teacher",
                  "admin",
                  "superadmin",
                ]),
              })
              .strict(),
            message: z.string(),
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
    ],
  },
  {
    method: "get",
    path: "/api/auth/info",
    alias: "getApiAuthInfo",
    description: `Get information about authentication configuration and instructions`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            message: z.string(),
            instructions: z.record(z.string()),
            cognito: z
              .object({
                userPoolId: z.string().optional(),
                clientId: z.string().optional(),
                region: z.string(),
              })
              .strict(),
          })
          .strict(),
      })
      .strict(),
  },
  {
    method: "post",
    path: "/api/auth/login",
    alias: "postApiAuthLogin",
    description: `Authenticate with AWS Cognito using email and password`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            accessToken: z.string(),
            idToken: z.string(),
            refreshToken: z.string(),
            expiresIn: z.number(),
            tokenType: z.string(),
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
    method: "post",
    path: "/api/auth/logout",
    alias: "postApiAuthLogout",
    description: `Clear authentication cookies and optionally revoke all SSO sessions`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        data: z.object({ message: z.string() }).strict(),
      })
      .strict(),
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const AuthenticationApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
