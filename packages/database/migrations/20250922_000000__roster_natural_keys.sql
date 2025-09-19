BEGIN;

-- Ensure OneRoster identifiers are authoritative across roster-owned tables
UPDATE students
SET oneroster_user_id = id::text
WHERE oneroster_user_id IS NULL;

UPDATE students
SET oneroster_org_id = COALESCE(oneroster_org_id, org_id::text)
WHERE oneroster_org_id IS NULL;

ALTER TABLE students
  ALTER COLUMN oneroster_user_id SET NOT NULL;

ALTER TABLE students
  ALTER COLUMN oneroster_org_id SET NOT NULL;

ALTER TABLE students
  ADD CONSTRAINT students_oneroster_user_id_unique
    UNIQUE (oneroster_user_id);

UPDATE courses
SET oneroster_course_id = id::text
WHERE oneroster_course_id IS NULL;

UPDATE courses
SET oneroster_org_id = COALESCE(oneroster_org_id, org_id::text)
WHERE oneroster_org_id IS NULL;

ALTER TABLE courses
  ALTER COLUMN oneroster_course_id SET NOT NULL;

ALTER TABLE courses
  ALTER COLUMN oneroster_org_id SET NOT NULL;

ALTER TABLE courses
  ADD CONSTRAINT courses_oneroster_course_id_unique
    UNIQUE (oneroster_course_id);

UPDATE classrooms
SET oneroster_class_id = id::text,
    oneroster_org_id = COALESCE(oneroster_org_id, org_id::text)
WHERE oneroster_class_id IS NULL;

ALTER TABLE classrooms
  ALTER COLUMN oneroster_class_id SET NOT NULL;

ALTER TABLE classrooms
  ALTER COLUMN oneroster_org_id SET NOT NULL;

ALTER TABLE classrooms
  ADD CONSTRAINT classrooms_oneroster_class_id_unique
    UNIQUE (oneroster_class_id);

UPDATE org_memberships
SET oneroster_user_id = user_id::text,
    oneroster_org_id = COALESCE(oneroster_org_id, org_id::text)
WHERE oneroster_user_id IS NULL;

ALTER TABLE org_memberships
  ALTER COLUMN oneroster_user_id SET NOT NULL,
  ALTER COLUMN oneroster_org_id SET NOT NULL;

ALTER TABLE org_memberships
  ADD CONSTRAINT org_memberships_oneroster_user_org_unique
    UNIQUE (oneroster_user_id, oneroster_org_id);

-- Normalize guardian links to sourced ids
ALTER TABLE student_guardians
  ADD COLUMN IF NOT EXISTS student_sourced_id text;

UPDATE student_guardians sg
SET student_sourced_id = s.oneroster_user_id
FROM students s
WHERE sg.student_id = s.id
  AND sg.student_sourced_id IS NULL;

ALTER TABLE student_guardians
  ALTER COLUMN student_sourced_id SET NOT NULL;

ALTER TABLE student_guardians
  ADD CONSTRAINT student_guardians_student_sourced_fk
    FOREIGN KEY (student_sourced_id)
    REFERENCES students(oneroster_user_id)
    ON DELETE CASCADE;

ALTER TABLE student_guardians
  DROP CONSTRAINT IF EXISTS student_guardians_pkey;

ALTER TABLE student_guardians
  ADD CONSTRAINT student_guardians_pkey
    PRIMARY KEY (student_sourced_id, guardian_id);

ALTER TABLE student_guardians
  DROP COLUMN IF EXISTS student_id;

-- Enforce soft delete contract consistently
ALTER TABLE students
  ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE classrooms
  ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE courses
  ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE org_memberships
  ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE student_parents
  ALTER COLUMN status SET DEFAULT 'active';

COMMIT;
