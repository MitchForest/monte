import { z } from 'zod';

import { IdSchema } from '../../../shared/index.js';
import { LessonDocumentSchema } from './document.js';
import { EntityMetadataSchema } from './primitives.js';
import {
  LessonAuthoringStatusSchema,
  LessonGradeLevelSchema,
  LessonStatusSchema,
} from './authoring.js';

export const LessonDraftRecordSchema = z
  .object({
    _id: IdSchema<'lessons'>(),
    draft: LessonDocumentSchema,
    published: LessonDocumentSchema.optional(),
    topicId: IdSchema<'topics'>(),
    slug: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    order: z.number(),
    status: LessonStatusSchema,
    createdAt: z.number(),
    updatedAt: z.number(),
    metadata: EntityMetadataSchema.optional(),
    authoringStatus: LessonAuthoringStatusSchema.optional(),
    assigneeId: z.string().optional(),
    authoringNotes: z.string().optional(),
    gradeLevels: z.array(LessonGradeLevelSchema).optional(),
    manifestHash: z.string().optional(),
    manifestGeneratedAt: z.string().optional(),
    manifestCommit: z.string().optional(),
  })
  .strict();
export type LessonDraftRecord = z.infer<typeof LessonDraftRecordSchema>;
