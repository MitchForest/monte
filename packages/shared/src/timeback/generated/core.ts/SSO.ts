import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postApiAuthSessionsRegister_Body = z
  .object({ fingerprint: z.string().min(1), domain: z.string().url() })
  .strict();

export const schemas = {
  postApiAuthSessionsRegister_Body,
};

export const endpoints = makeApi([
  {
    method: "post",
    path: "/api/auth/sessions/register",
    alias: "postApiAuthSessionsRegister",
    description: `Register a new SSO session after successful login`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiAuthSessionsRegister_Body,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            "Session registered successfully": z
              .object({
                id: z
                  .string()
                  .regex(
                    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                  )
                  .uuid(),
                domains: z.array(z.string()),
                createdAt: z.string(),
                lastActiveAt: z.string(),
                expiresAt: z.string(),
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
    path: "/api/auth/sessions/check",
    alias: "postApiAuthSessionsCheck",
    description: `Check if a valid SSO session exists for the device fingerprint`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiAuthSessionsRegister_Body,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            "Valid session found": z
              .object({
                authenticated: z.boolean(),
                token: z.string(),
                user: z
                  .object({
                    id: z
                      .string()
                      .regex(
                        /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                      )
                      .uuid(),
                    email: z
                      .string()
                      .regex(
                        /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/,
                      )
                      .email(),
                    name: z.string(),
                    role: z.string(),
                  })
                  .strict(),
                session: z
                  .object({
                    id: z
                      .string()
                      .regex(
                        /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                      )
                      .uuid(),
                    domains: z.array(z.string()),
                    createdAt: z.string(),
                    lastActiveAt: z.string(),
                    expiresAt: z.string(),
                  })
                  .strict(),
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
    path: "/api/auth/sessions/revoke",
    alias: "deleteApiAuthSessionsRevoke",
    description: `Revoke all SSO sessions for the current user (logout everywhere)`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            "Sessions revoked": z.object({ message: z.string() }).strict(),
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
    method: "get",
    path: "/api/auth/sessions",
    alias: "getApiAuthSessions",
    description: `Get all active SSO sessions for the current user`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            "Active sessions retrieved": z
              .object({
                sessions: z.array(
                  z
                    .object({
                      id: z
                        .string()
                        .regex(
                          /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
                        )
                        .uuid(),
                      domains: z.array(z.string()),
                      createdAt: z.string(),
                      lastActiveAt: z.string(),
                      expiresAt: z.string(),
                    })
                    .strict(),
                ),
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
]);

export type EndpointDefinitions = typeof endpoints;

export const SSOApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
