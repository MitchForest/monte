import { db } from "@monte/database";
import {
  type TimebackAnalyticsEvent,
  TimebackAnalyticsEventSchema,
  type TimebackAnalyticsFilters,
  TimebackAnalyticsFiltersSchema,
  type TimebackAnalyticsSummary,
  TimebackAnalyticsSummarySchema,
} from "@monte/shared/timeback";

import {
  getCaliperClient,
  isCaliperConfigured,
} from "../../lib/timeback/clients";
import { getAllowedTimebackOrgs } from "../../lib/timeback/orgs";

const DEFAULT_EVENT_LIMIT = 100;

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
  if (!event || typeof event !== "object") {
    return null;
  }

  const candidateBuckets: unknown[] = [];

  const generated = (event as Record<string, unknown>).generated;
  if (generated && typeof generated === "object") {
    const items = (generated as { items?: unknown }).items;
    if (Array.isArray(items)) {
      for (const item of items) {
        candidateBuckets.push(item);
      }
    }
  }

  const object = (event as Record<string, unknown>).object;
  if (object && typeof object === "object") {
    candidateBuckets.push(object);

    const extensions = (object as Record<string, unknown>).extensions;
    if (extensions && typeof extensions === "object") {
      candidateBuckets.push(extensions);

      const metrics = (extensions as Record<string, unknown>).metrics;
      if (metrics && typeof metrics === "object") {
        candidateBuckets.push(metrics);
      }
    }
  }

  for (const bucket of candidateBuckets) {
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

export class TimebackUnavailableError extends Error {
  constructor(message = "TimeBack client is not configured") {
    super(message);
    this.name = "TimebackUnavailableError";
  }
}

const normalizeEvent = (event: unknown): TimebackAnalyticsEvent => {
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

  return TimebackAnalyticsEventSchema.parse({
    id: payload.id,
    type: payload.type,
    action: payload.action,
    eventTime: payload.eventTime,
    storedAt: payload.storedAt,
    sensor: payload.sensor,
    actor: {
      id: actor.id,
      type: typeof actor.type === "string" ? actor.type : null,
    },
    object: {
      id:
        typeof object?.id === "string" && object.id.length > 0
          ? object.id
          : null,
      type:
        typeof object?.type === "string" && object.type.length > 0
          ? object.type
          : null,
      name:
        typeof object?.name === "string" && object.name.length > 0
          ? object.name
          : null,
    },
    xpEarned,
  });
};

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

export async function getStudentXpSummary(
  input: TimebackAnalyticsFilters,
): Promise<TimebackAnalyticsSummary> {
  const filters = TimebackAnalyticsFiltersSchema.parse(input);

  const local = await getLocalSummary(filters);
  if (local) {
    return local;
  }

  if (!isCaliperConfigured()) {
    throw new TimebackUnavailableError();
  }

  const client = getCaliperClient();
  const caliperClient = client ?? null;

  if (!caliperClient) {
    throw new TimebackUnavailableError();
  }

  const summary = await fetchSummaryFromCaliper(caliperClient, filters);
  return summary;
}

async function getLocalSummary(
  filters: TimebackAnalyticsFilters,
): Promise<TimebackAnalyticsSummary | null> {
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
  } satisfies TimebackAnalyticsSummary;

  return TimebackAnalyticsSummarySchema.parse(summary);
}

function buildEventQuery(filters: TimebackAnalyticsFilters) {
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

function buildFactsQuery(filters: TimebackAnalyticsFilters) {
  const allowlist = getAllowedTimebackOrgs();

  let query = db
    .selectFrom("xp_facts_daily")
    .select((eb) =>
      eb.fn.coalesce(eb.fn.sum<number>("xp_total"), eb.val(0)).as("xp"),
    )
    .where("student_id", "=", filters.studentId);

  if (filters.startTime) {
    query = query.where(
      "date_bucket",
      ">=",
      new Date(filters.startTime.slice(0, 10)),
    );
  }

  if (filters.endTime) {
    query = query.where(
      "date_bucket",
      "<=",
      new Date(filters.endTime.slice(0, 10)),
    );
  }

  if (allowlist.size > 0) {
    query = query.where("org_id", "in", Array.from(allowlist));
  }

  return query;
}

async function fetchSummaryFromCaliper(
  caliperClient: NonNullable<ReturnType<typeof getCaliperClient>>,
  filters: TimebackAnalyticsFilters,
): Promise<TimebackAnalyticsSummary> {
  const query: Record<string, unknown> = {
    actorId: filters.studentId,
    limit: filters.limit ?? DEFAULT_EVENT_LIMIT,
  };

  if (filters.startTime) {
    query.startDate = filters.startTime;
  }

  if (filters.endTime) {
    query.endDate = filters.endTime;
  }

  if (filters.eventType) {
    query.eventType = filters.eventType;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }
    searchParams.set(key, String(value));
  }

  const url =
    searchParams.size > 0
      ? `/caliper/events?${searchParams.toString()}`
      : "/caliper/events";

  const response = await caliperClient.fetch(url, { method: "GET" });

  if (!response.ok) {
    throw new Error(`TimeBack Caliper request failed (${response.status})`);
  }

  const payload = (await response.json()) as unknown;

  const events = extractEventsFromResponse(payload).map((rawEvent) =>
    normalizeEvent(rawEvent),
  );

  const totalXp = events.reduce(
    (accumulator: number, analyticsEvent: TimebackAnalyticsEvent) =>
      accumulator + (analyticsEvent.xpEarned ?? 0),
    0,
  );

  const summary = {
    studentId: filters.studentId,
    eventCount: events.length,
    totalXp,
    events,
  } satisfies TimebackAnalyticsSummary;

  return TimebackAnalyticsSummarySchema.parse(summary);
}
