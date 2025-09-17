import { withDbContext } from "@monte/database";
import type { AuthenticatedSession } from "../lib/auth/session";
import { generateSummary } from "../lib/integrations/openai";
import { sendSummaryEmail } from "../lib/integrations/resend";

type SummaryScope = "today" | "this_week" | "custom";

type SummaryRequest = {
  studentId: string;
  scope: SummaryScope;
  from?: string;
  to?: string;
  includeObservations?: boolean;
  includeTasks?: boolean;
  includeLessons?: boolean;
  includeHabits?: boolean;
  manualNotes?: string;
  model?: string;
  sendEmail?: {
    parentIds?: string[];
    emails?: string[];
  };
};

type SummaryTimespan = {
  start: Date;
  end: Date;
};

type StudentRecord = {
  id: string;
  org_id: string;
  full_name: string;
  primary_classroom_id: string | null;
  classroom_name: string | null;
};

type ObservationRecord = {
  content: string;
  created_at: string;
};

type ActionRecord = {
  title: string;
  description: string | null;
  type: "task" | "lesson";
  status: string;
  due_date: string | null;
  created_at: string;
};

type HabitRecord = {
  id: string;
  name: string;
  schedule: string;
};

type HabitEventRecord = {
  habit_id: string;
  date: string;
  checked: boolean;
  created_at: string;
};

type SummaryContext = {
  student: StudentRecord;
  observations: ObservationRecord[];
  actions: ActionRecord[];
  habits: HabitRecord[];
  habitEvents: HabitEventRecord[];
};

type PersistResult = {
  summary: {
    id: string;
    org_id: string;
    student_id: string;
    generated_by_user_id: string | null;
    title: string;
    content: string;
    scope: SummaryScope;
    timespan_start: string | null;
    timespan_end: string | null;
    emailed_at: string | null;
    created_at: string;
  };
  recipients: Array<{ id: string; email: string }>;
  emailsToSend: string[];
};

type CreateSummaryParams = {
  session: AuthenticatedSession;
  payload: SummaryRequest;
};

export type CreateStudentSummaryResult = {
  summary: PersistResult["summary"];
  recipients: PersistResult["recipients"];
};

export function resolveTimespan(
  payload: SummaryRequest,
  reference: Date = new Date(),
): SummaryTimespan {
  const now = reference;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (payload.scope === "today") {
    return { start: todayStart, end: now };
  }
  if (payload.scope === "this_week") {
    const dayOfWeek = todayStart.getDay();
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    return { start: weekStart, end: now };
  }
  if (!(payload.from && payload.to)) {
    throw new Error("Custom scope requires from and to dates");
  }
  return {
    start: new Date(payload.from),
    end: new Date(payload.to),
  };
}

