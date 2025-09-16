// Core enums and types
export type Role = "super_admin" | "admin" | "guide";

export type ActionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ActionType = "task" | "lesson";

export type HabitSchedule = "daily" | "weekdays" | "custom";

// Database table types
export type UsersTable = {
  id: string;
  email: string;
  name: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
};

export type OrganizationsTable = {
  id: string;
  name: string;
  created_at: string;
};

export type OrgMembershipsTable = {
  id: string;
  org_id: string;
  user_id: string;
  role: Role;
  created_at: string;
};

export type StudentsTable = {
  id: string;
  org_id: string;
  full_name: string;
  avatar_url: string | null;
  dob: string | null;
  primary_classroom_id: string | null;
  created_at: string;
};

export type StudentParentsTable = {
  id: string;
  student_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  relation: string | null;
  preferred_contact_method: string | null;
  created_at: string;
};

export type ClassroomsTable = {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
};

export type ClassroomGuidesTable = {
  id: string;
  classroom_id: string;
  user_id: string;
};

export type ObservationsTable = {
  id: string;
  org_id: string;
  student_id: string;
  created_by: string;
  content: string;
  audio_url: string | null;
  created_at: string;
};

export type ObservationTagsTable = {
  id: string;
  observation_id: string;
  tag: string;
  ref_id: string;
};

export type ActionsTable = {
  id: string;
  org_id: string;
  student_id: string;
  type: ActionType;
  title: string;
  description: string | null;
  assigned_to_user_id: string | null;
  due_date: string | null;
  recurring_rule: string | null;
  status: ActionStatus;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
  completed_at: string | null;
  completed_by: string | null;
};

export type ActionTagsTable = {
  id: string;
  action_id: string;
  tag: string;
  ref_id: string;
};

export type HabitsTable = {
  id: string;
  org_id: string;
  student_id: string;
  name: string;
  schedule: HabitSchedule;
  active: boolean;
  created_at: string;
};

export type HabitCheckinsTable = {
  id: string;
  habit_id: string;
  date: string;
  checked_by: string | null;
  created_at: string;
};

export type ClassAreasTable = {
  id: string;
  name: string;
};

export type DomainsTable = {
  id: string;
  name: string;
};

export type TopicsTable = {
  id: string;
  domain_id: string;
  name: string;
};

export type MaterialsTable = {
  id: string;
  name: string;
  org_id: string | null;
};

export type WorkPeriodsTable = {
  id: string;
  org_id: string;
  student_id: string;
  start_time: string;
  end_time: string | null;
  notes: string | null;
};

export type WorkPeriodItemsTable = {
  id: string;
  work_period_id: string;
  class_area_id: string | null;
  material_id: string | null;
  domain_id: string | null;
  topic_id: string | null;
};

export type AuthSessionsTable = {
  id: string;
  user_id: string;
  org_id: string | null;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  ip_address: string | null;
  user_agent: string | null;
};

export type AuthAccountsTable = {
  id: string;
  user_id: string;
  provider_id: string;
  account_id: string;
  access_token: string | null;
  refresh_token: string | null;
  id_token: string | null;
  scope: string | null;
  password: string | null;
  access_token_expires_at: string | null;
  refresh_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthVerificationsTable = {
  id: string;
  identifier: string;
  value: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  users: UsersTable;
  organizations: OrganizationsTable;
  org_memberships: OrgMembershipsTable;
  students: StudentsTable;
  student_parents: StudentParentsTable;
  classrooms: ClassroomsTable;
  classroom_guides: ClassroomGuidesTable;
  observations: ObservationsTable;
  observation_tags: ObservationTagsTable;
  actions: ActionsTable;
  action_tags: ActionTagsTable;
  habits: HabitsTable;
  habit_checkins: HabitCheckinsTable;
  class_areas: ClassAreasTable;
  domains: DomainsTable;
  topics: TopicsTable;
  materials: MaterialsTable;
  work_periods: WorkPeriodsTable;
  work_period_items: WorkPeriodItemsTable;
  auth_sessions: AuthSessionsTable;
  auth_accounts: AuthAccountsTable;
  auth_verifications: AuthVerificationsTable;
};
