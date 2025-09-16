import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsOnerosterGradebookV1p2AssessmentLineItems_Body = z
  .object({
    assessmentLineItem: z
      .object({
        title: z.string(),
        description: z.string().optional(),
        assignDate: z
          .string()
          .regex(
            /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/
          )
          .datetime({ offset: true })
          .optional(),
        dueDate: z
          .string()
          .regex(
            /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/
          )
          .datetime({ offset: true })
          .optional(),
        class: z
          .object({ href: z.string(), sourcedId: z.string(), type: z.string() })
          .strict(),
        category: z
          .object({ href: z.string(), sourcedId: z.string(), type: z.string() })
          .strict()
          .optional(),
        resultValueMin: z.number().gte(0).default(0),
        resultValueMax: z.number().gte(0).default(100),
        status: z.enum(["active", "tobedeleted"]).optional(),
        metadata: z.object({}).partial().strict().passthrough().optional(),
      })
      .strict(),
  })
  .strict();
const putImsOnerosterGradebookV1p2AssessmentLineItemsById_Body = z
  .object({
    assessmentLineItem: z
      .object({
        title: z.string(),
        description: z.string(),
        assignDate: z
          .string()
          .regex(
            /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/
          )
          .datetime({ offset: true }),
        dueDate: z
          .string()
          .regex(
            /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/
          )
          .datetime({ offset: true }),
        category: z
          .object({ href: z.string(), sourcedId: z.string(), type: z.string() })
          .strict(),
        resultValueMin: z.number().gte(0),
        resultValueMax: z.number().gte(0),
        status: z.enum(["active", "tobedeleted"]),
        metadata: z.object({}).partial().strict().passthrough(),
      })
      .partial()
      .strict(),
  })
  .strict();
const postImsOnerosterGradebookV1p2AssessmentResults_Body = z
  .object({
    assessmentResult: z
      .object({
        lineItem: z
          .object({ href: z.string(), sourcedId: z.string(), type: z.string() })
          .strict(),
        student: z
          .object({ href: z.string(), sourcedId: z.string(), type: z.string() })
          .strict(),
        scoreStatus: z.enum([
          "fully graded",
          "partially graded",
          "pending",
          "exempt",
        ]),
        score: z.number().gte(0).optional(),
        scoreDate: z
          .string()
          .regex(
            /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/
          )
          .datetime({ offset: true })
          .optional(),
        comment: z.string().optional(),
        status: z.enum(["active", "tobedeleted"]).optional(),
        metadata: z.object({}).partial().strict().passthrough().optional(),
      })
      .strict(),
  })
  .strict();
const putImsOnerosterGradebookV1p2AssessmentResultsById_Body = z
  .object({
    assessmentResult: z
      .object({
        scoreStatus: z.enum([
          "fully graded",
          "partially graded",
          "pending",
          "exempt",
        ]),
        score: z.number().gte(0),
        scoreDate: z
          .string()
          .regex(
            /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z))$/
          )
          .datetime({ offset: true }),
        comment: z.string(),
        status: z.enum(["active", "tobedeleted"]),
        metadata: z.object({}).partial().strict().passthrough(),
      })
      .partial()
      .strict(),
  })
  .strict();

