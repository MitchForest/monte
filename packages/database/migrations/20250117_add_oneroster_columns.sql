BEGIN;

ALTER TABLE organizations
  ADD COLUMN oneroster_sourced_id text UNIQUE;

ALTER TABLE users
  ADD COLUMN oneroster_user_id text;

CREATE INDEX IF NOT EXISTS idx_users_oneroster_user_id
  ON users (oneroster_user_id);

ALTER TABLE org_memberships
  ADD COLUMN oneroster_user_id text,
  ADD COLUMN oneroster_org_id text;

CREATE INDEX IF NOT EXISTS idx_org_memberships_oneroster_user_id
  ON org_memberships (oneroster_user_id);

ALTER TABLE classrooms
  ADD COLUMN oneroster_class_id text,
  ADD COLUMN oneroster_org_id text;

CREATE INDEX IF NOT EXISTS idx_classrooms_oneroster_class_id
  ON classrooms (oneroster_class_id);

ALTER TABLE classroom_guides
  ADD COLUMN oneroster_user_id text;

CREATE INDEX IF NOT EXISTS idx_classroom_guides_oneroster_user_id
  ON classroom_guides (oneroster_user_id);

ALTER TABLE students
  ADD COLUMN oneroster_user_id text,
  ADD COLUMN oneroster_org_id text;

CREATE INDEX IF NOT EXISTS idx_students_oneroster_user_id
  ON students (oneroster_user_id);

ALTER TABLE courses
  ADD COLUMN oneroster_course_id text,
  ADD COLUMN oneroster_org_id text;

CREATE INDEX IF NOT EXISTS idx_courses_oneroster_course_id
  ON courses (oneroster_course_id);

ALTER TABLE actions
  ADD COLUMN oneroster_student_id text,
  ADD COLUMN oneroster_user_id text;

ALTER TABLE observations
  ADD COLUMN oneroster_student_id text,
  ADD COLUMN oneroster_user_id text;

ALTER TABLE habits
  ADD COLUMN oneroster_student_id text;

ALTER TABLE habit_checkins
  ADD COLUMN oneroster_user_id text;

ALTER TABLE work_periods
  ADD COLUMN oneroster_student_id text;

ALTER TABLE student_summaries
  ADD COLUMN oneroster_student_id text;

ALTER TABLE student_summary_recipients
  ADD COLUMN oneroster_user_id text;

ALTER TABLE student_lessons
  ADD COLUMN oneroster_student_id text;

CREATE INDEX IF NOT EXISTS idx_actions_oneroster_student_id
  ON actions (oneroster_student_id);

CREATE INDEX IF NOT EXISTS idx_observations_oneroster_student_id
  ON observations (oneroster_student_id);

CREATE INDEX IF NOT EXISTS idx_habits_oneroster_student_id
  ON habits (oneroster_student_id);

CREATE INDEX IF NOT EXISTS idx_work_periods_oneroster_student_id
  ON work_periods (oneroster_student_id);

CREATE INDEX IF NOT EXISTS idx_student_summaries_oneroster_student_id
  ON student_summaries (oneroster_student_id);

COMMIT;