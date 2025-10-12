import { ConvexHttpClient } from 'convex/browser';
import { z } from 'zod';
import { api } from '../convex/_generated/api.js';
import {
  Id,
  IdSchema,
  LessonDocument,
  LessonDocumentSchema,
  LessonDraftRecord,
  LessonDraftRecordSchema,
  LessonAuthoringStatus,
  LessonAuthoringStatusSchema,
  LessonGradeLevel,
  LessonGradeLevelSchema,
  CurriculumTree,
  CurriculumTreeSchema,
  CurriculumTreeUnit,
  CurriculumTreeUnitSchema,
  CurriculumManifest,
  CurriculumManifestSchema,
  CurriculumSyncSummary,
  CurriculumSyncSummarySchema,
  EntityMetadata,
  EntityMetadataSchema,
} from '@monte/types';
import { assertInventoryConsistency, normalizeLessonDocumentTimelines } from '@monte/lesson-service';

export type {
  CurriculumTree,
  CurriculumTreeUnit,
  CurriculumTreeTopic,
  CurriculumTreeLesson,
  LessonDraftRecord,
  CurriculumManifest,
  CurriculumSyncSummary,
  LessonAuthoringStatus,
  LessonGradeLevel,
} from '@monte/types';
export type { SyncManifestInput, UpdateLessonAuthoringInput, LessonAuthoringUpdate };

const now = () => Date.now();

const pickScenarioBinding = (document: LessonDocument) => {
  for (const segment of document.lesson.segments) {
    if (segment.scenario) {
      return segment.scenario;
    }
  }
  return document.meta?.scenario;
};

type SyncManifestInput = {
  manifest: CurriculumManifest;
  prune?: boolean;
  manifestCommit?: string;
  defaultStatus?: LessonAuthoringStatus;
};

type UpdateLessonAuthoringInput = {
  lessonId: Id<'lessons'>;
  authoringStatus?: LessonAuthoringStatus | null;
  assigneeId?: string | null;
  authoringNotes?: string | null;
  gradeLevels?: LessonGradeLevel[] | null;
};

type LessonAuthoringUpdate = {
  lessonId: Id<'lessons'>;
  authoringStatus: LessonAuthoringStatus | null;
  assigneeId: string | null;
  authoringNotes: string | null;
  gradeLevels: LessonGradeLevel[];
  updatedAt: number;
};

const readEnvValue = (key: string): unknown => {
  const metaEnv = (import.meta as unknown as { env?: Record<string, unknown> })?.env;
  if (metaEnv && key in metaEnv) {
    return metaEnv[key];
  }
  const nodeEnv = (globalThis as unknown as { process?: { env?: Record<string, unknown> } }).process?.env;
  if (nodeEnv && key in nodeEnv) {
    return nodeEnv[key];
  }
  return undefined;
};

const convexUrl = (() => {
  const value: unknown = readEnvValue('VITE_CONVEX_URL') ?? readEnvValue('CONVEX_URL');
  return typeof value === 'string' && value.length > 0 ? value : undefined;
})();

const missingUrlMessage =
  'Curriculum client unavailable: set VITE_CONVEX_URL to enable live authoring. Falling back to local-only stubs.';

const createUnavailableCurriculumClient = (): CurriculumClient => {
  const warn = (method: string) => {
    console.warn(`${missingUrlMessage} Called ${method}.`);
  };

  const notReady = <T>(method: string, fallback: T): Promise<T> => {
    warn(method);
    return Promise.resolve(fallback);
  };

  const reject = <T>(method: string): Promise<T> => {
    warn(method);
    return Promise.reject(new Error(missingUrlMessage));
  };

  return {
    setAuthToken: () => warn('setAuthToken'),
    clearAuthToken: () => warn('clearAuthToken'),
    async fetchCurriculumTree() {
      return notReady('fetchCurriculumTree', []);
    },
    async fetchUnitBySlug() {
      return notReady('fetchUnitBySlug', undefined);
    },
    async fetchLessonBySlug() {
      return notReady('fetchLessonBySlug', undefined);
    },
    async fetchLessonById() {
      return notReady('fetchLessonById', undefined);
    },
    async createUnit() {
      return reject('createUnit');
    },
    async updateUnit() {
      await reject('updateUnit');
    },
    async deleteUnit() {
      await reject('deleteUnit');
    },
    async reorderUnits() {
      await reject('reorderUnits');
    },
    async createTopic() {
      return reject('createTopic');
    },
    async updateTopic() {
      await reject('updateTopic');
    },
    async deleteTopic() {
      await reject('deleteTopic');
    },
    async moveTopic() {
      await reject('moveTopic');
    },
    async reorderTopics() {
      await reject('reorderTopics');
    },
    async createLesson() {
      return reject('createLesson');
    },
    async saveLessonDraft() {
      await reject('saveLessonDraft');
    },
    async publishLesson() {
      await reject('publishLesson');
    },
    async deleteLesson() {
      await reject('deleteLesson');
    },
    async moveLesson() {
      await reject('moveLesson');
    },
    async reorderLessons() {
      await reject('reorderLessons');
    },
    async updateLessonAuthoring() {
      return reject<LessonAuthoringUpdate>('updateLessonAuthoring');
    },
    async listLessons() {
      return notReady('listLessons', []);
    },
    async syncManifest() {
      return reject('syncManifest');
    },
    async exportManifest() {
      return reject('exportManifest');
    },
  };
};


