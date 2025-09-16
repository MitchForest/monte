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
    path: "/ims/case/v1p1/CFItems",
    alias: "getImsCaseV1p1CFItems",
    description: `Retrieve all competency items with pagination, filtering, and sorting support`,
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
        CFItems: z.array(
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
              fullStatement: z.string(),
              alternativeLabel: z.string().optional(),
              CFItemType: z.string().optional(),
              humanCodingScheme: z.string().optional(),
              listEnumeration: z.string().optional(),
              abbreviatedStatement: z.string().optional(),
              conceptKeywords: z.array(z.string()).optional(),
              conceptKeywordsURI: z
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
              language: z.string().optional(),
              educationLevel: z.array(z.string()).optional(),
              CFItemTypeURI: z
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
              statusStartDate: z.string().optional(),
              statusEndDate: z.string().optional(),
              CFDocumentURI: z
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
              subject: z.string().optional(),
              subjectURI: z.string().optional(),
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
    path: "/ims/case/v1p1/CFItems/:sourcedId",
    alias: "getImsCaseV1p1CFItemsBySourcedId",
    description: `Retrieve a specific competency item by its UUID`,
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
        fullStatement: z.string(),
        alternativeLabel: z.string().optional(),
        CFItemType: z.string().optional(),
        humanCodingScheme: z.string().optional(),
        listEnumeration: z.string().optional(),
        abbreviatedStatement: z.string().optional(),
        conceptKeywords: z.array(z.string()).optional(),
        conceptKeywordsURI: z
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
        language: z.string().optional(),
        educationLevel: z.array(z.string()).optional(),
        CFItemTypeURI: z
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
        statusStartDate: z.string().optional(),
        statusEndDate: z.string().optional(),
        CFDocumentURI: z
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
        subject: z.string().optional(),
        subjectURI: z.string().optional(),
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
        description: `Item not found`,
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
    path: "/ims/case/v1p1/CFItemAssociations/:sourcedId",
    alias: "getImsCaseV1p1CFItemAssociationsBySourcedId",
    description: `Retrieve a CFItem along with ALL associations where this item is either the origin or destination`,
    requestFormat: "json",
    parameters: [
      {
        name: "sourcedId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        CFItem: z
          .object({
            identifier: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            uri: z.string().url(),
            lastChangeDateTime: z.string(),
            fullStatement: z.string(),
            alternativeLabel: z.string().optional(),
            CFItemType: z.string().optional(),
            humanCodingScheme: z.string().optional(),
            listEnumeration: z.string().optional(),
            abbreviatedStatement: z.string().optional(),
            conceptKeywords: z.array(z.string()).optional(),
            conceptKeywordsURI: z
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
            language: z.string().optional(),
            educationLevel: z.array(z.string()).optional(),
            CFItemTypeURI: z
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
            statusStartDate: z.string().optional(),
            statusEndDate: z.string().optional(),
            CFDocumentURI: z
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
            subject: z.string().optional(),
            subjectURI: z.string().optional(),
            extensions: z
              .object({})
              .partial()
              .strict()
              .passthrough()
              .optional(),
          })
          .strict(),
        CFAssociations: z.array(
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
              associationType: z.string(),
              sequenceNumber: z.number().optional(),
              originNodeURI: z
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
                .strict(),
              destinationNodeURI: z
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
                .strict(),
              CFAssociationGroupingURI: z
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
              CFDocumentURI: z
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
        status: 404,
        description: `Item not found`,
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

export const CASE_v1_1___ItemsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
