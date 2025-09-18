BEGIN;

create table if not exists workspace_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  code text not null unique,
  email text,
  role role not null default 'teacher',
  created_by uuid not null references users(id) on delete cascade,
  max_uses integer not null default 1,
  used_count integer not null default 0,
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists workspace_invites_org_idx on workspace_invites(org_id);
create index if not exists workspace_invites_code_idx on workspace_invites(code);

alter table workspace_invites enable row level security;

create policy workspace_invites_select on workspace_invites for select
  using (org_id = app.current_org_id());

create policy workspace_invites_manage on workspace_invites for all
  using (
    org_id = app.current_org_id()
    and exists (
      select 1
      from app.user_org_roles r
      where r.org_id = workspace_invites.org_id
        and r.user_id = app.current_user_id()
        and r.role = 'administrator'
    )
  )
  with check (
    org_id = app.current_org_id()
    and exists (
      select 1
      from app.user_org_roles r
      where r.org_id = workspace_invites.org_id
        and r.user_id = app.current_user_id()
        and r.role = 'administrator'
    )
  );

create or replace function app.bootstrap_organization(
  p_user_id uuid,
  p_org_id uuid,
  p_org_name text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := coalesce(p_org_id, gen_random_uuid());
begin
  insert into organizations (id, name)
  values (v_org_id, p_org_name)
  on conflict (id) do nothing;

  insert into org_memberships (id, org_id, user_id, role)
  values (gen_random_uuid(), v_org_id, p_user_id, 'administrator')
  on conflict do nothing;

  return v_org_id;
end;
$$;

create or replace function app.lookup_invite(p_code text)
returns workspace_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv workspace_invites;
begin
  select * into v_inv from workspace_invites where code = p_code;
  if not found then
    raise exception 'INVITE_NOT_FOUND';
  end if;
  if v_inv.expires_at is not null and v_inv.expires_at < now() then
    raise exception 'INVITE_EXPIRED';
  end if;
  if v_inv.max_uses <= v_inv.used_count then
    raise exception 'INVITE_EXHAUSTED';
  end if;
  return v_inv;
end;
$$;

create or replace function app.redeem_invite(p_code text, p_user_id uuid)
returns table(org_id uuid, role role)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv workspace_invites;
begin
  select * into v_inv from workspace_invites where code = p_code for update;
  if not found then
    raise exception 'INVITE_NOT_FOUND';
  end if;
  if v_inv.expires_at is not null and v_inv.expires_at < now() then
    raise exception 'INVITE_EXPIRED';
  end if;
  if v_inv.max_uses <= v_inv.used_count then
    raise exception 'INVITE_EXHAUSTED';
  end if;

  update workspace_invites
    set used_count = used_count + 1,
        redeemed_by = p_user_id,
        redeemed_at = now()
    where id = v_inv.id;

  return query select v_inv.org_id, v_inv.role;
end;
$$;

COMMIT;