export interface CurriculumClient {
  setAuthToken: (token?: string | null) => void;
  clearAuthToken: () => void;
  fetchCurriculumTree: () => Promise<CurriculumTree>;
  fetchUnitBySlug: (slug: string) => Promise<CurriculumTreeUnit | undefined>;
  fetchLessonBySlug: (slug: string) => Promise<LessonDraftRecord | undefined>;
  fetchLessonById: (lessonId: Id<'lessons'>) => Promise<LessonDraftRecord | undefined>;
  createUnit: (input: {
    title: string;
    slug?: string;
    summary?: string;
    coverImage?: string;
    metadata?: EntityMetadata;
  }) => Promise<{ unitId: Id<'units'> }>; 
  updateUnit: (input: {
    unitId: Id<'units'>;
    title?: string;
    slug?: string;
    summary?: string;
    coverImage?: string;
    metadata?: EntityMetadata;
    status?: 'active' | 'archived';
  }) => Promise<void>;
  deleteUnit: (unitId: Id<'units'>) => Promise<void>;
  reorderUnits: (unitIds: Id<'units'>[]) => Promise<void>;
  createTopic: (input: {
    unitId: Id<'units'>;
    title: string;
    slug?: string;
    overview?: string;
    focusSkills?: string[];
    estimatedDurationMinutes?: number;
    metadata?: EntityMetadata;
  }) => Promise<{ topicId: Id<'topics'> }>;
  updateTopic: (input: {
    topicId: Id<'topics'>;
    title?: string;
    slug?: string;
    overview?: string;
    focusSkills?: string[];
    estimatedDurationMinutes?: number;
    metadata?: EntityMetadata;
    status?: 'active' | 'archived';
  }) => Promise<void>;
  deleteTopic: (topicId: Id<'topics'>) => Promise<void>;
  moveTopic: (input: {
    topicId: Id<'topics'>;
    targetUnitId: Id<'units'>;
    targetIndex: number;
  }) => Promise<void>;
  reorderTopics: (unitId: Id<'units'>, topicIds: Id<'topics'>[]) => Promise<void>;
  createLesson: (input: { topicId: Id<'topics'>; title: string; slug?: string }) => Promise<{ lessonId: Id<'lessons'> }>;
  saveLessonDraft: (lessonId: Id<'lessons'>, draft: LessonDocument) => Promise<void>;
  publishLesson: (lessonId: Id<'lessons'>) => Promise<void>;
  deleteLesson: (lessonId: Id<'lessons'>) => Promise<void>;
  moveLesson: (input: {
    lessonId: Id<'lessons'>;
    targetTopicId: Id<'topics'>;
    targetIndex: number;
  }) => Promise<void>;
  reorderLessons: (topicId: Id<'topics'>, lessonIds: Id<'lessons'>[]) => Promise<void>;
  updateLessonAuthoring: (input: UpdateLessonAuthoringInput) => Promise<LessonAuthoringUpdate>;
  listLessons: (topicId?: Id<'topics'>) => Promise<LessonDraftRecord[]>;
  syncManifest: (input: SyncManifestInput) => Promise<CurriculumSyncSummary>;
  exportManifest: () => Promise<CurriculumManifest>;
}

type SaveLessonDraftArgs = typeof api.curriculum.saveLessonDraft._args;

