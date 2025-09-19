import crypto from "node:crypto";
import type { Database } from "@monte/database";
import { getDb, withDbContext } from "@monte/database";
import { logger } from "@monte/shared";
import { addDays, subDays } from "date-fns";
import type { Kysely } from "kysely";
import { sql } from "kysely";
import { loadApiEnv } from "../src/lib/env";

const COURSES = [
  {
    id: "3e9e0b41-2a78-4f2e-8f18-4040d1bb470d",
    name: "Monte Reading Expedition",
    description: "Literacy adventures focused on comprehension and vocabulary.",
    subject: { name: "Reading", color: "#8B5CF6" },
    onerosterCourseId: "monte-reading-course",
    lessons: [
      {
        id: "61c109f4-2446-4bf9-9c56-47c822a9e507",
        title: "Story Sequencing",
        description: "Arrange story beats and retell key points.",
        durationMinutes: 20,
        orderIndex: 1,
      },
      {
        id: "a3d7de93-dbef-4f5f-b947-1fbc1b08a3c2",
        title: "Context Clue Challenge",
        description: "Infer word meaning from context.",
        durationMinutes: 15,
        orderIndex: 2,
      },
    ],
  },
  {
    id: "5f2974b0-746d-4f6d-87dd-8fe1e57f42ce",
    name: "Monte Math Lab",
    description: "Hands-on problem solving and numeracy practice.",
    subject: { name: "Math", color: "#34D399" },
    onerosterCourseId: "monte-math-course",
    lessons: [
      {
        id: "d1390f66-5b29-4b78-8bea-94a897a796ec",
        title: "Fraction Art Studio",
        description: "Represent and compare fractions visually.",
        durationMinutes: 25,
        orderIndex: 1,
      },
      {
        id: "8b9f27ab-1d6f-4e9a-a7ce-006f3a90d8fa",
        title: "Geometry Scavenger Hunt",
        description: "Identify shapes in the environment.",
        durationMinutes: 30,
        orderIndex: 2,
      },
    ],
  },
];

const XP_EVENTS_PER_STUDENT = 3;

async function main() {
  const env = loadApiEnv();
  const orgSourcedId = env.MONTE_ONEROSTER_ORG_ID ?? "monte-staging-school";

  const db = getDb();

  const organization = await db
    .selectFrom("organizations")
    .select(["id", "name"])
    .where("oneroster_sourced_id", "=", orgSourcedId)
    .executeTakeFirst();

  if (!organization) {
    throw new Error(
      `Organization with oneroster_sourced_id ${orgSourcedId} not found. Run roster sync first.`,
    );
  }

  const adminRecord = await db
    .selectFrom("org_memberships")
    .innerJoin("users", "users.id", "org_memberships.user_id")
    .select(["org_memberships.user_id as user_id", "users.email as email"])
    .where("org_memberships.org_id", "=", organization.id)
    .where("org_memberships.role", "=", "administrator")
    .executeTakeFirst();

  if (!adminRecord) {
    throw new Error(
      `No administrator membership found for org ${organization.name}.`,
    );
  }

  const { user_id: adminId } = adminRecord;

  const subjectIdByName = new Map<string, string>();

  await withDbContext(
    { userId: adminId, orgId: organization.id },
    async (trx) => {
      for (const course of COURSES) {
        const subjectId = await ensureSubject(
          trx,
          organization.id,
          course.subject,
          subjectIdByName,
        );
        await ensureCourse(trx, organization.id, course, subjectId);
        for (const lesson of course.lessons) {
          await ensureCourseLesson(trx, organization.id, course.id, lesson);
        }
      }
    },
  );

  const students = await db
    .selectFrom("students")
    .select(["id", "full_name", "oneroster_user_id", "org_id"])
    .where("org_id", "=", organization.id)
    .execute();

  if (students.length === 0) {
    throw new Error(
      `No students found for org ${organization.name}. Run roster sync first.`,
    );
  }

  const courseLessonMap = await loadCourseLessons(organization.id);

  await seedStudentLessons(organization.id, adminId, students, courseLessonMap);
  await seedHabits(organization.id, adminId, students);
  await seedActions(organization.id, adminId, students);
  await seedObservations(organization.id, adminId, students);
  await seedParents(organization.id, adminId, students);
  await seedXpEvents(organization.id, adminId, students, courseLessonMap);

  logger.info("Seeded course progress and XP for Monte org", {
    organizationId: organization.id,
    studentCount: students.length,
  });
}

