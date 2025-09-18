import { z } from "zod";

import { ApiSuccessSchema } from "./api/response";
import {
  ActionSchema,
  ClassAreaSchema,
  ClassroomSchema,
  CourseLessonSchema,
  CourseSchema,
  HabitCheckinEventSchema,
  HabitSchema,
  MaterialSchema,
  ObservationSchema,
  OrganizationSchema,
  RoleSchema,
  StudentLessonSchema,
  StudentParentSchema,
  StudentSchema,
  StudentSummaryRecipientSchema,
  StudentSummarySchema,
  SubjectSchema,
  TopicSchema,
  UserSchema,
  WorkPeriodSchema,
  WorkspaceInviteSchema,
} from "./schemas";
import { StudentXpSummarySchema } from "./student";

export { ApiErrorSchema, ApiSuccessSchema } from "./api/response";

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

export const StudentDashboardResponseSchema = ApiSuccessSchema(
  z.object({
    student: StudentSchema,
    habits: z.array(HabitSchema),
    habitCheckins: z.array(HabitCheckinEventSchema),
    xp: StudentXpSummarySchema.nullable(),
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

export const StudentParentMutateResponseSchema = ApiSuccessSchema(
  z.object({
    parent: StudentParentSchema,
  }),
);

export const GuideDashboardStudentSchema = z.object({
  student: StudentSchema,
  habitsCount: z.number().nonnegative(),
  lastObservationAt: z.string().nullable(),
  lastSummaryAt: z.string().nullable(),
  xpToday: z.number().nonnegative().nullable(),
});

export const GuideDashboardResponseSchema = ApiSuccessSchema(
  z.object({
    schedule: z.array(ActionSchema),
    students: z.array(GuideDashboardStudentSchema),
    observationCount: z.number().nonnegative(),
    summaryCount: z.number().nonnegative(),
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

export const WorkspaceInvitesListResponseSchema = ApiSuccessSchema(
  z.object({
    invites: z.array(WorkspaceInviteSchema),
  }),
);

export const WorkspaceInviteDetailResponseSchema = ApiSuccessSchema(
  z.object({
    invite: WorkspaceInviteSchema,
    organization: OrganizationSchema.pick({ id: true, name: true }),
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

export const ClassAreasListResponseSchema = ApiSuccessSchema(
  z.object({
    classAreas: z.array(ClassAreaSchema),
  }),
);

export const MaterialsListResponseSchema = ApiSuccessSchema(
  z.object({
    materials: z.array(MaterialSchema),
  }),
);

export const TopicsListResponseSchema = ApiSuccessSchema(
  z.object({
    topics: z.array(TopicSchema),
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

export const WorkPeriodsListResponseSchema = ApiSuccessSchema(
  z.object({
    workPeriods: z.array(WorkPeriodSchema),
  }),
);

export const WorkPeriodDetailResponseSchema = ApiSuccessSchema(
  z.object({
    workPeriod: WorkPeriodSchema,
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
export type ApiError = z.infer<typeof import("./api/response").ApiErrorSchema>;
export type StudentsListResponse = z.infer<typeof StudentsListResponseSchema>;
export type StudentDetailResponse = z.infer<typeof StudentDetailResponseSchema>;
export type StudentParentsListResponse = z.infer<
  typeof StudentParentsListResponseSchema
>;
export type StudentParentDetailResponse = z.infer<
  typeof StudentParentDetailResponseSchema
>;
export type StudentParentMutateResponse = z.infer<
  typeof StudentParentMutateResponseSchema
>;
export type GuideDashboardStudent = z.infer<typeof GuideDashboardStudentSchema>;
export type GuideDashboardResponse = z.infer<
  typeof GuideDashboardResponseSchema
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
export type ClassAreasListResponse = z.infer<
  typeof ClassAreasListResponseSchema
>;
export type MaterialsListResponse = z.infer<typeof MaterialsListResponseSchema>;
export type TopicsListResponse = z.infer<typeof TopicsListResponseSchema>;
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
export type WorkPeriodsListResponse = z.infer<
  typeof WorkPeriodsListResponseSchema
>;
export type WorkPeriodDetailResponse = z.infer<
  typeof WorkPeriodDetailResponseSchema
>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type TeamListResponse = z.infer<typeof TeamListResponseSchema>;
export type WorkspaceInvitesListResponse = z.infer<
  typeof WorkspaceInvitesListResponseSchema
>;
export type WorkspaceInviteDetailResponse = z.infer<
  typeof WorkspaceInviteDetailResponseSchema
>;
