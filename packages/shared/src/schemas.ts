import { z } from "zod";
// Core enum schemas
export const RoleSchema = z.enum(["administrator", "teacher", "student", "parent"]);
export const ActionStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export const ActionTypeSchema = z.enum(["task", "lesson"]);
export const HabitScheduleSchema = z.enum(["daily", "weekdays", "custom"]);

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
export const StudentSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  full_name: z.string(),
  avatar_url: z.string().url().nullable(),
  dob: z.string().nullable(),
  primary_classroom_id: z.string().nullable(),
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
export type Student = z.infer<typeof StudentSchema>;
export type Classroom = z.infer<typeof ClassroomSchema>;
export type ClassroomGuide = z.infer<typeof ClassroomGuideSchema>;
export type Observation = z.infer<typeof ObservationSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Habit = z.infer<typeof HabitSchema>;
export type HabitCheckin = z.infer<typeof HabitCheckinSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type AuthAccount = z.infer<typeof AuthAccountSchema>;
export type AuthVerification = z.infer<typeof AuthVerificationSchema>;
