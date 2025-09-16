import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsQtiV3p0Validate_Body = z
  .object({ xmlContent: z.string(), documentType: z.string().optional() })
  .strict();
const postImsQtiV3p0ValidateBatch_Body = z
  .object({
    documents: z
      .array(
        z
          .object({
            xmlContent: z.string(),
            documentType: z.string().optional(),
          })
          .strict()
      )
      .min(1)
      .max(100),
  })
  .strict();

export const schemas = {
  postImsQtiV3p0Validate_Body,
  postImsQtiV3p0ValidateBatch_Body,
};

export const endpoints = makeApi([
  {
    method: "post",
    path: "/ims/qti/v3p0/validate",
    alias: "postImsQtiV3p0Validate",
    description: `Validates a single QTI XML document against QTI v3.0 rules`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0Validate_Body,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            valid: z.boolean(),
            errors: z.array(
              z
                .object({
                  line: z.number().optional(),
                  column: z.number().optional(),
                  message: z.string(),
                  severity: z.enum(["error", "warning"]),
                  path: z.string().optional(),
                })
                .strict()
            ),
            version: z.string().optional(),
            documentType: z.string().optional(),
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
    method: "post",
    path: "/ims/qti/v3p0/items/validate",
    alias: "postImsQtiV3p0ItemsValidate",
    description: `Validates QTI assessment item XML specifically`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ xmlContent: z.string() }).strict(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            valid: z.boolean(),
            errors: z.array(
              z
                .object({
                  line: z.number().optional(),
                  column: z.number().optional(),
                  message: z.string(),
                  severity: z.enum(["error", "warning"]),
                  path: z.string().optional(),
                })
                .strict()
            ),
            version: z.string().optional(),
            documentType: z.string().optional(),
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
    method: "post",
    path: "/ims/qti/v3p0/tests/validate",
    alias: "postImsQtiV3p0TestsValidate",
    description: `Validates QTI assessment test XML specifically`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ xmlContent: z.string() }).strict(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            valid: z.boolean(),
            errors: z.array(
              z
                .object({
                  line: z.number().optional(),
                  column: z.number().optional(),
                  message: z.string(),
                  severity: z.enum(["error", "warning"]),
                  path: z.string().optional(),
                })
                .strict()
            ),
            version: z.string().optional(),
            documentType: z.string().optional(),
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
    method: "post",
    path: "/ims/qti/v3p0/validate/batch",
    alias: "postImsQtiV3p0ValidateBatch",
    description: `Validates multiple QTI XML documents in a single request`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsQtiV3p0ValidateBatch_Body,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            results: z.array(
              z
                .object({
                  valid: z.boolean(),
                  errors: z.array(
                    z
                      .object({
                        line: z.number().optional(),
                        column: z.number().optional(),
                        message: z.string(),
                        severity: z.enum(["error", "warning"]),
                        path: z.string().optional(),
                      })
                      .strict()
                  ),
                  version: z.string().optional(),
                  documentType: z.string().optional(),
                })
                .strict()
            ),
            summary: z
              .object({
                total: z.number(),
                valid: z.number(),
                invalid: z.number(),
                warnings: z.number(),
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
    path: "/ims/qti/v3p0/validate/schemas",
    alias: "getImsQtiV3p0ValidateSchemas",
    description: `Returns a list of QTI document types that can be validated`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        data: z
          .object({
            schemas: z.array(
              z
                .object({
                  type: z.string(),
                  description: z.string(),
                  version: z.string(),
                })
                .strict()
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

export const QTI_v3_0___ValidationApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
