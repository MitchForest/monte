// src/runtime/lesson/timeline.ts
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

// src/runtime/lesson/player.ts
import { assign, createMachine } from "xstate";
var clamp = (value, min, max) => Math.min(Math.max(value, min), max);
var createLessonPlayerMachine = (totalSegments) => createMachine({
  types: {},
  id: "lessonPlayer",
  context: {
    index: 0,
    total: Math.max(totalSegments, 0),
    status: "idle"
  },
  initial: "idle",
  states: {
    idle: {
      entry: assign(() => ({ status: "idle" })),
      on: {
        PLAY: "#lessonPlayer.playing"
      }
    },
    playing: {
      entry: assign(() => ({ status: "playing" })),
      on: {
        PAUSE: "#lessonPlayer.paused",
        COMPLETE: [
          {
            guard: ({ context }) => context.index >= Math.max(context.total - 1, 0),
            target: "#lessonPlayer.finished"
          },
          {
            target: "#lessonPlayer.idle",
            actions: assign(({ context }) => {
              const lastIndex = Math.max(context.total - 1, 0);
              return {
                index: Math.min(context.index + 1, lastIndex),
                status: "idle"
              };
            })
          }
        ],
        NEXT: {
          target: "#lessonPlayer.idle",
          actions: assign(({ context }) => {
            const lastIndex = Math.max(context.total - 1, 0);
            return {
              index: Math.min(context.index + 1, lastIndex),
              status: "idle"
            };
          })
        },
        PREV: {
          target: "#lessonPlayer.idle",
          actions: assign(({ context }) => ({
            index: Math.max(context.index - 1, 0),
            status: "idle"
          }))
        }
      }
    },
    paused: {
      entry: assign(() => ({ status: "paused" })),
      on: {
        PLAY: "#lessonPlayer.playing",
        STOP: "#lessonPlayer.idle"
      }
    },
    finished: {
      entry: assign(() => ({ status: "completed" })),
      type: "final",
      on: {
        STOP: "#lessonPlayer.idle"
      }
    }
  },
  on: {
    SET_INDEX: {
      target: "#lessonPlayer.idle",
      actions: assign(({ event, context }) => {
        if (event.type !== "SET_INDEX") return {};
        return {
          index: clamp(event.index, 0, Math.max(context.total - 1, 0)),
          status: "idle"
        };
      })
    },
    PREV: {
      target: "#lessonPlayer.idle",
      actions: assign(({ context }) => ({
        index: Math.max(context.index - 1, 0),
        status: "idle"
      }))
    },
    NEXT: {
      target: "#lessonPlayer.idle",
      actions: assign(({ context }) => {
        const lastIndex = Math.max(context.total - 1, 0);
        return {
          index: Math.min(context.index + 1, lastIndex),
          status: "idle"
        };
      })
    },
    STOP: {
      target: "#lessonPlayer.idle",
      actions: assign(() => ({ status: "idle" }))
    }
  }
});

