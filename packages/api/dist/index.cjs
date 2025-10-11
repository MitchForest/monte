"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  clearAuthToken: () => clearAuthToken,
  createCurriculumClient: () => createCurriculumClient,
  createCurriculumHttpClient: () => createCurriculumHttpClient,
  createLesson: () => createLesson,
  createTopic: () => createTopic,
  createUnit: () => createUnit,
  curriculumClient: () => curriculumClient,
  deleteLesson: () => deleteLesson,
  deleteTopic: () => deleteTopic,
  deleteUnit: () => deleteUnit,
  exportManifest: () => exportManifest,
  fetchCurriculumTree: () => fetchCurriculumTree,
  fetchLessonById: () => fetchLessonById,
  fetchLessonBySlug: () => fetchLessonBySlug,
  fetchLessonDrafts: () => fetchLessonDrafts,
  fetchUnitBySlug: () => fetchUnitBySlug,
  isCurriculumApiAvailable: () => isCurriculumApiAvailable,
  isCurriculumAuthReady: () => isCurriculumAuthReady,
  listLessons: () => listLessons,
  moveLesson: () => moveLesson,
  moveTopic: () => moveTopic,
  publishLesson: () => publishLesson,
  reorderLessons: () => reorderLessons,
  reorderTopics: () => reorderTopics,
  reorderUnits: () => reorderUnits,
  saveLessonDraft: () => saveLessonDraft,
  setCurriculumAuthToken: () => setCurriculumAuthToken,
  syncManifest: () => syncManifest,
  updateLessonAuthoring: () => updateLessonAuthoring,
  updateTopic: () => updateTopic,
  updateUnit: () => updateUnit
});
module.exports = __toCommonJS(index_exports);

// src/curriculum.ts
var import_browser = require("convex/browser");
var import_zod = require("zod");

// convex/_generated/api.js
var import_server = require("convex/server");
var api = import_server.anyApi;
var components = (0, import_server.componentsGeneric)();

