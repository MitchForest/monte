import path from 'node:path';
import process from 'node:process';

import { config as loadEnv } from 'dotenv';

import type { LessonDocument, Id } from '@monte/types';
import { createCurriculumHttpClient } from '@monte/api';
import type { CurriculumTreeUnit, LessonDraftRecord } from '@monte/api';
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

const client = createCurriculumHttpClient(convexUrl);

type UnitId = Id<'units'>;
type TopicId = Id<'topics'>;
type LessonId = Id<'lessons'>;

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

const extractScenarioBinding = (document: LessonDocument) => {
  for (const segment of document.lesson.segments) {
    if (segment.scenario) {
      return segment.scenario;
    }
  }
  return document.meta?.scenario;
};

const normalizeLessonDocument = (
  document: LessonDocument,
  topic: CatalogTopic,
  lesson: CatalogLesson,
): LessonDocument => {
  const meta = document.meta ?? {};
  const metadata = { ...(meta.metadata ?? {}) } as Record<string, unknown>;
  const scenario = extractScenarioBinding(document);
  if (scenario && typeof metadata.scenario === 'undefined') {
    metadata.scenario = scenario;
  }

  const cleanedMeta = {
    createdAt: parseTimestamp(meta.createdAt),
    updatedAt: parseTimestamp(meta.updatedAt),
    author: meta.author,
    notes: meta.notes,
    scenario: scenario
      ? {
          kind: scenario.kind,
          seed: scenario.seed,
          snapshot: scenario.snapshot,
          notes: scenario.notes,
        }
      : undefined,
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

const fetchUnitBySlug = async (slug: string): Promise<CurriculumTreeUnit | null> =>
  (await client.fetchUnitBySlug(slug)) ?? null;

const fetchLessonBySlug = async (slug: string): Promise<LessonDraftRecord | undefined> =>
  client.fetchLessonBySlug(slug);

const ensureUnit = async (unit: CatalogUnit): Promise<UnitId> => {
  const existing = await fetchUnitBySlug(unit.slug);
  if (!existing) {
    const result = await client.createUnit({
      title: unit.title,
      slug: unit.slug,
      summary: unit.summary,
      coverImage: unit.coverImage,
      metadata: { source: 'seedCurriculum' },
    });
    return result.unitId;
  }

  await client.updateUnit({
    unitId: existing._id,
    title: unit.title,
    slug: unit.slug,
    summary: unit.summary,
    coverImage: unit.coverImage,
    status: unit.status ?? 'active',
  });

  return existing._id;
};

const ensureTopic = async (unitId: UnitId, unitSlug: string, topic: CatalogTopic): Promise<TopicId> => {
  const unitSnapshot = await fetchUnitBySlug(unitSlug);
  const existing = unitSnapshot?.topics.find((candidate) => candidate.slug === topic.slug);
  if (!existing) {
    const result = await client.createTopic({
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

  await client.updateTopic({
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

const upsertLesson = async (topicId: TopicId, topic: CatalogTopic, lesson: CatalogLesson): Promise<LessonId> => {
  const document = await resolveLessonDocument(lesson.file);
  const normalized = normalizeLessonDocument(document, topic, lesson);

  const existing = await fetchLessonBySlug(lesson.slug);
  let lessonId: LessonId;

  if (!existing) {
    const result = await client.createLesson({
      topicId,
      title: normalized.lesson.title,
      slug: lesson.slug,
    });
    lessonId = result.lessonId;
  } else {
    lessonId = existing._id;
  }

  await client.saveLessonDraft(lessonId, normalized);

  if (lesson.publish) {
    await client.publishLesson(lessonId);
  }

  return lessonId;
};

const seedTopicLessons = async (topicId: TopicId, topic: CatalogTopic) => {
  const lessonIds: LessonId[] = [];
  for (const lesson of topic.lessons) {
    const lessonId = await upsertLesson(topicId, topic, lesson);
    lessonIds.push(lessonId);
    console.log(`  • Lesson ${lesson.slug} synced (${lessonId})`);
  }

  if (lessonIds.length > 0) {
    await client.reorderLessons(topicId, lessonIds);
  }
};

const seedUnit = async (unit: CatalogUnit, index: number, total: number) => {
  console.log(`Seeding unit ${index + 1}/${total}: ${unit.slug}`);
  const unitId = await ensureUnit(unit);

  const topicIds: TopicId[] = [];
  for (const topic of unit.topics) {
    console.log(`- Topic ${topic.slug}`);
    const topicId = await ensureTopic(unitId, unit.slug, topic);
    topicIds.push(topicId);
    await seedTopicLessons(topicId, topic);
  }

  if (topicIds.length > 0) {
    await client.reorderTopics(unitId, topicIds);
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

    const unitIds: UnitId[] = [];
    for (let index = 0; index < units.length; index += 1) {
      const unit = units[index];
      await seedUnit(unit, index, units.length);
      const snapshot = await fetchUnitBySlug(unit.slug);
      if (snapshot) {
        unitIds.push(snapshot._id);
      }
    }

    if (unitIds.length > 0) {
      await client.reorderUnits(unitIds);
    }

    console.log('Curriculum seeding complete.');
  } catch (error) {
    console.error('Failed to seed curriculum:');
    console.error(error);
    process.exitCode = 1;
  }
};

void run();
