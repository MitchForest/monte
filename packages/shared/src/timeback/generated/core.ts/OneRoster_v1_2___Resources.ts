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
    path: "/ims/oneroster/resources/v1p2/resources",
    alias: "getImsOnerosterResourcesV1p2Resources",
    description: `Returns a collection of resource objects representing educational materials`,
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
        resources: z.array(
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
              vendorResourceId: z.union([z.string(), z.null()]).optional(),
              vendorId: z.union([z.string(), z.null()]).optional(),
              title: z.string(),
              description: z.union([z.string(), z.null()]).optional(),
              roles: z.array(z.string()).optional(),
              importance: z
                .union([
                  z.enum(["primary", "secondary", "supplemental"]),
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
    path: "/ims/oneroster/resources/v1p2/resources/:id",
    alias: "getImsOnerosterResourcesV1p2ResourcesById",
    description: `Returns a specific resource object`,
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
        resource: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            vendorResourceId: z.union([z.string(), z.null()]).optional(),
            vendorId: z.union([z.string(), z.null()]).optional(),
            title: z.string(),
            description: z.union([z.string(), z.null()]).optional(),
            roles: z.array(z.string()).optional(),
            importance: z
              .union([
                z.enum(["primary", "secondary", "supplemental"]),
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
        description: `Resource not found`,
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
    path: "/ims/oneroster/resources/v1p2/resources/courses/:courseId/resources",
    alias: "getImsOnerosterResourcesV1p2ResourcesCoursesByCourseIdResources",
    description: `Returns all resources associated with a specific course`,
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
      {
        name: "courseId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resources: z.array(
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
              vendorResourceId: z.union([z.string(), z.null()]).optional(),
              vendorId: z.union([z.string(), z.null()]).optional(),
              title: z.string(),
              description: z.union([z.string(), z.null()]).optional(),
              roles: z.array(z.string()).optional(),
              importance: z
                .union([
                  z.enum(["primary", "secondary", "supplemental"]),
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
    path: "/ims/oneroster/resources/v1p2/resources/classes/:classId/resources",
    alias: "getImsOnerosterResourcesV1p2ResourcesClassesByClassIdResources",
    description: `Returns all resources associated with a specific class`,
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
      {
        name: "classId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resources: z.array(
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
              vendorResourceId: z.union([z.string(), z.null()]).optional(),
              vendorId: z.union([z.string(), z.null()]).optional(),
              title: z.string(),
              description: z.union([z.string(), z.null()]).optional(),
              roles: z.array(z.string()).optional(),
              importance: z
                .union([
                  z.enum(["primary", "secondary", "supplemental"]),
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
    path: "/ims/oneroster/resources/v1p2/courses/:courseId/resources",
    alias: "getImsOnerosterResourcesV1p2CoursesByCourseIdResources",
    description: `Returns a collection of resource objects representing educational materials`,
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
      {
        name: "courseId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resources: z.array(
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
              vendorResourceId: z.union([z.string(), z.null()]).optional(),
              vendorId: z.union([z.string(), z.null()]).optional(),
              title: z.string(),
              description: z.union([z.string(), z.null()]).optional(),
              roles: z.array(z.string()).optional(),
              importance: z
                .union([
                  z.enum(["primary", "secondary", "supplemental"]),
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
    path: "/ims/oneroster/resources/v1p2/courses/:courseId/resources/:id",
    alias: "getImsOnerosterResourcesV1p2CoursesByCourseIdResourcesById",
    description: `Returns a specific resource object`,
    requestFormat: "json",
    parameters: [
      {
        name: "courseId",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resource: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            vendorResourceId: z.union([z.string(), z.null()]).optional(),
            vendorId: z.union([z.string(), z.null()]).optional(),
            title: z.string(),
            description: z.union([z.string(), z.null()]).optional(),
            roles: z.array(z.string()).optional(),
            importance: z
              .union([
                z.enum(["primary", "secondary", "supplemental"]),
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
        description: `Resource not found`,
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
    path: "/ims/oneroster/resources/v1p2/courses/:courseId/resources/courses/:courseId/resources",
    alias:
      "getImsOnerosterResourcesV1p2CoursesByCourseIdResourcesCoursesByCourseIdResources",
    description: `Returns all resources associated with a specific course`,
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
      {
        name: "courseId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resources: z.array(
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
              vendorResourceId: z.union([z.string(), z.null()]).optional(),
              vendorId: z.union([z.string(), z.null()]).optional(),
              title: z.string(),
              description: z.union([z.string(), z.null()]).optional(),
              roles: z.array(z.string()).optional(),
              importance: z
                .union([
                  z.enum(["primary", "secondary", "supplemental"]),
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
    path: "/ims/oneroster/resources/v1p2/courses/:courseId/resources/classes/:classId/resources",
    alias:
      "getImsOnerosterResourcesV1p2CoursesByCourseIdResourcesClassesByClassIdResources",
    description: `Returns all resources associated with a specific class`,
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
      {
        name: "courseId",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "classId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resources: z.array(
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
              vendorResourceId: z.union([z.string(), z.null()]).optional(),
              vendorId: z.union([z.string(), z.null()]).optional(),
              title: z.string(),
              description: z.union([z.string(), z.null()]).optional(),
              roles: z.array(z.string()).optional(),
              importance: z
                .union([
                  z.enum(["primary", "secondary", "supplemental"]),
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
    path: "/ims/oneroster/resources/v1p2/classes/:classId/resources",
    alias: "getImsOnerosterResourcesV1p2ClassesByClassIdResources",
    description: `Returns a collection of resource objects representing educational materials`,
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
      {
        name: "classId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resources: z.array(
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
              vendorResourceId: z.union([z.string(), z.null()]).optional(),
              vendorId: z.union([z.string(), z.null()]).optional(),
              title: z.string(),
              description: z.union([z.string(), z.null()]).optional(),
              roles: z.array(z.string()).optional(),
              importance: z
                .union([
                  z.enum(["primary", "secondary", "supplemental"]),
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
    path: "/ims/oneroster/resources/v1p2/classes/:classId/resources/:id",
    alias: "getImsOnerosterResourcesV1p2ClassesByClassIdResourcesById",
    description: `Returns a specific resource object`,
    requestFormat: "json",
    parameters: [
      {
        name: "classId",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resource: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            vendorResourceId: z.union([z.string(), z.null()]).optional(),
            vendorId: z.union([z.string(), z.null()]).optional(),
            title: z.string(),
            description: z.union([z.string(), z.null()]).optional(),
            roles: z.array(z.string()).optional(),
            importance: z
              .union([
                z.enum(["primary", "secondary", "supplemental"]),
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
        description: `Resource not found`,
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
    path: "/ims/oneroster/resources/v1p2/classes/:classId/resources/courses/:courseId/resources",
    alias:
      "getImsOnerosterResourcesV1p2ClassesByClassIdResourcesCoursesByCourseIdResources",
    description: `Returns all resources associated with a specific course`,
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
      {
        name: "classId",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "courseId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resources: z.array(
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
              vendorResourceId: z.union([z.string(), z.null()]).optional(),
              vendorId: z.union([z.string(), z.null()]).optional(),
              title: z.string(),
              description: z.union([z.string(), z.null()]).optional(),
              roles: z.array(z.string()).optional(),
              importance: z
                .union([
                  z.enum(["primary", "secondary", "supplemental"]),
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
    path: "/ims/oneroster/resources/v1p2/classes/:classId/resources/classes/:classId/resources",
    alias:
      "getImsOnerosterResourcesV1p2ClassesByClassIdResourcesClassesByClassIdResources",
    description: `Returns all resources associated with a specific class`,
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
      {
        name: "classId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        resources: z.array(
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
              vendorResourceId: z.union([z.string(), z.null()]).optional(),
              vendorId: z.union([z.string(), z.null()]).optional(),
              title: z.string(),
              description: z.union([z.string(), z.null()]).optional(),
              roles: z.array(z.string()).optional(),
              importance: z
                .union([
                  z.enum(["primary", "secondary", "supplemental"]),
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
]);

export type EndpointDefinitions = typeof endpoints;

export const OneRoster_v1_2___ResourcesApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
