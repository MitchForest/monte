BEGIN;

create policy classrooms_read on classrooms for select
  using (org_id = app.current_org_id());

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

create policy classroom_guides_read on classroom_guides for select
  using (
    exists (
      select 1
      from classrooms c
      where c.id = classroom_guides.classroom_id
        and c.org_id = app.current_org_id()
    )
  );

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

create policy actions_read on actions for select
  using (org_id = app.current_org_id());

create policy actions_insert on actions for insert
  with check (
    org_id = app.current_org_id()
    and created_by = app.current_user_id()
    and exists (
      select 1
      from app.user_org_roles r
      where r.org_id = actions.org_id
        and r.user_id = app.current_user_id()
    )
  );

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

create policy habits_read on habits for select
  using (org_id = app.current_org_id());

create policy habits_manage on habits for all
  using (
    org_id = app.current_org_id()
    and exists (
      select 1
      from app.user_org_roles r
      where r.org_id = habits.org_id
        and r.user_id = app.current_user_id()
    )
  )
  with check (org_id = app.current_org_id());

create policy habit_checkins_read on habit_checkins for select
  using (
    exists (
      select 1
      from habits h
      where h.id = habit_checkins.habit_id
        and h.org_id = app.current_org_id()
    )
  );

create policy habit_checkins_manage on habit_checkins for all
  using (
    exists (
      select 1
      from habits h
      where h.id = habit_checkins.habit_id
        and h.org_id = app.current_org_id()
    )
  )
  with check (
    exists (
      select 1
      from habits h
      where h.id = habit_checkins.habit_id
        and h.org_id = app.current_org_id()
    )
    and (habit_checkins.checked_by is null or habit_checkins.checked_by = app.current_user_id())
  );

COMMIT;
