import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { LessonDocument } from '../../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const lessonsDir = path.resolve(dataDir, 'lessons');
const catalogPath = path.resolve(dataDir, 'catalog.json');

export interface CatalogLesson {
  slug: string;
  documentId: string;
  file: string;
  publish?: boolean;
}

export interface CatalogTopic {
  slug: string;
  title: string;
  overview?: string;
  focusSkills?: string[];
  estimatedDurationMinutes?: number;
  status?: 'active' | 'archived';
  lessons: CatalogLesson[];
}

export interface CatalogUnit {
  slug: string;
  title: string;
  summary?: string;
  coverImage?: string;
  status?: 'active' | 'archived';
  topics: CatalogTopic[];
}

export interface CurriculumCatalog {
  units: CatalogUnit[];
}

export const loadCatalog = async (): Promise<CurriculumCatalog> => {
  const raw = await fs.readFile(catalogPath, 'utf8');
  return JSON.parse(raw) as CurriculumCatalog;
};

export const loadLessonDocuments = async (): Promise<LessonDocument[]> => {
  const entries = await fs.readdir(lessonsDir, { withFileTypes: true });
  const docs: LessonDocument[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const filePath = path.resolve(lessonsDir, entry.name);
    const contents = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(contents) as LessonDocument;
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
  return JSON.parse(raw) as LessonDocument;
};
