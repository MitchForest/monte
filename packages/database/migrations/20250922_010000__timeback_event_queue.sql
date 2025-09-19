BEGIN;

create table if not exists timeback_event_queue (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  payload jsonb not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  scheduled_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_timeback_event_queue_event_id
  on timeback_event_queue(event_id);

create index if not exists idx_timeback_event_queue_status_next_attempt
  on timeback_event_queue(status, next_attempt_at);

create table if not exists sync_metrics (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  value integer not null,
  recorded_at timestamptz not null default now(),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sync_metrics_entity_recorded_at
  on sync_metrics(entity, recorded_at desc);

COMMIT;