async function ensureSubject(
  trx: Kysely<Database>,
  orgId: string,
  subjectSeed: { name: string; color: string },
  cache: Map<string, string>,
): Promise<string> {
  const cached = cache.get(subjectSeed.name);
  if (cached) {
    return cached;
  }

  const existing = await trx
    .selectFrom("subjects")
    .select(["id"])
    .where("org_id", "=", orgId)
    .where("name", "=", subjectSeed.name)
    .executeTakeFirst();

  if (existing) {
    cache.set(subjectSeed.name, existing.id);
    return existing.id;
  }

  const id = crypto.randomUUID();
  await trx
    .insertInto("subjects")
    .values({
      id,
      org_id: orgId,
      name: subjectSeed.name,
      color: subjectSeed.color,
    })
    .execute();
  cache.set(subjectSeed.name, id);
  return id;
}

async function ensureCourse(
  trx: Kysely<Database>,
  orgId: string,
  courseSeed: (typeof COURSES)[number],
  subjectId: string,
): Promise<void> {
  const existing = await trx
    .selectFrom("courses")
    .select(["id", "name"])
    .where("id", "=", courseSeed.id)
    .executeTakeFirst();

  if (existing) {
    await trx
      .updateTable("courses")
      .set({
        name: courseSeed.name,
        description: courseSeed.description,
        subject_id: subjectId,
        oneroster_org_id: orgId,
        oneroster_course_id: courseSeed.onerosterCourseId,
      })
      .where("id", "=", courseSeed.id)
      .execute();
    return;
  }

  await trx
    .insertInto("courses")
    .values({
      id: courseSeed.id,
      org_id: orgId,
      name: courseSeed.name,
      description: courseSeed.description ?? null,
      subject_id: subjectId,
      oneroster_org_id: orgId,
      oneroster_course_id: courseSeed.onerosterCourseId,
    })
    .execute();
}

async function ensureCourseLesson(
  trx: Kysely<Database>,
  orgId: string,
  courseId: string,
  lesson: {
    id: string;
    title: string;
    description?: string;
    durationMinutes?: number;
    orderIndex: number;
  },
): Promise<void> {
  const existing = await trx
    .selectFrom("course_lessons")
    .select(["id"])
    .where("id", "=", lesson.id)
    .executeTakeFirst();

  if (existing) {
    await trx
      .updateTable("course_lessons")
      .set({
        title: lesson.title,
        description: lesson.description ?? null,
        duration_minutes: lesson.durationMinutes ?? null,
        order_index: lesson.orderIndex,
      })
      .where("id", "=", lesson.id)
      .execute();
    return;
  }

  await trx
    .insertInto("course_lessons")
    .values({
      id: lesson.id,
      org_id: orgId,
      course_id: courseId,
      title: lesson.title,
      description: lesson.description ?? null,
      duration_minutes: lesson.durationMinutes ?? null,
      order_index: lesson.orderIndex,
    })
    .execute();
}

async function loadCourseLessons(orgId: string) {
  const db = getDb();
  const lessons = await db
    .selectFrom("course_lessons")
    .select(["id", "course_id", "title"])
    .where("org_id", "=", orgId)
    .execute();

  const byCourse = new Map<string, Array<{ id: string; title: string }>>();
  for (const lesson of lessons) {
    const list = byCourse.get(lesson.course_id) ?? [];
    list.push({ id: lesson.id, title: lesson.title });
    byCourse.set(lesson.course_id, list);
  }
  return byCourse;
}

async function seedStudentLessons(
  orgId: string,
  adminId: string,
  students: Array<{
    id: string;
    full_name: string;
    oneroster_user_id: string | null;
  }>,
  lessonMap: Map<string, Array<{ id: string; title: string }>>,
) {
  const context = { userId: adminId, orgId } as const;
  await withDbContext(context, async (trx) => {
    for (const student of students) {
      for (const [_courseId, lessons] of lessonMap.entries()) {
        for (const [index, lesson] of lessons.entries()) {
          const existing = await trx
            .selectFrom("student_lessons")
            .select(["id"])
            .where("student_id", "=", student.id)
            .where("course_lesson_id", "=", lesson.id)
            .executeTakeFirst();

          if (existing) {
            continue;
          }

          const status = index === 0 ? "completed" : "scheduled";
          const now = new Date();
          const scheduledFor =
            status === "scheduled"
              ? addDays(now, index + 1)
              : subDays(now, index + 1);
          const completedAt =
            status === "completed"
              ? subDays(now, index + 1).toISOString()
              : null;

          await trx
            .insertInto("student_lessons")
            .values({
              id: crypto.randomUUID(),
              org_id: orgId,
              student_id: student.id,
              course_lesson_id: lesson.id,
              custom_title: null,
              notes: null,
              status,
              scheduled_for: scheduledFor.toISOString(),
              completed_at: completedAt,
              assigned_by_user_id: adminId,
              rescheduled_from_id: null,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              oneroster_student_id: student.oneroster_user_id,
            })
            .execute();
        }
      }
    }
  });
}

