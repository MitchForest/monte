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
  CurriculumTree,
  CurriculumTreeSchema,
  CurriculumTreeUnit,
  CurriculumTreeUnitSchema,
  UserProfile,
  UserProfileSchema,
  UserRole,
  UserRoleSchema,
} from '@monte/types';

export type {
  CurriculumTree,
  CurriculumTreeUnit,
  CurriculumTreeTopic,
  CurriculumTreeLesson,
  LessonDraftRecord,
} from '@monte/types';

const now = () => Date.now();

const pickScenarioBinding = (document: LessonDocument) => {
  for (const segment of document.lesson.segments) {
    if (segment.scenario) {
      return segment.scenario;
    }
  }
  return document.meta?.scenario;
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
    metadata?: Record<string, unknown>;
  }) => Promise<{ unitId: Id<'units'> }>;
  updateUnit: (input: {
    unitId: Id<'units'>;
    title?: string;
    slug?: string;
    summary?: string;
    coverImage?: string;
    metadata?: Record<string, unknown>;
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
    metadata?: Record<string, unknown>;
  }) => Promise<{ topicId: Id<'topics'> }>;
  updateTopic: (input: {
    topicId: Id<'topics'>;
    title?: string;
    slug?: string;
    overview?: string;
    focusSkills?: string[];
    estimatedDurationMinutes?: number;
    metadata?: Record<string, unknown>;
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
  listLessons: (topicId?: Id<'topics'>) => Promise<LessonDraftRecord[]>;
  ensureUserProfile: () => Promise<UserRole>;
  getCurrentUserProfile: () => Promise<UserProfile | null>;
  getCurrentUserRole: () => Promise<UserRole | null>;
  updateUserRole: (targetUserId: string, role: UserRole) => Promise<void>;
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
  return {
    ...parsed,
    lesson: {
      ...parsed.lesson,
      focusSkills: parsed.lesson.focusSkills ?? [],
      materials: parsed.lesson.materials ?? [],
      segments: parsed.lesson.segments ?? [],
    },
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
};

const CreateUnitResultSchema = z.object({ unitId: IdSchema<'units'>() });
const CreateTopicResultSchema = z.object({ topicId: IdSchema<'topics'>() });
const CreateLessonResultSchema = z.object({ lessonId: IdSchema<'lessons'>() });
const LessonDraftRecordListSchema = LessonDraftRecordSchema.array();

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
        draft: normalizeLessonDocument(draft),
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
        LessonDraftRecordListSchema,
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
    },
  };
};

export const createCurriculumHttpClient = (convexUrl: string) =>
  createCurriculumClient(new ConvexHttpClient(convexUrl));
