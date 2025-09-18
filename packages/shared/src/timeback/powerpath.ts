import { z } from "zod";

import { TimebackSuccessSchema } from "./envelope";

export const TimebackCourseSchema = z.object({
  sourcedId: z.string(),
  status: z.string().optional(),
  title: z.string(),
  courseCode: z.string().nullable().optional(),
  grades: z.array(z.string()).nullable().optional(),
  subjects: z.array(z.string()).nullable().optional(),
  subjectCodes: z.array(z.string()).nullable().optional(),
  dateLastModified: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  org: z
    .object({
      sourcedId: z.string(),
    })
    .optional(),
});

export type TimebackCourse = z.infer<typeof TimebackCourseSchema>;

const LessonPlanResourceMetadataSchema = z
  .object({
    caseIds: z.array(z.string()).optional(),
    ltiUrl: z.string().optional(),
    xp: z.number().optional(),
    dueDate: z.string().optional(),
    lessonType: z.string().optional(),
    assessmentType: z.string().optional(),
  })
  .passthrough();

export const TimebackLessonPlanResourceSchema = z.object({
  sourcedId: z.string(),
  title: z.string(),
  sortOrder: z.number().optional(),
  status: z.string().optional(),
  lessonType: z.string().nullable().optional(),
  metadata: LessonPlanResourceMetadataSchema.optional(),
  resource: z
    .object({
      sourcedId: z.string().optional(),
      status: z.string().optional(),
      title: z.string().optional(),
      roles: z.array(z.string()).optional(),
      importance: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
      vendorResourceId: z.string().optional(),
    })
    .optional(),
});

export type TimebackLessonPlanResource = z.infer<
  typeof TimebackLessonPlanResourceSchema
>;

export const TimebackLessonPlanComponentSchema: z.ZodType<{
  sourcedId: string;
  title: string;
  sortOrder?: number | undefined;
  status?: string | undefined;
  unlockDate?: string | undefined;
  metadata?: z.infer<typeof LessonPlanResourceMetadataSchema> | undefined;
  componentResources?: TimebackLessonPlanResource[] | undefined;
  subComponents?: TimebackLessonPlanComponent[] | undefined;
}> = z.lazy(() =>
  z.object({
    sourcedId: z.string(),
    title: z.string(),
    sortOrder: z.number().optional(),
    status: z.string().optional(),
    unlockDate: z.string().optional(),
    metadata: LessonPlanResourceMetadataSchema.optional(),
    componentResources: z.array(TimebackLessonPlanResourceSchema).optional(),
    subComponents: z.array(TimebackLessonPlanComponentSchema).optional(),
  }),
);

export type TimebackLessonPlanComponent = z.infer<
  typeof TimebackLessonPlanComponentSchema
>;

export const TimebackLessonPlanSchema = z.object({
  id: z.string().optional(),
  sourcedId: z.string(),
  status: z.string().optional(),
  dateLastModified: z.string().optional(),
  course: TimebackCourseSchema,
  subComponents: z.array(TimebackLessonPlanComponentSchema).optional(),
  componentResources: z.array(TimebackLessonPlanResourceSchema).optional(),
});

export type TimebackLessonPlan = z.infer<typeof TimebackLessonPlanSchema>;

export const TimebackLessonPlanResponseSchema = TimebackSuccessSchema(
  z.object({
    lessonPlan: TimebackLessonPlanSchema,
  }),
);

export type TimebackLessonPlanResponse = z.infer<
  typeof TimebackLessonPlanResponseSchema
>;

const LineItemResultMetadataSchema = z
  .object({
    attempt: z.number().optional(),
    xp: z.number().optional(),
    multiplier: z.number().optional(),
  })
  .passthrough();

export const TimebackCourseProgressResultSchema = z.object({
  sourcedId: z.string(),
  status: z.string().optional(),
  dateLastModified: z.string().optional(),
  assessmentLineItemSourcedId: z.string(),
  studentSourcedId: z.string(),
  score: z.number().optional(),
  textScore: z.string().optional(),
  scoreDate: z.string().optional(),
  scoreScaleSourcedId: z.string().nullable().optional(),
  scorePercentile: z.number().nullable().optional(),
  scoreStatus: z.string().optional(),
  comment: z.string().nullable().optional(),
  learningObjectiveSet: z.array(z.unknown()).optional(),
  inProgress: z.union([z.boolean(), z.string()]).optional(),
  incomplete: z.union([z.boolean(), z.string()]).optional(),
  late: z.union([z.boolean(), z.string()]).optional(),
  missing: z.union([z.boolean(), z.string()]).optional(),
  scoreScale: z.unknown().optional(),
  metadata: LineItemResultMetadataSchema.optional(),
});

