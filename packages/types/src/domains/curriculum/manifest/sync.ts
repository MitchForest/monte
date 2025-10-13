import { z } from 'zod';

export const CurriculumSyncSummarySchema = z
  .object({
    manifestHash: z.string(),
    manifestGeneratedAt: z.string(),
    manifestCommit: z.string().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
    units: z
      .object({
        created: z.number(),
        updated: z.number(),
        deleted: z.number(),
      })
      .strict(),
    topics: z
      .object({
        created: z.number(),
        updated: z.number(),
        deleted: z.number(),
      })
      .strict(),
    lessons: z
      .object({
        created: z.number(),
        updated: z.number(),
        deleted: z.number(),
      })
      .strict(),
  })
  .strict();
export type CurriculumSyncSummary = z.infer<typeof CurriculumSyncSummarySchema>;
