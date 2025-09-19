-- Track roster entity changes for audit/history
create table if not exists roster_audit (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  entity_id text,
  change_type text not null,
  payload jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);

create index if not exists roster_audit_entity_idx on roster_audit(entity);
create index if not exists roster_audit_entity_id_idx on roster_audit(entity_id);
create index if not exists roster_audit_occ_at_idx on roster_audit(occurred_at);

create or replace function log_roster_change() returns trigger as $$
declare
  data jsonb;
  identifier text;
begin
  if (TG_OP = 'DELETE') then
    data := to_jsonb(OLD);
  else
    data := to_jsonb(NEW);
  end if;

  identifier := data ->> 'id';

  insert into roster_audit(entity, entity_id, change_type, payload)
  values (TG_TABLE_NAME, identifier, lower(TG_OP), data);

  if (TG_OP = 'DELETE') then
    return OLD;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Apply audit triggers to core roster tables
drop trigger if exists students_roster_audit_trg on students;
create trigger students_roster_audit_trg
  after insert or update or delete on students
  for each row execute function log_roster_change();

drop trigger if exists student_parents_roster_audit_trg on student_parents;
create trigger student_parents_roster_audit_trg
  after insert or update or delete on student_parents
  for each row execute function log_roster_change();

drop trigger if exists guardians_roster_audit_trg on guardians;
create trigger guardians_roster_audit_trg
  after insert or update or delete on guardians
  for each row execute function log_roster_change();

drop trigger if exists student_guardians_roster_audit_trg on student_guardians;
create trigger student_guardians_roster_audit_trg
  after insert or update or delete on student_guardians
  for each row execute function log_roster_change();

drop trigger if exists org_memberships_roster_audit_trg on org_memberships;
create trigger org_memberships_roster_audit_trg
  after insert or update or delete on org_memberships
  for each row execute function log_roster_change();

drop trigger if exists classrooms_roster_audit_trg on classrooms;
create trigger classrooms_roster_audit_trg
  after insert or update or delete on classrooms
  for each row execute function log_roster_change();

drop trigger if exists courses_roster_audit_trg on courses;
create trigger courses_roster_audit_trg
  after insert or update or delete on courses
  for each row execute function log_roster_change();