async function loadSummaryContext(
  session: AuthenticatedSession,
  payload: SummaryRequest,
  timespan: SummaryTimespan,
): Promise<SummaryContext> {
  return withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    async (trx) => {
      const student = await trx
        .selectFrom("students")
        .leftJoin(
          "classrooms",
          "classrooms.id",
          "students.primary_classroom_id",
        )
        .select((eb) => [
          "students.id as id",
          "students.org_id as org_id",
          "students.full_name as full_name",
          "students.primary_classroom_id as primary_classroom_id",
          eb.ref("classrooms.name").as("classroom_name"),
        ])
        .where("students.id", "=", payload.studentId)
        .where("students.org_id", "=", session.session.orgId)
        .executeTakeFirst();

      if (!student) {
        throw new Error("Student not found");
      }

      const observationsRaw =
        payload.includeObservations === false
          ? []
          : await trx
              .selectFrom("observations")
              .select(["content", "created_at"])
              .where("student_id", "=", student.id)
              .where("created_at", ">=", timespan.start)
              .where("created_at", "<=", timespan.end)
              .orderBy("created_at", "desc")
              .limit(20)
              .execute();

      const observations: ObservationRecord[] = observationsRaw.map(
        (observation) => ({
          content: observation.content,
          created_at:
            observation.created_at instanceof Date
              ? observation.created_at.toISOString()
              : observation.created_at,
        }),
      );

      const wantsActions =
        payload.includeTasks !== false || payload.includeLessons !== false;

      const actionsRaw = wantsActions
        ? await trx
            .selectFrom("actions")
            .select([
              "title",
              "description",
              "type",
              "status",
              "due_date",
              "created_at",
            ])
            .where("student_id", "=", student.id)
            .where("created_at", ">=", timespan.start)
            .where("created_at", "<=", timespan.end)
            .orderBy("created_at", "desc")
            .limit(20)
            .execute()
        : [];

      const actions: ActionRecord[] = actionsRaw.map((action) => ({
        title: action.title,
        description: action.description,
        type: action.type,
        status: action.status,
        due_date:
          action.due_date instanceof Date
            ? action.due_date.toISOString()
            : action.due_date,
        created_at:
          action.created_at instanceof Date
            ? action.created_at.toISOString()
            : action.created_at,
      }));

      const habits =
        payload.includeHabits === false
          ? []
          : await trx
              .selectFrom("habits")
              .select(["id", "name", "schedule"])
              .where("student_id", "=", student.id)
              .execute();

      const habitEventsRaw =
        payload.includeHabits === false
          ? []
          : await trx
              .selectFrom("habit_checkin_events")
              .select(["habit_id", "date", "checked", "created_at"])
              .where("student_id", "=", student.id)
              .where("date", ">=", timespan.start)
              .where("date", "<=", timespan.end)
              .execute();

      const habitEvents: HabitEventRecord[] = habitEventsRaw.map((event) => ({
        habit_id: event.habit_id,
        date:
          event.date instanceof Date
            ? event.date.toISOString().slice(0, 10)
            : event.date,
        checked: event.checked,
        created_at:
          event.created_at instanceof Date
            ? event.created_at.toISOString()
            : event.created_at,
      }));

      return {
        student,
        observations,
        actions,
        habits,
        habitEvents,
      };
    },
  );
}

function buildPrompt(
  context: SummaryContext,
  payload: SummaryRequest,
  timespan: SummaryTimespan,
): string {
  const { student, observations, actions, habits, habitEvents } = context;
  const promptSections: string[] = [
    "You are an empathetic Montessori guide summarizing a learner's day.",
    `Student: ${student.full_name}`,
    `Classroom: ${student.classroom_name ?? "Unassigned"}`,
    `Timespan: ${timespan.start.toISOString()} to ${timespan.end.toISOString()}`,
  ];

  if (observations.length > 0) {
    promptSections.push(
      "Observations:",
      observations
        .map(
          (observation) =>
            `- [${observation.created_at}] ${observation.content}`,
        )
        .join("\n"),
    );
  }

  const relevantActions = actions.filter((action) => {
    if (action.type === "lesson" && payload.includeLessons === false) {
      return false;
    }
    if (action.type === "task" && payload.includeTasks === false) {
      return false;
    }
    return true;
  });

  if (relevantActions.length > 0) {
    promptSections.push(
      "Actions:",
      relevantActions
        .map((action) => {
          const details = [
            `${action.type.toUpperCase()} ${action.status}`,
            action.due_date ? `Due: ${action.due_date}` : null,
            action.description ?? null,
          ]
            .filter(Boolean)
            .join(" | ");
          return `- [${action.created_at}] ${action.title}${
            details ? ` (${details})` : ""
          }`;
        })
        .join("\n"),
    );
  }

  if (habits.length > 0) {
    const groupedEvents = new Map<string, number>();
    for (const event of habitEvents) {
      if (!event.checked) {
        continue;
      }
      const key = `${event.habit_id}-${event.date}`;
      groupedEvents.set(key, (groupedEvents.get(key) ?? 0) + 1);
    }

    const habitLines: string[] = [];
    for (const habit of habits) {
      const totalChecks = Array.from(groupedEvents.keys()).filter((key) =>
        key.startsWith(`${habit.id}-`),
      ).length;
      habitLines.push(
        `- ${habit.name} (${habit.schedule}) completed ${totalChecks} time(s)`,
      );
    }

    if (habitLines.length > 0) {
      promptSections.push("Habits:", habitLines.join("\n"));
    }
  }

  if (payload.manualNotes) {
    const trimmed = payload.manualNotes.trim();
    if (trimmed.length > 0) {
      promptSections.push("Educator notes:", trimmed);
    }
  }

  promptSections.push(
    "Compose a warm, specific family update with action-oriented suggestions.",
  );

  return promptSections.join("\n\n");
}

