create table if not exists timeback_events (
  event_id text primary key,
  event_time timestamptz not null,
  event_type text not null,
  action text not null,
  actor_user_id text not null,
  course_id text,
  class_id text,
  org_id text not null,
  xp_earned integer not null default 0,
  timespent_active_seconds integer not null default 0,
  payload jsonb not null,
  ingested_at timestamptz not null default now()
);

create index if not exists idx_timeback_events_org_time
  on timeback_events (org_id, event_time);

create index if not exists idx_timeback_events_actor_time
  on timeback_events (actor_user_id, event_time);

create table if not exists xp_facts_daily (
  student_id text not null,
  org_id text not null,
  date_bucket date not null,
  xp_total integer not null default 0,
  last_event_at timestamptz not null,
  primary key (student_id, org_id, date_bucket)
);

create index if not exists idx_xp_facts_org_date
  on xp_facts_daily (org_id, date_bucket);