// src/runtime/lesson/factories.ts
var BEAD_PLACE_ORDER = [
  "thousand",
  "hundred",
  "ten",
  "unit"
];
var randomId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};
var generateId = (prefix) => `${prefix}-${randomId().slice(0, 8)}`;
var createPresentationAction = (type, id = generateId(`action-${type}`)) => {
  const common = {
    id,
    durationMs: void 0,
    authoring: void 0
  };
  switch (type) {
    case "narrate":
      return { ...common, type: "narrate", text: "" };
    case "showCard":
      return {
        ...common,
        type: "showCard",
        card: "",
        position: "paper"
      };
    case "placeBeads":
      return {
        ...common,
        type: "placeBeads",
        place: "unit",
        quantity: 1,
        tray: 1
      };
    case "duplicateTray":
      return {
        ...common,
        type: "duplicateTray",
        count: 2
      };
    case "exchange":
      return {
        ...common,
        type: "exchange",
        from: "unit",
        to: "ten",
        quantity: 10,
        remainder: 0
      };
    case "moveBeadsBelowLine":
      return {
        ...common,
        type: "moveBeadsBelowLine",
        place: "unit",
        totalCount: 0
      };
    case "groupForExchange":
      return {
        ...common,
        type: "groupForExchange",
        place: "unit",
        groupsOfTen: 0,
        remainder: 0
      };
    case "exchangeBeads":
      return {
        ...common,
        type: "exchangeBeads",
        from: "unit",
        to: "ten",
        groupsOfTen: 0
      };
    case "placeResultCard":
      return {
        ...common,
        type: "placeResultCard",
        place: "unit",
        value: 0
      };
    case "stackPlaceValues":
      return {
        ...common,
        type: "stackPlaceValues",
        order: [...BEAD_PLACE_ORDER]
      };
    case "writeResult":
      return {
        ...common,
        type: "writeResult",
        value: ""
      };
    case "highlight":
      return {
        ...common,
        type: "highlight",
        target: "",
        text: ""
      };
    case "showStamp":
      return {
        ...common,
        type: "showStamp",
        stamp: "1",
        columns: 1,
        rows: 1
      };
    case "countTotal":
      return {
        ...common,
        type: "countTotal",
        value: ""
      };
    default: {
      const exhaustiveCheck = type;
      throw new Error(`Unsupported presentation action: ${exhaustiveCheck}`);
    }
  }
};
var defaultPracticeQuestion = () => ({
  id: generateId("question"),
  multiplicand: 100,
  multiplier: 2,
  prompt: "Solve 100 \xD7 2.",
  correctAnswer: 200,
  difficulty: "easy",
  authoring: void 0
});
var defaultPassCriteria = {
  type: "threshold",
  firstCorrect: 2,
  totalCorrect: 3,
  maxMisses: 3
};
var defaultGuidedStep = (workspace) => ({
  id: generateId("step"),
  prompt: "Describe the guided action.",
  expectation: "Expectation description.",
  successCheck: "Success criteria.",
  nudge: "Helpful hint to guide the learner.",
  explanation: void 0,
  durationMs: void 0,
  authoring: void 0,
  evaluatorId: workspace === "stamp-game" ? "stamp-game-build" : "golden-beads-build-base"
});
var createSegment = (type, defaultMaterialId) => {
  const baseId = generateId(`segment-${type}`);
  if (type === "presentation") {
    const segment2 = {
      id: baseId,
      title: "New presentation segment",
      description: "",
      type: "presentation",
      representation: "concrete",
      primaryMaterialId: defaultMaterialId,
      materials: [],
      skills: [],
      scriptId: `script-${baseId}`,
      script: {
        id: `script-${baseId}`,
        title: "Presentation script",
        summary: "",
        actions: [createPresentationAction("narrate")]
      },
      scenario: { kind: "golden-beads", seed: Date.now() },
      materialBankId: void 0,
      timeline: void 0
    };
    return segment2;
  }
  if (type === "guided") {
    const segment2 = {
      id: baseId,
      title: "New guided segment",
      description: "",
      type: "guided",
      representation: "concrete",
      materials: [],
      skills: [],
      workspace: "golden-beads",
      steps: [defaultGuidedStep("golden-beads")],
      scenario: { kind: "golden-beads", seed: Date.now() },
      materialBankId: void 0,
      timeline: void 0
    };
    return segment2;
  }
  const segment = {
    id: baseId,
    title: "New practice segment",
    description: "",
    type: "practice",
    representation: "concrete",
    materials: [],
    skills: [],
    workspace: "golden-beads",
    questions: [defaultPracticeQuestion()],
    passCriteria: { ...defaultPassCriteria },
    scenario: { kind: "golden-beads", seed: Date.now() },
    materialBankId: void 0,
    timeline: void 0
  };
  return segment;
};
var ensurePresentationScript = (segment) => {
  if (!segment.script) {
    segment.script = {
      id: segment.scriptId ?? `script-${segment.id}`,
      title: segment.title,
      summary: "",
      actions: []
    };
  }
  return segment.script;
};
var sanitizeScenario = (scenario, fallbackKind = "golden-beads") => {
  if (!scenario) {
    return { kind: fallbackKind, seed: Date.now() };
  }
  return scenario;
};

// src/runtime/inventory/inventory.ts
var randomId2 = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};
var generateInventoryId = (prefix) => `${prefix}-${randomId2()}`;
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
var createEmptyInventory = () => ({
  version: 1,
  tokenTypes: [],
  banks: []
});
var createTokenType = (partial) => ({
  quantityPerToken: 1,
  authoring: void 0,
  ...partial
});
var defaultVisual = (workspace) => {
  if (workspace === "stamp-game") {
    return { kind: "stamp", value: 1 };
  }
  return { kind: "bead", place: "unit" };
};
var createDefaultTokenType = (materialId, workspace, label = "New token type") => createTokenType({
  id: generateInventoryId("token"),
  materialId,
  workspace,
  label,
  visual: defaultVisual(workspace)
});
var createMaterialBank = (partial) => ({
  segmentId: partial.scope === "segment" ? partial.segmentId ?? void 0 : void 0,
  initialQuantity: 0,
  depletion: "consume",
  layout: void 0,
  metadata: void 0,
  ...partial
});
var createDefaultMaterialBank = (params) => createMaterialBank({
  id: generateInventoryId("bank"),
  label: params.label ?? "New material bank",
  scope: params.scope ?? "lesson",
  segmentId: params.scope === "segment" ? params.segmentId : void 0,
  materialId: params.materialId,
  accepts: params.accepts ?? [],
  initialQuantity: params.initialQuantity ?? 0
});
var resolveBankQuantity = (bank, tokenTypeId) => {
  if (typeof bank.initialQuantity === "number") {
    return bank.initialQuantity;
  }
  return bank.initialQuantity[tokenTypeId] ?? 0;
};
var removeTokenFromBank = (bank, tokenTypeId) => {
  const accepts = bank.accepts.filter((id) => id !== tokenTypeId);
  if (typeof bank.initialQuantity === "number") {
    return { ...bank, accepts };
  }
  const restQuantities = { ...bank.initialQuantity };
  delete restQuantities[tokenTypeId];
  return {
    ...bank,
    accepts,
    initialQuantity: restQuantities
  };
};