async function persistSummary(
  session: AuthenticatedSession,
  payload: SummaryRequest,
  content: string,
  timespan: SummaryTimespan,
  studentName: string,
): Promise<PersistResult> {
  return withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    async (trx) => {
      const summary = await trx
        .insertInto("student_summaries")
        .values({
          id: crypto.randomUUID(),
          org_id: session.session.orgId,
          student_id: payload.studentId,
          generated_by_user_id: session.session.userId,
          title: `${studentName} update`,
          content,
          scope: payload.scope,
          timespan_start: timespan.start.toISOString(),
          timespan_end: timespan.end.toISOString(),
          emailed_at: null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const emailsToSend = new Set<string>();
      const recipients: Array<{ id: string; email: string }> = [];

      if (payload.sendEmail) {
        const selectedParents = payload.sendEmail.parentIds?.length
          ? await trx
              .selectFrom("student_parents")
              .select(["id", "email"])
              .where("student_id", "=", payload.studentId)
              .where("id", "in", payload.sendEmail.parentIds)
              .execute()
          : [];

        for (const parent of selectedParents) {
          if (parent.email && !emailsToSend.has(parent.email)) {
            emailsToSend.add(parent.email);
          }
        }

        for (const email of payload.sendEmail.emails ?? []) {
          const trimmed = email.trim();
          if (trimmed.length > 0 && !emailsToSend.has(trimmed)) {
            emailsToSend.add(trimmed);
          }
        }

        if (emailsToSend.size > 0) {
          const insertedRecipients = await trx
            .insertInto("student_summary_recipients")
            .values(
              Array.from(emailsToSend).map((emailAddress) => ({
                id: crypto.randomUUID(),
                summary_id: summary.id,
                parent_id:
                  selectedParents.find(
                    (parent) => parent.email === emailAddress,
                  )?.id ?? null,
                email: emailAddress,
                delivered_at: null,
                created_at: new Date().toISOString(),
              })),
            )
            .returning(["id", "email"])
            .execute();

          recipients.push(...insertedRecipients);
        }
      }

      const normalizedSummary: PersistResult["summary"] = {
        ...summary,
        scope: payload.scope,
        created_at:
          summary.created_at instanceof Date
            ? summary.created_at.toISOString()
            : summary.created_at,
        timespan_start:
          summary.timespan_start instanceof Date
            ? summary.timespan_start.toISOString()
            : summary.timespan_start,
        timespan_end:
          summary.timespan_end instanceof Date
            ? summary.timespan_end.toISOString()
            : summary.timespan_end,
        emailed_at:
          summary.emailed_at instanceof Date
            ? summary.emailed_at.toISOString()
            : summary.emailed_at,
      };

      return {
        summary: normalizedSummary,
        recipients,
        emailsToSend: Array.from(emailsToSend),
      };
    },
  );
}

async function markSummaryEmailed(
  session: AuthenticatedSession,
  summaryId: string,
): Promise<void> {
  await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    async (trx) => {
      await trx
        .updateTable("student_summaries")
        .set({ emailed_at: new Date().toISOString() })
        .where("id", "=", summaryId)
        .execute();
    },
  );
}

export async function createStudentSummary({
  session,
  payload,
}: CreateSummaryParams): Promise<CreateStudentSummaryResult> {
  const timespan = resolveTimespan(payload);
  const context = await loadSummaryContext(session, payload, timespan);
  const prompt = buildPrompt(context, payload, timespan);
  const content = await generateSummary({
    prompt,
    model: payload.model,
  });

  const { summary, recipients, emailsToSend } = await persistSummary(
    session,
    payload,
    content,
    timespan,
    context.student.full_name,
  );

  if (emailsToSend.length > 0) {
    await sendSummaryEmail({
      to: emailsToSend,
      subject: summary.title,
      html: `<div>${summary.content}</div>`,
      text: summary.content,
    });

    await markSummaryEmailed(session, summary.id);
  }

  return { summary, recipients };
}

export type StudentSummaryRequest = SummaryRequest;
