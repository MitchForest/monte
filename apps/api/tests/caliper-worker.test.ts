import { describe, expect, test } from "bun:test";

import {
  CaliperProcessingSkipped,
  processCaliperEvent,
} from "../src/services/timeback/caliper";

const baseEvent = {
  id: "event-1",
  eventTime: new Date().toISOString(),
  type: "AssessmentEvent",
  actor: { id: "" },
} as const;

describe("processCaliperEvent", () => {
  test("skips events without actor identifiers", async () => {
    await expect(
      processCaliperEvent({ ...baseEvent, actor: { id: "" } }),
    ).rejects.toBeInstanceOf(CaliperProcessingSkipped);
  });

  test("skips events with invalid timestamps", async () => {
    await expect(
      processCaliperEvent({
        ...baseEvent,
        eventTime: "not-a-date",
        actor: { id: "urn:uuid:actor" },
      }),
    ).rejects.toBeInstanceOf(CaliperProcessingSkipped);
  });
});
