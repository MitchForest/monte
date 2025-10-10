import { createCurriculumHttpClient } from '@monte/api';
import type { CurriculumClient } from '@monte/api';
import type { Id, UserRole } from '@monte/types';
export type {
  CurriculumTree,
  CurriculumTreeLesson,
  CurriculumTreeTopic,
  CurriculumTreeUnit,
  LessonDraftRecord,
} from '@monte/api';

const convexUrl = (() => {
  const value: unknown = import.meta.env.VITE_CONVEX_URL ?? import.meta.env.CONVEX_URL;
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

  const defaultRole: UserRole = 'teacher';

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
    async listLessons() {
      return notReady('listLessons', []);
    },
    async ensureUserProfile() {
      return notReady('ensureUserProfile', defaultRole);
    },
    async getCurrentUserProfile() {
      return notReady('getCurrentUserProfile', null);
    },
    async getCurrentUserRole() {
      return notReady('getCurrentUserRole', null);
    },
    async updateUserRole() {
      await reject('updateUserRole');
    },
  };
};

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
  reorderLessons,
  listLessons,
  ensureUserProfile,
  getCurrentUserProfile,
  getCurrentUserRole,
  updateUserRole,
} = curriculumClient;

export const fetchLessonDrafts = (topicId?: Id<'topics'>) => curriculumClient.listLessons(topicId);
