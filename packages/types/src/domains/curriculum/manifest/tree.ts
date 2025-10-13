import { z } from 'zod';

import { IdSchema } from '../../../shared/index.js';
import {
  EntityMetadataSchema,
} from '../lesson/primitives.js';
import {
  LessonAuthoringStatusSchema,
  LessonGradeLevelSchema,
  LessonStatusSchema,
} from '../lesson/authoring.js';

export const CurriculumTreeLessonSchema = z
  .object({
    _id: IdSchema<'lessons'>(),
    slug: z.string(),
    order: z.number(),
    status: LessonStatusSchema,
    title: z.string(),
    summary: z.string(),
    updatedAt: z.number(),
    authoringStatus: LessonAuthoringStatusSchema.optional(),
    assigneeId: z.string().optional(),
    gradeLevels: z.array(LessonGradeLevelSchema).optional(),
  })
  .strict();
export type CurriculumTreeLesson = z.infer<typeof CurriculumTreeLessonSchema>;

export const TopicStatusSchema = z.enum(['active', 'archived']);
export type TopicStatus = z.infer<typeof TopicStatusSchema>;

export const UnitStatusSchema = TopicStatusSchema;
export type UnitStatus = TopicStatus;

export const CurriculumTreeTopicSchema = z
  .object({
    _id: IdSchema<'topics'>(),
    unitId: IdSchema<'units'>(),
    slug: z.string(),
    title: z.string(),
    overview: z.string().optional(),
    focusSkills: z.array(z.string()),
    estimatedDurationMinutes: z.number().optional(),
    order: z.number(),
    status: TopicStatusSchema,
    lessons: z.array(CurriculumTreeLessonSchema),
  })
  .strict();
export type CurriculumTreeTopic = z.infer<typeof CurriculumTreeTopicSchema>;

export const CurriculumTreeUnitSchema = z
  .object({
    _id: IdSchema<'units'>(),
    slug: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    coverImage: z.string().optional(),
    order: z.number(),
    status: UnitStatusSchema,
    metadata: EntityMetadataSchema.optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
    topics: z.array(CurriculumTreeTopicSchema),
  })
  .strict();
export type CurriculumTreeUnit = z.infer<typeof CurriculumTreeUnitSchema>;

export const CurriculumTreeSchema = z.array(CurriculumTreeUnitSchema);
export type CurriculumTree = z.infer<typeof CurriculumTreeSchema>;
