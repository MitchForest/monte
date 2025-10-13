import { z } from 'zod';

import { LessonMaterialInventorySchema, MaterialUsageSchema } from './inventory.js';
import { LessonSegmentSchema } from './segments.js';
import {
  EntityMetadataSchema,
  LessonScenarioBindingSchema,
} from './primitives.js';

export const LessonSchema = z
  .object({
    id: z.string(),
    topicId: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    focusSkills: z.array(z.string()).optional(),
    estimatedDurationMinutes: z.number(),
    primaryMaterialId: z.string(),
    segments: z.array(LessonSegmentSchema),
    materials: z.array(MaterialUsageSchema),
    materialInventory: LessonMaterialInventorySchema.optional(),
  })
  .strict();
export type Lesson = z.infer<typeof LessonSchema>;

export const LessonDocumentMetaSchema = z
  .object({
    createdAt: z.union([z.string(), z.number()]).optional(),
    updatedAt: z.union([z.string(), z.number()]).optional(),
    author: z.string().optional(),
    notes: z.string().optional(),
    metadata: EntityMetadataSchema.optional(),
    scenario: LessonScenarioBindingSchema.optional(),
  })
  .strict();
export type LessonDocumentMeta = z.infer<typeof LessonDocumentMetaSchema>;

export const LessonDocumentSchema = z
  .object({
    version: z.literal('1.0'),
    lesson: LessonSchema,
    meta: LessonDocumentMetaSchema.optional(),
  })
  .strict();
export type LessonDocument = z.infer<typeof LessonDocumentSchema>;

export const TopicSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    overview: z.string(),
    focusSkills: z.array(z.string()),
    estimatedDurationMinutes: z.number(),
    lessons: z.array(LessonSchema),
  })
  .strict();
export type Topic = z.infer<typeof TopicSchema>;

export const TaskCategorySchema = z.enum([
  'tutorial',
  'guided-practice',
  'practice-question',
  'independent-question',
]);
export type TaskCategory = z.infer<typeof TaskCategorySchema>;

export const LessonTaskSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    category: TaskCategorySchema,
    segmentId: z.string(),
    stepId: z.string().optional(),
    questionId: z.string().optional(),
    order: z.number(),
  })
  .strict();
export type LessonTask = z.infer<typeof LessonTaskSchema>;

export const LessonPlanSchema = z
  .object({
    lessonId: z.string(),
    label: z.string(),
    tasks: z.array(LessonTaskSchema),
  })
  .strict();
export type LessonPlan = z.infer<typeof LessonPlanSchema>;

export const UnitTopicRefSchema = z
  .object({
    topicId: z.string(),
    lessonIds: z.array(z.string()).optional(),
  })
  .strict();
export type UnitTopicRef = z.infer<typeof UnitTopicRefSchema>;

export const UnitSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    summary: z.string(),
    coverImage: z.string(),
    topics: z.array(UnitTopicRefSchema),
  })
  .strict();
export type Unit = z.infer<typeof UnitSchema>;
