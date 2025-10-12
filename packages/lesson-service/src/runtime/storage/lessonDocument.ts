import { z } from 'zod';
import { LessonDocumentSchema, type LessonDocument } from '@monte/types';

const LESSON_DOCUMENT_STORAGE_VERSION = 1;

const StoredLessonDocumentSchema: z.ZodType<{
  version: number;
  document: LessonDocument;
}> = z.object({
  version: z.literal(LESSON_DOCUMENT_STORAGE_VERSION),
  document: LessonDocumentSchema,
});

export const serializeLessonDocument = (document: LessonDocument): string =>
  JSON.stringify({
    version: LESSON_DOCUMENT_STORAGE_VERSION,
    document,
  });

export const deserializeLessonDocument = (raw: string): LessonDocument | undefined => {
  const parsed = StoredLessonDocumentSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return undefined;
  }
  return parsed.data.document;
};