export const schemas = {
  postImsOnerosterGradebookV1p2AssessmentLineItems_Body,
  putImsOnerosterGradebookV1p2AssessmentLineItemsById_Body,
  postImsOnerosterGradebookV1p2AssessmentResults_Body,
  putImsOnerosterGradebookV1p2AssessmentResultsById_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/categories",
    alias: "getImsOnerosterGradebookV1p2Categories",
    description: `Returns a collection of category objects used to organize gradebook line items`,
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
        categories: z.array(
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict()
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/categories/:id",
    alias: "getImsOnerosterGradebookV1p2CategoriesById",
    description: `Returns a specific category object`,
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
        category: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
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
                .strict()
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Category not found`,
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/assessmentLineItems",
    alias: "getImsOnerosterGradebookV1p2AssessmentLineItems",
    description: `Returns a collection of line item objects representing gradebook columns (assignments, tests, etc.)`,
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
        assessmentLineItems: z.array(
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
              description: z.union([z.string(), z.null()]).optional(),
              assignDate: z.union([z.string(), z.null()]).optional(),
              dueDate: z.union([z.string(), z.null()]).optional(),
              class: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              category: z
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
              resultValueMin: z.number(),
              resultValueMax: z.number(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict()
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "post",
    path: "/ims/oneroster/gradebook/v1p2/assessmentLineItems",
    alias: "postImsOnerosterGradebookV1p2AssessmentLineItems",
    description: `Creates a new line item (assignment, test, quiz, etc.) in the gradebook`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterGradebookV1p2AssessmentLineItems_Body,
      },
    ],
    response: z
      .object({
        assessmentLineItem: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            description: z.union([z.string(), z.null()]).optional(),
            assignDate: z.union([z.string(), z.null()]).optional(),
            dueDate: z.union([z.string(), z.null()]).optional(),
            class: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            category: z
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
            resultValueMin: z.number(),
            resultValueMax: z.number(),
          })
          .strict(),
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
                .strict()
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/assessmentLineItems/:id",
    alias: "getImsOnerosterGradebookV1p2AssessmentLineItemsById",
    description: `Returns a specific line item object`,
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
        assessmentLineItem: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            description: z.union([z.string(), z.null()]).optional(),
            assignDate: z.union([z.string(), z.null()]).optional(),
            dueDate: z.union([z.string(), z.null()]).optional(),
            class: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            category: z
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
            resultValueMin: z.number(),
            resultValueMax: z.number(),
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
                .strict()
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Line item not found`,
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "put",
    path: "/ims/oneroster/gradebook/v1p2/assessmentLineItems/:id",
    alias: "putImsOnerosterGradebookV1p2AssessmentLineItemsById",
    description: `Update an existing line item. Supports partial updates.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsOnerosterGradebookV1p2AssessmentLineItemsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        assessmentLineItem: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            title: z.string(),
            description: z.union([z.string(), z.null()]).optional(),
            assignDate: z.union([z.string(), z.null()]).optional(),
            dueDate: z.union([z.string(), z.null()]).optional(),
            class: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            category: z
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
            resultValueMin: z.number(),
            resultValueMax: z.number(),
          })
          .strict(),
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Line item not found`,
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "delete",
    path: "/ims/oneroster/gradebook/v1p2/assessmentLineItems/:id",
    alias: "deleteImsOnerosterGradebookV1p2AssessmentLineItemsById",
    description: `Soft deletes a line item by setting status to &#x27;tobedeleted&#x27;`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ message: z.string() }).strict(),
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
                .strict()
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Line item not found`,
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/assessmentLineItems/classes/:classId/assessmentLineItems",
    alias:
      "getImsOnerosterGradebookV1p2AssessmentLineItemsClassesByClassIdAssessmentLineItems",
    description: `Returns all line items associated with a specific class`,
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
        assessmentLineItems: z.array(
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
              description: z.union([z.string(), z.null()]).optional(),
              assignDate: z.union([z.string(), z.null()]).optional(),
              dueDate: z.union([z.string(), z.null()]).optional(),
              class: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              category: z
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
              resultValueMin: z.number(),
              resultValueMax: z.number(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict()
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/assessmentResults",
    alias: "getImsOnerosterGradebookV1p2AssessmentResults",
    description: `Returns a collection of result objects representing student scores on assignments`,
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
        assessmentResults: z.array(
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
              lineItem: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              student: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              scoreStatus: z.enum([
                "fully graded",
                "partially graded",
                "pending",
                "exempt",
              ]),
              score: z.union([z.number(), z.null()]).optional(),
              scoreDate: z.union([z.string(), z.null()]).optional(),
              comment: z.union([z.string(), z.null()]).optional(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict()
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "post",
    path: "/ims/oneroster/gradebook/v1p2/assessmentResults",
    alias: "postImsOnerosterGradebookV1p2AssessmentResults",
    description: `Creates a new result for a student on a line item (grade passback)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsOnerosterGradebookV1p2AssessmentResults_Body,
      },
    ],
    response: z
      .object({
        assessmentResult: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            lineItem: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            student: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            scoreStatus: z.enum([
              "fully graded",
              "partially graded",
              "pending",
              "exempt",
            ]),
            score: z.union([z.number(), z.null()]).optional(),
            scoreDate: z.union([z.string(), z.null()]).optional(),
            comment: z.union([z.string(), z.null()]).optional(),
          })
          .strict(),
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
                .strict()
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/assessmentResults/:id",
    alias: "getImsOnerosterGradebookV1p2AssessmentResultsById",
    description: `Returns a specific result object`,
    requestFormat: "json",
    parameters: [
      {
        name: "fields",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        assessmentResult: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            lineItem: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            student: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            scoreStatus: z.enum([
              "fully graded",
              "partially graded",
              "pending",
              "exempt",
            ]),
            score: z.union([z.number(), z.null()]).optional(),
            scoreDate: z.union([z.string(), z.null()]).optional(),
            comment: z.union([z.string(), z.null()]).optional(),
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
                .strict()
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Result not found`,
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "put",
    path: "/ims/oneroster/gradebook/v1p2/assessmentResults/:id",
    alias: "putImsOnerosterGradebookV1p2AssessmentResultsById",
    description: `Update an existing student result/grade. Supports partial updates of score, status, and metadata.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putImsOnerosterGradebookV1p2AssessmentResultsById_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        assessmentResult: z
          .object({
            sourcedId: z.string(),
            status: z.enum(["active", "tobedeleted"]),
            dateLastModified: z.string(),
            metadata: z.object({}).partial().strict().passthrough().optional(),
            lineItem: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            student: z
              .object({
                href: z.string(),
                sourcedId: z.string(),
                type: z.string(),
              })
              .strict(),
            scoreStatus: z.enum([
              "fully graded",
              "partially graded",
              "pending",
              "exempt",
            ]),
            score: z.union([z.number(), z.null()]).optional(),
            scoreDate: z.union([z.string(), z.null()]).optional(),
            comment: z.union([z.string(), z.null()]).optional(),
          })
          .strict(),
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Result not found`,
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "delete",
    path: "/ims/oneroster/gradebook/v1p2/assessmentResults/:id",
    alias: "deleteImsOnerosterGradebookV1p2AssessmentResultsById",
    description: `Soft deletes a result by setting status to &#x27;tobedeleted&#x27;`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ message: z.string() }).strict(),
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
                .strict()
            ),
          })
          .strict(),
      },
      {
        status: 404,
        description: `Result not found`,
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/assessmentResults/classes/:classId/assessmentResults",
    alias:
      "getImsOnerosterGradebookV1p2AssessmentResultsClassesByClassIdAssessmentResults",
    description: `Returns all results for line items associated with a specific class`,
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
        assessmentResults: z.array(
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
              lineItem: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              student: z
                .object({
                  href: z.string(),
                  sourcedId: z.string(),
                  type: z.string(),
                })
                .strict(),
              scoreStatus: z.enum([
                "fully graded",
                "partially graded",
                "pending",
                "exempt",
              ]),
              score: z.union([z.number(), z.null()]).optional(),
              scoreDate: z.union([z.string(), z.null()]).optional(),
              comment: z.union([z.string(), z.null()]).optional(),
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
            statusInfoSet: z.array(
              z
                .object({
                  codeMajor: z.enum(["success", "failure", "unsupported"]),
                  severity: z.enum(["status", "error", "warning"]),
                  codeMinor: z.string(),
                  description: z.string(),
                })
                .strict()
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/classes/:classId/assessmentLineItems",
    alias: "getImsOnerosterGradebookV1p2ClassesByClassIdAssessmentLineItems",
    description: `Returns all line items associated with a specific class`,
    requestFormat: "json",
    parameters: [
      {
        name: "classId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ assessmentLineItems: z.array(z.unknown()) }).strict(),
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
                .strict()
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
  {
    method: "get",
    path: "/ims/oneroster/gradebook/v1p2/classes/:classId/assessmentResults",
    alias: "getImsOnerosterGradebookV1p2ClassesByClassIdAssessmentResults",
    description: `Returns all results associated with a specific class`,
    requestFormat: "json",
    parameters: [
      {
        name: "classId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ assessmentResults: z.array(z.unknown()) }).strict(),
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
                .strict()
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
                .strict()
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
                .strict()
            ),
          })
          .strict(),
      },
    ],
  },
]);

export type EndpointDefinitions = typeof endpoints;

export const OneRoster_v1_2___GradebookApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
