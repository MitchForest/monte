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
  createCurriculumClient: () => createCurriculumClient,
  createCurriculumHttpClient: () => createCurriculumHttpClient
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
var now = () => Date.now();
var pickScenarioBinding = (document) => {
  for (const segment of document.lesson.segments) {
    if (segment.scenario) {
      return segment.scenario;
    }
  }
  return document.meta?.scenario;
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
  return {
    ...parsed,
    lesson: {
      ...parsed.lesson,
      focusSkills: parsed.lesson.focusSkills ?? [],
      materials: parsed.lesson.materials ?? [],
      segments: parsed.lesson.segments ?? []
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
      return await executeMutation(api.curriculum.createUnit, input, CreateUnitResultSchema);
    },
    async updateUnit(input) {
      await executeMutation(api.curriculum.updateUnit, input, import_zod.z.void());
    },
    async deleteUnit(unitId) {
      await executeMutation(api.curriculum.deleteUnit, { unitId }, import_zod.z.void());
    },
    async reorderUnits(unitIds) {
      await executeMutation(api.curriculum.reorderUnits, { unitIds }, import_zod.z.void());
    },
    async createTopic(input) {
      return await executeMutation(api.curriculum.createTopic, input, CreateTopicResultSchema);
    },
    async updateTopic(input) {
      await executeMutation(api.curriculum.updateTopic, input, import_zod.z.void());
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
      await executeMutation(api.curriculum.saveLessonDraft, {
        lessonId,
        draft: normalizeLessonDocument(draft)
      }, import_zod.z.void());
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
    async listLessons(topicId) {
      return await executeQuery(
        api.curriculum.listLessons,
        { topicId },
        LessonDraftRecordListSchema
      );
    },
    async ensureUserProfile() {
      return await executeMutation(api.auth.ensureUserProfile, {}, import_types.UserRoleSchema);
    },
    async getCurrentUserProfile() {
      return await executeQuery(api.auth.getCurrentUserProfile, {}, import_types.UserProfileSchema.nullable());
    },
    async getCurrentUserRole() {
      return await executeQuery(api.auth.getCurrentUserRole, {}, import_types.UserRoleSchema.nullable());
    },
    async updateUserRole(targetUserId, role) {
      await executeMutation(api.auth.updateUserRole, { targetUserId, role }, import_zod.z.void());
    }
  };
};
var createCurriculumHttpClient = (convexUrl) => createCurriculumClient(new import_browser.ConvexHttpClient(convexUrl));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createCurriculumClient,
  createCurriculumHttpClient
});
