BEGIN;

alter table auth_sessions
  alter column org_id drop not null;

COMMIT;
