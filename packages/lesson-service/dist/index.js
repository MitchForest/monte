// src/timeline.ts
var createEmptyTimeline = () => ({
  version: 1,
  steps: []
});
var normalizeTimelineSteps = (timeline) => (timeline?.steps ?? []).map((step) => ({
  ...step,
  keyframes: step.keyframes ?? [],
  interactions: step.interactions ?? []
}));
var normalizeSegmentTimeline = (segment) => {
  const timeline = segment.timeline ?? createEmptyTimeline();
  return {
    ...segment,
    timeline: {
      version: timeline.version ?? 1,
      label: timeline.label,
      metadata: timeline.metadata,
      steps: normalizeTimelineSteps(timeline)
    }
  };
};
var normalizeLessonDocumentTimelines = (document) => {
  document.lesson.segments = document.lesson.segments.map((segment) => normalizeSegmentTimeline(segment));
  return document;
};

// src/inventory.ts
var deriveAcceptedTokenIds = (bank, inventory) => {
  if (bank.accepts.length > 0) {
    return bank.accepts;
  }
  return inventory.tokenTypes.map((token) => token.id);
};
var toRecord = (entries) => {
  const map = {};
  entries.forEach(([key, value]) => {
    map[key] = value;
  });
  return map;
};
var createBankState = (bank, inventory) => {
  const tokenIds = deriveAcceptedTokenIds(bank, inventory);
  const initialQuantity = bank.initialQuantity;
  let initial;
  if (typeof initialQuantity === "number") {
    initial = toRecord(tokenIds.map((id) => [id, initialQuantity]));
  } else {
    initial = { ...initialQuantity };
  }
  tokenIds.forEach((id) => {
    if (typeof initial[id] !== "number") {
      initial[id] = 0;
    }
  });
  return {
    available: { ...initial },
    initial
  };
};
var buildRuntimeState = (inventory) => {
  const banks = {};
  for (const bank of inventory.banks) {
    banks[bank.id] = createBankState(bank, inventory);
  }
  return { banks };
};
var summarizeDeltas = (deltas) => {
  const summary = /* @__PURE__ */ new Map();
  for (const delta of deltas) {
    if (!delta.bankId) continue;
    if (delta.reason === "reset") {
      summary.delete(delta.bankId);
      continue;
    }
    if (delta.tokenTypeId === "*") continue;
    let bankSummary = summary.get(delta.bankId);
    if (!bankSummary) {
      bankSummary = /* @__PURE__ */ new Map();
      summary.set(delta.bankId, bankSummary);
    }
    const entry = bankSummary.get(delta.tokenTypeId) ?? {
      net: 0,
      consumed: 0,
      replenished: 0
    };
    entry.net += delta.delta;
    if (delta.reason === "consume") {
      entry.consumed += Math.abs(delta.delta);
    } else if (delta.reason === "replenish") {
      entry.replenished += Math.abs(delta.delta);
    }
    bankSummary.set(delta.tokenTypeId, entry);
  }
  return summary;
};
var detectInventoryConsistencyIssues = (inventory, runtime, deltas) => {
  const issues = [];
  const deltaSummary = summarizeDeltas(deltas);
  for (const bank of inventory.banks) {
    const runtimeBank = runtime.banks[bank.id];
    if (!runtimeBank) continue;
    const expectedTokens = /* @__PURE__ */ new Set([
      ...Object.keys(runtimeBank.initial),
      ...Object.keys(runtimeBank.available)
    ]);
    const accepted = deriveAcceptedTokenIds(bank, inventory);
    accepted.forEach((tokenId) => expectedTokens.add(tokenId));
    const bankSummary = deltaSummary.get(bank.id);
    for (const tokenId of expectedTokens) {
      const initial = runtimeBank.initial[tokenId] ?? 0;
      const available = runtimeBank.available[tokenId] ?? 0;
      const net = bankSummary?.get(tokenId)?.net ?? 0;
      const expected = initial + net;
      if (available !== expected) {
        issues.push({
          bankId: bank.id,
          tokenTypeId: tokenId,
          expected,
          actual: available
        });
      }
    }
  }
  return issues;
};
var assertInventoryConsistency = (draft) => {
  const inventory = draft.lesson.materialInventory;
  if (!inventory) return;
  const tokenTypeIds = new Set(inventory.tokenTypes.map((token) => token.id));
  const segmentIds = new Set(draft.lesson.segments.map((segment) => segment.id));
  for (const bank of inventory.banks) {
    const acceptedIds = bank.accepts.length > 0 ? bank.accepts : Array.from(tokenTypeIds);
    for (const tokenId of acceptedIds) {
      if (!tokenTypeIds.has(tokenId)) {
        throw new Error(`Bank ${bank.id} references unknown token type ${tokenId}`);
      }
    }
    if (bank.scope === "segment") {
      if (!bank.segmentId || !segmentIds.has(bank.segmentId)) {
        throw new Error(`Bank ${bank.id} references unknown segment ${bank.segmentId ?? "(missing)"}`);
      }
    }
  }
  const bankIds = new Set(inventory.banks.map((bank) => bank.id));
  for (const segment of draft.lesson.segments) {
    if (segment.materialBankId && !bankIds.has(segment.materialBankId)) {
      throw new Error(`Segment ${segment.id} references missing bank ${segment.materialBankId}`);
    }
  }
};
export {
  assertInventoryConsistency,
  buildRuntimeState,
  deriveAcceptedTokenIds,
  detectInventoryConsistencyIssues,
  normalizeLessonDocumentTimelines,
  normalizeSegmentTimeline
};
//# sourceMappingURL=index.js.map