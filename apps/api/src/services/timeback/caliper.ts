import { db } from "@monte/database";
import type { JsonValue } from "kysely";
import { oneroster } from "@monte/timeback-clients";
import { sql } from "kysely";
import { z } from "zod";

import { getOneRosterClient } from "../../lib/timeback/clients";
import { isOrgAllowed } from "../../lib/timeback/orgs";

const EVENT_CACHE_TTL_MS = 10 * 60 * 1000;

const CaliperGeneratedItemSchema = z.object({
  type: z.string(),
  value: z.union([z.number(), z.string()]).optional(),
});

const CaliperEventSchema = z
  .object({
    id: z.string(),
    eventTime: z.string(),
    type: z.string(),
    action: z.string().optional(),
    actor: z.object({
      id: z.string(),
    }),
    object: z
      .object({
        id: z.string().optional(),
        course: z
          .object({
            id: z.string(),
          })
          .optional(),
        extensions: z.unknown().optional(),
      })
      .optional(),
    generated: z
      .object({
        items: z.array(CaliperGeneratedItemSchema).optional(),
      })
      .optional(),
    target: z.unknown().optional(),
    edApp: z.unknown().optional(),
    group: z.unknown().optional(),
  })
  .passthrough();

export type CaliperEvent = z.infer<typeof CaliperEventSchema>;

export type CaliperIngestResult = {
  stored: number;
  dropped: Record<string, number>;
  errors: Array<{
    eventId?: string;
    reason: string;
    message?: string;
  }>;
};

type CacheEntry = {
  orgId: string | null;
  expiresAt: number;
};

const courseOrgCache = new Map<string, CacheEntry>();
const userOrgCache = new Map<string, CacheEntry>();

export async function ingestCaliperEvents(
  payloads: unknown[],
): Promise<CaliperIngestResult> {
  const result: CaliperIngestResult = {
    stored: 0,
    dropped: {},
    errors: [],
  };

  if (payloads.length === 0) {
    return result;
  }

  for (const raw of payloads) {
    const parsed = CaliperEventSchema.safeParse(raw);
    if (!parsed.success) {
      registerDrop(result, "parse_error", undefined, parsed.error.message);
      continue;
    }

    const event = parsed.data;
    const eventId = normalizeEventId(event.id);
    if (!eventId) {
      registerDrop(result, "invalid_event_id", event.id);
      continue;
    }

    const eventTime = new Date(event.eventTime);
    if (Number.isNaN(eventTime.getTime())) {
      registerDrop(result, "invalid_event_time", eventId);
      continue;
    }

    const actorId = extractSourcedId(event.actor?.id);
    if (!actorId) {
      registerDrop(result, "missing_actor", eventId);
      continue;
    }

    const courseId = extractSourcedId(event.object?.course?.id);
    const classId = extractSourcedId(event.object?.id);

    const xpEarned = extractXp(event.generated?.items ?? []);
    const activeSeconds = extractActiveSeconds(event.generated?.items ?? []);

    let orgId: string | null = null;

    if (courseId) {
      orgId = await resolveCourseOrgId(courseId);
    }

    if (!orgId) {
      orgId = await resolveUserOrgId(actorId);
    }

    if (!orgId) {
      registerDrop(result, "org_unresolved", eventId);
      continue;
    }

    if (!isOrgAllowed(orgId)) {
      registerDrop(result, "org_not_allowed", eventId);
      continue;
    }

    try {
      await db.transaction().execute(async (trx) => {
        await trx
          .insertInto("timeback_events")
          .values({
            event_id: eventId,
            event_time: eventTime.toISOString(),
            event_type: event.type,
            action: event.action ?? "unknown",
            actor_user_id: actorId,
            course_id: courseId ?? null,
            class_id: classId ?? null,
            org_id: orgId,
            xp_earned: xpEarned,
            timespent_active_seconds: activeSeconds,
            payload: event as JsonValue,
          })
          .onConflict((oc) => oc.column("event_id").doNothing())
          .execute();

        if (xpEarned !== 0) {
          const dateBucket = eventTime.toISOString().slice(0, 10);
          await trx
            .insertInto("xp_facts_daily")
            .values({
              student_id: actorId,
              org_id: orgId,
              date_bucket: dateBucket,
              xp_total: xpEarned,
              last_event_at: eventTime.toISOString(),
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
        }
      });
      result.stored += 1;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to store Caliper event";
      registerDrop(result, "db_error", eventId, message, true);
    }
  }

  return result;
}

function normalizeEventId(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.startsWith("urn:uuid:")) {
    return trimmed.slice("urn:uuid:".length);
  }
  return trimmed;
}

function extractSourcedId(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parts = trimmed.split(/[/:]/).filter((part) => part.length > 0);
  if (parts.length === 0) {
    return trimmed;
  }
  return parts[parts.length - 1];
}

function extractXp(
  items: Array<z.infer<typeof CaliperGeneratedItemSchema>>,
): number {
  return items
    .filter((item) => item.type.toLowerCase() === "xpearned")
    .reduce((total, item) => total + Number(item.value ?? 0), 0);
}

function extractActiveSeconds(
  items: Array<z.infer<typeof CaliperGeneratedItemSchema>>,
): number {
  const active = items.find((item) => item.type.toLowerCase() === "active");
  if (!active) {
    return 0;
  }
  return Number(active.value ?? 0);
}

async function resolveCourseOrgId(courseId: string): Promise<string | null> {
  const cached = courseOrgCache.get(courseId);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.orgId;
  }

  const local = await db
    .selectFrom("courses")
    .select(["oneroster_org_id", "org_id"])
    .where("oneroster_course_id", "=", courseId)
    .executeTakeFirst();

  let orgId = local?.oneroster_org_id ?? local?.org_id ?? null;

  if (!orgId) {
    const client = getOneRosterClient();
    if (!client) {
      courseOrgCache.set(courseId, {
        orgId: null,
        expiresAt: now + EVENT_CACHE_TTL_MS,
      });
      return null;
    }

    try {
      const detail = await oneroster.getCourse(client, courseId);
      orgId = detail.course?.org?.sourcedId ?? null;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown OneRoster error";
      process.stderr.write(
        `Failed to resolve course org for ${courseId}: ${message}\n`,
      );
    }
  }

  courseOrgCache.set(courseId, {
    orgId,
    expiresAt: now + EVENT_CACHE_TTL_MS,
  });
  return orgId;
}

