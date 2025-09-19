import { logger } from "@monte/shared";

import { processTimebackQueueBatch } from "../src/services/timeback/worker";

const BATCH_SIZE = 50;

async function main() {
  const result = await processTimebackQueueBatch(BATCH_SIZE);

  if (result.locked) {
    logger.info("Another worker holds the Timeback queue lock; exiting", {
      pending: result.pending,
      processing: result.processing,
      dlq: result.dlq,
    });
    return;
  }

  logger.info("Processed Timeback queue batch", result);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error("Timeback event worker failed", { message });
  process.exitCode = 1;
});
