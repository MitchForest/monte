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
    path: "/ims/case/v1p1/CFConcepts/:sourcedId",
    alias: "getImsCaseV1p1CFConceptsBySourcedId",
    description: `Retrieve a concept and all its child concepts based on hierarchy codes`,
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
        CFConcepts: z.array(
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
              title: z.string(),
              keywords: z.string().optional(),
              hierarchyCode: z.string().optional(),
              description: z.string().optional(),
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
        description: `Concept not found`,
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

export const CASE_v1_1___ConceptsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
