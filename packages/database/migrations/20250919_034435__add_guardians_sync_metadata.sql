BEGIN;

create table if not exists guardians (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  sourced_id text not null unique,
  name text not null,
  email text,
  phone text,
  relation text,
  status text not null default 'active',
  synced_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_guardians_status on guardians(status);
create index if not exists idx_guardians_deleted_at on guardians(deleted_at);

create table if not exists student_guardians (
  student_id uuid not null references students(id) on delete cascade,
  guardian_id uuid not null references guardians(id) on delete cascade,
  relation text,
  synced_at timestamptz not null default now(),
  primary key (student_id, guardian_id)
);

alter table students
  add column if not exists status text not null default 'active',
  add column if not exists synced_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table org_memberships
  add column if not exists status text not null default 'active',
  add column if not exists synced_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table courses
  add column if not exists status text not null default 'active',
  add column if not exists synced_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table classrooms
  add column if not exists status text not null default 'active',
  add column if not exists synced_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table student_parents
  add column if not exists status text not null default 'active',
  add column if not exists synced_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

create index if not exists idx_students_deleted_at on students(deleted_at);
create index if not exists idx_org_memberships_deleted_at on org_memberships(deleted_at);
create index if not exists idx_courses_deleted_at on courses(deleted_at);
create index if not exists idx_classrooms_deleted_at on classrooms(deleted_at);
create index if not exists idx_student_parents_deleted_at on student_parents(deleted_at);

COMMIT;
