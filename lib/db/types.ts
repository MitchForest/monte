export type StudentsTable = {
  id: string;
  org_id: string;
  full_name: string;
  avatar_url: string | null;
  dob: string | null; // ISO date string
  primary_classroom_id: string | null;
  created_at: string; // ISO datetime
};

export type Database = {
  students: StudentsTable;
};
