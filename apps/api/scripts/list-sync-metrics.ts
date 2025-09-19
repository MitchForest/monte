#!/usr/bin/env bun

import { getDb } from "@monte/database";
import { logger } from "@monte/shared";

const LIMIT = Number.parseInt(process.argv.at(2) ?? "20", 10);

async function main() {
  const rows = await getDb()
    .selectFrom("sync_metrics")
    .select(["entity", "value", "recorded_at", "metadata"])
    .orderBy("recorded_at", "desc")
    .limit(LIMIT)
    .execute();

  logger.info("sync metrics", { count: rows.length, rows });
}

main().catch((error) => {
  logger.error("list-sync-metrics failed", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
