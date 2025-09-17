import { z } from "zod";

import {
  ActionSchema,
  ClassroomSchema,
  CourseLessonSchema,
  CourseSchema,
  HabitCheckinEventSchema,
  HabitSchema,
  ObservationSchema,
  OrganizationSchema,
  RoleSchema,
  StudentLessonSchema,
  StudentParentSchema,
  StudentSchema,
  StudentSummaryRecipientSchema,
  StudentSummarySchema,
  SubjectSchema,
  UserSchema,
} from "./schemas";

// API Response wrapper schemas
export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z
      .object({
        page: z.number().optional(),
        limit: z.number().optional(),
        total: z.number().optional(),
      })
      .optional(),
  });

// Student API responses
export const StudentsListResponseSchema = ApiSuccessSchema(
  z.object({
    students: z.array(StudentSchema),
  }),
);

export const StudentDetailResponseSchema = ApiSuccessSchema(
  z.object({
    student: StudentSchema,
    parents: z.array(StudentParentSchema).optional(),
    habits: z.array(HabitSchema).optional(),
    summaries: z.array(StudentSummarySchema).optional(),
    habitCheckins: z.array(HabitCheckinEventSchema).optional(),
  }),
);

export const StudentParentsListResponseSchema = ApiSuccessSchema(
  z.object({
    parents: z.array(StudentParentSchema),
  }),
);

export const StudentParentDetailResponseSchema = ApiSuccessSchema(
  z.object({
    parent: StudentParentSchema,
  }),
);

// Classroom API responses
export const ClassroomGuideSummarySchema = UserSchema.pick({
  id: true,
  name: true,
  email: true,
});

export const ClassroomWithGuidesSchema = ClassroomSchema.extend({
  guides: z.array(ClassroomGuideSummarySchema),
});

export const ClassroomsListResponseSchema = ApiSuccessSchema(
  z.object({
    classrooms: z.array(ClassroomWithGuidesSchema),
  }),
);

export const ClassroomCreatedResponseSchema = ApiSuccessSchema(
  z.object({
    classroom: ClassroomWithGuidesSchema,
  }),
);

export const ClassroomDetailResponseSchema = ApiSuccessSchema(
  z.object({
    classroom: ClassroomSchema,
    guides: z.array(UserSchema),
    students: z.array(StudentSchema),
  }),
);

// Observation API responses
export const ObservationsListResponseSchema = ApiSuccessSchema(
  z.object({
    observations: z.array(ObservationSchema),
  }),
);

export const ObservationDetailResponseSchema = ApiSuccessSchema(
  z.object({
    observation: ObservationSchema,
  }),
);

// Action/Task API responses
export const ActionsListResponseSchema = ApiSuccessSchema(
  z.object({
    actions: z.array(ActionSchema),
  }),
);

export const ActionDetailResponseSchema = ApiSuccessSchema(
  z.object({
    action: ActionSchema,
  }),
);

// Habit API responses
export const HabitsListResponseSchema = ApiSuccessSchema(
  z.object({
    habits: z.array(HabitSchema),
  }),
);

export const HabitDetailResponseSchema = ApiSuccessSchema(
  z.object({
    habit: HabitSchema,
  }),
);

export const HabitCheckinDetailResponseSchema = ApiSuccessSchema(
  z.object({
    checkin: HabitCheckinEventSchema,
  }),
);

export const HabitCheckinDeletionResponseSchema = ApiSuccessSchema(
  z.object({
    deleted: z.literal(true),
  }),
);

export const HabitCheckinEventsListResponseSchema = ApiSuccessSchema(
  z.object({
    events: z.array(HabitCheckinEventSchema),
  }),
);

// Course API responses
export const SubjectsListResponseSchema = ApiSuccessSchema(
  z.object({
    subjects: z.array(SubjectSchema),
  }),
);

export const CoursesListResponseSchema = ApiSuccessSchema(
  z.object({
    courses: z.array(CourseSchema),
  }),
);

