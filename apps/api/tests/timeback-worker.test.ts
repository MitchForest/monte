import { describe, expect, test } from "bun:test";

import { processTimebackQueueBatch } from "../src/services/timeback/worker";

describe("processTimebackQueueBatch", () => {
  test("returns locked summary when another worker holds the lock", async () => {
    const result = await processTimebackQueueBatch(5, {
      tryAcquireQueueLock: async () => false,
      countQueueByStatus: async (status) =>
        status === "pending" ? 5 : status === "processing" ? 2 : 0,
      countDlq: async () => 1,
      recordMetric: async () => undefined,
      claimPendingEvents: async () => {
        throw new Error("should not be called when lock is held");
      },
      releaseQueueLock: async () => undefined,
    });

    expect(result.locked).toBe(true);
    expect(result.pending).toBe(5);
    expect(result.processing).toBe(2);
    expect(result.dlq).toBe(1);
    expect(result.claimed).toBe(0);
  });

  test("claims zero events and releases lock", async () => {
    let released = false;
    let claims = 0;

    const result = await processTimebackQueueBatch(5, {
      tryAcquireQueueLock: async () => true,
      releaseQueueLock: async () => {
        released = true;
      },
      claimPendingEvents: async () => {
        claims += 1;
        return [];
      },
      countQueueByStatus: async () => 0,
      countDlq: async () => 0,
      recordMetric: async () => undefined,
    });

    expect(result.locked).toBe(false);
    expect(result.claimed).toBe(0);
    expect(claims).toBe(1);
    expect(released).toBe(true);
  });
});