// src/runtime/editor/lessonEditor.ts
import { createMemo } from "solid-js";
import { createStore } from "solid-js/store";
var cloneDocument = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};
var HISTORY_LIMIT = 50;
var enqueuePast = (history, snapshot) => {
  const nextPast = [...history.past, snapshot];
  if (nextPast.length > HISTORY_LIMIT) {
    nextPast.shift();
  }
  return {
    past: nextPast,
    future: []
  };
};
var createLessonEditor = () => {
  const [state, setState] = createStore({
    dirty: false,
    status: "idle",
    history: { past: [], future: [] }
  });
  const loadDocument = (document) => {
    const cloned = normalizeLessonDocumentTimelines(cloneDocument(document));
    setState({
      activeLessonId: cloned.lesson.id,
      document: cloned,
      initialDocument: cloneDocument(cloned),
      dirty: false,
      status: "ready",
      history: { past: [], future: [] },
      error: void 0,
      selection: void 0,
      lastSavedAt: void 0
    });
  };
  const applyUpdate = (makeChange) => {
    if (!state.document) return;
    try {
      const snapshot = cloneDocument(state.document);
      const draft = normalizeLessonDocumentTimelines(cloneDocument(state.document));
      makeChange(draft);
      normalizeLessonDocumentTimelines(draft);
      setState({
        document: draft,
        dirty: true,
        history: enqueuePast(state.history, snapshot),
        activeLessonId: draft.lesson.id
      });
    } catch (error) {
      console.error("Failed to apply lesson edit", error);
      setState("error", "Unable to apply changes.");
    }
  };
  const select = (selection) => {
    setState("selection", selection);
  };
  const undo = () => {
    if (!state.document) return;
    const nextPast = [...state.history.past];
    if (nextPast.length === 0) return;
    const previous = nextPast.pop();
    const currentSnapshot = cloneDocument(state.document);
    setState({
      document: cloneDocument(previous),
      dirty: true,
      history: {
        past: nextPast,
        future: [currentSnapshot, ...state.history.future]
      }
    });
  };
  const redo = () => {
    if (!state.document) return;
    const [next, ...rest] = state.history.future;
    if (!next) return;
    const currentSnapshot = cloneDocument(state.document);
    setState({
      document: cloneDocument(next),
      dirty: true,
      history: {
        past: [...state.history.past, currentSnapshot],
        future: rest
      }
    });
  };
  const canUndo = createMemo(() => state.history.past.length > 0);
  const canRedo = createMemo(() => state.history.future.length > 0);
  const beginSaving = () => {
    setState({ status: "saving", error: void 0 });
  };
  const markSaved = (timestamp) => {
    if (state.document) {
      setState({
        initialDocument: cloneDocument(state.document),
        dirty: false,
        status: "ready",
        lastSavedAt: timestamp ?? (/* @__PURE__ */ new Date()).toISOString(),
        history: { past: [], future: [] }
      });
    } else {
      setState({ dirty: false, status: "ready", lastSavedAt: timestamp });
    }
  };
  const resetToInitial = () => {
    if (!state.initialDocument) return;
    const cloned = cloneDocument(state.initialDocument);
    setState({
      document: cloned,
      dirty: false,
      history: { past: [], future: [] },
      selection: void 0,
      status: "ready"
    });
  };
  const setError = (message) => {
    setState({ error: message, status: "ready" });
  };
  const applyInventoryUpdate = (mutate) => {
    applyUpdate((draft) => {
      const currentInventory = draft.lesson.materialInventory ?? createEmptyInventory();
      draft.lesson.materialInventory = mutate(currentInventory, draft);
    });
  };
  return {
    state,
    loadDocument,
    applyUpdate,
    undo,
    redo,
    canUndo,
    canRedo,
    beginSaving,
    markSaved,
    resetToInitial,
    select,
    setError,
    applyInventoryUpdate
  };
};

// src/runtime/materials/goldenBeads.ts
var GOLDEN_BEADS_MATERIAL_ID = "golden-beads";
var template = [
  {
    id: "tray-base",
    materialId: "golden-beads-tray",
    label: "Tray",
    transform: {
      position: { x: 0, y: 0 },
      scale: { x: 3.6, y: 3.6 }
    }
  },
  {
    id: "thousands-bank",
    materialId: "golden-beads-thousand",
    label: "1000",
    transform: {
      position: { x: -180, y: -60 },
      scale: { x: 3.2, y: 3.2 }
    }
  },
  {
    id: "hundreds-bank",
    materialId: "golden-beads-hundred",
    label: "100",
    transform: {
      position: { x: -90, y: -60 },
      scale: { x: 3.2, y: 3.2 }
    }
  },
  {
    id: "tens-bank",
    materialId: "golden-beads-ten",
    label: "10",
    transform: {
      position: { x: 0, y: -50 },
      scale: { x: 3.4, y: 3.4 }
    }
  },
  {
    id: "units-bank",
    materialId: "golden-beads-unit",
    label: "1",
    transform: {
      position: { x: 110, y: -45 },
      scale: { x: 3.8, y: 3.8 }
    }
  },
  {
    id: "ribbon",
    materialId: "golden-beads-ribbon",
    label: "Ribbon",
    transform: {
      position: { x: -20, y: 100 },
      scale: { x: 1.4, y: 1.4 }
    }
  }
];
var cloneTransform = (transform) => ({
  position: { ...transform.position },
  rotation: transform.rotation,
  scale: transform.scale ? { ...transform.scale } : void 0,
  opacity: transform.opacity
});
var cloneNode = (node) => ({
  ...node,
  transform: cloneTransform(node.transform),
  metadata: node.metadata ? { ...node.metadata } : void 0
});
var buildGoldenBeadScene = () => template.map(cloneNode);

