import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';
import { LessonDocumentSchema, type LessonDocument } from '@monte/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
const dataDir = path.resolve(projectRoot, 'apps/frontend/src/domains/curriculum/data');
const lessonsDir = path.resolve(dataDir, 'lessons');
const catalogPath = path.resolve(dataDir, 'catalog.json');

const CatalogLessonSchema = z.object({
  slug: z.string(),
  documentId: z.string(),
  file: z.string(),
  publish: z.boolean().optional(),
});

const CatalogTopicSchema = z.object({
  slug: z.string(),
  title: z.string(),
  overview: z.string().optional(),
  focusSkills: z.array(z.string()).optional(),
  estimatedDurationMinutes: z.number().optional(),
  status: z.enum(['active', 'archived']).optional(),
  lessons: z.array(CatalogLessonSchema),
});

const CatalogUnitSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
  topics: z.array(CatalogTopicSchema),
});

const CurriculumCatalogSchema = z.object({
  units: z.array(CatalogUnitSchema),
});

export type CatalogLesson = z.infer<typeof CatalogLessonSchema>;
export type CatalogTopic = z.infer<typeof CatalogTopicSchema>;
export type CatalogUnit = z.infer<typeof CatalogUnitSchema>;
export type CurriculumCatalog = z.infer<typeof CurriculumCatalogSchema>;

export const loadCatalog = async (): Promise<CurriculumCatalog> => {
  const raw = await fs.readFile(catalogPath, 'utf8');
  return CurriculumCatalogSchema.parse(JSON.parse(raw));
};

export const loadLessonDocuments = async (): Promise<LessonDocument[]> => {
  const entries = await fs.readdir(lessonsDir, { withFileTypes: true });
  const docs: LessonDocument[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const filePath = path.resolve(lessonsDir, entry.name);
    const contents = await fs.readFile(filePath, 'utf8');
    const parsed = LessonDocumentSchema.parse(JSON.parse(contents));
    docs.push(parsed);
  }
  return docs;
};

export const loadLessonDocumentMap = async () => {
  const docs = await loadLessonDocuments();
  const map = new Map<string, LessonDocument>();
  docs.forEach((doc) => {
    map.set(doc.lesson.id, doc);
  });
  return map;
};

export const resolveLessonDocument = async (fileName: string): Promise<LessonDocument> => {
  const filePath = path.resolve(lessonsDir, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  return LessonDocumentSchema.parse(JSON.parse(raw));
};
