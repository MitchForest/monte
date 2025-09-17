BEGIN;

-- Drop the view that depends on the role column (CASCADE to drop dependent objects)
drop view if exists app.user_org_roles cascade;

-- Create new enum type
create type role_new as enum ('administrator','teacher','student','parent');

-- Update the column to use new enum
alter table org_memberships
  alter column role type role_new
  using (
    case role
      when 'super_admin' then 'administrator'
      when 'admin' then 'administrator'
      when 'guide' then 'teacher'
      else 'student'
    end
  )::role_new;

-- Drop old enum and rename new one
drop type role;
alter type role_new rename to role;

-- Recreate the view with the new enum
create or replace view app.user_org_roles as
select m.user_id, m.org_id, m.role from org_memberships m;

-- Update existing policies to use the new role values
-- Update classrooms_manage policy
drop policy if exists classrooms_manage on classrooms;
create policy classrooms_manage on classrooms for all
  using (
    org_id = app.current_org_id()
    and exists (
      select 1
      from app.user_org_roles r
      where r.org_id = classrooms.org_id
        and r.user_id = app.current_user_id()
        and r.role = 'administrator'
    )
  )
  with check (org_id = app.current_org_id());

-- Update classroom_guides_manage policy
drop policy if exists classroom_guides_manage on classroom_guides;
create policy classroom_guides_manage on classroom_guides for all
  using (
    exists (
      select 1
      from classrooms c
      where c.id = classroom_guides.classroom_id
        and c.org_id = app.current_org_id()
    )
    and exists (
      select 1
      from app.user_org_roles r
      where r.org_id = app.current_org_id()
        and r.user_id = app.current_user_id()
        and r.role = 'administrator'
    )
  )
  with check (
    exists (
      select 1
      from classrooms c
      where c.id = classroom_guides.classroom_id
        and c.org_id = app.current_org_id()
    )
  );

-- Update actions_update policy
drop policy if exists actions_update on actions;
create policy actions_update on actions for update
  using (
    org_id = app.current_org_id()
    and exists (
      select 1
      from app.user_org_roles r
      where r.org_id = actions.org_id
        and r.user_id = app.current_user_id()
        and r.role = 'administrator'
    )
  )
  with check (org_id = app.current_org_id());

-- Update organizations_write policy
drop policy if exists organizations_write on organizations;
create policy organizations_write on organizations for all
  using (
    id = app.current_org_id() and exists (
      select 1 from app.user_org_roles r
      where r.org_id = id and r.user_id = app.current_user_id() and r.role = 'administrator'
    )
  )
  with check (id = app.current_org_id());

COMMIT;