export type TimebackCourseProgressResult = z.infer<
  typeof TimebackCourseProgressResultSchema
>;

export const TimebackCourseProgressLineItemSchema = z.object({
  type: z.enum(["component", "resource"]).optional(),
  resultValueMin: z.number().optional(),
  resultValueMax: z.number().optional(),
  assessmentLineItemSourcedId: z.string(),
  courseComponentSourcedId: z.string().optional(),
  courseComponentResourceSourcedId: z.string().optional(),
  title: z.string().optional(),
  results: z.array(TimebackCourseProgressResultSchema).optional(),
});

export type TimebackCourseProgressLineItem = z.infer<
  typeof TimebackCourseProgressLineItemSchema
>;

export const TimebackCourseProgressSummarySchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  lessonId: z.string().nullable(),
  totalLineItems: z.number(),
  completedLineItems: z.number(),
  outstandingLineItems: z.number(),
  completionRate: z.number(),
  totalXpAwarded: z.number(),
  lineItems: z.array(TimebackCourseProgressLineItemSchema),
});

export type TimebackCourseProgressSummary = z.infer<
  typeof TimebackCourseProgressSummarySchema
>;

export const TimebackCourseProgressResponseSchema = TimebackSuccessSchema(
  TimebackCourseProgressSummarySchema,
);

export type TimebackCourseProgressResponse = z.infer<
  typeof TimebackCourseProgressResponseSchema
>;

export const TimebackSubjectProgressEntrySchema = z.object({
  course: TimebackCourseSchema.pick({
    courseCode: true,
    dateLastModified: true,
    grades: true,
    sourcedId: true,
    status: true,
    subjects: true,
    title: true,
  }),
  inEnrolled: z.boolean().optional(),
  hasUsedTestOut: z.boolean().optional(),
  completedLessons: z.number().optional(),
  testOutLessonId: z.string().nullable().optional(),
  totalLessons: z.number().optional(),
  totalAttainableXp: z.number().optional(),
  totalXpEarned: z.number().optional(),
});

export type TimebackSubjectProgressEntry = z.infer<
  typeof TimebackSubjectProgressEntrySchema
>;

export const TimebackSubjectProgressSchema = z.object({
  success: z.boolean(),
  progress: z.array(TimebackSubjectProgressEntrySchema).optional(),
});

export type TimebackSubjectProgress = z.infer<
  typeof TimebackSubjectProgressSchema
>;

export const TimebackNextPlacementTestSchema = z.object({
  success: z.boolean(),
  exhaustedTests: z.boolean().optional(),
  gradeLevel: z.string().nullable().optional(),
  lesson: z.string().nullable().optional(),
  onboarded: z.boolean().optional(),
});

export type TimebackNextPlacementTest = z.infer<
  typeof TimebackNextPlacementTestSchema
>;

export const TimebackCurrentLevelSchema = z.object({
  success: z.boolean(),
  gradeLevel: z.string().nullable().optional(),
  onboarded: z.boolean().optional(),
});

export type TimebackCurrentLevel = z.infer<typeof TimebackCurrentLevelSchema>;

export const TimebackPlacementAssessmentResultSchema = z.object({
  score: z.number().optional(),
  scoreDate: z.string().optional(),
  scoreStatus: z.string().optional(),
  inProgress: z.boolean().optional(),
  incomplete: z.boolean().optional(),
});

export const TimebackPlacementTestSchema = z.object({
  component_resources: z
    .object({
      sourcedId: z.string(),
      title: z.string().optional(),
    })
    .optional(),
  resources: z.record(z.unknown()).optional(),
  resources_metadata: z
    .object({
      grades: z.array(z.string()).optional(),
      toolProvider: z.string().optional(),
    })
    .optional(),
  assessment_line_items: z.record(z.unknown()).nullable().optional(),
  assessment_results: z
    .array(TimebackPlacementAssessmentResultSchema)
    .nullable()
    .optional(),
});

export type TimebackPlacementTest = z.infer<typeof TimebackPlacementTestSchema>;

export const TimebackPlacementTestsResponseSchema = z.object({
  success: z.boolean(),
  placementTests: z.array(TimebackPlacementTestSchema).optional(),
});

export type TimebackPlacementTestsResponse = z.infer<
  typeof TimebackPlacementTestsResponseSchema
>;
