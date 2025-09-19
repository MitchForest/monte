import type { Json, TimebackEventQueue } from "@monte/database";
import { getDb } from "@monte/database";
import { logger } from "@monte/shared";

import {
  CaliperEventSchema,
  CaliperProcessingSkipped,
  enqueueCaliperDlq,
  processCaliperEvent,
} from "./caliper";
import {
  claimPendingEvents,
  countDlq,
  countQueueByStatus,
  releaseQueueLock,
  tryAcquireQueueLock,
} from "./event-queue";

const DEFAULT_BATCH_SIZE = 50;

type QueueOutcome = "processed" | "skipped" | "failed";

type QueueWorkerDeps = {
  tryAcquireQueueLock: typeof tryAcquireQueueLock;
  releaseQueueLock: typeof releaseQueueLock;
  claimPendingEvents: typeof claimPendingEvents;
  countQueueByStatus: typeof countQueueByStatus;
  countDlq: typeof countDlq;
  recordMetric: (
    name: string,
    value: number,
    metadata?: Record<string, unknown>,
  ) => Promise<void>;
  processItem: (item: TimebackEventQueue) => Promise<QueueOutcome>;
};

const defaultDeps: QueueWorkerDeps = {
  tryAcquireQueueLock,
  releaseQueueLock,
  claimPendingEvents,
  countQueueByStatus,
  countDlq,
  recordMetric,
  processItem,
};

export type TimebackWorkerResult = {
  processed: number;
  skipped: number;
  failed: number;
  claimed: number;
  pending: number;
  processing: number;
  dlq: number;
  locked: boolean;
};

export async function processTimebackQueueBatch(
  batchSize = DEFAULT_BATCH_SIZE,
  overrides: Partial<QueueWorkerDeps> = {},
): Promise<TimebackWorkerResult> {
  const deps = { ...defaultDeps, ...overrides } satisfies QueueWorkerDeps;

  const acquired = await deps.tryAcquireQueueLock();
  if (!acquired) {
    return {
      processed: 0,
      skipped: 0,
      failed: 0,
      claimed: 0,
      pending: await deps.countQueueByStatus("pending"),
      processing: await deps.countQueueByStatus("processing"),
      dlq: await deps.countDlq(),
      locked: true,
    };
  }

  try {
    const batch = await deps.claimPendingEvents(batchSize);

    if (batch.length === 0) {
      return {
        processed: 0,
        skipped: 0,
        failed: 0,
        claimed: 0,
        pending: await deps.countQueueByStatus("pending"),
        processing: await deps.countQueueByStatus("processing"),
        dlq: await deps.countDlq(),
        locked: false,
      };
    }

    const outcomes = await Promise.all(
      batch.map((item) => deps.processItem(item)),
    );

    const processed = outcomes.filter(
      (outcome) => outcome === "processed",
    ).length;
    const skipped = outcomes.filter((outcome) => outcome === "skipped").length;
    const failed = outcomes.filter((outcome) => outcome === "failed").length;

    const [pending, processing, dlq] = await Promise.all([
      deps.countQueueByStatus("pending"),
      deps.countQueueByStatus("processing"),
      deps.countDlq(),
    ]);

    await Promise.all([
      deps.recordMetric("timeback_events.queue.processed", processed, {
        skipped,
        failed,
        batch: batch.length,
      }),
      deps.recordMetric("timeback_events.queue.pending", pending),
      deps.recordMetric("timeback_events.queue.processing", processing),
      deps.recordMetric("timeback_events.queue.dlq", dlq),
    ]);

    return {
      processed,
      skipped,
      failed,
      claimed: batch.length,
      pending,
      processing,
      dlq,
      locked: false,
    };
  } finally {
    await deps.releaseQueueLock();
  }
}

async function processItem(item: TimebackEventQueue): Promise<QueueOutcome> {
  const db = getDb();
  const nowIso = new Date().toISOString();
  const rowId = item.id as unknown as string;
  const eventId = item.event_id as unknown as string | null;

  try {
    const parsed = CaliperEventSchema.parse(item.payload);
    await processCaliperEvent(parsed);
    await db
      .updateTable("timeback_event_queue")
      .set({
        status: "processed",
        processed_at: nowIso,
        updated_at: nowIso,
        last_error: null,
      })
      .where("id", "=", rowId)
      .execute();
    return "processed";
  } catch (error) {
    if (error instanceof CaliperProcessingSkipped) {
      await db
        .updateTable("timeback_event_queue")
        .set({
          status: "skipped",
          processed_at: nowIso,
          updated_at: nowIso,
          last_error: error.reason,
        })
        .where("id", "=", rowId)
        .execute();
      return "skipped";
    }

    const message = error instanceof Error ? error.message : String(error);
    const attempts = Number(item.attempts ?? 0) + 1;

    if (attempts >= 5) {
      await enqueueCaliperDlq(
        eventId,
        item.payload as Json,
        "max_attempts",
        message,
      );
      await db
        .updateTable("timeback_event_queue")
        .set({
          status: "failed",
          attempts,
          processed_at: nowIso,
          updated_at: nowIso,
          last_error: message,
        })
        .where("id", "=", rowId)
        .execute();
      return "failed";
    }

    const backoffMs = Math.min(2000 * 2 ** (attempts - 1), 60000);
    const nextAttemptAt = new Date(Date.now() + backoffMs).toISOString();

    await db
      .updateTable("timeback_event_queue")
      .set({
        status: "pending",
        attempts,
        next_attempt_at: nextAttemptAt,
        updated_at: nowIso,
        last_error: message,
      })
      .where("id", "=", rowId)
      .execute();

    return "failed";
  }
}

async function recordMetric(
  name: string,
  value: number,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const timestamp = new Date().toISOString();
  logger.info("timeback metric", { name, value, ...metadata, timestamp });

  const metadataPayload: Json | null =
    Object.keys(metadata).length > 0 ? (metadata as Json) : null;

  await getDb()
    .insertInto("sync_metrics")
    .values({
      entity: name,
      value,
      recorded_at: timestamp,
      metadata: metadataPayload,
    })
    .execute();
}