// src/curriculum.ts
var import_types = require("@monte/types");
var import_meta = {};
var now = () => Date.now();
var pickScenarioBinding = (document) => {
  for (const segment of document.lesson.segments) {
    if (segment.scenario) {
      return segment.scenario;
    }
  }
  return document.meta?.scenario;
};
var readEnvValue = (key) => {
  const metaEnv = import_meta?.env;
  if (metaEnv && key in metaEnv) {
    return metaEnv[key];
  }
  const nodeEnv = globalThis.process?.env;
  if (nodeEnv && key in nodeEnv) {
    return nodeEnv[key];
  }
  return void 0;
};
var convexUrl = (() => {
  const value = readEnvValue("VITE_CONVEX_URL") ?? readEnvValue("CONVEX_URL");
  return typeof value === "string" && value.length > 0 ? value : void 0;
})();
var missingUrlMessage = "Curriculum client unavailable: set VITE_CONVEX_URL to enable live authoring. Falling back to local-only stubs.";
var createUnavailableCurriculumClient = () => {
  const warn = (method) => {
    console.warn(`${missingUrlMessage} Called ${method}.`);
  };
  const notReady = (method, fallback) => {
    warn(method);
    return Promise.resolve(fallback);
  };
  const reject = (method) => {
    warn(method);
    return Promise.reject(new Error(missingUrlMessage));
  };
  return {
    setAuthToken: () => warn("setAuthToken"),
    clearAuthToken: () => warn("clearAuthToken"),
    async fetchCurriculumTree() {
      return notReady("fetchCurriculumTree", []);
    },
    async fetchUnitBySlug() {
      return notReady("fetchUnitBySlug", void 0);
    },
    async fetchLessonBySlug() {
      return notReady("fetchLessonBySlug", void 0);
    },
    async fetchLessonById() {
      return notReady("fetchLessonById", void 0);
    },
    async createUnit() {
      return reject("createUnit");
    },
    async updateUnit() {
      await reject("updateUnit");
    },
    async deleteUnit() {
      await reject("deleteUnit");
    },
    async reorderUnits() {
      await reject("reorderUnits");
    },
    async createTopic() {
      return reject("createTopic");
    },
    async updateTopic() {
      await reject("updateTopic");
    },
    async deleteTopic() {
      await reject("deleteTopic");
    },
    async moveTopic() {
      await reject("moveTopic");
    },
    async reorderTopics() {
      await reject("reorderTopics");
    },
    async createLesson() {
      return reject("createLesson");
    },
    async saveLessonDraft() {
      await reject("saveLessonDraft");
    },
    async publishLesson() {
      await reject("publishLesson");
    },
    async deleteLesson() {
      await reject("deleteLesson");
    },
    async moveLesson() {
      await reject("moveLesson");
    },
    async reorderLessons() {
      await reject("reorderLessons");
    },
    async updateLessonAuthoring() {
      return reject("updateLessonAuthoring");
    },
    async listLessons() {
      return notReady("listLessons", []);
    },
    async syncManifest() {
      return reject("syncManifest");
    },
    async exportManifest() {
      return reject("exportManifest");
    }
  };
};
var normalizeTimestamp = (value, fallback) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};
var normalizeLessonDocument = (document) => {
  const parsed = import_types.LessonDocumentSchema.parse(document);
  const baseline = now();
  const draftMeta = parsed.meta ?? {};
  const scenarioBinding = pickScenarioBinding(parsed);
  const normalizeTimelineSegments = parsed.lesson.segments?.map((segment) => {
    const timeline = segment.timeline ?? { version: 1, steps: [] };
    const steps = (timeline.steps ?? []).map((step) => ({
      ...step,
      keyframes: step.keyframes ?? [],
      interactions: step.interactions ?? []
    }));
    return {
      ...segment,
      timeline: {
        version: timeline.version ?? 1,
        label: timeline.label,
        metadata: timeline.metadata,
        steps
      }
    };
  }) ?? [];
  return {
    ...parsed,
    lesson: {
      ...parsed.lesson,
      focusSkills: parsed.lesson.focusSkills ?? [],
      materials: parsed.lesson.materials ?? [],
      segments: normalizeTimelineSegments
    },
    meta: {
      ...draftMeta,
      createdAt: normalizeTimestamp(draftMeta.createdAt, baseline),
      updatedAt: normalizeTimestamp(draftMeta.updatedAt, baseline),
      scenario: scenarioBinding ? {
        kind: scenarioBinding.kind,
        seed: scenarioBinding.seed,
        snapshot: scenarioBinding.snapshot,
        notes: scenarioBinding.notes
      } : void 0
    }
  };
};
var CreateUnitResultSchema = import_zod.z.object({ unitId: (0, import_types.IdSchema)() });
var CreateTopicResultSchema = import_zod.z.object({ topicId: (0, import_types.IdSchema)() });
var CreateLessonResultSchema = import_zod.z.object({ lessonId: (0, import_types.IdSchema)() });
var LessonDraftRecordListSchema = import_types.LessonDraftRecordSchema.array();
var LessonAuthoringUpdateResultSchema = import_zod.z.object({
  lessonId: (0, import_types.IdSchema)(),
  authoringStatus: import_types.LessonAuthoringStatusSchema.nullable(),
  assigneeId: import_zod.z.string().nullable(),
  authoringNotes: import_zod.z.string().nullable(),
  gradeLevels: import_zod.z.array(import_types.LessonGradeLevelSchema),
  updatedAt: import_zod.z.number()
});
var createCurriculumClient = (httpClient) => {
  const executeQuery = async (queryRef, args, schema) => schema.parse(await httpClient.query(queryRef, args));
  const executeMutation = async (mutationRef, args, schema) => schema.parse(await httpClient.mutation(mutationRef, args));
  const setAuthToken = (token) => {
    if (token && token.length > 0) {
      httpClient.setAuth(token);
    } else {
      httpClient.clearAuth();
    }
  };
  return {
    setAuthToken,
    clearAuthToken: () => httpClient.clearAuth(),
    async fetchCurriculumTree() {
      return await executeQuery(api.curriculum.listCurriculumTree, {}, import_types.CurriculumTreeSchema);
    },
    async fetchUnitBySlug(slug) {
      const result = await executeQuery(
        api.curriculum.getUnitBySlug,
        { slug },
        import_types.CurriculumTreeUnitSchema.optional()
      );
      return result ?? void 0;
    },
    async fetchLessonBySlug(slug) {
      const record = await executeQuery(
        api.curriculum.getLessonBySlug,
        { slug },
        import_types.LessonDraftRecordSchema.optional()
      );
      return record ?? void 0;
    },
    async fetchLessonById(lessonId) {
      const record = await executeQuery(
        api.curriculum.getLessonById,
        { lessonId },
        import_types.LessonDraftRecordSchema.optional()
      );
      return record ?? void 0;
    },
    async createUnit(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? import_types.EntityMetadataSchema.parse(input.metadata) : void 0
      };
      return await executeMutation(api.curriculum.createUnit, payload, CreateUnitResultSchema);
    },
    async updateUnit(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? import_types.EntityMetadataSchema.parse(input.metadata) : void 0
      };
      await executeMutation(api.curriculum.updateUnit, payload, import_zod.z.void());
    },
    async deleteUnit(unitId) {
      await executeMutation(api.curriculum.deleteUnit, { unitId }, import_zod.z.void());
    },
    async reorderUnits(unitIds) {
      await executeMutation(api.curriculum.reorderUnits, { unitIds }, import_zod.z.void());
    },
    async createTopic(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? import_types.EntityMetadataSchema.parse(input.metadata) : void 0
      };
      return await executeMutation(api.curriculum.createTopic, payload, CreateTopicResultSchema);
    },
    async updateTopic(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? import_types.EntityMetadataSchema.parse(input.metadata) : void 0
      };
      await executeMutation(api.curriculum.updateTopic, payload, import_zod.z.void());
    },
    async deleteTopic(topicId) {
      await executeMutation(api.curriculum.deleteTopic, { topicId }, import_zod.z.void());
    },
    async moveTopic(input) {
      await executeMutation(api.curriculum.moveTopic, input, import_zod.z.void());
    },
    async reorderTopics(unitId, topicIds) {
      await executeMutation(api.curriculum.reorderTopics, { unitId, topicIds }, import_zod.z.void());
    },
    async createLesson(input) {
      return await executeMutation(api.curriculum.createLesson, input, CreateLessonResultSchema);
    },
    async saveLessonDraft(lessonId, draft) {
      const normalized = normalizeLessonDocument(draft);
      await executeMutation(
        api.curriculum.saveLessonDraft,
        {
          lessonId,
          draft: normalized
        },
        import_zod.z.void()
      );
    },
    async publishLesson(lessonId) {
      await executeMutation(api.curriculum.publishLesson, { lessonId }, import_zod.z.void());
    },
    async deleteLesson(lessonId) {
      await executeMutation(api.curriculum.deleteLesson, { lessonId }, import_zod.z.void());
    },
    async moveLesson(input) {
      await executeMutation(api.curriculum.moveLesson, input, import_zod.z.void());
    },
    async reorderLessons(topicId, lessonIds) {
      await executeMutation(api.curriculum.reorderLessons, { topicId, lessonIds }, import_zod.z.void());
    },
    async updateLessonAuthoring(input) {
      const mapNullable = (value) => value === void 0 ? void 0 : value;
      const payload = {
        lessonId: input.lessonId,
        authoringStatus: mapNullable(input.authoringStatus),
        assigneeId: mapNullable(input.assigneeId),
        authoringNotes: mapNullable(input.authoringNotes),
        gradeLevels: mapNullable(input.gradeLevels)
      };
      const result = await executeMutation(
        api.curriculum.updateLessonAuthoring,
        payload,
        LessonAuthoringUpdateResultSchema
      );
      const normalized = {
        lessonId: result.lessonId,
        authoringStatus: result.authoringStatus,
        assigneeId: result.assigneeId,
        authoringNotes: result.authoringNotes,
        gradeLevels: result.gradeLevels,
        updatedAt: result.updatedAt
      };
      return normalized;
    },
    async listLessons(topicId) {
      return await executeQuery(
        api.curriculum.listLessons,
        { topicId },
        LessonDraftRecordListSchema
      );
    },
    async syncManifest(input) {
      const manifest = import_types.CurriculumManifestSchema.parse(input.manifest);
      const options = {
        prune: input.prune ?? void 0,
        manifestCommit: input.manifestCommit ?? void 0,
        defaultStatus: input.defaultStatus ?? void 0
      };
      const hasOptions = Object.values(options).some((value) => value !== void 0);
      const payload = hasOptions ? { manifest, options } : { manifest };
      return await executeMutation(
        api.curriculum.syncManifest,
        payload,
        import_types.CurriculumSyncSummarySchema
      );
    },
    async exportManifest() {
      return await executeQuery(api.curriculum.exportManifest, {}, import_types.CurriculumManifestSchema);
    }
  };
};
var createCurriculumHttpClient = (convexUrl2) => createCurriculumClient(new import_browser.ConvexHttpClient(convexUrl2));
var curriculumClient = convexUrl ? createCurriculumHttpClient(convexUrl) : createUnavailableCurriculumClient();
if (!convexUrl) {
  console.warn(missingUrlMessage);
}
var isCurriculumApiAvailable = Boolean(convexUrl);
var curriculumAuthReady = !isCurriculumApiAvailable;
var isCurriculumAuthReady = () => curriculumAuthReady;
var setCurriculumAuthToken = (token) => {
  curriculumClient.setAuthToken(token ?? null);
  curriculumAuthReady = !isCurriculumApiAvailable || typeof token === "string";
};
var {
  clearAuthToken,
  fetchCurriculumTree,
  fetchUnitBySlug,
  fetchLessonBySlug,
  fetchLessonById,
  createUnit,
  updateUnit,
  deleteUnit,
  reorderUnits,
  createTopic,
  updateTopic,
  deleteTopic,
  moveTopic,
  reorderTopics,
  createLesson,
  saveLessonDraft,
  publishLesson,
  deleteLesson,
  moveLesson,
  reorderLessons,
  updateLessonAuthoring,
  listLessons,
  syncManifest,
  exportManifest
} = curriculumClient;
var fetchLessonDrafts = (topicId) => curriculumClient.listLessons(topicId);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clearAuthToken,
  createCurriculumClient,
  createCurriculumHttpClient,
  createLesson,
  createTopic,
  createUnit,
  curriculumClient,
  deleteLesson,
  deleteTopic,
  deleteUnit,
  exportManifest,
  fetchCurriculumTree,
  fetchLessonById,
  fetchLessonBySlug,
  fetchLessonDrafts,
  fetchUnitBySlug,
  isCurriculumApiAvailable,
  isCurriculumAuthReady,
  listLessons,
  moveLesson,
  moveTopic,
  publishLesson,
  reorderLessons,
  reorderTopics,
  reorderUnits,
  saveLessonDraft,
  setCurriculumAuthToken,
  syncManifest,
  updateLessonAuthoring,
  updateTopic,
  updateUnit
});