// src/runtime/materials/registry.ts
var registry = /* @__PURE__ */ new Map();
registry.set(GOLDEN_BEADS_MATERIAL_ID, {
  id: GOLDEN_BEADS_MATERIAL_ID,
  buildScene: buildGoldenBeadScene
});
var getManipulativeDefinition = (id) => registry.get(id);
var listManipulativeDefinitions = () => Array.from(registry.values());
var getManipulativeManifest = getManipulativeDefinition;
var listManipulativeManifests = listManipulativeDefinitions;

// src/runtime/scenarios/multiplication.ts
var createSeededRng = (seed) => {
  let t = seed >>> 0;
  return () => {
    t += 1831565813;
    let x = t;
    x = Math.imul(x ^ x >>> 15, x | 1);
    x ^= x + Math.imul(x ^ x >>> 7, x | 61);
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
};
var randomInclusive = (rand, min, max) => Math.floor(rand() * (max - min + 1)) + min;
var generateDigits = (rand) => {
  const thousands = randomInclusive(rand, 1, 2);
  const hundreds = randomInclusive(rand, 1, 4);
  const tens = randomInclusive(rand, 2, 8);
  const units = randomInclusive(rand, 2, 9);
  return { thousands, hundreds, tens, units };
};
var generateGoldenBeadScenario = (seed) => {
  const baseSeed = seed ?? Math.floor(Math.random() * 1e9);
  const rand = createSeededRng(baseSeed);
  while (true) {
    const digits = generateDigits(rand);
    const multiplier = randomInclusive(rand, 2, 4);
    const multiplicand = digits.thousands * 1e3 + digits.hundreds * 100 + digits.tens * 10 + digits.units;
    const unitTotal = digits.units * multiplier;
    const unitCarry = Math.floor(unitTotal / 10);
    const unitRemainder = unitTotal % 10;
    const tensTotal = digits.tens * multiplier + unitCarry;
    const tensCarry = Math.floor(tensTotal / 10);
    const tensRemainder = tensTotal % 10;
    const hundredsTotal = digits.hundreds * multiplier + tensCarry;
    const hundredsCarry = Math.floor(hundredsTotal / 10);
    const hundredsRemainder = hundredsTotal % 10;
    const thousandsTotal = digits.thousands * multiplier + hundredsCarry;
    if (thousandsTotal >= 10) {
      continue;
    }
    const product = multiplicand * multiplier;
    const hasCarry = unitCarry > 0 || tensCarry > 0 || hundredsCarry > 0;
    if (!hasCarry) {
      continue;
    }
    return {
      kind: "golden-beads",
      seed: baseSeed,
      multiplicand,
      multiplier,
      digits,
      unitTotal,
      unitRemainder,
      unitCarry,
      tensTotal,
      tensRemainder,
      tensCarry,
      hundredsTotal,
      hundredsRemainder,
      hundredsCarry,
      thousandsTotal,
      product
    };
  }
};
var generateStampGameScenario = (seed) => {
  const baseSeed = seed ?? Math.floor(Math.random() * 1e9);
  const rand = createSeededRng(baseSeed);
  while (true) {
    const hundreds = randomInclusive(rand, 2, 5);
    const tens = randomInclusive(rand, 2, 8);
    const units = randomInclusive(rand, 1, 9);
    const multiplier = randomInclusive(rand, 2, 5);
    const digits = { hundreds, tens, units };
    const multiplicand = hundreds * 100 + tens * 10 + units;
    const unitsTotal = units * multiplier;
    const unitsCarry = Math.floor(unitsTotal / 10);
    const unitsRemainder = unitsTotal % 10;
    const tensTotal = tens * multiplier + unitsCarry;
    const tensCarry = Math.floor(tensTotal / 10);
    const tensRemainder = tensTotal % 10;
    const hundredsTotal = hundreds * multiplier + tensCarry;
    const hundredsCarry = Math.floor(hundredsTotal / 10);
    const hundredsRemainder = hundredsTotal % 10;
    const thousandsTotal = hundredsCarry;
    if (thousandsTotal >= 10) {
      continue;
    }
    const product = multiplicand * multiplier;
    const hasCarry = unitsCarry > 0 || tensCarry > 0 || hundredsCarry > 0;
    if (!hasCarry) {
      continue;
    }
    return {
      kind: "stamp-game",
      seed: baseSeed,
      multiplicand,
      multiplier,
      digits,
      unitsTotal,
      unitsRemainder,
      unitsCarry,
      tensTotal,
      tensRemainder,
      tensCarry,
      hundredsTotal,
      hundredsRemainder,
      hundredsCarry,
      thousandsTotal,
      product
    };
  }
};
var formatNumber = (value) => value.toLocaleString();
var withActionIds = (actions, prefix) => actions.map((action, index) => ({
  id: `${prefix}-${index + 1}`,
  ...action
}));
var buildGoldenBeadPresentationScript = (scenario) => {
  const { digits, multiplier, unitTotal, unitRemainder, unitCarry, tensTotal, tensRemainder, tensCarry, hundredsTotal, hundredsRemainder, hundredsCarry, product } = scenario;
  const multiplicandStr = formatNumber(scenario.multiplicand);
  const multiplierStr = multiplier.toString();
  const actionInputs = [
    // Action 1: Write problem on paper (handwritten style font) to the side: 2344 x 3
    { type: "showCard", card: `${multiplicandStr} \xD7 ${multiplierStr}`, position: "paper" },
    { type: "narrate", text: `We will multiply ${multiplicandStr} by ${multiplierStr} using golden beads.` },
    // Actions 2-5: Lay out 2000, then 300, then 40, then 4 stacked
    { type: "showCard", card: `${digits.thousands * 1e3}`, position: "multiplicand-stack" },
    { type: "showCard", card: `${digits.hundreds * 100}`, position: "multiplicand-stack" },
    { type: "showCard", card: `${digits.tens * 10}`, position: "multiplicand-stack" },
    { type: "showCard", card: `${digits.units}`, position: "multiplicand-stack" },
    { type: "narrate", text: `Stack the thousand, hundred, ten, and unit cards to show ${multiplicandStr}.` },
    // Actions 6-7: Put multiplier (3) below the 4, put x to left of 3
    { type: "showCard", card: multiplierStr, position: "multiplier" },
    { type: "showCard", card: "\xD7", position: "paper" },
    // Actions 8-11: Place beads for each place value left to right
    { type: "narrate", text: "Lay out the golden beads to match each place value." },
    { type: "placeBeads", place: "thousand", quantity: digits.thousands, tray: 1 },
    { type: "placeBeads", place: "hundred", quantity: digits.hundreds, tray: 1 },
    { type: "placeBeads", place: "ten", quantity: digits.tens, tray: 1 },
    { type: "placeBeads", place: "unit", quantity: digits.units, tray: 1 },
    // Actions 12-13: Repeat 2nd and 3rd time to match multiplier
    { type: "narrate", text: `Repeat the layout a second time.` },
    { type: "duplicateTray", count: 2 },
    { type: "narrate", text: `Repeat the layout a third time.` },
    { type: "duplicateTray", count: 3 },
    // Action 14: Put yellow multiplication ribbon down
    { type: "narrate", text: "Lay a yellow ribbon beneath to signal multiplication." },
    { type: "highlight", target: "multiplication-ribbon", text: "Place ribbon" },
    // UNIT EXCHANGE - Step by step
    { type: "narrate", text: "Move all unit beads below the yellow line." },
    { type: "moveBeadsBelowLine", place: "unit", totalCount: unitTotal },
    { type: "narrate", text: "Group the units into sets of ten." },
    { type: "groupForExchange", place: "unit", groupsOfTen: unitCarry, remainder: unitRemainder },
    { type: "narrate", text: `Exchange ${unitCarry === 1 ? "this group of 10 units" : `${unitCarry} groups of 10 units`} for ${unitCarry === 1 ? "a ten bar" : `${unitCarry} ten bars`}.` },
    { type: "exchangeBeads", from: "unit", to: "ten", groupsOfTen: unitCarry },
    { type: "narrate", text: `${unitRemainder} units remain.` },
    { type: "placeResultCard", place: "unit", value: unitRemainder },
    { type: "showCard", card: `${unitRemainder}`, position: "paper" },
    // TEN EXCHANGE - Step by step
    { type: "narrate", text: "Move all ten bars below the yellow line." },
    { type: "moveBeadsBelowLine", place: "ten", totalCount: tensTotal },
    { type: "narrate", text: "Group the tens into sets of ten." },
    { type: "groupForExchange", place: "ten", groupsOfTen: tensCarry, remainder: tensRemainder },
    { type: "narrate", text: `Exchange ${tensCarry === 1 ? "this group of 10 tens" : `${tensCarry} groups of 10 tens`} for ${tensCarry === 1 ? "a hundred square" : `${tensCarry} hundred squares`}.` },
    { type: "exchangeBeads", from: "ten", to: "hundred", groupsOfTen: tensCarry },
    { type: "narrate", text: `${tensRemainder} tens remain.` },
    { type: "placeResultCard", place: "ten", value: tensRemainder },
    // HUNDRED EXCHANGE - Step by step
    { type: "narrate", text: "Move all hundred squares below the yellow line." },
    { type: "moveBeadsBelowLine", place: "hundred", totalCount: hundredsTotal },
    { type: "narrate", text: "Group the hundreds into sets of ten." },
    { type: "groupForExchange", place: "hundred", groupsOfTen: hundredsCarry, remainder: hundredsRemainder },
    { type: "narrate", text: `Exchange ${hundredsCarry === 1 ? "this group of 10 hundreds" : `${hundredsCarry} groups of 10 hundreds`} for ${hundredsCarry === 1 ? "a thousand cube" : `${hundredsCarry} thousand cubes`}.` },
    { type: "exchangeBeads", from: "hundred", to: "thousand", groupsOfTen: hundredsCarry },
    { type: "narrate", text: `${hundredsRemainder} hundreds remain.` },
    { type: "placeResultCard", place: "hundred", value: hundredsRemainder },
    // Final stacking and product
    { type: "narrate", text: "Stack each place value to read the product." },
    { type: "stackPlaceValues", order: ["thousand", "hundred", "ten", "unit"] },
    { type: "writeResult", value: formatNumber(product) },
    { type: "narrate", text: `${multiplicandStr} multiplied by ${multiplierStr} equals ${formatNumber(product)}.` }
  ];
  const actions = withActionIds(actionInputs, "presentation.multiplication.goldenBeads");
  return {
    id: "presentation.multiplication.goldenBeads",
    title: "Golden Bead Staircase Multiplication",
    summary: `Demonstrate ${multiplicandStr} \xD7 ${multiplierStr} using golden beads, exchanges, and final stacking.`,
    actions
  };
};
var buildStampGamePresentationScript = (scenario) => {
  const { digits, multiplier, unitsRemainder, tensRemainder, product } = scenario;
  const multiplicandStr = formatNumber(scenario.multiplicand);
  const multiplierStr = multiplier.toString();
  const actionInputs = [
    { type: "narrate", text: `Let us multiply ${multiplicandStr} by ${multiplierStr} using the stamp game.` },
    { type: "showCard", card: multiplicandStr, position: "paper" },
    { type: "showCard", card: multiplierStr, position: "multiplier" },
    { type: "narrate", text: `Build one column with ${digits.hundreds} red hundreds, ${digits.tens} blue tens, and ${digits.units} green units.` },
    { type: "showStamp", stamp: "100", columns: 1, rows: digits.hundreds },
    { type: "showStamp", stamp: "10", columns: 1, rows: digits.tens },
    { type: "showStamp", stamp: "1", columns: 1, rows: digits.units },
    { type: "narrate", text: `Repeat this column ${multiplierStr} times for the multiplier.` },
    { type: "duplicateTray", count: multiplier },
    { type: "narrate", text: "Gather the tiles and make exchanges: ten greens become a blue, ten blues become a red." },
    { type: "exchange", from: "unit", to: "ten", quantity: 10, remainder: unitsRemainder },
    { type: "exchange", from: "ten", to: "hundred", quantity: 10, remainder: tensRemainder },
    { type: "countTotal", value: formatNumber(product) },
    { type: "narrate", text: `${multiplicandStr} times ${multiplierStr} equals ${formatNumber(product)}.` }
  ];
  const actions = withActionIds(actionInputs, "presentation.multiplication.stampGame");
  return {
    id: "presentation.multiplication.stampGame",
    title: "Stamp Game Multiplication Stories",
    summary: `Show ${multiplicandStr} \xD7 ${multiplierStr} on the stamp game with exchanges.`,
    actions
  };
};
var buildGoldenBeadGuidedSteps = (scenario) => {
  const multiplicandStr = formatNumber(scenario.multiplicand);
  const productStr = formatNumber(scenario.product);
  return [
    {
      id: "step-build-base",
      prompt: `Lay out ${multiplicandStr} with bead cards and matching quantities.`,
      expectation: `${scenario.digits.thousands} thousands, ${scenario.digits.hundreds} hundreds, ${scenario.digits.tens} tens, ${scenario.digits.units} units.`,
      successCheck: "Cards and beads match the multiplicand.",
      nudge: "Check each place value: thousands, hundreds, tens, ones. Add missing bead bars.",
      evaluatorId: "golden-beads-build-base"
    },
    {
      id: "step-duplicate",
      prompt: `Create the ${multiplicandStr} layout ${scenario.multiplier} times to match the multiplier.`,
      expectation: `${scenario.multiplier} full copies separated by the ribbon.`,
      successCheck: "Correct number of full sets present.",
      nudge: "Use the yellow ribbon to separate each copy and confirm counts.",
      evaluatorId: "golden-beads-duplicate"
    },
    {
      id: "step-exchange-units",
      prompt: "Combine the units and exchange every 10 for a ten bar.",
      expectation: `${scenario.unitRemainder} units remain with ${scenario.unitCarry} ten carried.`,
      successCheck: "Units reduced below ten with the carry recorded.",
      nudge: "Group ten unit beads, trade them for a ten bar, and place the ten on the tens column.",
      evaluatorId: "golden-beads-exchange-units"
    },
    {
      id: "step-exchange-tens",
      prompt: "Combine tens, exchanging groups of ten tens for a hundred.",
      expectation: `${scenario.tensRemainder} tens remain with ${scenario.tensCarry} hundred carried.`,
      successCheck: "Tens consolidated with the carry noted.",
      nudge: "Bundle ten tens, trade for a hundred square, and move it to hundreds.",
      evaluatorId: "golden-beads-exchange-tens"
    },
    {
      id: "step-exchange-hundreds",
      prompt: "Combine hundreds, exchanging ten hundreds for a thousand.",
      expectation: `${scenario.hundredsRemainder} hundreds remain with ${scenario.hundredsCarry} thousand carried.`,
      successCheck: "Hundreds consolidated with the carry noted.",
      nudge: "Gather ten hundreds, swap for a thousand cube, and add it to thousands.",
      evaluatorId: "golden-beads-exchange-hundreds"
    },
    {
      id: "step-stack-result",
      prompt: "Stack the final thousands, hundreds, tens, and units to read the product.",
      expectation: `Result cards show ${productStr}.`,
      successCheck: `Final stack equals ${productStr}.`,
      nudge: "Slide each place value pile to form the final number and read it aloud.",
      evaluatorId: "golden-beads-stack-result"
    }
  ];
};
var buildStampGameGuidedSteps = (scenario) => {
  const multiplicandStr = formatNumber(scenario.multiplicand);
  const productStr = formatNumber(scenario.product);
  return [
    {
      id: "step-build",
      prompt: `Lay out ${multiplicandStr} using stamp tiles in a single column.`,
      expectation: `${scenario.digits.hundreds} hundreds, ${scenario.digits.tens} tens, ${scenario.digits.units} units.`,
      successCheck: "Tiles match the multiplicand layout.",
      nudge: "Use red 100s on top, blue 10s beneath, green 1s at bottom.",
      evaluatorId: "stamp-game-build"
    },
    {
      id: "step-repeat-columns",
      prompt: `Repeat the column ${scenario.multiplier} times for the multiplier.`,
      expectation: `${scenario.multiplier} matching columns ready to combine.`,
      successCheck: "The correct number of columns is present.",
      nudge: "Count each column aloud as you copy to the right.",
      evaluatorId: "stamp-game-repeat-columns"
    },
    {
      id: "step-exchange",
      prompt: "Gather all tiles and exchange groups of ten for the next place value.",
      expectation: `${scenario.unitsRemainder} units, ${scenario.tensRemainder} tens, ${scenario.hundredsRemainder} hundreds, plus ${scenario.thousandsTotal} thousands.`,
      successCheck: "Remaining tiles per place value are fewer than ten with carries recorded.",
      nudge: "Stack tiles by color, trade ten greens for a blue, ten blues for a red.",
      evaluatorId: "stamp-game-exchange"
    },
    {
      id: "step-read-result",
      prompt: "Count the final tiles to read the product aloud.",
      expectation: `${productStr}.`,
      successCheck: `Learner states ${productStr}.`,
      nudge: "Count hundreds first, then tens, then ones to gather the total.",
      evaluatorId: "stamp-game-read-result"
    }
  ];
};
var uniqueProblems = (existing, candidate) => !existing.some((entry) => entry.multiplicand === candidate.multiplicand && entry.multiplier === candidate.multiplier);
var randomGoldenProblem = (rand) => {
  const digits = generateDigits(rand);
  const multiplier = randomInclusive(rand, 2, 4);
  const multiplicand = digits.thousands * 1e3 + digits.hundreds * 100 + digits.tens * 10 + digits.units;
  return {
    id: `gb-${multiplicand}-${multiplier}`,
    multiplicand,
    multiplier,
    prompt: `Solve ${formatNumber(multiplicand)} \xD7 ${multiplier}.`,
    correctAnswer: multiplicand * multiplier,
    difficulty: multiplier <= 3 ? "medium" : "hard"
  };
};
var randomStampProblem = (rand) => {
  const hundreds = randomInclusive(rand, 2, 5);
  const tens = randomInclusive(rand, 2, 8);
  const units = randomInclusive(rand, 1, 9);
  const multiplicand = hundreds * 100 + tens * 10 + units;
  const multiplier = randomInclusive(rand, 2, 5);
  return {
    id: `sg-${multiplicand}-${multiplier}`,
    multiplicand,
    multiplier,
    prompt: `Solve ${formatNumber(multiplicand)} \xD7 ${multiplier}.`,
    correctAnswer: multiplicand * multiplier,
    difficulty: multiplier <= 3 ? "medium" : "hard"
  };
};
var buildGoldenBeadPractice = (scenario) => {
  const questions = [
    {
      id: `gb-scenario-${scenario.seed}`,
      multiplicand: scenario.multiplicand,
      multiplier: scenario.multiplier,
      prompt: `Solve ${formatNumber(scenario.multiplicand)} \xD7 ${scenario.multiplier}.`,
      correctAnswer: scenario.product,
      difficulty: "easy"
    }
  ];
  const rand = createSeededRng(scenario.seed + 101);
  while (questions.length < 5) {
    const candidate = randomGoldenProblem(rand);
    if (uniqueProblems(questions, candidate)) {
      questions.push({ ...candidate, id: `gb-${scenario.seed}-${questions.length}` });
    }
  }
  questions[1].difficulty = "medium";
  questions[2].difficulty = "medium";
  questions[3].difficulty = "hard";
  questions[4].difficulty = "hard";
  return questions;
};
var buildStampGamePractice = (scenario) => {
  const questions = [
    {
      id: `sg-scenario-${scenario.seed}`,
      multiplicand: scenario.multiplicand,
      multiplier: scenario.multiplier,
      prompt: `Solve ${formatNumber(scenario.multiplicand)} \xD7 ${scenario.multiplier}.`,
      correctAnswer: scenario.product,
      difficulty: "easy"
    }
  ];
  const rand = createSeededRng(scenario.seed + 211);
  while (questions.length < 5) {
    const candidate = randomStampProblem(rand);
    if (uniqueProblems(questions, candidate)) {
      questions.push({ ...candidate, id: `sg-${scenario.seed}-${questions.length}` });
    }
  }
  questions[1].difficulty = "medium";
  questions[2].difficulty = "medium";
  questions[3].difficulty = "hard";
  questions[4].difficulty = "hard";
  return questions;
};
var goldenBeadPassCriteria = {
  type: "threshold",
  firstCorrect: 2,
  totalCorrect: 3,
  maxMisses: 3
};
var stampGamePassCriteria = {
  type: "threshold",
  firstCorrect: 2,
  totalCorrect: 3,
  maxMisses: 3
};

// src/runtime/storage/lessonDocument.ts
import { z } from "zod";
import { LessonDocumentSchema } from "@monte/types";
var LESSON_DOCUMENT_STORAGE_VERSION = 1;
var StoredLessonDocumentSchema = z.object({
  version: z.literal(LESSON_DOCUMENT_STORAGE_VERSION),
  document: LessonDocumentSchema
});
var serializeLessonDocument = (document) => JSON.stringify({
  version: LESSON_DOCUMENT_STORAGE_VERSION,
  document
});
var deserializeLessonDocument = (raw) => {
  const parsed = StoredLessonDocumentSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return void 0;
  }
  return parsed.data.document;
};

