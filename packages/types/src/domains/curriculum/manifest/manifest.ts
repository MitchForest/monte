import { z } from 'zod';

import { LessonGradeLevelSchema } from '../lesson/authoring.js';

const RitRangeSchema = z
  .object({
    min: z.number(),
    max: z.number(),
  })
  .strict();

const CurriculumSkillPracticeSchema = z
  .object({
    easy: z.array(z.string()).optional(),
    medium: z.array(z.string()).optional(),
    hard: z.array(z.string()).optional(),
  })
  .strict()
  .optional();

export const CurriculumSkillSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    domainId: z.string(),
    unitId: z.string().optional(),
    topicId: z.string().optional(),
    ccss: z.array(z.string()).optional(),
    ritBand: RitRangeSchema.optional(),
    representations: z.array(z.string()).optional(),
    practice: CurriculumSkillPracticeSchema,
    mentalMathEligible: z.boolean().optional(),
  })
  .passthrough();
export type CurriculumSkill = z.infer<typeof CurriculumSkillSchema>;

export const CurriculumManifestUnitSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    domainId: z.string().optional(),
    ritRange: RitRangeSchema.optional(),
    primaryCcss: z.array(z.string()).optional(),
    topicOrder: z.array(z.string()),
  })
  .strict();
export type CurriculumManifestUnit = z.infer<typeof CurriculumManifestUnitSchema>;

export const CurriculumManifestTopicSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    unitId: z.string(),
    title: z.string(),
    overview: z.string().optional(),
    focusSkills: z.array(z.string()),
    ritRange: RitRangeSchema.optional(),
    ccssFocus: z.array(z.string()).optional(),
    priority: z.number().optional(),
    prerequisiteTopicIds: z.array(z.string()),
  })
  .strict();
export type CurriculumManifestTopic = z.infer<typeof CurriculumManifestTopicSchema>;

export const CurriculumManifestLessonSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    topicId: z.string(),
    title: z.string(),
    materialId: z.string().optional(),
    gradeLevels: z.array(LessonGradeLevelSchema),
    segments: z.array(
      z
        .object({
          type: z.string(),
          representation: z.string().optional(),
        })
        .strict(),
    ),
    prerequisiteLessonIds: z.array(z.string()),
    skills: z.array(z.string()),
    notes: z.string().optional(),
  })
  .strict();
export type CurriculumManifestLesson = z.infer<typeof CurriculumManifestLessonSchema>;

export const CurriculumManifestSchema = z
  .object({
    generatedAt: z.string(),
    domains: z.array(z.record(z.unknown())),
    units: z.array(CurriculumManifestUnitSchema),
    topics: z.array(CurriculumManifestTopicSchema),
    lessons: z.array(CurriculumManifestLessonSchema),
  })
  .strict();
export type CurriculumManifest = z.infer<typeof CurriculumManifestSchema>;
