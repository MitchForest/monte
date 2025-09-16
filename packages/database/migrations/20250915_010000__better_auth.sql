BEGIN;

alter table users
  add column if not exists email_verified boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create policy users_manage on users for all
  using (true)
  with check (true);

create table if not exists auth_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider_id text not null,
  account_id text not null,
  access_token text,
  refresh_token text,
  id_token text,
  scope text,
  password text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, account_id)
);

create table if not exists auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

create index if not exists idx_auth_sessions_user on auth_sessions(user_id);
create index if not exists idx_auth_sessions_org on auth_sessions(org_id);

create table if not exists auth_verifications (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  value text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_auth_verifications_identifier on auth_verifications(identifier);

create policy org_memberships_read on org_memberships for select
  using (user_id = app.current_user_id());

create policy org_memberships_manage on org_memberships for all
  using (
    user_id = app.current_user_id() and
    (app.current_org_id() is null or org_id = app.current_org_id())
  )
  with check (
    user_id = app.current_user_id() and
    (app.current_org_id() is null or org_id = app.current_org_id())
  );

COMMIT;