const normalizeTimestamp = (value: unknown, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const normalizeLessonDocument = (document: LessonDocument): SaveLessonDraftArgs['draft'] => {
  const parsed = LessonDocumentSchema.parse(document);
  const baseline = now();
  const draftMeta = parsed.meta ?? {};
  const scenarioBinding = pickScenarioBinding(parsed);
  const normalized = normalizeLessonDocumentTimelines(parsed);
  const lesson = {
    ...normalized.lesson,
    focusSkills: normalized.lesson.focusSkills ?? [],
    materials: normalized.lesson.materials ?? [],
  };
  const result: LessonDocument = {
    ...normalized,
    lesson,
    meta: {
      ...draftMeta,
      createdAt: normalizeTimestamp(draftMeta.createdAt, baseline),
      updatedAt: normalizeTimestamp(draftMeta.updatedAt, baseline),
      scenario: scenarioBinding
        ? {
            kind: scenarioBinding.kind,
            seed: scenarioBinding.seed,
            snapshot: scenarioBinding.snapshot,
            notes: scenarioBinding.notes,
          }
        : undefined,
    },
  };
  assertInventoryConsistency(result);
  return result;
};

const CreateUnitResultSchema = z.object({ unitId: IdSchema<'units'>() });
const CreateTopicResultSchema = z.object({ topicId: IdSchema<'topics'>() });
const CreateLessonResultSchema = z.object({ lessonId: IdSchema<'lessons'>() });
const LessonDraftRecordListSchema = LessonDraftRecordSchema.array();
const LessonAuthoringUpdateResultSchema = z.object({
  lessonId: IdSchema<'lessons'>(),
  authoringStatus: LessonAuthoringStatusSchema.nullable(),
  assigneeId: z.string().nullable(),
  authoringNotes: z.string().nullable(),
  gradeLevels: z.array(LessonGradeLevelSchema),
  updatedAt: z.number(),
});

export const createCurriculumClient = (httpClient: ConvexHttpClient): CurriculumClient => {
  const executeQuery = async <Schema extends z.ZodTypeAny>(
    queryRef: unknown,
    args: unknown,
    schema: Schema,
  ): Promise<z.infer<Schema>> => schema.parse(await httpClient.query(queryRef as never, args as never));

  const executeMutation = async <Schema extends z.ZodTypeAny>(
    mutationRef: unknown,
    args: unknown,
    schema: Schema,
  ): Promise<z.infer<Schema>> => schema.parse(await httpClient.mutation(mutationRef as never, args as never));

  const setAuthToken = (token?: string | null) => {
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
        CurriculumTreeUnitSchema.optional(),
      );
      return result ?? undefined;
    },
    async fetchLessonBySlug(slug) {
      const record = await executeQuery(
        api.curriculum.getLessonBySlug,
        { slug },
        LessonDraftRecordSchema.optional(),
      );
      return record ?? undefined;
    },
    async fetchLessonById(lessonId) {
      const record = await executeQuery(
        api.curriculum.getLessonById,
        { lessonId },
        LessonDraftRecordSchema.optional(),
      );
      return record ?? undefined;
    },
    async createUnit(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? EntityMetadataSchema.parse(input.metadata) : undefined,
      };
      return await executeMutation(api.curriculum.createUnit, payload, CreateUnitResultSchema);
    },
    async updateUnit(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? EntityMetadataSchema.parse(input.metadata) : undefined,
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
        metadata: input.metadata ? EntityMetadataSchema.parse(input.metadata) : undefined,
      };
      return await executeMutation(api.curriculum.createTopic, payload, CreateTopicResultSchema);
    },
    async updateTopic(input) {
      const payload = {
        ...input,
        metadata: input.metadata ? EntityMetadataSchema.parse(input.metadata) : undefined,
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
          draft: normalized,
        },
        z.void(),
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
      const mapNullable = <T>(value: T | null | undefined) =>
        value === undefined ? undefined : value;
      const payload = {
        lessonId: input.lessonId,
        authoringStatus: mapNullable(input.authoringStatus),
        assigneeId: mapNullable(input.assigneeId),
        authoringNotes: mapNullable(input.authoringNotes),
        gradeLevels: mapNullable(input.gradeLevels),
      };
      const result = await executeMutation(
        api.curriculum.updateLessonAuthoring,
        payload,
        LessonAuthoringUpdateResultSchema,
      );
      const normalized: LessonAuthoringUpdate = {
        lessonId: result.lessonId as Id<'lessons'>,
        authoringStatus: result.authoringStatus as LessonAuthoringStatus | null,
        assigneeId: result.assigneeId,
        authoringNotes: result.authoringNotes,
        gradeLevels: result.gradeLevels as LessonGradeLevel[],
        updatedAt: result.updatedAt,
      };
      return normalized;
    },
    async listLessons(topicId) {
      return await executeQuery(
        api.curriculum.listLessons,
        { topicId },
        LessonDraftRecordListSchema,
      );
    },
    async syncManifest(input) {
      const manifest = CurriculumManifestSchema.parse(input.manifest);
      const options = {
        prune: input.prune ?? undefined,
        manifestCommit: input.manifestCommit ?? undefined,
        defaultStatus: input.defaultStatus ?? undefined,
      };
      const hasOptions = Object.values(options).some((value) => value !== undefined);
      const payload = hasOptions ? { manifest, options } : { manifest };
      return await executeMutation(
        api.curriculum.syncManifest,
        payload,
        CurriculumSyncSummarySchema,
      );
    },
    async exportManifest() {
      return await executeQuery(api.curriculum.exportManifest, {}, CurriculumManifestSchema);
    },
  };
};

export const createCurriculumHttpClient = (convexUrl: string) =>
  createCurriculumClient(new ConvexHttpClient(convexUrl));

export const curriculumClient: CurriculumClient = convexUrl
  ? createCurriculumHttpClient(convexUrl)
  : createUnavailableCurriculumClient();

if (!convexUrl) {
  console.warn(missingUrlMessage);
}

export const isCurriculumApiAvailable = Boolean(convexUrl);

let curriculumAuthReady = !isCurriculumApiAvailable;

export const isCurriculumAuthReady = () => curriculumAuthReady;

export const setCurriculumAuthToken = (token?: string | null) => {
  curriculumClient.setAuthToken(token ?? null);
  curriculumAuthReady = !isCurriculumApiAvailable || typeof token === 'string';
};

export const {
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
  exportManifest,
} = curriculumClient;

export const fetchLessonDrafts = (topicId?: Id<'topics'>) => curriculumClient.listLessons(topicId);
