import { db } from "@monte/database";
import {
  type CourseProgressSummary as PowerpathCourseProgressSummary,
  getCourseProgressSummary,
} from "@monte/timeback-clients/powerpath";
import type { PowerpathClient } from "@monte/timeback-clients/powerpath";
import {
  TimebackCourseProgressResponseSchema,
  type TimebackCourseProgressSummary,
  TimebackCurrentLevelSchema,
  type TimebackCurrentLevel,
  TimebackLessonPlanResponseSchema,
  type TimebackLessonPlan,
  TimebackNextPlacementTestSchema,
  type TimebackNextPlacementTest,
  TimebackPlacementTestsResponseSchema,
  type TimebackPlacementTestsResponse,
  TimebackSubjectProgressSchema,
  type TimebackSubjectProgress,
} from "@monte/shared/timeback";

import {
  getPowerpathClient,
  isPowerpathConfigured,
} from "../../lib/timeback/clients";
import { getAllowedTimebackOrgs } from "../../lib/timeback/orgs";

const POWERPATH_LESSON_PLAN_ENDPOINT = "/powerpath/lessonPlans";
const POWERPATH_PLACEMENT_ENDPOINT = "/powerpath/placement";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

type EnsureStudentOrgResult = {
  orgId: string;
};

async function ensureStudentOrgAllowed(
  studentId: string,
): Promise<EnsureStudentOrgResult> {
  const allowlist = getAllowedTimebackOrgs();
  if (allowlist.size === 0) {
    return { orgId: "" };
  }

  const record = await db
    .selectFrom("students")
    .select(["org_id", "oneroster_org_id"])
    .where("oneroster_user_id", "=", studentId)
    .executeTakeFirst();

  const orgId = record?.oneroster_org_id ?? record?.org_id ?? null;

  if (!orgId || !allowlist.has(orgId)) {
    const error = new TimebackStudentNotAllowedError(studentId);
    throw error;
  }

  return { orgId };
}

async function getConfiguredClient(): Promise<PowerpathClient> {
  const client = getPowerpathClient();
  if (!client || !isPowerpathConfigured()) {
    throw new TimebackPowerpathUnavailableError();
  }
  return client;
}

async function parseJsonResponse<T>(
  response: Response,
  schema: { parse: (input: unknown) => T },
  options?: { allowNotFound?: boolean },
): Promise<T | null> {
  if (response.status === 404 && options?.allowNotFound) {
    return null;
  }

  if (!response.ok) {
    const body = await safeReadJson(response);
    throw new TimebackPowerpathRequestError(response.status, body);
  }

  const payload = await response.json();
  return schema.parse(payload);
}

async function safeReadJson(response: Response): Promise<unknown> {
  try {
    return await response.clone().json();
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unable to parse response" };
  }
}

export class TimebackPowerpathUnavailableError extends Error {
  constructor() {
    super("Timeback PowerPath integration is not configured");
    this.name = "TimebackPowerpathUnavailableError";
  }
}

export class TimebackStudentNotAllowedError extends Error {
  constructor(studentId: string) {
    super(`Student ${studentId} is not part of an allowlisted organization`);
    this.name = "TimebackStudentNotAllowedError";
  }
}

