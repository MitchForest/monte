BEGIN;

create table if not exists sync_state (
  entity text primary key,
  cursor text,
  last_hash text,
  last_run_at timestamptz,
  success boolean,
  error_message text,
  updated_at timestamptz not null default now()
);

create table if not exists timeback_events_dlq (
  id uuid primary key default gen_random_uuid(),
  event_id text,
  payload jsonb not null,
  error_message text not null,
  retries integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_students_oneroster_user_id
  on students(oneroster_user_id)
  where oneroster_user_id is not null;

create unique index if not exists uq_courses_oneroster_course_id
  on courses(oneroster_course_id)
  where oneroster_course_id is not null;

create unique index if not exists uq_classrooms_oneroster_class_id
  on classrooms(oneroster_class_id)
  where oneroster_class_id is not null;

create unique index if not exists uq_org_memberships_oneroster
  on org_memberships(oneroster_user_id, oneroster_org_id)
  where oneroster_user_id is not null
  and oneroster_org_id is not null;

COMMIT;
