import { db } from "@monte/database";
import {
  type StudentNextPlacement,
  StudentNextPlacementResponseSchema,
  type StudentPlacementCourseProgress,
  StudentPlacementCourseProgressSchema,
  type StudentPlacementLevel,
  StudentPlacementLevelResponseSchema,
  StudentPlacementProgressResponseSchema,
  type StudentPlacementTestAttempt,
  StudentPlacementTestsResponseSchema,
} from "@monte/shared/student";
import { z } from "zod";

import {
  getPowerpathClient,
  isPowerpathConfigured,
} from "../../lib/timeback/clients";
import { getAllowedTimebackOrgs } from "../../lib/timeback/orgs";

const POWERPATH_PLACEMENT_ENDPOINT = "/powerpath/placement";
const JSON_HEADERS = {
  Accept: "application/json",
};

const PowerpathSubjectCourseSchema = z.object({
  courseCode: z.string().nullable().optional(),
  sourcedId: z.string().nullable().optional(),
  title: z.string().optional().default(""),
  subjects: z.array(z.string()).nullable().optional(),
});

const PowerpathSubjectProgressEntrySchema = z.object({
  course: PowerpathSubjectCourseSchema.optional(),
  completedLessons: z.number().optional(),
  totalLessons: z.number().optional(),
  totalXpEarned: z.number().optional(),
  totalAttainableXp: z.number().optional(),
  testOutLessonId: z.string().nullable().optional(),
  hasUsedTestOut: z.boolean().optional(),
});

const PowerpathSubjectProgressSchema = z.object({
  success: z.boolean().optional(),
  progress: z.array(PowerpathSubjectProgressEntrySchema).optional(),
});

const PowerpathPlacementLevelSchema = z.object({
  success: z.boolean().optional(),
  gradeLevel: z.string().nullable().optional(),
  onboarded: z.boolean().optional(),
});

const PowerpathNextPlacementSchema = z.object({
  success: z.boolean().optional(),
  lesson: z.string().nullable().optional(),
  gradeLevel: z.string().nullable().optional(),
  exhaustedTests: z.boolean().optional(),
});

const PowerpathPlacementTestSchema = z.object({
  component_resources: z
    .object({
      title: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  assessment_results: z
    .array(
      z.object({
        score: z.number().nullable().optional(),
        scoreStatus: z.string().nullable().optional(),
      }),
    )
    .nullable()
    .optional(),
});

const PowerpathPlacementTestsSchema = z.object({
  success: z.boolean().optional(),
  placementTests: z.array(PowerpathPlacementTestSchema).optional(),
});

type PlacementQuery = {
  student: string;
  subject: string | null;
};

export class StudentPlacementUnavailableError extends Error {
  constructor() {
    super("PowerPath integration is not configured");
    this.name = "StudentPlacementUnavailableError";
  }
}

export class StudentPlacementNotAllowedError extends Error {
  constructor(studentId: string) {
    super(`Student ${studentId} is not part of an allowlisted organization`);
    this.name = "StudentPlacementNotAllowedError";
  }
}

export class StudentPlacementRequestError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`PowerPath request failed with status ${status}`);
    this.name = "StudentPlacementRequestError";
    this.status = status;
    this.body = body;
  }
}

async function ensureStudentOrgAllowed(studentId: string): Promise<void> {
  const allowlist = getAllowedTimebackOrgs();
  if (allowlist.size === 0) {
    return;
  }

  const record = await db
    .selectFrom("students")
    .select(["org_id", "oneroster_org_id"])
    .where("oneroster_user_id", "=", studentId)
    .executeTakeFirst();

  const orgId = record?.oneroster_org_id ?? record?.org_id ?? null;
  if (!orgId || !allowlist.has(orgId)) {
    throw new StudentPlacementNotAllowedError(studentId);
  }
}

async function getClient() {
  const client = getPowerpathClient();
  if (!client || !isPowerpathConfigured()) {
    throw new StudentPlacementUnavailableError();
  }
  return client;
}

function buildPlacementQuery(params: PlacementQuery): string {
  const searchParams = new URLSearchParams();
  searchParams.set("student", params.student);
  if (params.subject) {
    searchParams.set("subject", params.subject);
  }
  const queryString = searchParams.toString();
  return queryString.length > 0 ? `?${queryString}` : "";
}

async function powerpathGet<T>(
  path: string,
  options: { allowNotFound?: boolean } = {},
): Promise<T | null> {
  const client = await getClient();
  const response = await client.fetch(path, {
    method: "GET",
    headers: JSON_HEADERS,
  });

  if (response.status === 404 && options.allowNotFound) {
    return null;
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.clone().json();
    } catch {
      // ignore parse error
    }
    throw new StudentPlacementRequestError(response.status, body);
  }

  return (await response.json()) as T;
}

