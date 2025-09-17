import type {
  TimebackAnalyticsEvent,
  TimebackAnalyticsFilters,
  TimebackAnalyticsSummary,
} from "@monte/shared/timeback";
import {
  TimebackAnalyticsEventSchema,
  TimebackAnalyticsFiltersSchema,
  TimebackAnalyticsSummarySchema,
} from "@monte/shared/timeback";
import type { QueryEventsOptions } from "@monte/timeback-sdk";

import { getTimebackClient } from "../../lib/timeback/client";

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

export async function getStudentXpSummary(
  input: TimebackAnalyticsFilters,
): Promise<TimebackAnalyticsSummary> {
  const filters = TimebackAnalyticsFiltersSchema.parse(input);
  const client = getTimebackClient();
  const caliperClient = client?.caliper ?? null;

  if (!client || !caliperClient) {
    throw new TimebackUnavailableError();
  }

  const queryFilters: NonNullable<QueryEventsOptions["filters"]> = {
    actorId: filters.studentId,
    limit: String(filters.limit ?? DEFAULT_EVENT_LIMIT),
  };

  if (filters.startTime) {
    queryFilters.startTime = filters.startTime;
  }

  if (filters.endTime) {
    queryFilters.endTime = filters.endTime;
  }

  if (filters.eventType) {
    queryFilters.eventType = filters.eventType;
  }

  const response = await caliperClient.queryEvents({
    filters: queryFilters,
  });

  const events: TimebackAnalyticsEvent[] = Array.isArray(response.events)
    ? response.events.map((rawEvent: unknown) => normalizeEvent(rawEvent))
    : [];

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
