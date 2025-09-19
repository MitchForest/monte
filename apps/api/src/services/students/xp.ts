import { db } from "@monte/database";
import {
  type StudentXpEvent,
  StudentXpEventSchema,
  type StudentXpMetric,
  StudentXpMetricSchema,
  type StudentXpSummary,
  StudentXpSummarySchema,
} from "@monte/shared/student";
import { caliper } from "@monte/timeback-clients";
import { z } from "zod";

import {
  getCaliperClient,
  isCaliperConfigured,
} from "../../lib/timeback/clients";
import { getAllowedTimebackOrgs } from "../../lib/timeback/orgs";

const DEFAULT_EVENT_LIMIT = 100;

const StudentXpFiltersSchema = z.object({
  studentId: z.string().min(1),
  startTime: z.string().datetime({ offset: true }).optional(),
  endTime: z.string().datetime({ offset: true }).optional(),
  eventType: z.string().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export type StudentXpFilters = z.infer<typeof StudentXpFiltersSchema>;

function toDateBucket(value: string): Date {
  const bucket = value.slice(0, 10);
  return new Date(`${bucket}T00:00:00Z`);
}

const coerceNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const extractXpEarned = (event: unknown): number | null => {
  const buckets = collectMetricBuckets(event);

  for (const bucket of buckets) {
    if (!bucket || typeof bucket !== "object") {
      continue;
    }

    const record = bucket as Record<string, unknown>;

    if (record.type === "xpEarned" && "value" in record) {
      const xp = coerceNumber(record.value);
      if (xp !== null) {
        return xp;
      }
    }

    const directXpCandidates = [record.xpEarned, record.xp, record.points];

    for (const candidate of directXpCandidates) {
      const xp = coerceNumber(candidate);
      if (xp !== null) {
        return xp;
      }
    }
  }

  return null;
};

const extractMetrics = (event: unknown): StudentXpMetric[] => {
  const buckets = collectMetricBuckets(event);
  const metrics: StudentXpMetric[] = [];

  for (const bucket of buckets) {
    if (!bucket || typeof bucket !== "object") {
      continue;
    }

    const record = bucket as Record<string, unknown>;
    const type = record.type;
    const value = coerceNumber(record.value);

    if (typeof type === "string" && value !== null) {
      metrics.push(StudentXpMetricSchema.parse({ type, value }));
    }
  }

  return metrics;
};

function collectMetricBuckets(event: unknown): unknown[] {
  const buckets: unknown[] = [];

  if (!event || typeof event !== "object") {
    return buckets;
  }

  const record = event as Record<string, unknown>;

  const generated = record.generated;
  if (generated && typeof generated === "object") {
    const items = (generated as { items?: unknown }).items;
    if (Array.isArray(items)) {
      buckets.push(...items);
    }
  }

  const object = record.object;
  if (object && typeof object === "object") {
    buckets.push(object);

    const extensions = (object as Record<string, unknown>).extensions;
    if (extensions && typeof extensions === "object") {
      buckets.push(extensions);

      const metrics = (extensions as Record<string, unknown>).metrics;
      if (Array.isArray(metrics)) {
        buckets.push(...metrics);
      } else if (metrics && typeof metrics === "object") {
        buckets.push(metrics);
      }
    }
  }

  return buckets;
}

export class StudentXpUnavailableError extends Error {
  constructor(message = "Caliper client is not configured") {
    super(message);
    this.name = "StudentXpUnavailableError";
  }
}

const normalizeEvent = (event: unknown): StudentXpEvent => {
  if (!event || typeof event !== "object") {
    throw new Error("Invalid Caliper event payload");
  }

  const payload = event as Record<string, unknown>;
  const actor = payload.actor as Record<string, unknown> | undefined;
  const object = payload.object as Record<string, unknown> | undefined;

  if (!actor || typeof actor.id !== "string") {
    throw new Error("Caliper event is missing actor information");
  }

  const xpEarned = extractXpEarned(event);
  const metrics = extractMetrics(event);

  const subject =
    typeof object?.subject === "string" && object.subject.length > 0
      ? object.subject
      : null;

  const activity =
    object && typeof object === "object"
      ? ((object as Record<string, unknown>).activity as
          | Record<string, unknown>
          | undefined)
      : undefined;

  const app =
    object && typeof object === "object"
      ? ((object as Record<string, unknown>).app as
          | Record<string, unknown>
          | undefined)
      : undefined;

  const course =
    object && typeof object === "object"
      ? ((object as Record<string, unknown>).course as
          | Record<string, unknown>
          | undefined)
      : undefined;

  return StudentXpEventSchema.parse({
    id: payload.id,
    occurredAt: payload.eventTime,
    activityTitle:
      typeof object?.name === "string" && object.name.length > 0
        ? object.name
        : typeof activity?.name === "string" && activity.name.length > 0
          ? activity.name
          : typeof payload.type === "string"
            ? payload.type
            : null,
    resourceUri:
      typeof object?.id === "string" && object.id.length > 0 ? object.id : null,
    subject,
    app: typeof app?.name === "string" && app.name.length > 0 ? app.name : null,
    course:
      course && (course.id || course.name)
        ? {
            id:
              typeof course.id === "string" && course.id.length > 0
                ? course.id
                : null,
            name:
              typeof course.name === "string" && course.name.length > 0
                ? course.name
                : null,
          }
        : undefined,
    xpEarned,
    metrics: metrics.length > 0 ? metrics : undefined,
  });
};

export async function getStudentXpSummary(
  input: StudentXpFilters,
): Promise<StudentXpSummary> {
  const filters = StudentXpFiltersSchema.parse(input);

  const local = await getLocalSummary(filters);
  if (local) {
    return local;
  }

  if (!isCaliperConfigured()) {
    throw new StudentXpUnavailableError();
  }

  const client = getCaliperClient();
  if (!client) {
    throw new StudentXpUnavailableError();
  }

  return fetchSummaryFromCaliper(client, filters);
}

async function getLocalSummary(
  filters: StudentXpFilters,
): Promise<StudentXpSummary | null> {
  const limit = filters.limit ?? DEFAULT_EVENT_LIMIT;

  const baseQuery = buildEventQuery(filters);

  const countRow = await baseQuery
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();

  const totalEvents = Number(countRow?.count ?? 0);

  if (totalEvents === 0) {
    return null;
  }

  const eventRows = await buildEventQuery(filters)
    .select(["payload"])
    .orderBy("event_time", "desc")
    .limit(limit)
    .execute();

  const events = eventRows.map((row) => normalizeEvent(row.payload));

  const xpRow = await buildFactsQuery(filters).executeTakeFirst();
  const totalXp = Number(xpRow?.xp ?? 0);

  const summary = {
    studentId: filters.studentId,
    eventCount: totalEvents,
    totalXp,
    events,
  } satisfies StudentXpSummary;

  return StudentXpSummarySchema.parse(summary);
}

function buildEventQuery(filters: StudentXpFilters) {
  const allowlist = getAllowedTimebackOrgs();

  let query = db
    .selectFrom("timeback_events")
    .where("actor_user_id", "=", filters.studentId);

  if (filters.startTime) {
    query = query.where("event_time", ">=", new Date(filters.startTime));
  }

  if (filters.endTime) {
    query = query.where("event_time", "<=", new Date(filters.endTime));
  }

  if (filters.eventType) {
    query = query.where("event_type", "=", filters.eventType);
  }

  if (allowlist.size > 0) {
    query = query.where("org_id", "in", Array.from(allowlist));
  }

  return query;
}

function buildFactsQuery(filters: StudentXpFilters) {
  const allowlist = getAllowedTimebackOrgs();

  let query = db
    .selectFrom("xp_facts_daily")
    .select((eb) =>
      eb.fn.coalesce(eb.fn.sum<number>("xp_total"), eb.val(0)).as("xp"),
    )
    .where("student_id", "=", filters.studentId);

  if (filters.startTime) {
    const startBucket = toDateBucket(filters.startTime);
    query = query.where("date_bucket", ">=", startBucket);
  }

  if (filters.endTime) {
    const endBucket = toDateBucket(filters.endTime);
    query = query.where("date_bucket", "<=", endBucket);
  }

  if (allowlist.size > 0) {
    query = query.where("org_id", "in", Array.from(allowlist));
  }

  return query;
}

async function fetchSummaryFromCaliper(
  caliperClient: NonNullable<ReturnType<typeof getCaliperClient>>,
  filters: StudentXpFilters,
): Promise<StudentXpSummary> {
  const payload = await caliper.listCaliperEvents(caliperClient, {
    actorId: filters.studentId,
    startDate: filters.startTime,
    endDate: filters.endTime,
    eventType: filters.eventType,
    limit: filters.limit ?? DEFAULT_EVENT_LIMIT,
  });

  const events = extractEventsFromResponse(payload).map((rawEvent) =>
    normalizeEvent(rawEvent),
  );

  const totalXp = events.reduce(
    (accumulator: number, event) => accumulator + (event.xpEarned ?? 0),
    0,
  );

  const summary = {
    studentId: filters.studentId,
    eventCount: events.length,
    totalXp,
    events,
  } satisfies StudentXpSummary;

  return StudentXpSummarySchema.parse(summary);
}

function extractEventsFromResponse(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.events)) {
    return record.events;
  }

  const data = record.data;
  if (data && typeof data === "object") {
    const events = (data as { events?: unknown }).events;
    if (Array.isArray(events)) {
      return events;
    }
  }

  return [];
}
