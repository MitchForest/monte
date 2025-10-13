import { z } from 'zod';

export const LessonStatusSchema = z.enum(['draft', 'published']);
export type LessonStatus = z.infer<typeof LessonStatusSchema>;

export const LessonAuthoringStatusSchema = z.enum([
  'not_started',
  'outline',
  'presentation',
  'guided',
  'practice',
  'qa',
  'published',
]);
export type LessonAuthoringStatus = z.infer<typeof LessonAuthoringStatusSchema>;

export const LessonGradeLevelSchema = z.enum(['kindergarten', 'grade1', 'grade2', 'grade3']);
export type LessonGradeLevel = z.infer<typeof LessonGradeLevelSchema>;
