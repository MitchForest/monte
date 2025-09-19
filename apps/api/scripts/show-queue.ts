#!/usr/bin/env bun

import { getDb } from "@monte/database";
import { logger } from "@monte/shared";

async function main() {
  const db = getDb();

  const [pending, processing, failed, skipped, dlq] = await Promise.all([
    db
      .selectFrom("timeback_event_queue")
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .where("status", "=", "pending")
      .executeTakeFirst(),
    db
      .selectFrom("timeback_event_queue")
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .where("status", "=", "processing")
      .executeTakeFirst(),
    db
      .selectFrom("timeback_event_queue")
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .where("status", "=", "failed")
      .executeTakeFirst(),
    db
      .selectFrom("timeback_event_queue")
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .where("status", "=", "skipped")
      .executeTakeFirst(),
    db
      .selectFrom("timeback_events_dlq")
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .executeTakeFirst(),
  ]);

  const pendingSample = await db
    .selectFrom("timeback_event_queue")
    .select([
      "event_id",
      "status",
      "attempts",
      "next_attempt_at",
      "scheduled_at",
      "last_error",
    ])
    .where("status", "=", "pending")
    .orderBy("scheduled_at", "asc")
    .limit(10)
    .execute();

  logger.info("timeback queue status", {
    pending: Number(pending?.count ?? 0),
    processing: Number(processing?.count ?? 0),
    failed: Number(failed?.count ?? 0),
    skipped: Number(skipped?.count ?? 0),
    dlq: Number(dlq?.count ?? 0),
    sample: pendingSample,
  });
}

main().catch((error) => {
  logger.error("show-queue failed", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
