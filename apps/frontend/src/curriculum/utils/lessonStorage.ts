import type { LessonDocument } from '../types';

const STORAGE_PREFIX = 'monte:lesson-doc:';

export const getLessonStorageKey = (lessonId: string) => `${STORAGE_PREFIX}${lessonId}`;

export const readStoredLessonDocument = (lessonId: string): LessonDocument | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(getLessonStorageKey(lessonId));
    if (!raw) return undefined;
    return JSON.parse(raw) as LessonDocument;
  } catch (error) {
    console.warn('Failed to parse stored lesson document', error);
    return undefined;
  }
};

export const writeStoredLessonDocument = (document: LessonDocument) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getLessonStorageKey(document.lesson.id), JSON.stringify(document));
  } catch (error) {
    console.error('Failed to persist lesson document', error);
    throw error;
  }
};

export const clearStoredLessonDocument = (lessonId: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getLessonStorageKey(lessonId));
};