async function resolveUserOrgId(userId: string): Promise<string | null> {
  const cached = userOrgCache.get(userId);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.orgId;
  }

  const local = await db
    .selectFrom("students")
    .select(["oneroster_org_id"])
    .where("oneroster_user_id", "=", userId)
    .executeTakeFirst();

  let orgId = local?.oneroster_org_id ?? null;

  if (!orgId) {
    const client = getOneRosterClient();
    if (!client) {
      userOrgCache.set(userId, {
        orgId: null,
        expiresAt: now + EVENT_CACHE_TTL_MS,
      });
      return null;
    }

    try {
      const detail = await oneroster.getUser(client, userId);
      const userRoles = normalizeRoles(detail.user?.roles);
      const studentRole = userRoles.find((role) => role?.role === "student");
      orgId =
        studentRole?.org?.sourcedId ??
        detail.user?.primaryOrg?.sourcedId ??
        null;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown OneRoster error";
      process.stderr.write(
        `Failed to resolve user org for ${userId}: ${message}\n`,
      );
    }
  }

  userOrgCache.set(userId, {
    orgId,
    expiresAt: now + EVENT_CACHE_TTL_MS,
  });

  return orgId;
}

type OneRosterRole =
  | {
      role?: string;
      org?: {
        sourcedId?: string;
      } | null;
    }
  | null
  | undefined;

function normalizeRoles(roles: unknown): OneRosterRole[] {
  if (!roles) {
    return [];
  }
  if (Array.isArray(roles)) {
    return roles as OneRosterRole[];
  }
  return [];
}

function registerDrop(
  result: CaliperIngestResult,
  reason: string,
  eventId?: string,
  message?: string,
  isError = false,
): void {
  result.dropped[reason] = (result.dropped[reason] ?? 0) + 1;
  if (isError || message) {
    result.errors.push({ eventId, reason, message });
  }
}
