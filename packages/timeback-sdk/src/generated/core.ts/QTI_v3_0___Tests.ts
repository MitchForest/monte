import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsQtiV3p0Assessment_tests_Body = z
  .object({
    identifier: z.string().min(1),
    title: z.string().min(1),
    toolName: z.string().optional(),
    toolVersion: z.string().optional(),
    label: z.string().optional(),
    xmlContent: z.string().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
    organizationId: z.string().optional(),
  })
  .strict();
const putImsQtiV3p0Assessment_testsById_Body = z
  .object({
    title: z.string().min(1),
    toolName: z.string(),
    toolVersion: z.string(),
    label: z.string(),
    xmlContent: z.string(),
    metadata: z.object({}).partial().strict().passthrough(),
    status: z.enum(["active", "inactive", "archived"]),
  })
  .partial()
  .strict();

export const schemas = {
  postImsQtiV3p0Assessment_tests_Body,
  putImsQtiV3p0Assessment_testsById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/qti/v3p0/assessment-tests",
    alias: "getImsQtiV3p0Assessment-tests",
    description: `Get a paginated list of assessment tests with optional filtering`,
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
        schema: z.enum(["active", "inactive", "archived"]).optional(),
      },
      {
        name: "organizationId",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z
      .object({
        tests: z.array(
          z
            .object({
              id: z
                .string()
                .regex(
                  /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
                )
                .uuid(),
              identifier: z.string(),
              title: z.string(),
              toolName: z.union([z.string(), z.null()]),
              toolVersion: z.union([z.string(), z.null()]),
              label: z.union([z.string(), z.null()]),
              s3Id: z.union([z.string(), z.null()]),
              xmlHash: z.union([z.string(), z.null()]),
              metadata: z.object({}).partial().strict().passthrough(),
              status: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
              createdBy: z.union([z.string(), z.null()]),
              organizationId: z.union([z.string(), z.null()]),
            })
            .strict()
        ),
        pagination: z
          .object({
            limit: z.number(),
            offset: z.number(),
            total: z.number(),
            hasMore: z.boolean(),
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
    path: "/ims/qti/v3p0/assessment-tests",
    alias: "postImsQtiV3p0Assessment-tests",
    description: `Create a new assessment test`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0Assessment_tests_Body,
      },
    ],
    response: z
      .object({
        test: z
          .object({
            id: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            identifier: z.string(),
            title: z.string(),
            toolName: z.union([z.string(), z.null()]),
            toolVersion: z.union([z.string(), z.null()]),
            label: z.union([z.string(), z.null()]),
            s3Id: z.union([z.string(), z.null()]),
            xmlHash: z.union([z.string(), z.null()]),
            metadata: z.object({}).partial().strict().passthrough(),
            status: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            createdBy: z.union([z.string(), z.null()]),
            organizationId: z.union([z.string(), z.null()]),
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
        status: 409,
        description: `Conflict - Test identifier already exists`,
        schema: z
          .object({
            success: z.boolean(),
            error: z.object({ message: z.string() }).strict(),
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
    path: "/ims/qti/v3p0/assessment-tests/:id",
    alias: "getImsQtiV3p0Assessment-testsById",
    description: `Get a specific assessment test by ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        test: z
          .object({
            id: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            identifier: z.string(),
            title: z.string(),
            toolName: z.union([z.string(), z.null()]),
            toolVersion: z.union([z.string(), z.null()]),
            label: z.union([z.string(), z.null()]),
            s3Id: z.union([z.string(), z.null()]),
            xmlHash: z.union([z.string(), z.null()]),
            metadata: z.object({}).partial().strict().passthrough(),
            status: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            createdBy: z.union([z.string(), z.null()]),
            organizationId: z.union([z.string(), z.null()]),
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
    method: "put",
    path: "/ims/qti/v3p0/assessment-tests/:id",
    alias: "putImsQtiV3p0Assessment-testsById",
    description: `Update an existing assessment test`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsQtiV3p0Assessment_testsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        test: z
          .object({
            id: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            identifier: z.string(),
            title: z.string(),
            toolName: z.union([z.string(), z.null()]),
            toolVersion: z.union([z.string(), z.null()]),
            label: z.union([z.string(), z.null()]),
            s3Id: z.union([z.string(), z.null()]),
            xmlHash: z.union([z.string(), z.null()]),
            metadata: z.object({}).partial().strict().passthrough(),
            status: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            createdBy: z.union([z.string(), z.null()]),
            organizationId: z.union([z.string(), z.null()]),
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
    path: "/ims/qti/v3p0/assessment-tests/:id",
    alias: "deleteImsQtiV3p0Assessment-testsById",
    description: `Delete an existing assessment test`,
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
        status: 400,
        description: `Bad Request - Test has associated parts`,
        schema: z
          .object({
            success: z.boolean(),
            error: z.object({ message: z.string() }).strict(),
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
    path: "/ims/qti/v3p0/assessment-tests/:id/parts",
    alias: "getImsQtiV3p0Assessment-testsByIdParts",
    description: `Get all parts for a specific assessment test`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        parts: z.array(
          z
            .object({
              id: z.string(),
              identifier: z.string(),
              navigationMode: z.union([z.string(), z.null()]),
              submissionMode: z.union([z.string(), z.null()]),
              itemSelectionRules: z.union([
                z.object({}).partial().strict().passthrough(),
                z.null(),
              ]),
              timeLimits: z.union([
                z.object({}).partial().strict().passthrough(),
                z.null(),
              ]),
              sequence: z.number(),
              metadata: z.object({}).partial().strict().passthrough(),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
            .strict()
        ),
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
    method: "get",
    path: "/ims/qti/v3p0/assessment-tests/:id/questions",
    alias: "getImsQtiV3p0Assessment-testsByIdQuestions",
    description: `Retrieves all assessment items (questions) associated with a test through its parts and sections`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        questions: z.array(
          z
            .object({
              id: z.string(),
              identifier: z.string(),
              title: z.string(),
              label: z.union([z.string(), z.null()]),
              interactionType: z.string(),
              adaptive: z.boolean(),
              timeDependent: z.boolean(),
              language: z.union([z.string(), z.null()]),
              status: z.string(),
              sectionId: z.string(),
              sectionTitle: z.string(),
              partId: z.string(),
              partIdentifier: z.string(),
              sequence: z.number(),
            })
            .strict()
        ),
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
    method: "get",
    path: "/ims/qti/v3p0/assessment-tests/:id/test-parts",
    alias: "getImsQtiV3p0Assessment-testsByIdTest-parts",
    description: `Retrieves all test parts with their nested sections and items, following the QTI hierarchical structure`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        testParts: z.array(
          z
            .object({
              id: z.string(),
              identifier: z.string(),
              navigationMode: z.union([z.string(), z.null()]),
              submissionMode: z.union([z.string(), z.null()]),
              sequence: z.number(),
              sections: z.array(
                z
                  .object({
                    id: z.string(),
                    identifier: z.string(),
                    title: z.string(),
                    visible: z.boolean(),
                    required: z.boolean(),
                    fixed: z.boolean(),
                    sequence: z.number(),
                    items: z.array(
                      z
                        .object({
                          id: z.string(),
                          identifier: z.string(),
                          title: z.string(),
                          interactionType: z.string(),
                          sequence: z.number(),
                        })
                        .strict()
                    ),
                  })
                  .strict()
              ),
            })
            .strict()
        ),
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
]);

export type EndpointDefinitions = typeof endpoints;

export const QTI_v3_0___TestsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
