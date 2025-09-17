BEGIN;

create type lesson_instance_status as enum ('unscheduled','scheduled','completed');

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists course_lessons (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  duration_minutes integer,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists student_lessons (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  course_lesson_id uuid references course_lessons(id) on delete set null,
  custom_title text,
  notes text,
  status lesson_instance_status not null default 'unscheduled',
  scheduled_for date,
  completed_at timestamptz,
  assigned_by_user_id uuid references users(id) on delete set null,
  rescheduled_from_id uuid references student_lessons(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists student_summaries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  generated_by_user_id uuid references users(id) on delete set null,
  title text not null,
  content text not null,
  scope text not null,
  timespan_start date,
  timespan_end date,
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists student_summary_recipients (
  id uuid primary key default gen_random_uuid(),
  summary_id uuid not null references student_summaries(id) on delete cascade,
  parent_id uuid references student_parents(id) on delete set null,
  email text not null,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists habit_checkin_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  habit_id uuid not null references habits(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  checked boolean not null default true,
  source text not null default 'manual',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index if not exists idx_subjects_org on subjects(org_id);
create index if not exists idx_courses_org on courses(org_id);
create index if not exists idx_course_lessons_course on course_lessons(course_id);
create index if not exists idx_student_lessons_student on student_lessons(student_id);
create index if not exists idx_student_lessons_status on student_lessons(status);
create index if not exists idx_student_summaries_student on student_summaries(student_id);
create index if not exists idx_habit_checkin_events_habit_date on habit_checkin_events(habit_id, date desc);

alter table subjects enable row level security;
alter table courses enable row level security;
alter table course_lessons enable row level security;
alter table student_lessons enable row level security;
alter table student_summaries enable row level security;
alter table student_summary_recipients enable row level security;
alter table habit_checkin_events enable row level security;

create policy subjects_select on subjects for select
  using (org_id = app.current_org_id());
create policy subjects_modify on subjects for all
  using (
    org_id = app.current_org_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = subjects.org_id and r.user_id = app.current_user_id()
    )
  ) with check (org_id = app.current_org_id());

create policy courses_select on courses for select
  using (org_id = app.current_org_id());
create policy courses_modify on courses for all
  using (
    org_id = app.current_org_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = courses.org_id and r.user_id = app.current_user_id()
    )
  ) with check (org_id = app.current_org_id());

create policy course_lessons_select on course_lessons for select
  using (org_id = app.current_org_id());
create policy course_lessons_modify on course_lessons for all
  using (
    org_id = app.current_org_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = course_lessons.org_id and r.user_id = app.current_user_id()
    )
  ) with check (org_id = app.current_org_id());

create policy student_lessons_select on student_lessons for select
  using (org_id = app.current_org_id());
create policy student_lessons_modify on student_lessons for all
  using (
    org_id = app.current_org_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = student_lessons.org_id and r.user_id = app.current_user_id()
    )
  ) with check (org_id = app.current_org_id());

create policy student_summaries_select on student_summaries for select
  using (org_id = app.current_org_id());
create policy student_summaries_modify on student_summaries for all
  using (
    org_id = app.current_org_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = student_summaries.org_id and r.user_id = app.current_user_id()
    )
  ) with check (org_id = app.current_org_id());

create policy student_summary_recipients_select on student_summary_recipients for select
  using (
    exists (
      select 1
      from student_summaries ss
      where ss.id = student_summary_recipients.summary_id
        and ss.org_id = app.current_org_id()
    )
  );
create policy student_summary_recipients_modify on student_summary_recipients for all
  using (
    exists (
      select 1
      from student_summaries ss
      where ss.id = student_summary_recipients.summary_id
        and ss.org_id = app.current_org_id()
    )
  ) with check (
    exists (
      select 1
      from student_summaries ss
      where ss.id = student_summary_recipients.summary_id
        and ss.org_id = app.current_org_id()
    )
  );

create policy habit_checkin_events_select on habit_checkin_events for select
  using (org_id = app.current_org_id());
create policy habit_checkin_events_insert on habit_checkin_events for insert
  with check (org_id = app.current_org_id());
create policy habit_checkin_events_update on habit_checkin_events for update
  using (org_id = app.current_org_id())
  with check (org_id = app.current_org_id());

COMMIT;
