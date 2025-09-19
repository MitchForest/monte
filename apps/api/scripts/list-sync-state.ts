#!/usr/bin/env bun

import { getDb } from "@monte/database";
import { logger } from "@monte/shared";

async function main() {
  const rows = await getDb()
    .selectFrom("sync_state")
    .selectAll()
    .orderBy("entity", "asc")
    .execute();

  logger.info("sync state", { rows });
}

main().catch((error) => {
  logger.error("list-sync-state failed", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
