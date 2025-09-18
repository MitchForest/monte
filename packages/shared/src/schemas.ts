import { z } from "zod";
// Core enum schemas
export const RoleSchema = z.enum([
  "administrator",
  "teacher",
  "student",
  "parent",
]);
export const ActionStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export const ActionTypeSchema = z.enum(["task", "lesson"]);
export const HabitScheduleSchema = z.enum(["daily", "weekdays", "custom"]);
export const LessonInstanceStatusSchema = z.enum([
  "unscheduled",
  "scheduled",
  "completed",
]);
export const SummaryScopeSchema = z.enum(["today", "this_week", "custom"]);

export type Role = z.infer<typeof RoleSchema>;
export type ActionStatus = z.infer<typeof ActionStatusSchema>;
export type ActionType = z.infer<typeof ActionTypeSchema>;
export type HabitSchedule = z.infer<typeof HabitScheduleSchema>;
export type LessonInstanceStatus = z.infer<typeof LessonInstanceStatusSchema>;
export type SummaryScope = z.infer<typeof SummaryScopeSchema>;

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  image_url: z.string().url().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  email_verified: z.boolean(),
});

// Organization schemas
export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string(),
});

export const OrgMembershipSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  user_id: z.string(),
  role: RoleSchema,
  created_at: z.string(),
});

// Student schemas
export const StudentClassroomSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const StudentSchema = z
  .object({
    id: z.string(),
    org_id: z.string(),
    full_name: z.string(),
    avatar_url: z.string().url().nullable(),
    dob: z.string().nullable(),
    primary_classroom_id: z.string().nullable(),
    created_at: z.string(),
    oneroster_user_id: z.string().nullable().optional(),
  })
  .extend({
    classroom: StudentClassroomSchema.nullable().optional(),
  });

export const StudentParentSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  relation: z.string().nullable(),
  preferred_contact_method: z.string().nullable(),
  created_at: z.string(),
});

// Classroom schemas
export const ClassroomSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  name: z.string(),
  created_at: z.string(),
});

export const ClassroomGuideSchema = z.object({
  id: z.string(),
  classroom_id: z.string(),
  user_id: z.string(),
});

// Course schemas
export const SubjectSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  created_at: z.string(),
});

export const CourseSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  subject_id: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
});

export const CourseLessonSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  course_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  duration_minutes: z.number().nullable(),
  order_index: z.number(),
  created_at: z.string(),
});

export const ClassAreaSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const MaterialSchema = z.object({
  id: z.string(),
  name: z.string(),
  org_id: z.string().nullable(),
});

export const TopicSchema = z.object({
  id: z.string(),
  domain_id: z.string(),
  name: z.string(),
});

// Observation schemas
export const ObservationSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  student_id: z.string(),
  created_by: z.string(),
  content: z.string(),
  audio_url: z.string().url().nullable(),
  created_at: z.string(),
});

// Action schemas
export const ActionSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  student_id: z.string(),
  type: ActionTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  assigned_to_user_id: z.string().nullable(),
  due_date: z.string().nullable(),
  recurring_rule: z.string().nullable(),
  status: ActionStatusSchema,
  created_by: z.string(),
  created_at: z.string(),
  updated_by: z.string().nullable(),
  updated_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  completed_by: z.string().nullable(),
});

export const StudentLessonSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  student_id: z.string(),
  course_lesson_id: z.string().nullable(),
  custom_title: z.string().nullable(),
  notes: z.string().nullable(),
  status: LessonInstanceStatusSchema,
  scheduled_for: z.string().nullable(),
  completed_at: z.string().nullable(),
  assigned_by_user_id: z.string().nullable(),
  rescheduled_from_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const StudentSummarySchema = z.object({
  id: z.string(),
  org_id: z.string(),
  student_id: z.string(),
  generated_by_user_id: z.string().nullable(),
  title: z.string(),
  content: z.string(),
  scope: SummaryScopeSchema,
  timespan_start: z.string().nullable(),
  timespan_end: z.string().nullable(),
  emailed_at: z.string().nullable(),
  created_at: z.string(),
});

export const StudentSummaryRecipientSchema = z.object({
  id: z.string(),
  summary_id: z.string(),
  parent_id: z.string().nullable(),
  email: z.string().email(),
  delivered_at: z.string().nullable(),
  created_at: z.string(),
});

// Habit schemas
export const HabitSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  student_id: z.string(),
  name: z.string(),
  schedule: HabitScheduleSchema,
  active: z.boolean(),
  created_at: z.string(),
});

export const HabitCheckinSchema = z.object({
  id: z.string(),
  habit_id: z.string(),
  date: z.string(),
  checked_by: z.string().nullable(),
  created_at: z.string(),
});

export const HabitCheckinEventSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  habit_id: z.string(),
  student_id: z.string(),
  date: z.string(),
  checked: z.boolean(),
  source: z.string(),
  created_by: z.string().nullable(),
  created_at: z.string(),
});

export const WorkPeriodSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  student_id: z.string(),
  oneroster_student_id: z.string().nullable(),
  start_time: z.string(),
  end_time: z.string().nullable(),
  notes: z.string().nullable(),
});

export type WorkPeriod = z.infer<typeof WorkPeriodSchema>;

export const WorkspaceInviteSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  code: z.string(),
  email: z.string().email().nullable(),
  role: RoleSchema,
  created_by: z.string(),
  max_uses: z.number().int().min(1),
  used_count: z.number().int().min(0),
  expires_at: z.string().nullable(),
  redeemed_at: z.string().nullable(),
  redeemed_by: z.string().nullable(),
  created_at: z.string(),
});

// Auth schemas
export const AuthSessionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  org_id: z.string().nullable(),
  token: z.string(),
  expires_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
});

export const AuthAccountSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  provider_id: z.string(),
  account_id: z.string(),
  access_token: z.string().nullable(),
  refresh_token: z.string().nullable(),
  id_token: z.string().nullable(),
  scope: z.string().nullable(),
  password: z.string().nullable(),
  access_token_expires_at: z.string().nullable(),
  refresh_token_expires_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AuthVerificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expires_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Infer types from schemas
export type User = z.infer<typeof UserSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type OrgMembership = z.infer<typeof OrgMembershipSchema>;
export type StudentClassroom = z.infer<typeof StudentClassroomSchema>;
export type Student = z.infer<typeof StudentSchema>;
export type StudentParent = z.infer<typeof StudentParentSchema>;
export type Classroom = z.infer<typeof ClassroomSchema>;
export type ClassroomGuide = z.infer<typeof ClassroomGuideSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type CourseLesson = z.infer<typeof CourseLessonSchema>;
export type Observation = z.infer<typeof ObservationSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type StudentLesson = z.infer<typeof StudentLessonSchema>;
export type StudentSummary = z.infer<typeof StudentSummarySchema>;
export type StudentSummaryRecipient = z.infer<
  typeof StudentSummaryRecipientSchema
>;
export type Habit = z.infer<typeof HabitSchema>;
export type HabitCheckin = z.infer<typeof HabitCheckinSchema>;
export type HabitCheckinEvent = z.infer<typeof HabitCheckinEventSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type AuthAccount = z.infer<typeof AuthAccountSchema>;
export type AuthVerification = z.infer<typeof AuthVerificationSchema>;
export type WorkspaceInvite = z.infer<typeof WorkspaceInviteSchema>;