export class TimebackPowerpathRequestError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Timeback PowerPath request failed with status ${status}`);
    this.name = "TimebackPowerpathRequestError";
    this.status = status;
    this.body = body;
  }
}

function toCourseProgressSummary(
  summary: PowerpathCourseProgressSummary,
  input: {
    studentId: string;
    courseId: string;
    lessonId: string | null;
  },
): TimebackCourseProgressSummary {
  const shaped = {
    studentId: input.studentId,
    courseId: input.courseId,
    lessonId: input.lessonId,
    totalLineItems: summary.totalLineItems,
    completedLineItems: summary.completedLineItems,
    outstandingLineItems: summary.outstandingLineItems,
    completionRate: summary.completionRate,
    totalXpAwarded: summary.totalXpAwarded,
    lineItems: summary.lineItems ?? [],
  } satisfies Omit<TimebackCourseProgressSummary, "lineItems"> & {
    lineItems: PowerpathCourseProgressSummary["lineItems"];
  };

  return TimebackCourseProgressResponseSchema.parse({ data: shaped }).data;
}

export async function fetchCourseProgressSummary(args: {
  studentId: string;
  courseId: string;
  lessonId?: string | null;
}): Promise<TimebackCourseProgressSummary> {
  await ensureStudentOrgAllowed(args.studentId);
  const client = await getConfiguredClient();

  const summary = await getCourseProgressSummary({
    client,
    courseId: args.courseId,
    studentId: args.studentId,
    lessonId: args.lessonId ?? undefined,
  });

  return toCourseProgressSummary(summary, {
    studentId: args.studentId,
    courseId: args.courseId,
    lessonId: args.lessonId ?? null,
  });
}

async function postLessonPlan(
  client: PowerpathClient,
  payload: { courseId: string; studentId: string },
): Promise<void> {
  const body = JSON.stringify({
    courseId: payload.courseId,
    userId: payload.studentId,
  });

  const response = await client.fetch(POWERPATH_LESSON_PLAN_ENDPOINT + "/", {
    method: "POST",
    headers: JSON_HEADERS,
    body,
  });

  if (!response.ok) {
    const data = await safeReadJson(response);
    throw new TimebackPowerpathRequestError(response.status, data);
  }
}

async function getLessonPlan(
  client: PowerpathClient,
  payload: { courseId: string; studentId: string },
  options?: { allowNotFound?: boolean },
): Promise<TimebackLessonPlan | null> {
  const path = `${POWERPATH_LESSON_PLAN_ENDPOINT}/${encodeURIComponent(payload.courseId)}/${encodeURIComponent(payload.studentId)}`;

  const response = await client.fetch(path, { method: "GET", headers: JSON_HEADERS });
  const parsed = await parseJsonResponse(
    response,
    TimebackLessonPlanResponseSchema,
    { allowNotFound: options?.allowNotFound },
  );

  return parsed?.data.lessonPlan ?? null;
}

export async function fetchLessonPlanForStudent(args: {
  studentId: string;
  courseId: string;
  createIfMissing?: boolean;
}): Promise<TimebackLessonPlan | null> {
  await ensureStudentOrgAllowed(args.studentId);
  const client = await getConfiguredClient();

  let lessonPlan = await getLessonPlan(
    client,
    { courseId: args.courseId, studentId: args.studentId },
    { allowNotFound: true },
  );

  if (!lessonPlan && args.createIfMissing) {
    await postLessonPlan(client, {
      courseId: args.courseId,
      studentId: args.studentId,
    });
    lessonPlan = await getLessonPlan(client, {
      courseId: args.courseId,
      studentId: args.studentId,
    });
  }

  return lessonPlan;
}

type PlacementQuery = {
  student: string;
  subject: string | null;
};

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
  schema: { parse: (input: unknown) => T },
  options?: { allowNotFound?: boolean },
): Promise<T | null> {
  const client = await getConfiguredClient();
  const response = await client.fetch(path, { method: "GET", headers: JSON_HEADERS });
  return parseJsonResponse(response, schema, options);
}

export async function fetchSubjectProgress(args: {
  studentId: string;
  subject: string | null;
}): Promise<TimebackSubjectProgress | null> {
  await ensureStudentOrgAllowed(args.studentId);
  const query = buildPlacementQuery({
    student: args.studentId,
    subject: args.subject,
  });

  const path = `${POWERPATH_PLACEMENT_ENDPOINT}/getSubjectProgress${query}`;
  const response = await powerpathGet(path, TimebackSubjectProgressSchema, {
    allowNotFound: true,
  });

  return response;
}

export async function fetchNextPlacementTest(args: {
  studentId: string;
  subject: string | null;
}): Promise<TimebackNextPlacementTest | null> {
  await ensureStudentOrgAllowed(args.studentId);
  const query = buildPlacementQuery({
    student: args.studentId,
    subject: args.subject,
  });

  const path = `${POWERPATH_PLACEMENT_ENDPOINT}/getNextPlacementTest${query}`;
  const response = await powerpathGet(path, TimebackNextPlacementTestSchema, {
    allowNotFound: true,
  });

  return response;
}

export async function fetchCurrentPlacementLevel(args: {
  studentId: string;
  subject: string | null;
}): Promise<TimebackCurrentLevel | null> {
  await ensureStudentOrgAllowed(args.studentId);
  const query = buildPlacementQuery({
    student: args.studentId,
    subject: args.subject,
  });

  const path = `${POWERPATH_PLACEMENT_ENDPOINT}/getCurrentLevel${query}`;
  const response = await powerpathGet(path, TimebackCurrentLevelSchema, {
    allowNotFound: true,
  });

  return response;
}

export async function fetchPlacementTests(args: {
  studentId: string;
  subject: string | null;
}): Promise<TimebackPlacementTestsResponse | null> {
  await ensureStudentOrgAllowed(args.studentId);
  const query = buildPlacementQuery({
    student: args.studentId,
    subject: args.subject,
  });

  const path = `${POWERPATH_PLACEMENT_ENDPOINT}/getAllPlacementTests${query}`;
  const response = await powerpathGet(
    path,
    TimebackPlacementTestsResponseSchema,
    {
      allowNotFound: true,
    },
  );

  return response;
}
