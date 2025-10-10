import type { Lesson, LessonDocument } from '@monte/types';

interface NormalizedLesson {
  lesson: Lesson;
  document: LessonDocument;
}

export const normalizeLessonDocument = (document: LessonDocument): NormalizedLesson => ({
  lesson: document.lesson,
  document,
});

export const normalizeLessonDocuments = (
  documents: LessonDocument[],
): NormalizedLesson[] => documents.map((document) => normalizeLessonDocument(document));

export const extractLessons = (documents: LessonDocument[]): Lesson[] =>
  normalizeLessonDocuments(documents).map((entry) => entry.lesson);
