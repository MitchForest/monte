import path from 'node:path';
import process from 'node:process';

import { config as loadEnv } from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';

import type { LessonDocument } from '../types';
import {
  loadCatalog,
  resolveLessonDocument,
  type CatalogLesson,
  type CatalogTopic,
  type CatalogUnit,
} from './utils/loadLessons';

const projectRoot = path.resolve(process.cwd(), '../../');
loadEnv({ path: path.resolve(projectRoot, '.env') });

const convexUrl = process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.error('Missing CONVEX_URL or VITE_CONVEX_URL environment variable.');
  process.exit(1);
}

type ConvexId = string;

type ConvexDocument<T> = T & { _id: ConvexId };

type ConvexLessonRecord = ConvexDocument<{
  slug: string;
  draft: LessonDocument;
  status: 'draft' | 'published';
}>;

const client = new ConvexHttpClient(convexUrl);

const callConvex = async <T>(
  kind: 'query' | 'mutation',
  name: string,
  args: Record<string, unknown>,
): Promise<T> => {
  // Using unknown here because Convex client methods accept any function reference
  // We're building a dynamic seeding script that doesn't have compile-time type safety
  const functionReference = name as unknown as never;
  const typedArgs = args as never;
  if (kind === 'query') {
    return (await client.query(functionReference, typedArgs)) as T;
  }
  return (await client.mutation(functionReference, typedArgs)) as T;
};

const parseTimestamp = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return Date.now();
};

const normalizeLessonDocument = (
  document: LessonDocument,
  topic: CatalogTopic,
  lesson: CatalogLesson,
): LessonDocument => {
  const meta = document.meta ?? {};
  const metadata = { ...(meta.metadata ?? {}) } as Record<string, unknown>;
  const scenario = (meta as Record<string, unknown>).scenario;
  if (scenario && typeof metadata.scenario === 'undefined') {
    metadata.scenario = scenario;
  }

  const cleanedMeta = {
    createdAt: parseTimestamp(meta.createdAt),
    updatedAt: parseTimestamp(meta.updatedAt),
    author: meta.author,
    notes: meta.notes,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  } as LessonDocument['meta'];

  return {
    ...document,
    lesson: {
      ...document.lesson,
      topicId: topic.slug,
      id: lesson.documentId,
    },
    meta: cleanedMeta,
  };
};

const fetchUnitBySlug = async (slug: string) =>
  await callConvex<ConvexDocument<{ slug: string; topics: Array<ConvexDocument<{ slug: string; lessons: ConvexLessonRecord[] }>> }>>(
    'query',
    'curriculum:getUnitBySlug',
    { slug },
  );

const fetchLessonBySlug = async (slug: string) =>
  await callConvex<ConvexLessonRecord | undefined>('query', 'curriculum:getLessonBySlug', { slug });

const ensureUnit = async (unit: CatalogUnit) => {
  const existing = await fetchUnitBySlug(unit.slug);
  if (!existing) {
    const result = await callConvex<{ unitId: ConvexId }>('mutation', 'curriculum:createUnit', {
      title: unit.title,
      slug: unit.slug,
      summary: unit.summary,
      coverImage: unit.coverImage,
      metadata: { source: 'seedCurriculum' },
    });
    return result.unitId;
  }

  await callConvex('mutation', 'curriculum:updateUnit', {
    unitId: existing._id,
    title: unit.title,
    slug: unit.slug,
    summary: unit.summary,
    coverImage: unit.coverImage,
    status: unit.status ?? 'active',
  });

  return existing._id;
};

const ensureTopic = async (unitId: ConvexId, unitSlug: string, topic: CatalogTopic) => {
  const unitSnapshot = await fetchUnitBySlug(unitSlug);
  const existing = unitSnapshot?.topics.find((candidate) => candidate.slug === topic.slug);
  if (!existing) {
    const result = await callConvex<{ topicId: ConvexId }>('mutation', 'curriculum:createTopic', {
      unitId,
      title: topic.title,
      slug: topic.slug,
      overview: topic.overview,
      focusSkills: topic.focusSkills,
      estimatedDurationMinutes: topic.estimatedDurationMinutes,
      metadata: { source: 'seedCurriculum' },
    });
    return result.topicId;
  }

  await callConvex('mutation', 'curriculum:updateTopic', {
    topicId: existing._id,
    title: topic.title,
    slug: topic.slug,
    overview: topic.overview,
    focusSkills: topic.focusSkills,
    estimatedDurationMinutes: topic.estimatedDurationMinutes,
    status: topic.status ?? 'active',
  });

  return existing._id;
};

const upsertLesson = async (topicId: ConvexId, topic: CatalogTopic, lesson: CatalogLesson) => {
  const document = await resolveLessonDocument(lesson.file);
  const normalized = normalizeLessonDocument(document, topic, lesson);

  const existing = await fetchLessonBySlug(lesson.slug);
  let lessonId: ConvexId;

  if (!existing) {
    const result = await callConvex<{ lessonId: ConvexId }>('mutation', 'curriculum:createLesson', {
      topicId,
      title: normalized.lesson.title,
      slug: lesson.slug,
    });
    lessonId = result.lessonId;
  } else {
    lessonId = existing._id;
  }

  await callConvex('mutation', 'curriculum:saveLessonDraft', {
    lessonId,
    draft: normalized,
  });

  if (lesson.publish) {
    await callConvex('mutation', 'curriculum:publishLesson', { lessonId });
  }

  return lessonId;
};

const seedTopicLessons = async (topicId: ConvexId, topic: CatalogTopic) => {
  const lessonIds: ConvexId[] = [];
  for (const lesson of topic.lessons) {
    const lessonId = await upsertLesson(topicId, topic, lesson);
    lessonIds.push(lessonId);
    console.log(`  • Lesson ${lesson.slug} synced (${lessonId})`);
  }

  if (lessonIds.length > 0) {
    await callConvex('mutation', 'curriculum:reorderLessons', {
      topicId,
      lessonIds,
    });
  }
};

const seedUnit = async (unit: CatalogUnit, index: number, total: number) => {
  console.log(`Seeding unit ${index + 1}/${total}: ${unit.slug}`);
  const unitId = await ensureUnit(unit);

  const topicIds: ConvexId[] = [];
  for (const topic of unit.topics) {
    console.log(`- Topic ${topic.slug}`);
    const topicId = await ensureTopic(unitId, unit.slug, topic);
    topicIds.push(topicId);
    await seedTopicLessons(topicId, topic);
  }

  if (topicIds.length > 0) {
    await callConvex('mutation', 'curriculum:reorderTopics', {
      unitId,
      topicIds,
    });
  }
};

const run = async () => {
  try {
    const catalog = await loadCatalog();
    const units = catalog.units ?? [];
    if (units.length === 0) {
      console.log('No units defined in catalog. Nothing to seed.');
      return;
    }

    const unitIds: ConvexId[] = [];
    for (let index = 0; index < units.length; index += 1) {
      const unit = units[index];
      await seedUnit(unit, index, units.length);
      const snapshot = await fetchUnitBySlug(unit.slug);
      if (snapshot) {
        unitIds.push(snapshot._id);
      }
    }

    if (unitIds.length > 0) {
      await callConvex('mutation', 'curriculum:reorderUnits', { unitIds });
    }

    console.log('Curriculum seeding complete.');
  } catch (error) {
    console.error('Failed to seed curriculum:');
    console.error(error);
    process.exitCode = 1;
  }
};

void run();
