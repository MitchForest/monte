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
import { assertInventoryConsistency, normalizeLessonDocumentTimelines } from "@monte/lesson-service";

// src/env.ts
var readMetaEnvValue = (key) => {
  if (typeof import.meta !== "undefined" && typeof import.meta.env === "object") {
    const env = import.meta.env;
    const candidate = env?.[key];
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return void 0;
};
var readNodeEnvValue = (key) => {
  if (typeof globalThis === "object" && "process" in globalThis) {
    const env = globalThis.process?.env;
    const candidate = env?.[key];
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return void 0;
};
var readEnvString = (key) => readMetaEnvValue(key) ?? readNodeEnvValue(key);
var requireEnvString = (key) => {
  const value = readEnvString(key);
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  throw new Error(`Missing required environment variable: ${key}`);
};

// src/curriculum.ts
var now = () => Date.now();
var pickScenarioBinding = (document) => {
  for (const segment of document.lesson.segments) {
    if (segment.scenario) {
      return segment.scenario;
    }
  }
  return document.meta?.scenario;
};
var convexUrl = (() => {
  const value = readEnvString("VITE_CONVEX_URL") ?? readEnvString("CONVEX_URL");
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
  const normalized = normalizeLessonDocumentTimelines(parsed);
  const lesson = {
    ...normalized.lesson,
    focusSkills: normalized.lesson.focusSkills ?? [],
    materials: normalized.lesson.materials ?? []
  };
  const result = {
    ...normalized,
    lesson,
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
  assertInventoryConsistency(result);
  return result;
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
var createCurriculumClientManager = (client, { apiAvailable = true } = {}) => {
  let authReady = !apiAvailable;
  const managedClient = {
    ...client,
    setAuthToken(token) {
      client.setAuthToken(token ?? null);
      authReady = !apiAvailable || typeof token === "string";
    },
    clearAuthToken() {
      client.clearAuthToken();
      authReady = !apiAvailable;
    }
  };
  return {
    ...managedClient,
    client: managedClient,
    isApiAvailable: () => apiAvailable,
    isAuthReady: () => authReady
  };
};
var createCurriculumHttpClient = (convexUrl2) => createCurriculumClient(new ConvexHttpClient(convexUrl2));
var createBrowserCurriculumClientManager = () => {
  if (!convexUrl) {
    return createCurriculumClientManager(createUnavailableCurriculumClient(), {
      apiAvailable: false
    });
  }
  return createCurriculumClientManager(createCurriculumHttpClient(convexUrl), {
    apiAvailable: true
  });
};
var defaultCurriculumClientManager = createBrowserCurriculumClientManager();
if (!convexUrl) {
  console.warn(missingUrlMessage);
}
var curriculumClientManager = defaultCurriculumClientManager;
var isCurriculumApiAvailable = curriculumClientManager.isApiAvailable();
var isCurriculumAuthReady = () => curriculumClientManager.isAuthReady();
var setCurriculumAuthToken = (token) => {
  curriculumClientManager.setAuthToken(token ?? null);
};
var clearAuthToken = () => {
  curriculumClientManager.clearAuthToken();
};
var {
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
} = curriculumClientManager;
var fetchLessonDrafts = (topicId) => curriculumClientManager.listLessons(topicId);

// src/auth.ts
import { z as z2 } from "zod";
import {
  AuthInvitationSchema,
  AuthMemberSchema,
  AuthOrganizationSchema,
  OrganizationOverviewSchema
} from "@monte/types";
var AuthOrganizationListSchema = z2.array(AuthOrganizationSchema);
var AuthMemberNullableSchema = z2.union([AuthMemberSchema, z2.null()]);
var AuthInvitationListSchema = z2.array(AuthInvitationSchema);
var parseAuthOrganization = (input) => AuthOrganizationSchema.parse(input);
var parseAuthOrganizationList = (input) => AuthOrganizationListSchema.parse(input);
var parseAuthMember = (input) => AuthMemberSchema.parse(input);
var parseAuthMemberOrNull = (input) => AuthMemberNullableSchema.parse(input);
var parseAuthInvitationList = (input) => AuthInvitationListSchema.parse(input);
var parseOrganizationOverview = (input) => OrganizationOverviewSchema.parse(input);
export {
  clearAuthToken,
  createBrowserCurriculumClientManager,
  createCurriculumClient,
  createCurriculumClientManager,
  createCurriculumHttpClient,
  createLesson,
  createTopic,
  createUnit,
  curriculumClientManager,
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
  parseAuthInvitationList,
  parseAuthMember,
  parseAuthMemberOrNull,
  parseAuthOrganization,
  parseAuthOrganizationList,
  parseOrganizationOverview,
  publishLesson,
  readEnvString,
  reorderLessons,
  reorderTopics,
  reorderUnits,
  requireEnvString,
  saveLessonDraft,
  setCurriculumAuthToken,
  syncManifest,
  updateLessonAuthoring,
  updateTopic,
  updateUnit
};
