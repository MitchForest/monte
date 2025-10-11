// src/curriculum.ts
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";

// convex/_generated/api.js
import { anyApi, componentsGeneric } from "convex/server";
var api = anyApi;
var components = componentsGeneric();

// src/curriculum.ts
import {
  IdSchema,
  LessonDocumentSchema,
  LessonDraftRecordSchema,
  LessonAuthoringStatusSchema,
  LessonGradeLevelSchema,
  CurriculumTreeSchema,
  CurriculumTreeUnitSchema,
  CurriculumManifestSchema,
  CurriculumSyncSummarySchema,
  EntityMetadataSchema
} from "@monte/types";
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
  const metaEnv = import.meta?.env;
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
  const parsed = LessonDocumentSchema.parse(document);
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
var CreateUnitResultSchema = z.object({ unitId: IdSchema() });
var CreateTopicResultSchema = z.object({ topicId: IdSchema() });
var CreateLessonResultSchema = z.object({ lessonId: IdSchema() });
var LessonDraftRecordListSchema = LessonDraftRecordSchema.array();
var LessonAuthoringUpdateResultSchema = z.object({
  lessonId: IdSchema(),
  authoringStatus: LessonAuthoringStatusSchema.nullable(),
  assigneeId: z.string().nullable(),
  authoringNotes: z.string().nullable(),
  gradeLevels: z.array(LessonGradeLevelSchema),
  updatedAt: z.number()
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
      return await executeQuery(api.curriculum.listCurriculumTree, {}, CurriculumTreeSchema);
    },
    async fetchUnitBySlug(slug) {
      const result = await executeQuery(
        api.curriculum.getUnitBySlug,
        { slug },
        CurriculumTreeUnitSchema.optional()
      );
      return result ?? void 0;
    },
    async fetchLessonBySlug(slug) {
      const record = await executeQuery(
        api.curriculum.getLessonBySlug,
        { slug },
        LessonDraftRecordSchema.optional()
      );
      return record ?? void 0;
    },
    async fetchLessonById(lessonId) {
      const record = await executeQuery(
        api.curriculum.getLessonById,
        { lessonId },
        LessonDraftRecordSchema.optional()
      );
      return record ?? void 0;
    },
    async createUnit(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? EntityMetadataSchema.parse(input.metadata) : void 0
      };
      return await executeMutation(api.curriculum.createUnit, payload, CreateUnitResultSchema);
    },
    async updateUnit(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? EntityMetadataSchema.parse(input.metadata) : void 0
      };
      await executeMutation(api.curriculum.updateUnit, payload, z.void());
    },
    async deleteUnit(unitId) {
      await executeMutation(api.curriculum.deleteUnit, { unitId }, z.void());
    },
    async reorderUnits(unitIds) {
      await executeMutation(api.curriculum.reorderUnits, { unitIds }, z.void());
    },
    async createTopic(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? EntityMetadataSchema.parse(input.metadata) : void 0
      };
      return await executeMutation(api.curriculum.createTopic, payload, CreateTopicResultSchema);
    },
    async updateTopic(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? EntityMetadataSchema.parse(input.metadata) : void 0
      };
      await executeMutation(api.curriculum.updateTopic, payload, z.void());
    },
    async deleteTopic(topicId) {
      await executeMutation(api.curriculum.deleteTopic, { topicId }, z.void());
    },
    async moveTopic(input) {
      await executeMutation(api.curriculum.moveTopic, input, z.void());
    },
    async reorderTopics(unitId, topicIds) {
      await executeMutation(api.curriculum.reorderTopics, { unitId, topicIds }, z.void());
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
        z.void()
      );
    },
    async publishLesson(lessonId) {
      await executeMutation(api.curriculum.publishLesson, { lessonId }, z.void());
    },
    async deleteLesson(lessonId) {
      await executeMutation(api.curriculum.deleteLesson, { lessonId }, z.void());
    },
    async moveLesson(input) {
      await executeMutation(api.curriculum.moveLesson, input, z.void());
    },
    async reorderLessons(topicId, lessonIds) {
      await executeMutation(api.curriculum.reorderLessons, { topicId, lessonIds }, z.void());
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
      const manifest = CurriculumManifestSchema.parse(input.manifest);
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
        CurriculumSyncSummarySchema
      );
    },
    async exportManifest() {
      return await executeQuery(api.curriculum.exportManifest, {}, CurriculumManifestSchema);
    }
  };
};
var createCurriculumHttpClient = (convexUrl2) => createCurriculumClient(new ConvexHttpClient(convexUrl2));
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
export {
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
};
