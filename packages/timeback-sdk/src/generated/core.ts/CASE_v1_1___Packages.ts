import {
  makeApi,
  Zodios,
  type ZodiosEndpointDefinitions,
  type ZodiosOptions,
} from "@zodios/core";
import { z } from "zod";

const postImsCaseV1p1CFPackages_Body = z
  .object({
    CFDocument: z
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
          extensions: z.object({}).partial().strict().passthrough().optional(),
        })
        .strict()
    ),
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
          extensions: z.object({}).partial().strict().passthrough().optional(),
        })
        .strict()
    ),
    CFDefinitions: z
      .object({
        CFSubjects: z.array(
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
              hierarchyCode: z.string().optional(),
              description: z.string().optional(),
            })
            .strict()
        ),
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
        CFItemTypes: z.array(
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
              description: z.string().optional(),
              hierarchyCode: z.string().optional(),
              typeCode: z.string().optional(),
            })
            .strict()
        ),
        CFLicenses: z.array(
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
              description: z.string().optional(),
              licenseText: z.string(),
            })
            .strict()
        ),
        CFAssociationGroupings: z.array(
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
              description: z.string().optional(),
            })
            .strict()
        ),
      })
      .partial()
      .strict()
      .optional(),
    CFRubrics: z
      .array(
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
            description: z.string().optional(),
            CFRubricCriteria: z
              .array(
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
                    category: z.string().optional(),
                    description: z.string().optional(),
                    CFItemURI: z
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
                    weight: z.number().optional(),
                    position: z.number().optional(),
                    CFRubricCriterionLevels: z
                      .array(
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
                            description: z.string().optional(),
                            quality: z.string().optional(),
                            score: z.number().optional(),
                            feedback: z.string().optional(),
                            position: z.number().optional(),
                          })
                          .strict()
                      )
                      .optional(),
                  })
                  .strict()
              )
              .optional(),
          })
          .strict()
      )
      .optional(),
  })
  .strict();

export const schemas = {
  postImsCaseV1p1CFPackages_Body,
};

export const endpoints = makeApi([
  {
    method: "get",
    path: "/ims/case/v1p1/CFPackages/:sourcedId",
    alias: "getImsCaseV1p1CFPackagesBySourcedId",
    description: `Retrieve a complete competency framework package containing the document, all items, associations, definitions, and rubrics`,
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
        CFDocument: z
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
          .strict(),
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
        CFDefinitions: z
          .object({
            CFSubjects: z.array(
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
                  hierarchyCode: z.string().optional(),
                  description: z.string().optional(),
                })
                .strict()
            ),
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
            CFItemTypes: z.array(
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
                  description: z.string().optional(),
                  hierarchyCode: z.string().optional(),
                  typeCode: z.string().optional(),
                })
                .strict()
            ),
            CFLicenses: z.array(
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
                  description: z.string().optional(),
                  licenseText: z.string(),
                })
                .strict()
            ),
            CFAssociationGroupings: z.array(
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
                  description: z.string().optional(),
                })
                .strict()
            ),
          })
          .partial()
          .strict()
          .optional(),
        CFRubrics: z
          .array(
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
                description: z.string().optional(),
                CFRubricCriteria: z
                  .array(
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
                        category: z.string().optional(),
                        description: z.string().optional(),
                        CFItemURI: z
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
                        weight: z.number().optional(),
                        position: z.number().optional(),
                        CFRubricCriterionLevels: z
                          .array(
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
                                description: z.string().optional(),
                                quality: z.string().optional(),
                                score: z.number().optional(),
                                feedback: z.string().optional(),
                                position: z.number().optional(),
                              })
                              .strict()
                          )
                          .optional(),
                      })
                      .strict()
                  )
                  .optional(),
              })
              .strict()
          )
          .optional(),
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
        description: `Package not found`,
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
    method: "post",
    path: "/ims/case/v1p1/CFPackages",
    alias: "postImsCaseV1p1CFPackages",
    description: `Upload a complete CASE package with document, items, and associations for data ingestion`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postImsCaseV1p1CFPackages_Body,
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        message: z.string(),
        result: z
          .object({
            documentId: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            stats: z
              .object({
                documents: z.number(),
                items: z.number(),
                associations: z.number(),
              })
              .strict(),
            success: z.boolean(),
          })
          .strict(),
      })
      .strict(),
    errors: [
      {
        status: 400,
        description: `Bad request - invalid package structure`,
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
        status: 422,
        description: `Unprocessable entity - validation errors`,
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
    path: "/ims/case/v1p1/CFPackages/:sourcedId/groups",
    alias: "getImsCaseV1p1CFPackagesBySourcedIdGroups",
    description: `Retrieve a complete competency framework with hierarchical organization by CFItemType for UI-friendly display`,
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
        CFPackageWithGroups: z
          .object({
            sourcedId: z
              .string()
              .regex(
                /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
              )
              .uuid(),
            CFDocument: z
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
              .strict(),
            structuredContent: z.record(z.array(z.unknown())),
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
        description: `Package not found`,
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

export const CASE_v1_1___PackagesApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}

export function getEndpoint(alias: string) {
  return endpoints.find((endpoint) => endpoint.alias === alias) as
    | ZodiosEndpointDefinitions[number]
    | undefined;
}
