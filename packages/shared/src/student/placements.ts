import { z } from "zod";

import { ApiSuccessSchema } from "../api/response";

export const StudentPlacementCourseProgressSchema = z.object({
  courseId: z.string().nullable(),
  courseTitle: z.string(),
  courseCode: z.string().nullable(),
  subject: z.string().nullable(),
  completedLessons: z.number().int().nonnegative(),
  totalLessons: z.number().int().nonnegative(),
  totalXpEarned: z.number().nonnegative(),
  totalXpAvailable: z.number().nonnegative().nullable(),
  masteredViaTestOut: z.boolean(),
});

export type StudentPlacementCourseProgress = z.infer<
  typeof StudentPlacementCourseProgressSchema
>;

export const StudentPlacementProgressResponseSchema = ApiSuccessSchema(
  z.object({ courses: z.array(StudentPlacementCourseProgressSchema) }),
);

export type StudentPlacementProgressResponse = z.infer<
  typeof StudentPlacementProgressResponseSchema
>;

export const StudentPlacementLevelSchema = z.object({
  gradeLevel: z.string().nullable(),
  onboarded: z.boolean(),
});

export type StudentPlacementLevel = z.infer<typeof StudentPlacementLevelSchema>;

export const StudentPlacementLevelResponseSchema = ApiSuccessSchema(
  z.object({ currentLevel: StudentPlacementLevelSchema.nullable() }),
);

export type StudentPlacementLevelResponse = z.infer<
  typeof StudentPlacementLevelResponseSchema
>;

export const StudentNextPlacementSchema = z.object({
  lessonTitle: z.string().nullable(),
  gradeLevel: z.string().nullable(),
  exhausted: z.boolean(),
});

export type StudentNextPlacement = z.infer<typeof StudentNextPlacementSchema>;

export const StudentNextPlacementResponseSchema = ApiSuccessSchema(
  z.object({ nextPlacement: StudentNextPlacementSchema.nullable() }),
);

export type StudentNextPlacementResponse = z.infer<
  typeof StudentNextPlacementResponseSchema
>;

export const StudentPlacementTestAttemptSchema = z.object({
  title: z.string(),
  score: z.number().nullable(),
  status: z.string(),
});

export type StudentPlacementTestAttempt = z.infer<
  typeof StudentPlacementTestAttemptSchema
>;

export const StudentPlacementTestsResponseSchema = ApiSuccessSchema(
  z.object({ tests: z.array(StudentPlacementTestAttemptSchema) }),
);

export type StudentPlacementTestsResponse = z.infer<
  typeof StudentPlacementTestsResponseSchema
>;
