import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsOnerosterRosteringV1p2Orgs_Body = z
  .object({
    name: z.string().min(1).max(255),
    type: z.enum([
      "department",
      "school",
      "district",
      "local",
      "state",
      "national",
    ]),
    identifier: z.string().optional(),
    parentId: z.string().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putImsOnerosterRosteringV1p2OrgsById_Body = z
  .object({
    name: z.string().min(1).max(255),
    type: z.enum([
      "department",
      "school",
      "district",
      "local",
      "state",
      "national",
    ]),
    identifier: z.string(),
    parentId: z.union([z.string(), z.null()]),
    status: z.enum(["active", "tobedeleted"]),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();
const postImsOnerosterRosteringV1p2Users_Body = z
  .object({
    username: z.string().min(1).max(255),
    givenName: z.string().min(1).max(255),
    familyName: z.string().min(1).max(255),
    middleName: z.string().optional(),
    email: z
      .string()
      .regex(
        /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/,
      )
      .email()
      .optional(),
    sms: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum([
      "administrator",
      "aide",
      "guardian",
      "parent",
      "proctor",
      "relative",
      "student",
      "teacher",
    ]),
    grades: z.array(z.string()).optional(),
    identifier: z.string().optional(),
    orgIds: z.array(z.string()).min(1),
    enabledUser: z.boolean().default(true),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putImsOnerosterRosteringV1p2UsersById_Body = z
  .object({
    username: z.string().min(1).max(255),
    givenName: z.string().min(1).max(255),
    familyName: z.string().min(1).max(255),
    middleName: z.string(),
    email: z
      .string()
      .regex(
        /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/,
      )
      .email(),
    sms: z.string(),
    phone: z.string(),
    role: z.enum([
      "administrator",
      "aide",
      "guardian",
      "parent",
      "proctor",
      "relative",
      "student",
      "teacher",
    ]),
    grades: z.array(z.string()),
    identifier: z.string(),
    enabledUser: z.boolean(),
    status: z.enum(["active", "tobedeleted"]),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();
const postImsOnerosterRosteringV1p2UsersByIdCredentials_Body = z
  .object({
    type: z.string().min(1).max(100),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    issuer: z.string().optional(),
    issueDate: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/,
      )
      .datetime({ offset: true })
      .optional(),
    expirationDate: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/,
      )
      .datetime({ offset: true })
      .optional(),
    credentialUrl: z.string().url().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
    encryptedData: z.string().optional(),
  })
  .strict();
const postImsOnerosterRosteringV1p2Courses_Body = z
  .object({
    title: z.string().min(1).max(255),
    courseCode: z.string().optional(),
    grades: z.array(z.string()).optional(),
    subjects: z.array(z.string()).optional(),
    orgId: z.string(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putImsOnerosterRosteringV1p2CoursesById_Body = z
  .object({
    title: z.string().min(1).max(255),
    courseCode: z.string(),
    grades: z.array(z.string()),
    subjects: z.array(z.string()),
    status: z.enum(["active", "tobedeleted"]),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();
const postImsOnerosterRosteringV1p2Classes_Body = z
  .object({
    title: z.string().min(1).max(255),
    classCode: z.string().optional(),
    classType: z.enum(["homeroom", "scheduled"]),
    location: z.string().optional(),
    grades: z.array(z.string()).optional(),
    subjects: z.array(z.string()).optional(),
    courseId: z.string(),
    schoolId: z.string(),
    termIds: z.array(z.string()).optional(),
    periods: z.array(z.string()).optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putImsOnerosterRosteringV1p2ClassesById_Body = z
  .object({
    title: z.string().min(1).max(255),
    classCode: z.string(),
    classType: z.enum(["homeroom", "scheduled"]),
    location: z.string(),
    grades: z.array(z.string()),
    subjects: z.array(z.string()),
    termIds: z.array(z.string()),
    periods: z.array(z.string()),
    status: z.enum(["active", "tobedeleted"]),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();
const postImsOnerosterRosteringV1p2Enrollments_Body = z
  .object({
    userId: z.string(),
    classId: z.string(),
    schoolId: z.string(),
    role: z.enum(["student", "teacher", "aide", "administrator"]),
    primary: z.boolean().optional(),
    beginDate: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/,
      )
      .datetime({ offset: true })
      .optional(),
    endDate: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/,
      )
      .datetime({ offset: true })
      .optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putImsOnerosterRosteringV1p2EnrollmentsById_Body = z
  .object({
    role: z.enum(["student", "teacher", "aide", "administrator"]),
    primary: z.boolean(),
    beginDate: z.union([z.string(), z.null()]),
    endDate: z.union([z.string(), z.null()]),
    status: z.enum(["active", "tobedeleted"]),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();
const postImsOnerosterRosteringV1p2AcademicSessions_Body = z
  .object({
    title: z.string().min(1).max(255),
    startDate: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/,
      )
      .datetime({ offset: true }),
    endDate: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/,
      )
      .datetime({ offset: true }),
    type: z.enum(["gradingPeriod", "semester", "schoolYear", "term"]),
    schoolYear: z.number().int().gte(2000).lte(2100),
    parentId: z.string().optional(),
    orgId: z.string(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict();
const putImsOnerosterRosteringV1p2AcademicSessionsById_Body = z
  .object({
    title: z.string().min(1).max(255),
    startDate: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/,
      )
      .datetime({ offset: true }),
    endDate: z
      .string()
      .regex(
        /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/,
      )
      .datetime({ offset: true }),
    type: z.enum(["gradingPeriod", "semester", "schoolYear", "term"]),
    schoolYear: z.number().int().gte(2000).lte(2100),
    parentId: z.string(),
    status: z.enum(["active", "tobedeleted"]),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict();

export const schemas = {
  postImsOnerosterRosteringV1p2Orgs_Body,
  putImsOnerosterRosteringV1p2OrgsById_Body,
  postImsOnerosterRosteringV1p2Users_Body,
  putImsOnerosterRosteringV1p2UsersById_Body,
  postImsOnerosterRosteringV1p2UsersByIdCredentials_Body,
  postImsOnerosterRosteringV1p2Courses_Body,
  putImsOnerosterRosteringV1p2CoursesById_Body,
  postImsOnerosterRosteringV1p2Classes_Body,
  putImsOnerosterRosteringV1p2ClassesById_Body,
  postImsOnerosterRosteringV1p2Enrollments_Body,
  putImsOnerosterRosteringV1p2EnrollmentsById_Body,
  postImsOnerosterRosteringV1p2AcademicSessions_Body,
  putImsOnerosterRosteringV1p2AcademicSessionsById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/orgs",
    alias: "getImsOnerosterRosteringV1p2Orgs",
    description: `Returns a collection of organization objects. Organizations include schools, districts, and other hierarchical entities.`,
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
        orgs: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              name: z.string(),
              type: z.enum([
                "department",
                "school",
                "district",
                "local",
                "state",
                "national",
              ]),
              identifier: z.union([z.string(), z.null()]).optional(),
              parent: z
                .union([
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                  z.null(),
                ])
                .optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "post",
    path: "/ims/oneroster/rostering/v1p2/orgs",
    alias: "postImsOnerosterRosteringV1p2Orgs",
    description: `Create a new organization record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterRosteringV1p2Orgs_Body,
      },
    ],
    response: z
      .object({
        org: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            name: z.string(),
            type: z.enum([
              "department",
              "school",
              "district",
              "local",
              "state",
              "national",
            ]),
            identifier: z.union([z.string(), z.null()]).optional(),
            parent: z
              .union([
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
                z.null(),
              ])
              .optional(),
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
    path: "/ims/oneroster/rostering/v1p2/orgs/:id",
    alias: "getImsOnerosterRosteringV1p2OrgsById",
    description: `Returns a specific organization object`,
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
        org: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            name: z.string(),
            type: z.enum([
              "department",
              "school",
              "district",
              "local",
              "state",
              "national",
            ]),
            identifier: z.union([z.string(), z.null()]).optional(),
            parent: z
              .union([
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
                z.null(),
              ])
              .optional(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Organization not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "put",
    path: "/ims/oneroster/rostering/v1p2/orgs/:id",
    alias: "putImsOnerosterRosteringV1p2OrgsById",
    description: `Update an existing organization record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsOnerosterRosteringV1p2OrgsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        org: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            name: z.string(),
            type: z.enum([
              "department",
              "school",
              "district",
              "local",
              "state",
              "national",
            ]),
            identifier: z.union([z.string(), z.null()]).optional(),
            parent: z
              .union([
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
                z.null(),
              ])
              .optional(),
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
    method: "delete",
    path: "/ims/oneroster/rostering/v1p2/orgs/:id",
    alias: "deleteImsOnerosterRosteringV1p2OrgsById",
    description: `Delete an organization record`,
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
    path: "/ims/oneroster/rostering/v1p2/schools",
    alias: "getImsOnerosterRosteringV1p2Schools",
    description: `Returns a collection of school objects (organizations with type&#x3D;&#x27;school&#x27;)`,
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
        schools: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              name: z.string(),
              type: z.enum([
                "department",
                "school",
                "district",
                "local",
                "state",
                "national",
              ]),
              identifier: z.union([z.string(), z.null()]).optional(),
              parent: z
                .union([
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                  z.null(),
                ])
                .optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/schools/:id",
    alias: "getImsOnerosterRosteringV1p2SchoolsById",
    description: `Returns a specific school object`,
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
        school: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            name: z.string(),
            type: z.enum([
              "department",
              "school",
              "district",
              "local",
              "state",
              "national",
            ]),
            identifier: z.union([z.string(), z.null()]).optional(),
            parent: z
              .union([
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
                z.null(),
              ])
              .optional(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `School not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/schools/:id/classes",
    alias: "getImsOnerosterRosteringV1p2SchoolsByIdClasses",
    description: `Returns all classes belonging to a specific school`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
        classes: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              classCode: z.union([z.string(), z.null()]).optional(),
              classType: z.enum(["homeroom", "scheduled"]),
              location: z.union([z.string(), z.null()]).optional(),
              grades: z.array(z.string()).optional(),
              subjects: z.array(z.string()).optional(),
              course: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              school: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              terms: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
              subjectCodes: z.array(z.string()).optional(),
              periods: z.array(z.string()).optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 403,
        description: `Forbidden`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `School not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/schools/:id/courses",
    alias: "getImsOnerosterRosteringV1p2SchoolsByIdCourses",
    description: `Returns all courses offered by a specific school`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
        courses: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              schoolYear: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict()
                .optional(),
              courseCode: z.union([z.string(), z.null()]).optional(),
              grades: z.array(z.string()).optional(),
              subjects: z.array(z.string()).optional(),
              org: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              subjectCodes: z.array(z.string()).optional(),
              resources: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `School not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/schools/:id/students",
    alias: "getImsOnerosterRosteringV1p2SchoolsByIdStudents",
    description: `Returns all students enrolled in a specific school`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
    response: z.object({ users: z.array(z.unknown()) }).strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `School not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/schools/:id/teachers",
    alias: "getImsOnerosterRosteringV1p2SchoolsByIdTeachers",
    description: `Returns all teachers associated with a specific school`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
    response: z.object({ users: z.array(z.unknown()) }).strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `School not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/schools/:id/enrollments",
    alias: "getImsOnerosterRosteringV1p2SchoolsByIdEnrollments",
    description: `Returns all enrollments for classes in a specific school`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
    response: z.object({ enrollments: z.array(z.unknown()) }).strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `School not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/schools/:id/terms",
    alias: "getImsOnerosterRosteringV1p2SchoolsByIdTerms",
    description: `Returns all academic terms associated with a specific school`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
    response: z.object({ academicSessions: z.array(z.unknown()) }).strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `School not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/users",
    alias: "getImsOnerosterRosteringV1p2Users",
    description: `Returns a collection of all user objects`,
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
        users: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              username: z.string(),
              enabledUser: z.boolean(),
              givenName: z.string(),
              familyName: z.string(),
              middleName: z.union([z.string(), z.null()]).optional(),
              email: z.union([z.string(), z.null()]).optional(),
              sms: z.union([z.string(), z.null()]).optional(),
              phone: z.union([z.string(), z.null()]).optional(),
              role: z.enum([
                "administrator",
                "aide",
                "guardian",
                "parent",
                "proctor",
                "relative",
                "student",
                "teacher",
              ]),
              grades: z.array(z.string()).optional(),
              identifier: z.union([z.string(), z.null()]).optional(),
              orgs: z.array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              ),
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
    path: "/ims/oneroster/rostering/v1p2/users",
    alias: "postImsOnerosterRosteringV1p2Users",
    description: `Create a new user record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterRosteringV1p2Users_Body,
      },
    ],
    response: z
      .object({
        user: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            username: z.string(),
            enabledUser: z.boolean(),
            givenName: z.string(),
            familyName: z.string(),
            middleName: z.union([z.string(), z.null()]).optional(),
            email: z.union([z.string(), z.null()]).optional(),
            sms: z.union([z.string(), z.null()]).optional(),
            phone: z.union([z.string(), z.null()]).optional(),
            role: z.enum([
              "administrator",
              "aide",
              "guardian",
              "parent",
              "proctor",
              "relative",
              "student",
              "teacher",
            ]),
            grades: z.array(z.string()).optional(),
            identifier: z.union([z.string(), z.null()]).optional(),
            orgs: z.array(
              z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
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
    path: "/ims/oneroster/rostering/v1p2/users/:id",
    alias: "getImsOnerosterRosteringV1p2UsersById",
    description: `Returns a specific user object`,
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
        user: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            username: z.string(),
            enabledUser: z.boolean(),
            givenName: z.string(),
            familyName: z.string(),
            middleName: z.union([z.string(), z.null()]).optional(),
            email: z.union([z.string(), z.null()]).optional(),
            sms: z.union([z.string(), z.null()]).optional(),
            phone: z.union([z.string(), z.null()]).optional(),
            role: z.enum([
              "administrator",
              "aide",
              "guardian",
              "parent",
              "proctor",
              "relative",
              "student",
              "teacher",
            ]),
            grades: z.array(z.string()).optional(),
            identifier: z.union([z.string(), z.null()]).optional(),
            orgs: z.array(
              z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
            ),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `User not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "put",
    path: "/ims/oneroster/rostering/v1p2/users/:id",
    alias: "putImsOnerosterRosteringV1p2UsersById",
    description: `Update an existing user record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsOnerosterRosteringV1p2UsersById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        user: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            username: z.string(),
            enabledUser: z.boolean(),
            givenName: z.string(),
            familyName: z.string(),
            middleName: z.union([z.string(), z.null()]).optional(),
            email: z.union([z.string(), z.null()]).optional(),
            sms: z.union([z.string(), z.null()]).optional(),
            phone: z.union([z.string(), z.null()]).optional(),
            role: z.enum([
              "administrator",
              "aide",
              "guardian",
              "parent",
              "proctor",
              "relative",
              "student",
              "teacher",
            ]),
            grades: z.array(z.string()).optional(),
            identifier: z.union([z.string(), z.null()]).optional(),
            orgs: z.array(
              z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
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
  {
    method: "delete",
    path: "/ims/oneroster/rostering/v1p2/users/:id",
    alias: "deleteImsOnerosterRosteringV1p2UsersById",
    description: `Soft delete a user by setting status to &#x27;tobedeleted&#x27;`,
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
    path: "/ims/oneroster/rostering/v1p2/users/:id/credentials",
    alias: "getImsOnerosterRosteringV1p2UsersByIdCredentials",
    description: `Get all credentials for a specific user (proprietary extension)`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ credentials: z.array(z.unknown()) }).strict(),
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
    method: "post",
    path: "/ims/oneroster/rostering/v1p2/users/:id/credentials",
    alias: "postImsOnerosterRosteringV1p2UsersByIdCredentials",
    description: `Create a new credential for a specific user (proprietary extension)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterRosteringV1p2UsersByIdCredentials_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ credential: z.unknown() }).strict(),
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
    method: "post",
    path: "/ims/oneroster/rostering/v1p2/users/:id/credentials/:credentialId/decrypt",
    alias:
      "postImsOnerosterRosteringV1p2UsersByIdCredentialsByCredentialIdDecrypt",
    description: `Decrypt sensitive data from a user credential (proprietary extension). Note: This is a mock implementation for compatibility.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "credentialId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ decryptedData: z.unknown() }).strict(),
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
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/users/:id/classes",
    alias: "getImsOnerosterRosteringV1p2UsersByIdClasses",
    description: `Returns all classes that a user is enrolled in`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
        classes: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              classCode: z.union([z.string(), z.null()]).optional(),
              classType: z.enum(["homeroom", "scheduled"]),
              location: z.union([z.string(), z.null()]).optional(),
              grades: z.array(z.string()).optional(),
              subjects: z.array(z.string()).optional(),
              course: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              school: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              terms: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
              subjectCodes: z.array(z.string()).optional(),
              periods: z.array(z.string()).optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `User not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/students",
    alias: "getImsOnerosterRosteringV1p2Students",
    description: `Returns a collection of student user objects (users with role&#x3D;&#x27;student&#x27;)`,
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
        students: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              username: z.string(),
              enabledUser: z.boolean(),
              givenName: z.string(),
              familyName: z.string(),
              middleName: z.union([z.string(), z.null()]).optional(),
              email: z.union([z.string(), z.null()]).optional(),
              sms: z.union([z.string(), z.null()]).optional(),
              phone: z.union([z.string(), z.null()]).optional(),
              role: z.enum([
                "administrator",
                "aide",
                "guardian",
                "parent",
                "proctor",
                "relative",
                "student",
                "teacher",
              ]),
              grades: z.array(z.string()).optional(),
              identifier: z.union([z.string(), z.null()]).optional(),
              orgs: z.array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              ),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/students/:id/classes",
    alias: "getImsOnerosterRosteringV1p2StudentsByIdClasses",
    description: `Returns all classes that a student is enrolled in`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
        classes: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              classCode: z.union([z.string(), z.null()]).optional(),
              classType: z.enum(["homeroom", "scheduled"]),
              location: z.union([z.string(), z.null()]).optional(),
              grades: z.array(z.string()).optional(),
              subjects: z.array(z.string()).optional(),
              course: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              school: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              terms: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
              subjectCodes: z.array(z.string()).optional(),
              periods: z.array(z.string()).optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Student not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/teachers",
    alias: "getImsOnerosterRosteringV1p2Teachers",
    description: `Returns a collection of teacher user objects (users with role&#x3D;&#x27;teacher&#x27;)`,
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
        teachers: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              username: z.string(),
              enabledUser: z.boolean(),
              givenName: z.string(),
              familyName: z.string(),
              middleName: z.union([z.string(), z.null()]).optional(),
              email: z.union([z.string(), z.null()]).optional(),
              sms: z.union([z.string(), z.null()]).optional(),
              phone: z.union([z.string(), z.null()]).optional(),
              role: z.enum([
                "administrator",
                "aide",
                "guardian",
                "parent",
                "proctor",
                "relative",
                "student",
                "teacher",
              ]),
              grades: z.array(z.string()).optional(),
              identifier: z.union([z.string(), z.null()]).optional(),
              orgs: z.array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              ),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/teachers/:id/classes",
    alias: "getImsOnerosterRosteringV1p2TeachersByIdClasses",
    description: `Returns all classes that a teacher is assigned to`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
        classes: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              classCode: z.union([z.string(), z.null()]).optional(),
              classType: z.enum(["homeroom", "scheduled"]),
              location: z.union([z.string(), z.null()]).optional(),
              grades: z.array(z.string()).optional(),
              subjects: z.array(z.string()).optional(),
              course: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              school: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              terms: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
              subjectCodes: z.array(z.string()).optional(),
              periods: z.array(z.string()).optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Teacher not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/courses",
    alias: "getImsOnerosterRosteringV1p2Courses",
    description: `Returns a collection of course objects. A course is the curriculum for a class.`,
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
        courses: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              courseCode: z.union([z.string(), z.null()]).optional(),
              grades: z.array(z.string()).optional(),
              subjects: z.array(z.string()).optional(),
              org: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
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
        description: `Bad request`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "post",
    path: "/ims/oneroster/rostering/v1p2/courses",
    alias: "postImsOnerosterRosteringV1p2Courses",
    description: `Create a new course record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterRosteringV1p2Courses_Body,
      },
    ],
    response: z
      .object({
        course: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            courseCode: z.union([z.string(), z.null()]).optional(),
            grades: z.array(z.string()).optional(),
            subjects: z.array(z.string()).optional(),
            org: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
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
    path: "/ims/oneroster/rostering/v1p2/courses/:id",
    alias: "getImsOnerosterRosteringV1p2CoursesById",
    description: `Returns a specific course object`,
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
        course: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            courseCode: z.union([z.string(), z.null()]).optional(),
            grades: z.array(z.string()).optional(),
            subjects: z.array(z.string()).optional(),
            org: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Course not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "put",
    path: "/ims/oneroster/rostering/v1p2/courses/:id",
    alias: "putImsOnerosterRosteringV1p2CoursesById",
    description: `Update an existing course record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsOnerosterRosteringV1p2CoursesById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        course: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            courseCode: z.union([z.string(), z.null()]).optional(),
            grades: z.array(z.string()).optional(),
            subjects: z.array(z.string()).optional(),
            org: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
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
    method: "delete",
    path: "/ims/oneroster/rostering/v1p2/courses/:id",
    alias: "deleteImsOnerosterRosteringV1p2CoursesById",
    description: `Delete a course record`,
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
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/courses/:id/classes",
    alias: "getImsOnerosterRosteringV1p2CoursesByIdClasses",
    description: `Returns all classes that are instances of a specific course`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
        classes: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              classCode: z.union([z.string(), z.null()]).optional(),
              classType: z.enum(["homeroom", "scheduled"]),
              location: z.union([z.string(), z.null()]).optional(),
              grades: z.array(z.string()).optional(),
              subjects: z.array(z.string()).optional(),
              course: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              school: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              terms: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
              subjectCodes: z.array(z.string()).optional(),
              periods: z.array(z.string()).optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Course not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/classes",
    alias: "getImsOnerosterRosteringV1p2Classes",
    description: `Returns a collection of class objects. A class is an instance of a course.`,
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
        classes: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              classCode: z.union([z.string(), z.null()]).optional(),
              classType: z.enum(["homeroom", "scheduled"]),
              location: z.union([z.string(), z.null()]).optional(),
              grades: z.array(z.string()).optional(),
              subjects: z.array(z.string()).optional(),
              course: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              school: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              terms: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
              periods: z.array(z.string()).optional(),
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
    path: "/ims/oneroster/rostering/v1p2/classes",
    alias: "postImsOnerosterRosteringV1p2Classes",
    description: `Create a new class record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterRosteringV1p2Classes_Body,
      },
    ],
    response: z
      .object({
        class: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            classCode: z.union([z.string(), z.null()]).optional(),
            classType: z.enum(["homeroom", "scheduled"]),
            location: z.union([z.string(), z.null()]).optional(),
            grades: z.array(z.string()).optional(),
            subjects: z.array(z.string()).optional(),
            course: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            school: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            terms: z
              .array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              )
              .optional(),
            periods: z.array(z.string()).optional(),
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
    path: "/ims/oneroster/rostering/v1p2/classes/:id",
    alias: "getImsOnerosterRosteringV1p2ClassesById",
    description: `Returns a specific class object`,
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
        class: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            classCode: z.union([z.string(), z.null()]).optional(),
            classType: z.enum(["homeroom", "scheduled"]),
            location: z.union([z.string(), z.null()]).optional(),
            grades: z.array(z.string()).optional(),
            subjects: z.array(z.string()).optional(),
            course: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            school: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            terms: z
              .array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              )
              .optional(),
            periods: z.array(z.string()).optional(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Class not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "put",
    path: "/ims/oneroster/rostering/v1p2/classes/:id",
    alias: "putImsOnerosterRosteringV1p2ClassesById",
    description: `Update an existing class record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsOnerosterRosteringV1p2ClassesById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        class: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            classCode: z.union([z.string(), z.null()]).optional(),
            classType: z.enum(["homeroom", "scheduled"]),
            location: z.union([z.string(), z.null()]).optional(),
            grades: z.array(z.string()).optional(),
            subjects: z.array(z.string()).optional(),
            course: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            school: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            terms: z
              .array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              )
              .optional(),
            periods: z.array(z.string()).optional(),
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
    method: "delete",
    path: "/ims/oneroster/rostering/v1p2/classes/:id",
    alias: "deleteImsOnerosterRosteringV1p2ClassesById",
    description: `Delete a class record`,
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
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/classes/:id/students",
    alias: "getImsOnerosterRosteringV1p2ClassesByIdStudents",
    description: `Returns all students enrolled in a specific class`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
        users: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              username: z.string(),
              enabledUser: z.boolean(),
              givenName: z.string(),
              familyName: z.string(),
              middleName: z.union([z.string(), z.null()]).optional(),
              identifier: z.union([z.string(), z.null()]).optional(),
              email: z.union([z.string(), z.null()]).optional(),
              sms: z.union([z.string(), z.null()]).optional(),
              phone: z.union([z.string(), z.null()]).optional(),
              agents: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
              grades: z.array(z.string()).optional(),
              orgs: z.array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              ),
              role: z.enum([
                "student",
                "teacher",
                "aide",
                "administrator",
                "guardian",
                "parent",
                "relative",
                "proctor",
              ]),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Class not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/classes/:id/teachers",
    alias: "getImsOnerosterRosteringV1p2ClassesByIdTeachers",
    description: `Returns all teachers assigned to a specific class`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
        users: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              username: z.string(),
              enabledUser: z.boolean(),
              givenName: z.string(),
              familyName: z.string(),
              middleName: z.union([z.string(), z.null()]).optional(),
              identifier: z.union([z.string(), z.null()]).optional(),
              email: z.union([z.string(), z.null()]).optional(),
              sms: z.union([z.string(), z.null()]).optional(),
              phone: z.union([z.string(), z.null()]).optional(),
              agents: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
              grades: z.array(z.string()).optional(),
              orgs: z.array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              ),
              role: z.enum([
                "student",
                "teacher",
                "aide",
                "administrator",
                "guardian",
                "parent",
                "relative",
                "proctor",
              ]),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Class not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/enrollments",
    alias: "getImsOnerosterRosteringV1p2Enrollments",
    description: `Returns a collection of enrollment objects representing the association between users and classes`,
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
        enrollments: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              user: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              class: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              school: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              role: z.enum(["student", "teacher", "aide", "administrator"]),
              primary: z.boolean().optional(),
              beginDate: z.union([z.string(), z.null()]).optional(),
              endDate: z.union([z.string(), z.null()]).optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "post",
    path: "/ims/oneroster/rostering/v1p2/enrollments",
    alias: "postImsOnerosterRosteringV1p2Enrollments",
    description: `Create a new enrollment record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterRosteringV1p2Enrollments_Body,
      },
    ],
    response: z
      .object({
        enrollment: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            user: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            class: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            school: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            role: z.enum(["student", "teacher", "aide", "administrator"]),
            primary: z.boolean().optional(),
            beginDate: z.union([z.string(), z.null()]).optional(),
            endDate: z.union([z.string(), z.null()]).optional(),
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
    path: "/ims/oneroster/rostering/v1p2/enrollments/:id",
    alias: "getImsOnerosterRosteringV1p2EnrollmentsById",
    description: `Returns a specific enrollment object`,
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
        enrollment: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            user: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            class: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            school: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            role: z.enum(["student", "teacher", "aide", "administrator"]),
            primary: z.boolean().optional(),
            beginDate: z.union([z.string(), z.null()]).optional(),
            endDate: z.union([z.string(), z.null()]).optional(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Enrollment not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "put",
    path: "/ims/oneroster/rostering/v1p2/enrollments/:id",
    alias: "putImsOnerosterRosteringV1p2EnrollmentsById",
    description: `Update an existing enrollment record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsOnerosterRosteringV1p2EnrollmentsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        enrollment: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            user: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            class: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            school: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            role: z.enum(["student", "teacher", "aide", "administrator"]),
            primary: z.boolean().optional(),
            beginDate: z.union([z.string(), z.null()]).optional(),
            endDate: z.union([z.string(), z.null()]).optional(),
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
    method: "delete",
    path: "/ims/oneroster/rostering/v1p2/enrollments/:id",
    alias: "deleteImsOnerosterRosteringV1p2EnrollmentsById",
    description: `Delete an enrollment record`,
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
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/academicSessions",
    alias: "getImsOnerosterRosteringV1p2AcademicSessions",
    description: `Returns a collection of academic session objects (terms, grading periods, etc.)`,
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
        academicSessions: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              startDate: z.string(),
              endDate: z.string(),
              type: z.enum(["gradingPeriod", "semester", "schoolYear", "term"]),
              schoolYear: z.number(),
              parent: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict()
                .optional(),
              children: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "post",
    path: "/ims/oneroster/rostering/v1p2/academicSessions",
    alias: "postImsOnerosterRosteringV1p2AcademicSessions",
    description: `Create a new academic session record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterRosteringV1p2AcademicSessions_Body,
      },
    ],
    response: z
      .object({
        academicSession: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            type: z.enum(["gradingPeriod", "semester", "schoolYear", "term"]),
            schoolYear: z.number(),
            parent: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict()
              .optional(),
            children: z
              .array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              )
              .optional(),
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
    path: "/ims/oneroster/rostering/v1p2/academicSessions/:id",
    alias: "getImsOnerosterRosteringV1p2AcademicSessionsById",
    description: `Returns a specific academic session object`,
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
        academicSession: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            type: z.enum(["gradingPeriod", "semester", "schoolYear", "term"]),
            schoolYear: z.number(),
            parent: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict()
              .optional(),
            children: z
              .array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              )
              .optional(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Academic session not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "put",
    path: "/ims/oneroster/rostering/v1p2/academicSessions/:id",
    alias: "putImsOnerosterRosteringV1p2AcademicSessionsById",
    description: `Update an existing academic session record`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsOnerosterRosteringV1p2AcademicSessionsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        academicSession: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            type: z.enum(["gradingPeriod", "semester", "schoolYear", "term"]),
            schoolYear: z.number(),
            parent: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict()
              .optional(),
            children: z
              .array(
                z
                  .object({
                    href: z.string(),
                    sourcedId: z.string(),
                    type: z.string(),
                  })
                  .strict(),
              )
              .optional(),
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
    method: "delete",
    path: "/ims/oneroster/rostering/v1p2/academicSessions/:id",
    alias: "deleteImsOnerosterRosteringV1p2AcademicSessionsById",
    description: `Delete an academic session record`,
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
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/terms",
    alias: "getImsOnerosterRosteringV1p2Terms",
    description: `Returns a collection of term objects (academic sessions with type&#x3D;&#x27;term&#x27;)`,
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
        terms: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              startDate: z.string(),
              endDate: z.string(),
              type: z.enum(["gradingPeriod", "semester", "schoolYear", "term"]),
              schoolYear: z.number(),
              parent: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict()
                .optional(),
              children: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/terms/:id/classes",
    alias: "getImsOnerosterRosteringV1p2TermsByIdClasses",
    description: `Returns all classes associated with a specific academic term`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
        classes: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              classCode: z.union([z.string(), z.null()]).optional(),
              classType: z.enum(["homeroom", "scheduled"]),
              location: z.union([z.string(), z.null()]).optional(),
              grades: z.array(z.string()).optional(),
              subjects: z.array(z.string()).optional(),
              course: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              school: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              terms: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
              subjectCodes: z.array(z.string()).optional(),
              periods: z.array(z.string()).optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Term not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/terms/:id/gradingPeriods",
    alias: "getImsOnerosterRosteringV1p2TermsByIdGradingPeriods",
    description: `Returns all grading periods that are children of a specific term`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
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
    response: z.object({ academicSessions: z.array(z.unknown()) }).strict(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Term not found`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/rostering/v1p2/gradingPeriods",
    alias: "getImsOnerosterRosteringV1p2GradingPeriods",
    description: `Returns a collection of grading period objects (academic sessions with type&#x3D;&#x27;gradingPeriod&#x27;)`,
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
        gradingPeriods: z.array(
          z
            .object({
              sourcedId: z.string(),
              status: z.enum(["active", "tobedeleted"]),
              dateLastModified: z.string(),
              metadata: z
                .object({})
                .partial()
                .strict()
                .passthrough()
                .optional(),
              title: z.string(),
              startDate: z.string(),
              endDate: z.string(),
              type: z.enum(["gradingPeriod", "semester", "schoolYear", "term"]),
              schoolYear: z.number(),
              parent: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict()
                .optional(),
              children: z
                .array(
                  z
                    .object({
                      href: z.string(),
                      sourcedId: z.string(),
                      type: z.string(),
                    })
                    .strict(),
                )
                .optional(),
            })
            .strict(),
        ),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z
          .object({
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict(),
            ),
          })
          .strict(),
      },
    ],
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const OneRoster_v1_2___RosteringApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
