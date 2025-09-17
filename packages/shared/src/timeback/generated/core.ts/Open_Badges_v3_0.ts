import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postApiBadgesV3Achievements_Body = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().min(1),
    image: z.string().optional(),
    criteria: z.string().min(1),
    achievementType: z.string().optional(),
    creditsAvailable: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    humanCode: z.string().optional(),
    specialization: z.string().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
    issuer: z.string().min(1),
    alignment: z.string().optional(),
    resultDescription: z.string().optional(),
  })
  .strict();
const postApiBadgesV3Credentials_Body = z
  .object({
    achievementId: z.string().min(1),
    recipientEmail: z
      .string()
      .regex(
        /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/,
      )
      .email(),
    recipientName: z.string().optional(),
    evidence: z
      .array(
        z
          .object({
            id: z.string().optional(),
            type: z.array(z.string()).optional(),
            name: z.string(),
            description: z.string().optional(),
            url: z.string().url().optional(),
            genre: z.string().optional(),
          })
          .strict(),
      )
      .optional(),
    expirationDate: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/,
      )
      .datetime({ offset: true })
      .optional(),
  })
  .strict();
const postApiBadgesV3CredentialsVerify_Body = z
  .object({
    verifiableCredential: z
      .object({
        "@context": z
          .array(z.string())
          .default([
            "https://www.w3.org/ns/credentials/v2",
            "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
          ]),
        id: z.string(),
        type: z.array(z.string()),
        issuer: z.string(),
        issuanceDate: z.string(),
        expirationDate: z.string().optional(),
        credentialSubject: z
          .object({
            id: z.string(),
            type: z.array(z.string()),
            achievement: z.object({}).partial().strict().passthrough(),
            identifier: z.array(
              z
                .object({
                  type: z.string(),
                  identityHash: z.string(),
                  hashed: z.boolean(),
                })
                .strict(),
            ),
            name: z.string().optional(),
          })
          .strict(),
        proof: z
          .object({
            type: z.string(),
            cryptosuite: z.string(),
            created: z.string(),
            verificationMethod: z.string(),
            proofPurpose: z.string(),
            proofValue: z.string(),
          })
          .strict(),
        credentialStatus: z
          .object({})
          .partial()
          .strict()
          .passthrough()
          .optional(),
        evidence: z
          .array(z.object({}).partial().strict().passthrough())
          .optional(),
      })
      .strict(),
  })
  .strict();

