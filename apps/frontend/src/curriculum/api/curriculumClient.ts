import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../backend/convex/_generated/api';
import type { Id } from '../../../../backend/convex/_generated/dataModel';
import type { LessonDocument } from '../types';

const convexUrl = (() => {
  const value: unknown = import.meta.env.VITE_CONVEX_URL ?? import.meta.env.CONVEX_URL;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
})();

if (!convexUrl) {
  throw new Error('VITE_CONVEX_URL is not set. Configure the Convex deployment URL to enable authoring.');
}

const client = new ConvexHttpClient(convexUrl);

type SaveLessonDraftArgs = typeof api.curriculum.saveLessonDraft._args;

export interface CurriculumTreeLesson {
  _id: Id<'lessons'>;
  slug: string;
  order: number;
  status: 'draft' | 'published';
  title: string;
  summary: string;
  updatedAt: number;
}

export interface CurriculumTreeTopic {
  _id: Id<'topics'>;
  unitId: Id<'units'>;
  slug: string;
  title: string;
  overview?: string;
  focusSkills: string[];
  estimatedDurationMinutes?: number;
  order: number;
  status: 'active' | 'archived';
  lessons: CurriculumTreeLesson[];
}

export interface CurriculumTreeUnit {
  _id: Id<'units'>;
  slug: string;
  title: string;
  summary?: string;
  coverImage?: string;
  order: number;
  status: 'active' | 'archived';
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  topics: CurriculumTreeTopic[];
}

export type CurriculumTree = CurriculumTreeUnit[];

export const fetchCurriculumTree = async (): Promise<CurriculumTree> => {
  return await client.query(api.curriculum.listCurriculumTree, {});
};

export const fetchUnitBySlug = async (slug: string) => {
  return await client.query(api.curriculum.getUnitBySlug, { slug });
};

export const fetchLessonBySlug = async (slug: string) => {
  return await client.query(api.curriculum.getLessonBySlug, { slug });
};

export const fetchLessonById = async (lessonId: Id<'lessons'>) => {
  return await client.query(api.curriculum.getLessonById, { lessonId });
};

export const createUnit = async (input: {
  title: string;
  slug?: string;
  summary?: string;
  coverImage?: string;
  metadata?: Record<string, unknown>;
}) => {
  return await client.mutation(api.curriculum.createUnit, input);
};

export const updateUnit = async (input: {
  unitId: Id<'units'>;
  title?: string;
  slug?: string;
  summary?: string;
  coverImage?: string;
  metadata?: Record<string, unknown>;
  status?: 'active' | 'archived';
}) => {
  await client.mutation(api.curriculum.updateUnit, input);
};

export const deleteUnit = async (unitId: Id<'units'>) => {
  await client.mutation(api.curriculum.deleteUnit, { unitId });
};

export const reorderUnits = async (unitIds: Id<'units'>[]) => {
  await client.mutation(api.curriculum.reorderUnits, { unitIds });
};

export const createTopic = async (input: {
  unitId: Id<'units'>;
  title: string;
  slug?: string;
  overview?: string;
  focusSkills?: string[];
  estimatedDurationMinutes?: number;
  metadata?: Record<string, unknown>;
}) => {
  return await client.mutation(api.curriculum.createTopic, input);
};

export const updateTopic = async (input: {
  topicId: Id<'topics'>;
  title?: string;
  slug?: string;
  overview?: string;
  focusSkills?: string[];
  estimatedDurationMinutes?: number;
  metadata?: Record<string, unknown>;
  status?: 'active' | 'archived';
}) => {
  await client.mutation(api.curriculum.updateTopic, input);
};

export const deleteTopic = async (topicId: Id<'topics'>) => {
  await client.mutation(api.curriculum.deleteTopic, { topicId });
};

export const moveTopic = async (input: {
  topicId: Id<'topics'>;
  targetUnitId: Id<'units'>;
  targetIndex: number;
}) => {
  await client.mutation(api.curriculum.moveTopic, input);
};

export const reorderTopics = async (unitId: Id<'units'>, topicIds: Id<'topics'>[]) => {
  await client.mutation(api.curriculum.reorderTopics, { unitId, topicIds });
};

export const createLesson = async (input: { topicId: Id<'topics'>; title: string; slug?: string }) => {
  return await client.mutation(api.curriculum.createLesson, input);
};

export const saveLessonDraft = async (lessonId: Id<'lessons'>, draft: LessonDocument) => {
  const normalizeTimestamp = (value: unknown, fallback: number) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
  };

  const baseline = Date.now();
  const draftMeta = draft.meta ?? {};
  const normalizedDraft: SaveLessonDraftArgs['draft'] = {
    ...draft,
    lesson: {
      ...draft.lesson,
      focusSkills: draft.lesson.focusSkills ?? [],
      materials: draft.lesson.materials ?? [],
      segments: draft.lesson.segments ?? [],
    },
    meta: {
      ...draftMeta,
      createdAt: normalizeTimestamp(draftMeta.createdAt, baseline),
      updatedAt: normalizeTimestamp(draftMeta.updatedAt, baseline),
    },
  };

  await client.mutation(api.curriculum.saveLessonDraft, { lessonId, draft: normalizedDraft });
};

export const publishLesson = async (lessonId: Id<'lessons'>) => {
  await client.mutation(api.curriculum.publishLesson, { lessonId });
};

export const deleteLesson = async (lessonId: Id<'lessons'>) => {
  await client.mutation(api.curriculum.deleteLesson, { lessonId });
};

export const moveLesson = async (input: {
  lessonId: Id<'lessons'>;
  targetTopicId: Id<'topics'>;
  targetIndex: number;
}) => {
  await client.mutation(api.curriculum.moveLesson, input);
};

export const reorderLessons = async (topicId: Id<'topics'>, lessonIds: Id<'lessons'>[]) => {
  await client.mutation(api.curriculum.reorderLessons, { topicId, lessonIds });
};

export const listLessons = async (topicId?: Id<'topics'>) => {
  return await client.query(api.curriculum.listLessons, { topicId });
};
