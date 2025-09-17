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
    path: "/ims/case/v1p1/CFAssociations/:sourcedId",
    alias: "getImsCaseV1p1CFAssociationsBySourcedId",
    description: `Retrieve a specific association by its UUID`,
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
        identifier: z
          .string()
          .regex(
            /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
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
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
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
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
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
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
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
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
              )
              .uuid(),
            uri: z.string().url(),
            targetType: z.string().optional(),
          })
          .strict()
          .optional(),
        notes: z.string().optional(),
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
                    .strict(),
                ),
              })
              .strict(),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Association not found`,
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
                    .strict(),
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
                    .strict(),
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

export const CASE_v1_1___AssociationsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
