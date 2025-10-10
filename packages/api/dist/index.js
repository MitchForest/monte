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
  CurriculumTreeSchema,
  CurriculumTreeUnitSchema,
  UserProfileSchema,
  UserRoleSchema
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
var CreateUnitResultSchema = z.object({ unitId: IdSchema() });
var CreateTopicResultSchema = z.object({ topicId: IdSchema() });
var CreateLessonResultSchema = z.object({ lessonId: IdSchema() });
var LessonDraftRecordListSchema = LessonDraftRecordSchema.array();
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
      return await executeMutation(api.curriculum.createUnit, input, CreateUnitResultSchema);
    },
    async updateUnit(input) {
      await executeMutation(api.curriculum.updateUnit, input, z.void());
    },
    async deleteUnit(unitId) {
      await executeMutation(api.curriculum.deleteUnit, { unitId }, z.void());
    },
    async reorderUnits(unitIds) {
      await executeMutation(api.curriculum.reorderUnits, { unitIds }, z.void());
    },
    async createTopic(input) {
      return await executeMutation(api.curriculum.createTopic, input, CreateTopicResultSchema);
    },
    async updateTopic(input) {
      await executeMutation(api.curriculum.updateTopic, input, z.void());
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
      await executeMutation(api.curriculum.saveLessonDraft, {
        lessonId,
        draft: normalizeLessonDocument(draft)
      }, z.void());
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
    async listLessons(topicId) {
      return await executeQuery(
        api.curriculum.listLessons,
        { topicId },
        LessonDraftRecordListSchema
      );
    },
    async ensureUserProfile() {
      return await executeMutation(api.auth.ensureUserProfile, {}, UserRoleSchema);
    },
    async getCurrentUserProfile() {
      return await executeQuery(api.auth.getCurrentUserProfile, {}, UserProfileSchema.nullable());
    },
    async getCurrentUserRole() {
      return await executeQuery(api.auth.getCurrentUserRole, {}, UserRoleSchema.nullable());
    },
    async updateUserRole(targetUserId, role) {
      await executeMutation(api.auth.updateUserRole, { targetUserId, role }, z.void());
    }
  };
};
var createCurriculumHttpClient = (convexUrl) => createCurriculumClient(new ConvexHttpClient(convexUrl));
export {
  createCurriculumClient,
  createCurriculumHttpClient
};
