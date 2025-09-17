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
    path: "/ims/clr/v2p0/discovery",
    alias: "getImsClrV2p0Discovery",
    description: `Provides public metadata about the CLR service, including its capabilities and OAuth endpoint locations`,
    requestFormat: "json",
    response: z
      .object({
        "@context": z.string(),
        id: z.string().url(),
        type: z.string(),
        name: z.string().min(1),
        apiVersion: z.string(),
        authorizationUrl: z.string().url(),
        tokenUrl: z.string().url(),
        scopesOffered: z.array(z.string()),
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
    path: "/ims/clr/v2p0/credentials",
    alias: "postImsClrV2p0Credentials",
    description: `Create a new VerifiableCredential or update an existing one. Requires readwrite scope.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `VerifiableCredential to create or update`,
        type: "Body",
        schema: z.unknown(),
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
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({
                message: z.string(),
                details: z.array(
                  z
                    .object({
                      path: z.array(z.union([z.string(), z.number()])),
                      message: z.string(),
                      code: z.string(),
                    })
                    .partial()
                    .strict()
                    .passthrough(),
                ),
              })
              .partial()
              .strict()
              .passthrough(),
          })
          .partial()
          .strict()
          .passthrough(),
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
    path: "/ims/clr/v2p0/credentials",
    alias: "getImsClrV2p0Credentials",
    description: `Retrieve a paginated list of credentials for the authenticated user. Requires readonly or readwrite scope.`,
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(25),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: z
      .object({
        "@context": z.array(z.string()),
        type: z.string(),
        credentials: z.array(
          z
            .object({
              "@context": z.array(z.string()),
              id: z.string().url(),
              type: z.array(z.string()),
              issuer: z.union([
                z.string(),
                z.object({ id: z.string().url() }).strict().passthrough(),
              ]),
              issuanceDate: z.string(),
              expirationDate: z.string().optional(),
              credentialSubject: z
                .object({ id: z.string().url() })
                .strict()
                .passthrough(),
              credentialSchema: z
                .object({ id: z.string().url(), type: z.string() })
                .strict()
                .passthrough()
                .optional(),
              evidence: z
                .array(
                  z
                    .object({ id: z.string().url(), type: z.string() })
                    .partial()
                    .strict()
                    .passthrough(),
                )
                .optional(),
              proof: z
                .object({
                  type: z.string(),
                  created: z.string().optional(),
                  proofPurpose: z.string().optional(),
                  verificationMethod: z.string().url(),
                  jws: z.string().min(1),
                })
                .strict(),
            })
            .strict(),
        ),
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
    method: "get",
    path: "/ims/clr/v2p0/credentials/:credentialId",
    alias: "getImsClrV2p0CredentialsByCredentialId",
    description: `Retrieve a specific credential by ID. Requires readonly or readwrite scope.`,
    requestFormat: "json",
    parameters: [
      {
        name: "credentialId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        "@context": z.array(z.string()),
        id: z.string().url(),
        type: z.array(z.string()),
        issuer: z.union([
          z.string(),
          z.object({ id: z.string().url() }).strict().passthrough(),
        ]),
        issuanceDate: z.string(),
        expirationDate: z.string().optional(),
        credentialSubject: z
          .object({ id: z.string().url() })
          .strict()
          .passthrough(),
        credentialSchema: z
          .object({ id: z.string().url(), type: z.string() })
          .strict()
          .passthrough()
          .optional(),
        evidence: z
          .array(
            z
              .object({ id: z.string().url(), type: z.string() })
              .partial()
              .strict()
              .passthrough(),
          )
          .optional(),
        proof: z
          .object({
            type: z.string(),
            created: z.string().optional(),
            proofPurpose: z.string().optional(),
            verificationMethod: z.string().url(),
            jws: z.string().min(1),
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
        description: `Credential not found`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string() })
              .partial()
              .strict()
              .passthrough(),
          })
          .partial()
          .strict()
          .passthrough(),
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
    path: "/ims/clr/v2p0/credentials/:credentialId",
    alias: "deleteImsClrV2p0CredentialsByCredentialId",
    description: `Delete a specific credential by ID. Requires readwrite scope.`,
    requestFormat: "json",
    parameters: [
      {
        name: "credentialId",
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
        description: `Credential not found`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string() })
              .partial()
              .strict()
              .passthrough(),
          })
          .partial()
          .strict()
          .passthrough(),
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
    path: "/ims/clr/v2p0/profile",
    alias: "getImsClrV2p0Profile",
    description: `Retrieve the profile of the authenticated user. Requires readonly or readwrite scope.`,
    requestFormat: "json",
    response: z
      .object({
        "@context": z.union([z.string(), z.array(z.string())]),
        type: z.string(),
      })
      .strict()
      .passthrough(),
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
        description: `Profile not found`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({ message: z.string() })
              .partial()
              .strict()
              .passthrough(),
          })
          .partial()
          .strict()
          .passthrough(),
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
    path: "/ims/clr/v2p0/profile",
    alias: "putImsClrV2p0Profile",
    description: `Create a new profile or completely replace an existing profile for the authenticated user. Requires readwrite scope.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Profile to create or replace`,
        type: "Body",
        schema: z.unknown(),
      },
    ],
    response: z
      .object({
        "@context": z.union([z.string(), z.array(z.string())]),
        type: z.string(),
      })
      .strict()
      .passthrough(),
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
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({
                message: z.string(),
                details: z.array(
                  z
                    .object({
                      path: z.array(z.union([z.string(), z.number()])),
                      message: z.string(),
                      code: z.string(),
                    })
                    .partial()
                    .strict()
                    .passthrough(),
                ),
              })
              .partial()
              .strict()
              .passthrough(),
          })
          .partial()
          .strict()
          .passthrough(),
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

export const CLR_2_0Api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
