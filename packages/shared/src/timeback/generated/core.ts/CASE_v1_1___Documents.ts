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
    path: "/ims/case/v1p1/CFDocuments",
    alias: "getImsCaseV1p1CFDocuments",
    description: `Retrieve all competency framework documents with pagination, filtering, and sorting support`,
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().gte(1).lte(3000).optional().default(100),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().gte(0).optional().default(0),
      },
      {
        name: "sort",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "orderBy",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("desc"),
      },
      {
        name: "filter",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "fields",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z
      .object({
        CFDocuments: z.array(
          z
            .object({
              identifier: z
                .string()
                .regex(
                  /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
                )
                .uuid(),
              uri: z.string().url(),
              lastChangeDateTime: z.string(),
              creator: z.string(),
              title: z.string(),
              officialSourceURL: z.string().url().optional(),
              publisher: z.string().optional(),
              description: z.string().optional(),
              subject: z.array(z.string()).optional(),
              subjectURI: z
                .array(
                  z
                    .object({
                      title: z.string(),
                      identifier: z
                        .string()
                        .regex(
                          /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
                        )
                        .uuid(),
                      uri: z.string().url(),
                      targetType: z.string().optional(),
                    })
                    .strict()
                )
                .optional(),
              language: z.string().optional(),
              version: z.string().optional(),
              adoptionStatus: z.string().optional(),
              statusStartDate: z.string().optional(),
              statusEndDate: z.string().optional(),
              licenseURI: z
                .object({
                  title: z.string(),
                  identifier: z
                    .string()
                    .regex(
                      /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
                    )
                    .uuid(),
                  uri: z.string().url(),
                  targetType: z.string().optional(),
                })
                .strict()
                .optional(),
              notes: z.string().optional(),
              CFPackageURI: z
                .object({
                  title: z.string(),
                  identifier: z
                    .string()
                    .regex(
                      /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
                    )
                    .uuid(),
                  uri: z.string().url(),
                  targetType: z.string().optional(),
                })
                .strict()
                .optional(),
              caseVersion: z.string().optional(),
              frameworkType: z.string().optional(),
              extensions: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
            })
            .strict()
        ),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            imsx_codeMajor: z.enum(["failure", "success"]),
            imsx_severity: z.enum(["error", "warning", "info"]),
            imsx_description: z.string(),
            imsx_codeMinor: z
              .object({
                imsx_codeMinorField: z.array(
                  z
                    .object({
                      imsx_codeMinorFieldName: z.string(),
                      imsx_codeMinorFieldValue: z.string(),
                    })
                    .strict()
                ),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            imsx_codeMajor: z.enum(["failure", "success"]),
            imsx_severity: z.enum(["error", "warning", "info"]),
            imsx_description: z.string(),
            imsx_codeMinor: z
              .object({
                imsx_codeMinorField: z.array(
                  z
                    .object({
                      imsx_codeMinorFieldName: z.string(),
                      imsx_codeMinorFieldValue: z.string(),
                    })
                    .strict()
                ),
              })
              .strict(),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/case/v1p1/CFDocuments/:sourcedId",
    alias: "getImsCaseV1p1CFDocumentsBySourcedId",
    description: `Retrieve a specific competency framework document by its UUID`,
    requestFormat: "json",
    parameters: [
      {
        name: "fields",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "sourcedId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        identifier: z
          .string()
          .regex(
            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
          )
          .uuid(),
        uri: z.string().url(),
        lastChangeDateTime: z.string(),
        creator: z.string(),
        title: z.string(),
        officialSourceURL: z.string().url().optional(),
        publisher: z.string().optional(),
        description: z.string().optional(),
        subject: z.array(z.string()).optional(),
        subjectURI: z
          .array(
            z
              .object({
                title: z.string(),
                identifier: z
                  .string()
                  .regex(
                    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
                  )
                  .uuid(),
                uri: z.string().url(),
                targetType: z.string().optional(),
              })
              .strict()
          )
          .optional(),
        language: z.string().optional(),
        version: z.string().optional(),
        adoptionStatus: z.string().optional(),
        statusStartDate: z.string().optional(),
        statusEndDate: z.string().optional(),
        licenseURI: z
          .object({
            title: z.string(),
            identifier: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            uri: z.string().url(),
            targetType: z.string().optional(),
          })
          .strict()
          .optional(),
        notes: z.string().optional(),
        CFPackageURI: z
          .object({
            title: z.string(),
            identifier: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            uri: z.string().url(),
            targetType: z.string().optional(),
          })
          .strict()
          .optional(),
        caseVersion: z.string().optional(),
        frameworkType: z.string().optional(),
        extensions: z.object({}).partial().strict().passthrough().optional(),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            imsx_codeMajor: z.enum(["failure", "success"]),
            imsx_severity: z.enum(["error", "warning", "info"]),
            imsx_description: z.string(),
            imsx_codeMinor: z
              .object({
                imsx_codeMinorField: z.array(
                  z
                    .object({
                      imsx_codeMinorFieldName: z.string(),
                      imsx_codeMinorFieldValue: z.string(),
                    })
                    .strict()
                ),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Document not found`,
        schema: z
          .object({
            imsx_codeMajor: z.enum(["failure", "success"]),
            imsx_severity: z.enum(["error", "warning", "info"]),
            imsx_description: z.string(),
            imsx_codeMinor: z
              .object({
                imsx_codeMinorField: z.array(
                  z
                    .object({
                      imsx_codeMinorFieldName: z.string(),
                      imsx_codeMinorFieldValue: z.string(),
                    })
                    .strict()
                ),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            imsx_codeMajor: z.enum(["failure", "success"]),
            imsx_severity: z.enum(["error", "warning", "info"]),
            imsx_description: z.string(),
            imsx_codeMinor: z
              .object({
                imsx_codeMinorField: z.array(
                  z
                    .object({
                      imsx_codeMinorFieldName: z.string(),
                      imsx_codeMinorFieldValue: z.string(),
                    })
                    .strict()
                ),
              })
              .strict(),
          })
          .strict(),
      },
    ],
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const CASE_v1_1___DocumentsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