function toCourseProgressList(
  payload: unknown,
): StudentPlacementCourseProgress[] {
  const parsed = PowerpathSubjectProgressSchema.parse(payload);
  const courses = parsed.progress ?? [];
  const mapped = courses.map((entry) =>
    StudentPlacementCourseProgressSchema.parse({
      courseId: entry.course?.sourcedId ?? null,
      courseTitle: entry.course?.title ?? "Course",
      courseCode: entry.course?.courseCode ?? null,
      subject: entry.course?.subjects?.[0] ?? null,
      completedLessons: entry.completedLessons ?? 0,
      totalLessons: entry.totalLessons ?? 0,
      totalXpEarned: entry.totalXpEarned ?? 0,
      totalXpAvailable: entry.totalAttainableXp ?? null,
      masteredViaTestOut: Boolean(entry.hasUsedTestOut),
    }),
  );

  return StudentPlacementProgressResponseSchema.parse({
    data: { courses: mapped },
  }).data.courses;
}

function toPlacementLevel(payload: unknown): StudentPlacementLevel | null {
  const parsed = PowerpathPlacementLevelSchema.parse(payload);
  if (!parsed) {
    return null;
  }

  return StudentPlacementLevelResponseSchema.parse({
    data: {
      currentLevel: {
        gradeLevel: parsed.gradeLevel ?? null,
        onboarded: Boolean(parsed.onboarded),
      },
    },
  }).data.currentLevel;
}

function toNextPlacement(payload: unknown): StudentNextPlacement | null {
  const parsed = PowerpathNextPlacementSchema.parse(payload);
  if (!parsed) {
    return null;
  }

  return StudentNextPlacementResponseSchema.parse({
    data: {
      nextPlacement: {
        lessonTitle: parsed.lesson ?? null,
        gradeLevel: parsed.gradeLevel ?? null,
        exhausted: Boolean(parsed.exhaustedTests),
      },
    },
  }).data.nextPlacement;
}

function toPlacementTests(payload: unknown): StudentPlacementTestAttempt[] {
  const parsed = PowerpathPlacementTestsSchema.parse(payload);
  const tests = parsed.placementTests ?? [];

  const mapped = tests.map((test) => {
    const result = test.assessment_results?.[0] ?? null;
    return {
      title: test.component_resources?.title ?? "Placement test",
      score: result?.score ?? null,
      status: result?.scoreStatus ?? "unknown",
    } satisfies StudentPlacementTestAttempt;
  });

  return StudentPlacementTestsResponseSchema.parse({
    data: { tests: mapped },
  }).data.tests;
}

export async function getStudentPlacementProgress(args: {
  studentId: string;
  subject?: string | null;
}): Promise<StudentPlacementCourseProgress[]> {
  await ensureStudentOrgAllowed(args.studentId);

  const query = buildPlacementQuery({
    student: args.studentId,
    subject: args.subject ?? null,
  });

  const payload = await powerpathGet<unknown>(
    `${POWERPATH_PLACEMENT_ENDPOINT}/getSubjectProgress${query}`,
    { allowNotFound: true },
  );

  if (!payload) {
    return [];
  }

  return toCourseProgressList(payload);
}

export async function getStudentPlacementLevel(args: {
  studentId: string;
  subject?: string | null;
}): Promise<StudentPlacementLevel | null> {
  await ensureStudentOrgAllowed(args.studentId);

  const query = buildPlacementQuery({
    student: args.studentId,
    subject: args.subject ?? null,
  });

  const payload = await powerpathGet<unknown>(
    `${POWERPATH_PLACEMENT_ENDPOINT}/getCurrentLevel${query}`,
    { allowNotFound: true },
  );

  if (!payload) {
    return null;
  }

  return toPlacementLevel(payload);
}

export async function getStudentNextPlacement(args: {
  studentId: string;
  subject?: string | null;
}): Promise<StudentNextPlacement | null> {
  await ensureStudentOrgAllowed(args.studentId);

  const query = buildPlacementQuery({
    student: args.studentId,
    subject: args.subject ?? null,
  });

  const payload = await powerpathGet<unknown>(
    `${POWERPATH_PLACEMENT_ENDPOINT}/getNextPlacementTest${query}`,
    { allowNotFound: true },
  );

  if (!payload) {
    return null;
  }

  return toNextPlacement(payload);
}

export async function getStudentPlacementTests(args: {
  studentId: string;
  subject?: string | null;
}): Promise<StudentPlacementTestAttempt[]> {
  await ensureStudentOrgAllowed(args.studentId);

  const query = buildPlacementQuery({
    student: args.studentId,
    subject: args.subject ?? null,
  });

  const payload = await powerpathGet<unknown>(
    `${POWERPATH_PLACEMENT_ENDPOINT}/getAllPlacementTests${query}`,
    { allowNotFound: true },
  );

  if (!payload) {
    return [];
  }

  return toPlacementTests(payload);
}
