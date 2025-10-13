import { z } from 'zod';

export const SegmentTypeSchema = z.enum(['presentation', 'guided', 'practice']);
export type SegmentType = z.infer<typeof SegmentTypeSchema>;

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const AuthoringMetaSchema = z
  .object({
    label: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
export type AuthoringMeta = z.infer<typeof AuthoringMetaSchema>;

export const LessonScenarioKindSchema = z.enum(['golden-beads', 'stamp-game']);
export type LessonScenarioKind = z.infer<typeof LessonScenarioKindSchema>;

export const LessonScenarioBindingSchema = z
  .object({
    kind: LessonScenarioKindSchema,
    seed: z.number(),
    snapshot: z.record(z.unknown()).optional(),
    notes: z.string().optional(),
  })
  .strict();
export type LessonScenarioBinding = z.infer<typeof LessonScenarioBindingSchema>;

export const EntityMetadataSchema = z
  .object({
    source: z.string().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    scenario: LessonScenarioBindingSchema.optional(),
  })
  .catchall(z.unknown());
export type EntityMetadata = z.infer<typeof EntityMetadataSchema>;

export const RepresentationSchema = z.enum(['concrete', 'abstract']);
export type Representation = z.infer<typeof RepresentationSchema>;
