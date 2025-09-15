BEGIN;

create extension if not exists pgcrypto;

-- Enums
create type role as enum ('super_admin','admin','guide');
create type action_status as enum ('pending','in_progress','completed','cancelled');
create type action_type as enum ('task','lesson');
create type tag_type as enum ('student','domain','topic','material','class_area');
create type habit_schedule as enum ('daily','weekdays','custom');

-- RLS helper functions
create schema if not exists app;

create or replace function app.current_user_id() returns uuid
language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid
$$;

create or replace function app.current_org_id() returns uuid
language sql stable as $$
  select nullif(current_setting('app.org_id', true), '')::uuid
$$;

-- Core tables
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  name text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists org_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role role not null,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table if not exists classrooms (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists classroom_guides (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  unique (classroom_id, user_id)
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  dob date,
  primary_classroom_id uuid references classrooms(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists student_parents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  relation text,
  preferred_contact_method text,
  created_at timestamptz not null default now()
);

create table if not exists observations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  created_by uuid not null references users(id) on delete restrict,
  content text not null,
  audio_url text,
  created_at timestamptz not null default now()
);

create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  type action_type not null,
  title text not null,
  description text,
  assigned_to_user_id uuid references users(id) on delete set null,
  due_date date,
  recurring_rule text,
  status action_status not null default 'pending',
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_by uuid references users(id),
  updated_at timestamptz,
  completed_at timestamptz,
  completed_by uuid references users(id)
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  name text not null,
  schedule habit_schedule not null default 'daily',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists habit_checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  checked_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

-- Taxonomy
create table if not exists class_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references domains(id) on delete cascade,
  name text not null
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_id uuid references organizations(id) on delete cascade
);

create table if not exists observation_tags (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references observations(id) on delete cascade,
  tag tag_type not null,
  ref_id uuid not null
);

create table if not exists action_tags (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references actions(id) on delete cascade,
  tag tag_type not null,
  ref_id uuid not null
);

create table if not exists work_periods (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz,
  notes text
);

create table if not exists work_period_items (
  id uuid primary key default gen_random_uuid(),
  work_period_id uuid not null references work_periods(id) on delete cascade,
  class_area_id uuid references class_areas(id) on delete set null,
  material_id uuid references materials(id) on delete set null,
  domain_id uuid references domains(id) on delete set null,
  topic_id uuid references topics(id) on delete set null
);

-- Indexes
create index if not exists idx_observations_student_created_at on observations(student_id, created_at desc);
create index if not exists idx_actions_student_status_due on actions(student_id, status, due_date);
create index if not exists idx_students_org on students(org_id);
create index if not exists idx_actions_org on actions(org_id);

-- RLS enable
alter table organizations enable row level security;
alter table users enable row level security;
alter table org_memberships enable row level security;
alter table classrooms enable row level security;
alter table classroom_guides enable row level security;
alter table students enable row level security;
alter table student_parents enable row level security;
alter table observations enable row level security;
alter table actions enable row level security;
alter table habits enable row level security;
alter table habit_checkins enable row level security;
alter table materials enable row level security;
alter table work_periods enable row level security;
alter table work_period_items enable row level security;
alter table observation_tags enable row level security;
alter table action_tags enable row level security;

-- Basic policies (scaffold): org isolation by app.current_org_id()
create or replace view app.user_org_roles as
select m.user_id, m.org_id, m.role from org_memberships m;

-- Organizations: super_admins can read/write their org
create policy organizations_read on organizations for select
  using (id = app.current_org_id());
create policy organizations_write on organizations for all
  using (
    id = app.current_org_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = id and r.user_id = app.current_user_id() and r.role = 'super_admin'
    )
  ) with check (id = app.current_org_id());

-- Students: org members can read; admins can write
create policy students_read on students for select
  using (org_id = app.current_org_id());
create policy students_write on students for all
  using (
    org_id = app.current_org_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = students.org_id and r.user_id = app.current_user_id() and r.role in ('super_admin','admin')
    )
  ) with check (org_id = app.current_org_id());

-- Observations: org members can read; guides can insert their own; admins edit
create policy observations_read on observations for select
  using (org_id = app.current_org_id());
create policy observations_insert on observations for insert
  with check (
    org_id = app.current_org_id() and created_by = app.current_user_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = observations.org_id and r.user_id = app.current_user_id()
    )
  );
create policy observations_update on observations for update
  using (
    org_id = app.current_org_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = observations.org_id and r.user_id = app.current_user_id() and r.role in ('super_admin','admin')
    )
  ) with check (org_id = app.current_org_id());

COMMIT;