async function seedHabits(
  orgId: string,
  adminId: string,
  students: Array<{
    id: string;
    full_name: string;
    oneroster_user_id: string | null;
  }>,
) {
  const context = { userId: adminId, orgId } as const;
  const habitTemplates = [
    { name: "Morning Work Cycle", schedule: "daily" },
    { name: "Grace & Courtesy Practice", schedule: "weekdays" },
  ] as const;

  await withDbContext(context, async (trx) => {
    for (const student of students) {
      for (const template of habitTemplates) {
        const existing = await trx
          .selectFrom("habits")
          .select(["id"])
          .where("student_id", "=", student.id)
          .where("name", "=", template.name)
          .executeTakeFirst();

        let habitId: string;
        if (existing) {
          habitId = existing.id;
        } else {
          habitId = crypto.randomUUID();
          await trx
            .insertInto("habits")
            .values({
              id: habitId,
              org_id: orgId,
              student_id: student.id,
              name: template.name,
              schedule: template.schedule,
              active: true,
              created_at: new Date().toISOString(),
              oneroster_student_id: student.oneroster_user_id,
            })
            .execute();
        }

        for (let dayOffset = 0; dayOffset < 3; dayOffset += 1) {
          const checkinDate = subDays(new Date(), dayOffset)
            .toISOString()
            .slice(0, 10);
          await trx
            .insertInto("habit_checkins")
            .values({
              id: crypto.randomUUID(),
              habit_id: habitId,
              date: checkinDate,
              checked_by: adminId,
              created_at: new Date().toISOString(),
            })
            .onConflict((oc) =>
              oc.columns(["habit_id", "date"]).doUpdateSet((eb) => ({
                checked_by: eb.ref("excluded.checked_by"),
              })),
            )
            .execute();
        }
      }
    }
  });
}

async function seedActions(
  orgId: string,
  adminId: string,
  students: Array<{
    id: string;
    full_name: string;
    oneroster_user_id: string | null;
  }>,
) {
  const context = { userId: adminId, orgId } as const;
  await withDbContext(context, async (trx) => {
    for (const student of students) {
      const templates = [
        {
          title: `Check-in with ${student.full_name}`,
          type: "task" as const,
          description: "Review progress and note any needs.",
          due_date: addDays(new Date(), 1).toISOString().slice(0, 10),
        },
        {
          title: `Present new material to ${student.full_name}`,
          type: "lesson" as const,
          description: "Introduce next Montessori work.",
          due_date: addDays(new Date(), 3).toISOString().slice(0, 10),
        },
      ];

      for (const template of templates) {
        const existing = await trx
          .selectFrom("actions")
          .select(["id"])
          .where("org_id", "=", orgId)
          .where("student_id", "=", student.id)
          .where("title", "=", template.title)
          .executeTakeFirst();

        if (existing) {
          continue;
        }

        await trx
          .insertInto("actions")
          .values({
            id: crypto.randomUUID(),
            org_id: orgId,
            student_id: student.id,
            type: template.type,
            title: template.title,
            description: template.description,
            assigned_to_user_id: adminId,
            due_date: template.due_date,
            status: "pending",
            created_by: adminId,
            created_at: new Date().toISOString(),
            oneroster_student_id: student.oneroster_user_id,
          })
          .execute();
      }
    }
  });
}

async function seedObservations(
  orgId: string,
  adminId: string,
  students: Array<{
    id: string;
    full_name: string;
    oneroster_user_id: string | null;
  }>,
) {
  const context = { userId: adminId, orgId } as const;
  await withDbContext(context, async (trx) => {
    for (const student of students) {
      const content = `Monte observation: ${student.full_name} focused on practical life work today.`;
      const existing = await trx
        .selectFrom("observations")
        .select(["id"])
        .where("org_id", "=", orgId)
        .where("student_id", "=", student.id)
        .where("content", "=", content)
        .executeTakeFirst();

      if (existing) {
        continue;
      }

      await trx
        .insertInto("observations")
        .values({
          id: crypto.randomUUID(),
          org_id: orgId,
          student_id: student.id,
          created_by: adminId,
          content,
          audio_url: null,
          created_at: new Date().toISOString(),
          oneroster_student_id: student.oneroster_user_id,
          oneroster_user_id: student.oneroster_user_id,
        })
        .execute();
    }
  });
}

