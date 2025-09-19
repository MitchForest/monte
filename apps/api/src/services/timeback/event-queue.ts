import type { Json, TimebackEventQueue } from "@monte/database";
import { getDb } from "@monte/database";
import { logger } from "@monte/shared";
import { sql } from "kysely";

import {
  releaseAdvisoryLock,
  TIMEBACK_QUEUE_LOCK_KEY,
  tryAcquireAdvisoryLock,
} from "../../lib/timeback/locks";

export async function tryAcquireQueueLock(): Promise<boolean> {
  return tryAcquireAdvisoryLock(TIMEBACK_QUEUE_LOCK_KEY);
}

export async function releaseQueueLock(): Promise<void> {
  await releaseAdvisoryLock(TIMEBACK_QUEUE_LOCK_KEY);
}

export async function claimPendingEvents(
  batchSize: number,
  now: Date = new Date(),
): Promise<TimebackEventQueue[]> {
  const nowIso = now.toISOString();
  const result = await sql<TimebackEventQueue>`
    UPDATE timeback_event_queue
    SET status = 'processing',
        updated_at = ${nowIso}
    WHERE ctid IN (
      SELECT ctid
      FROM timeback_event_queue
      WHERE status = 'pending'
        AND next_attempt_at <= ${nowIso}
      ORDER BY scheduled_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${batchSize}
    )
    RETURNING *
  `.execute(getDb());

  return result.rows;
}

export async function enqueueQueueEvent(
  eventId: string,
  payload: Json,
  now: Date = new Date(),
): Promise<void> {
  const nowIso = now.toISOString();

  await getDb()
    .insertInto("timeback_event_queue")
    .values({
      event_id: eventId,
      payload,
      status: "pending",
      attempts: 0,
      next_attempt_at: nowIso,
      scheduled_at: nowIso,
      updated_at: nowIso,
    })
    .onConflict((oc) =>
      oc.column("event_id").doUpdateSet(({ val }) => ({
        payload: val(payload),
        status: val("pending"),
        attempts: val(0),
        next_attempt_at: val(nowIso),
        last_error: val(null),
        updated_at: val(nowIso),
      })),
    )
    .execute();
}

export async function enqueueQueueDlq(
  eventId: string | null,
  payload: Json,
  reason: string,
  message?: string,
): Promise<void> {
  const error = message ? `${reason}: ${message}` : reason;
  try {
    await getDb()
      .insertInto("timeback_events_dlq")
      .values({
        event_id: eventId,
        payload,
        error_message: error,
      })
      .execute();
  } catch (dlqError) {
    const dlqMessage =
      dlqError instanceof Error ? dlqError.message : String(dlqError);
    logger.error("Failed to enqueue Timeback DLQ entry", {
      message: dlqMessage,
      reason,
      eventId,
    });
  }
}

export async function countQueueByStatus(status: string): Promise<number> {
  const row = await getDb()
    .selectFrom("timeback_event_queue")
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .where("status", "=", status)
    .executeTakeFirst();
  return Number(row?.count ?? 0);
}

export async function countDlq(): Promise<number> {
  const row = await getDb()
    .selectFrom("timeback_events_dlq")
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  return Number(row?.count ?? 0);
}