// src/runtime/storage/progress.ts
import { z as z2 } from "zod";
var PROGRESS_STORAGE_VERSION = 1;
var TaskStatusSchema = z2.union([
  z2.literal("locked"),
  z2.literal("ready"),
  z2.literal("in-progress"),
  z2.literal("completed"),
  z2.literal("incorrect")
]);
var LessonTaskStateSchema = z2.object({
  status: TaskStatusSchema,
  attempts: z2.number()
});
var LessonProgressStateSchema = z2.object({
  tasks: z2.record(LessonTaskStateSchema),
  orderedTaskIds: z2.array(z2.string())
});
var LessonAuthoringProgressStateSchema = z2.object({
  lessons: z2.record(LessonProgressStateSchema)
});
var StoredProgressSchema = z2.object({
  version: z2.literal(PROGRESS_STORAGE_VERSION),
  state: LessonAuthoringProgressStateSchema
});
var serializeProgressState = (state) => JSON.stringify({
  version: PROGRESS_STORAGE_VERSION,
  state
});
var deserializeProgressState = (raw) => {
  const parsed = StoredProgressSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return void 0;
  }
  return parsed.data.state;
};
export {
  GOLDEN_BEADS_MATERIAL_ID,
  PROGRESS_STORAGE_VERSION,
  assertInventoryConsistency,
  buildGoldenBeadGuidedSteps,
  buildGoldenBeadPractice,
  buildGoldenBeadPresentationScript,
  buildGoldenBeadScene,
  buildRuntimeState,
  buildStampGameGuidedSteps,
  buildStampGamePractice,
  buildStampGamePresentationScript,
  createDefaultMaterialBank,
  createDefaultTokenType,
  createEmptyInventory,
  createLessonEditor,
  createLessonPlayerMachine,
  createMaterialBank,
  createPresentationAction,
  createSegment,
  createTokenType,
  defaultGuidedStep,
  defaultPassCriteria,
  defaultPracticeQuestion,
  deriveAcceptedTokenIds,
  deserializeLessonDocument,
  deserializeProgressState,
  detectInventoryConsistencyIssues,
  normalizeLessonDocumentTimelines as ensureLessonDocumentTimelines,
  ensurePresentationScript,
  normalizeSegmentTimeline as ensureSegmentTimeline,
  generateGoldenBeadScenario,
  generateId,
  generateStampGameScenario,
  getManipulativeDefinition,
  getManipulativeManifest,
  goldenBeadPassCriteria,
  listManipulativeDefinitions,
  listManipulativeManifests,
  normalizeLessonDocumentTimelines,
  normalizeSegmentTimeline,
  removeTokenFromBank,
  resolveBankQuantity,
  sanitizeScenario,
  serializeLessonDocument,
  serializeProgressState,
  stampGamePassCriteria
};
//# sourceMappingURL=index.js.map