async function seedParents(
  orgId: string,
  adminId: string,
  students: Array<{
    id: string;
    full_name: string;
    oneroster_user_id: string | null;
  }>,
) {
  const context = { userId: adminId, orgId } as const;
  await withDbContext(context, async (trx) => {
    for (const student of students) {
      const slug = slugify(student.full_name);
      const email = `${slug || student.id}-parent@demo.monte`;
      const existing = await trx
        .selectFrom("student_parents")
        .select(["id"])
        .where("student_id", "=", student.id)
        .where("email", "=", email)
        .executeTakeFirst();

      if (existing) {
        continue;
      }

      await trx
        .insertInto("student_parents")
        .values({
          id: crypto.randomUUID(),
          student_id: student.id,
          name: `Parent of ${student.full_name}`,
          email,
          phone: "555-0100",
          relation: "Guardian",
          preferred_contact_method: "email",
          created_at: new Date().toISOString(),
        })
        .execute();
    }
  });
}

async function seedXpEvents(
  orgId: string,
  _adminId: string,
  students: Array<{
    id: string;
    full_name: string;
    oneroster_user_id: string | null;
  }>,
  lessonMap: Map<string, Array<{ id: string; title: string }>>,
) {
  const trx = getDb();
  const now = new Date();
  let insertedEvents = 0;
  logger.info("Seed Monte XP seeding lesson map", {
    courseCount: lessonMap.size,
  });

  for (const student of students) {
    if (!student.oneroster_user_id) {
      continue;
    }

    let xpBase = 40;
    for (const courseId of lessonMap.keys()) {
      const courseSeed = COURSES.find((course) => course.id === courseId);
      if (!courseSeed) {
        continue;
      }

      for (let i = 0; i < XP_EVENTS_PER_STUDENT; i += 1) {
        const eventTime = subDays(now, i);
        const courseUrl = `https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/${courseSeed.onerosterCourseId}`;
        const payload = {
          id: `urn:uuid:${crypto.randomUUID()}`,
          eventTime: eventTime.toISOString(),
          profile: "TimebackProfile",
          type: "ActivityEvent",
          actor: {
            id: `https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/${student.oneroster_user_id}`,
            type: "TimebackUser",
            email: `${student.oneroster_user_id}@example.com`,
          },
          action: "Completed",
          object: {
            id: `${courseUrl}/component-resources/${courseSeed.onerosterCourseId}-activity-${i + 1}`,
            type: "TimebackActivityContext",
            subject: courseSeed.subject.name,
            app: { name: "Monte Studio" },
            activity: { name: `Progress Mission ${i + 1}` },
            course: { id: courseUrl, name: courseSeed.name },
            process: false,
          },
          generated: {
            id: `urn:uuid:${crypto.randomUUID()}`,
            type: "TimebackActivityMetricsCollection",
            items: [
              { type: "xpEarned", value: xpBase },
              { type: "totalQuestions", value: 10 + i },
              { type: "correctQuestions", value: 8 + i },
              { type: "masteredUnits", value: i },
            ],
          },
        } as const;

        await trx
          .insertInto("timeback_events")
          .values({
            event_id: payload.id,
            event_time: payload.eventTime,
            event_type: payload.type,
            action: payload.action,
            actor_user_id: student.oneroster_user_id,
            course_id: courseSeed.onerosterCourseId,
            class_id: null,
            org_id: orgId,
            xp_earned: xpBase,
            timespent_active_seconds: 900,
            payload:
              payload as unknown as Database["timeback_events"]["payload"],
          })
          .onConflict((oc) => oc.column("event_id").doNothing())
          .execute();

        insertedEvents += 1;

        await trx
          .insertInto("xp_facts_daily")
          .values({
            student_id: student.oneroster_user_id,
            org_id: orgId,
            date_bucket: payload.eventTime.slice(0, 10),
            xp_total: xpBase,
            last_event_at: payload.eventTime,
          })
          .onConflict((oc) =>
            oc
              .columns(["student_id", "org_id", "date_bucket"])
              .doUpdateSet(({ ref }) => ({
                xp_total: sql`${ref("xp_facts_daily.xp_total")} + excluded.xp_total`,
                last_event_at: sql`GREATEST(${ref("xp_facts_daily.last_event_at")}, excluded.last_event_at)`,
              })),
          )
          .execute();

        xpBase += 10;
      }
    }
  }

  logger.info("Seed Monte XP events created", { eventCount: insertedEvents });
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

main().catch((error) => {
  logger.error("seed-monte-progress failed", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
