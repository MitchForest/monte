import type {
  CurriculumClientManager,
  CurriculumManifest,
  CurriculumSyncSummary,
  CurriculumTree,
  CurriculumTreeLesson,
  CurriculumTreeTopic,
  CurriculumTreeUnit,
  LessonAuthoringUpdate,
  LessonDraftRecord,
} from '@monte/api';
import type { Id } from '@monte/types';

let manager: CurriculumClientManager | null = null;

export const registerCurriculumClientManager = (instance: CurriculumClientManager) => {
  manager = instance;
};

export const unregisterCurriculumClientManager = (instance: CurriculumClientManager) => {
  if (manager === instance) {
    manager = null;
  }
};

const ensureManager = (): CurriculumClientManager => {
  if (!manager) {
    throw new Error('Curriculum client manager not registered. Wrap usage in CurriculumProvider.');
  }
  return manager;
};

export const getCurriculumClientManager = ensureManager;

export const getCurriculumClient = () => ensureManager();

export const isCurriculumApiAvailable = () => ensureManager().isApiAvailable();
export const isCurriculumAuthReady = () => ensureManager().isAuthReady();
export const setCurriculumAuthToken = (token?: string | null) => ensureManager().setAuthToken(token);
export const clearAuthToken = () => ensureManager().clearAuthToken();

export const fetchCurriculumTree = () => ensureManager().fetchCurriculumTree();
export const fetchUnitBySlug = (slug: string) => ensureManager().fetchUnitBySlug(slug);
export const fetchLessonBySlug = (slug: string) => ensureManager().fetchLessonBySlug(slug);
export const fetchLessonById = (lessonId: Id<'lessons'>) => ensureManager().fetchLessonById(lessonId);
export const createUnit = (...args: Parameters<CurriculumClientManager['createUnit']>) =>
  ensureManager().createUnit(...args);
export const updateUnit = (...args: Parameters<CurriculumClientManager['updateUnit']>) =>
  ensureManager().updateUnit(...args);
export const deleteUnit = (...args: Parameters<CurriculumClientManager['deleteUnit']>) =>
  ensureManager().deleteUnit(...args);
export const reorderUnits = (...args: Parameters<CurriculumClientManager['reorderUnits']>) =>
  ensureManager().reorderUnits(...args);
export const createTopic = (...args: Parameters<CurriculumClientManager['createTopic']>) =>
  ensureManager().createTopic(...args);
export const updateTopic = (...args: Parameters<CurriculumClientManager['updateTopic']>) =>
  ensureManager().updateTopic(...args);
export const deleteTopic = (...args: Parameters<CurriculumClientManager['deleteTopic']>) =>
  ensureManager().deleteTopic(...args);
export const moveTopic = (...args: Parameters<CurriculumClientManager['moveTopic']>) =>
  ensureManager().moveTopic(...args);
export const reorderTopics = (...args: Parameters<CurriculumClientManager['reorderTopics']>) =>
  ensureManager().reorderTopics(...args);
export const createLesson = (...args: Parameters<CurriculumClientManager['createLesson']>) =>
  ensureManager().createLesson(...args);
export const saveLessonDraft = (
  ...args: Parameters<CurriculumClientManager['saveLessonDraft']>
) => ensureManager().saveLessonDraft(...args);
export const publishLesson = (...args: Parameters<CurriculumClientManager['publishLesson']>) =>
  ensureManager().publishLesson(...args);
export const deleteLesson = (...args: Parameters<CurriculumClientManager['deleteLesson']>) =>
  ensureManager().deleteLesson(...args);
export const moveLesson = (...args: Parameters<CurriculumClientManager['moveLesson']>) =>
  ensureManager().moveLesson(...args);
export const reorderLessons = (
  ...args: Parameters<CurriculumClientManager['reorderLessons']>
) => ensureManager().reorderLessons(...args);
export const updateLessonAuthoring = (
  ...args: Parameters<CurriculumClientManager['updateLessonAuthoring']>
) => ensureManager().updateLessonAuthoring(...args);
export const listLessons = (...args: Parameters<CurriculumClientManager['listLessons']>) =>
  ensureManager().listLessons(...args);
export const syncManifest = (...args: Parameters<CurriculumClientManager['syncManifest']>) =>
  ensureManager().syncManifest(...args);
export const exportManifest = (
  ...args: Parameters<CurriculumClientManager['exportManifest']>
) => ensureManager().exportManifest(...args);
export const fetchLessonDrafts = (
  ...args: Parameters<CurriculumClientManager['listLessons']>
) => ensureManager().listLessons(...args);

export type {
  CurriculumClientManager,
  CurriculumManifest,
  CurriculumSyncSummary,
  CurriculumTree,
  CurriculumTreeLesson,
  CurriculumTreeTopic,
  CurriculumTreeUnit,
  LessonAuthoringUpdate,
  LessonDraftRecord,
};
