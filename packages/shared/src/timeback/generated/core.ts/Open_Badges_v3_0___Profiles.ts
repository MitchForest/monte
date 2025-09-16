import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postApiBadgesV3Profiles_Body = z
  .object({
    name: z.string().min(1).max(255),
    url: z.string().url().optional(),
    email: z
      .string()
      .regex(
        /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
      )
      .email()
      .optional(),
    telephone: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    address: z.string().optional(),
    additionalName: z.string().optional(),
    familyName: z.string().optional(),
    givenName: z.string().optional(),
    parentOrg: z.string().optional(),
    generateKeys: z.boolean().default(false),
  })
  .strict();
const putApiBadgesV3ProfilesById_Body = z
  .object({
    name: z.string(),
    url: z.string().url(),
    email: z
      .string()
      .regex(
        /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
      )
      .email(),
    telephone: z.string(),
    description: z.string(),
    image: z.string(),
    address: z.string(),
    additionalName: z.string(),
    familyName: z.string(),
    givenName: z.string(),
    parentOrg: z.string(),
  })
  .partial()
  .strict();

export const schemas = {
  postApiBadgesV3Profiles_Body,
  putApiBadgesV3ProfilesById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/badges/v3/profiles",
    alias: "getApiBadgesV3Profiles",
    description: `Retrieve a paginated list of all active badge issuer profiles`,
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
                  "@context": z
                    .array(z.string())
                    .default([
                      "https://www.w3.org/ns/credentials/v2",
                      "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
                    ]),
                  id: z.string(),
                  type: z.array(z.string()),
                  name: z.string(),
                  url: z.string().optional(),
                  email: z
                    .string()
                    .regex(
                      /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
                    )
                    .email()
                    .optional(),
                  telephone: z.string().optional(),
                  description: z.string().optional(),
                  image: z.string().optional(),
                  address: z.unknown().optional(),
                  additionalName: z.string().optional(),
                  familyName: z.string().optional(),
                  givenName: z.string().optional(),
                  parentOrg: z.string().optional(),
                  verificationMethod: z
                    .array(
                      z
                        .object({
                          id: z.string(),
                          type: z.string(),
                          controller: z.string(),
                          publicKeyJwk: z.unknown(),
                        })
                        .strict()
                    )
                    .optional(),
                })
                .strict()
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
    path: "/api/badges/v3/profiles",
    alias: "postApiBadgesV3Profiles",
    description: `Create a new badge issuer profile with optional cryptographic key generation`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiBadgesV3Profiles_Body,
      },
    ],
    response: z.void(),
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
    method: "get",
    path: "/api/badges/v3/profiles/:id",
    alias: "getApiBadgesV3ProfilesById",
    description: `Retrieve a specific badge issuer profile by its IRI`,
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
    path: "/api/badges/v3/profiles/:id",
    alias: "putApiBadgesV3ProfilesById",
    description: `Update an existing badge issuer profile (requires ownership)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putApiBadgesV3ProfilesById_Body,
      },
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
  {
    method: "delete",
    path: "/api/badges/v3/profiles/:id",
    alias: "deleteApiBadgesV3ProfilesById",
    description: `Soft delete a badge issuer profile (requires ownership)`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
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
    method: "get",
    path: "/api/badges/v3/profiles/:id/.well-known/did.json",
    alias: "getApiBadgesV3ProfilesById.well-knownDid.json",
    description: `Retrieve the DID document for a profile&#x27;s verification keys`,
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

export const Open_Badges_v3_0___ProfilesApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