export const schemas = {
  postApiBadgesV3Achievements_Body,
  postApiBadgesV3Credentials_Body,
  postApiBadgesV3CredentialsVerify_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/badges/v3/achievements",
    alias: "getApiBadgesV3Achievements",
    description: `Get a paginated list of achievements with optional filtering`,
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
      {
        name: "issuer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "type",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "tags",
        type: "Query",
        schema: z.string().optional(),
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
                  description: z.string(),
                  image: z.string().optional(),
                  criteria: z
                    .object({ narrative: z.string() })
                    .partial()
                    .strict(),
                  achievementType: z.string().optional(),
                  creditsAvailable: z.number().optional(),
                  fieldOfStudy: z.string().optional(),
                  humanCode: z.string().optional(),
                  specialization: z.string().optional(),
                  tags: z.array(z.string()).optional(),
                  version: z.string().optional(),
                  issuer: z.string(),
                  alignment: z.array(z.unknown()).optional(),
                  resultDescription: z.array(z.unknown()).optional(),
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
    path: "/api/badges/v3/achievements",
    alias: "postApiBadgesV3Achievements",
    description: `Create a new achievement definition`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiBadgesV3Achievements_Body,
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
    path: "/api/badges/v3/achievements/:id",
    alias: "getApiBadgesV3AchievementsById",
    description: `Get a specific achievement by its IRI`,
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
    path: "/api/badges/v3/achievements/:id",
    alias: "putApiBadgesV3AchievementsById",
    description: `Update an existing achievement`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiBadgesV3Achievements_Body,
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
    path: "/api/badges/v3/achievements/:id",
    alias: "deleteApiBadgesV3AchievementsById",
    description: `Soft delete an achievement`,
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
    path: "/api/badges/v3/credentials",
    alias: "getApiBadgesV3Credentials",
    description: `Get a paginated list of credentials with optional filtering`,
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
      {
        name: "issuer",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "recipient",
        type: "Query",
        schema: z
          .string()
          .regex(
            /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/,
          )
          .email()
          .optional(),
      },
      {
        name: "achievement",
        type: "Query",
        schema: z.string().optional(),
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
                  issuer: z.string(),
                  issuanceDate: z.string(),
                  expirationDate: z.string().optional(),
                  credentialSubject: z
                    .object({
                      id: z.string(),
                      type: z.array(z.string()),
                      achievement: z
                        .object({})
                        .partial()
                        .strict()
                        .passthrough(),
                      identifier: z.array(
                        z
                          .object({
                            type: z.string(),
                            identityHash: z.string(),
                            hashed: z.boolean(),
                          })
                          .strict(),
                      ),
                      name: z.string().optional(),
                    })
                    .strict(),
                  proof: z
                    .object({
                      type: z.string(),
                      cryptosuite: z.string(),
                      created: z.string(),
                      verificationMethod: z.string(),
                      proofPurpose: z.string(),
                      proofValue: z.string(),
                    })
                    .strict(),
                  credentialStatus: z
                    .object({})
                    .partial()
                    .strict()
                    .passthrough()
                    .optional(),
                  evidence: z
                    .array(z.object({}).partial().strict().passthrough())
                    .optional(),
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
    path: "/api/badges/v3/credentials",
    alias: "postApiBadgesV3Credentials",
    description: `Issue a new achievement credential`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiBadgesV3Credentials_Body,
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
    path: "/api/badges/v3/credentials/my-credentials",
    alias: "getApiBadgesV3CredentialsMy-credentials",
    description: `Get credentials issued to the authenticated user`,
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
                  issuer: z.string(),
                  issuanceDate: z.string(),
                  expirationDate: z.string().optional(),
                  credentialSubject: z
                    .object({
                      id: z.string(),
                      type: z.array(z.string()),
                      achievement: z
                        .object({})
                        .partial()
                        .strict()
                        .passthrough(),
                      identifier: z.array(
                        z
                          .object({
                            type: z.string(),
                            identityHash: z.string(),
                            hashed: z.boolean(),
                          })
                          .strict(),
                      ),
                      name: z.string().optional(),
                    })
                    .strict(),
                  proof: z
                    .object({
                      type: z.string(),
                      cryptosuite: z.string(),
                      created: z.string(),
                      verificationMethod: z.string(),
                      proofPurpose: z.string(),
                      proofValue: z.string(),
                    })
                    .strict(),
                  credentialStatus: z
                    .object({})
                    .partial()
                    .strict()
                    .passthrough()
                    .optional(),
                  evidence: z
                    .array(z.object({}).partial().strict().passthrough())
                    .optional(),
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
    method: "get",
    path: "/api/badges/v3/credentials/:id",
    alias: "getApiBadgesV3CredentialsById",
    description: `Get a specific credential by its IRI`,
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
        status: 410,
        description: `Credential has been revoked`,
        schema: z
          .object({
            success: z.boolean(),
            error: z
              .object({
                message: z.string(),
                revocationReason: z.string().optional(),
              })
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
    path: "/api/badges/v3/credentials/verify",
    alias: "postApiBadgesV3CredentialsVerify",
    description: `Verify the cryptographic proof and revocation status of a credential`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiBadgesV3CredentialsVerify_Body,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        verified: z.boolean(),
        revocationStatus: z
          .object({ revoked: z.boolean(), reason: z.string().optional() })
          .strict()
          .optional(),
        verificationResult: z
          .object({
            proofVerified: z.boolean(),
            issuerVerified: z.boolean(),
            notRevoked: z.boolean(),
            notExpired: z.boolean().optional(),
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
    path: "/api/badges/v3/credentials/:id/revoke",
    alias: "putApiBadgesV3CredentialsByIdRevoke",
    description: `Revoke an issued credential`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ reason: z.string() }).partial().strict(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        message: z.string(),
        revocationReason: z.string().optional(),
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

export const Open_Badges_v3_0Api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