export const CourseLessonsListResponseSchema = ApiSuccessSchema(
  z.object({
    lessons: z.array(CourseLessonSchema),
  }),
);

// Student lesson API responses
export const StudentLessonsListResponseSchema = ApiSuccessSchema(
  z.object({
    lessons: z.array(StudentLessonSchema),
  }),
);

export const StudentLessonDetailResponseSchema = ApiSuccessSchema(
  z.object({
    lesson: StudentLessonSchema,
  }),
);

// Student summary API responses
export const StudentSummariesListResponseSchema = ApiSuccessSchema(
  z.object({
    summaries: z.array(StudentSummarySchema),
  }),
);

export const StudentSummaryDetailResponseSchema = ApiSuccessSchema(
  z.object({
    summary: StudentSummarySchema,
    recipients: z.array(StudentSummaryRecipientSchema),
  }),
);

// Auth API responses
export const LoginResponseSchema = z.object({
  user: UserSchema,
  session: z.object({
    token: z.string(),
    expires_at: z.string(),
  }),
  organization: OrganizationSchema,
});

export const CurrentUserResponseSchema = z.object({
  user: UserSchema,
  organization: OrganizationSchema,
  role: RoleSchema,
});

export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  role: RoleSchema,
});

export const TeamListResponseSchema = ApiSuccessSchema(
  z.object({
    members: z.array(TeamMemberSchema),
  }),
);

// Type exports
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type StudentsListResponse = z.infer<typeof StudentsListResponseSchema>;
export type StudentDetailResponse = z.infer<typeof StudentDetailResponseSchema>;
export type StudentParentsListResponse = z.infer<
  typeof StudentParentsListResponseSchema
>;
export type StudentParentDetailResponse = z.infer<
  typeof StudentParentDetailResponseSchema
>;
export type ClassroomsListResponse = z.infer<
  typeof ClassroomsListResponseSchema
>;
export type ClassroomWithGuides = z.infer<typeof ClassroomWithGuidesSchema>;
export type ClassroomDetailResponse = z.infer<
  typeof ClassroomDetailResponseSchema
>;
export type ClassroomCreatedResponse = z.infer<
  typeof ClassroomCreatedResponseSchema
>;
export type ObservationsListResponse = z.infer<
  typeof ObservationsListResponseSchema
>;
export type ObservationDetailResponse = z.infer<
  typeof ObservationDetailResponseSchema
>;
export type ActionsListResponse = z.infer<typeof ActionsListResponseSchema>;
export type ActionDetailResponse = z.infer<typeof ActionDetailResponseSchema>;
export type HabitsListResponse = z.infer<typeof HabitsListResponseSchema>;
export type HabitDetailResponse = z.infer<typeof HabitDetailResponseSchema>;
export type HabitCheckinDetailResponse = z.infer<
  typeof HabitCheckinDetailResponseSchema
>;
export type HabitCheckinDeletionResponse = z.infer<
  typeof HabitCheckinDeletionResponseSchema
>;
export type HabitCheckinEventsListResponse = z.infer<
  typeof HabitCheckinEventsListResponseSchema
>;
export type SubjectsListResponse = z.infer<typeof SubjectsListResponseSchema>;
export type CoursesListResponse = z.infer<typeof CoursesListResponseSchema>;
export type CourseLessonsListResponse = z.infer<
  typeof CourseLessonsListResponseSchema
>;
export type StudentLessonsListResponse = z.infer<
  typeof StudentLessonsListResponseSchema
>;
export type StudentLessonDetailResponse = z.infer<
  typeof StudentLessonDetailResponseSchema
>;
export type StudentSummariesListResponse = z.infer<
  typeof StudentSummariesListResponseSchema
>;
export type StudentSummaryDetailResponse = z.infer<
  typeof StudentSummaryDetailResponseSchema
>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type TeamListResponse = z.infer<typeof TeamListResponseSchema>;
