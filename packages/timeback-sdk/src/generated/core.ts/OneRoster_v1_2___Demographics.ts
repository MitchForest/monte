import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsOnerosterRosteringV1p2Demographics_Body = z
  .object({
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sex: z.enum(["male", "female", "other"]),
    americanIndianOrAlaskaNative: z.boolean(),
    asian: z.boolean(),
    blackOrAfricanAmerican: z.boolean(),
    nativeHawaiianOrOtherPacificIslander: z.boolean(),
    white: z.boolean(),
    demographicRaceTwoOrMoreRaces: z.boolean(),
    hispanicOrLatinoEthnicity: z.boolean(),
    countryOfBirthCode: z.string(),
    stateOfBirthAbbreviation: z.string(),
    cityOfBirth: z.string(),
    publicSchoolResidenceStatus: z.string(),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();
const putImsOnerosterRosteringV1p2DemographicsById_Body = z
  .object({
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sex: z.enum(["male", "female", "other"]),
    americanIndianOrAlaskaNative: z.boolean(),
    asian: z.boolean(),
    blackOrAfricanAmerican: z.boolean(),
    nativeHawaiianOrOtherPacificIslander: z.boolean(),
    white: z.boolean(),
    demographicRaceTwoOrMoreRaces: z.boolean(),
    hispanicOrLatinoEthnicity: z.boolean(),
    countryOfBirthCode: z.string(),
    stateOfBirthAbbreviation: z.string(),
    cityOfBirth: z.string(),
    publicSchoolResidenceStatus: z.string(),
    metadata: z.object({}).partial().strict().passthrough(),
    status: z.enum(["active", "tobedeleted"]),
  })
  .partial()
  .strict();

export const schemas = {
  postImsOnerosterRosteringV1p2Demographics_Body,
  putImsOnerosterRosteringV1p2DemographicsById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/demographics",
    alias: "getImsOnerosterRosteringV1p2Demographics",
    description: `List all demographics records (privileged access required)`,
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
        schema: z.enum(["active", "tobedeleted"]).optional(),
      },
    ],
    response: z.object({ demographics: z.array(z.unknown()) }).strict(),
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
    path: "/ims/oneroster/rostering/v1p2/demographics",
    alias: "postImsOnerosterRosteringV1p2Demographics",
    description: `Create a new demographics record (privileged access required)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterRosteringV1p2Demographics_Body,
      },
    ],
    response: z.object({ demographics: z.unknown() }).strict(),
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
    path: "/ims/oneroster/rostering/v1p2/demographics/:id",
    alias: "getImsOnerosterRosteringV1p2DemographicsById",
    description: `Get a specific demographics record by ID (privileged access required)`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ demographics: z.unknown() }).strict(),
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
    path: "/ims/oneroster/rostering/v1p2/demographics/:id",
    alias: "putImsOnerosterRosteringV1p2DemographicsById",
    description: `Update a demographics record (privileged access required)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsOnerosterRosteringV1p2DemographicsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ demographics: z.unknown() }).strict(),
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
    method: "delete",
    path: "/ims/oneroster/rostering/v1p2/demographics/:id",
    alias: "deleteImsOnerosterRosteringV1p2DemographicsById",
    description: `Delete a demographics record (privileged access required)`,
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

export const OneRoster_v1_2___DemographicsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
