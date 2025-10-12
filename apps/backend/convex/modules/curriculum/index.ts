import type { Doc, Id } from '@monte/api/convex/_generated/dataModel.js';
import { mutation, query } from '@monte/api/convex/_generated/server.js';
import type { MutationCtx, QueryCtx } from '@monte/api/convex/_generated/server.js';
import { v, type Infer } from 'convex/values';
import { zodToConvex } from 'convex-helpers/server/zod';
import {
  CurriculumManifestSchema,
  CurriculumSyncSummarySchema,
  EntityMetadataSchema,
  LessonAuthoringStatusSchema,
  LessonGradeLevelSchema,
} from '@monte/types';
import {
  assertInventoryConsistency,
  normalizeLessonDocumentTimelines,
} from '@monte/lesson-service';

import { lessonDocument as lessonDocumentSchema } from '../../schema.js';

const metadataValue = zodToConvex(EntityMetadataSchema);
const curriculumManifestValue = zodToConvex(CurriculumManifestSchema);
const lessonAuthoringStatusValue = zodToConvex(LessonAuthoringStatusSchema);
const lessonGradeLevelValue = zodToConvex(LessonGradeLevelSchema);
const syncManifestOptionsValue = v.object({
  prune: v.optional(v.boolean()),
  manifestCommit: v.optional(v.string()),
  defaultStatus: v.optional(lessonAuthoringStatusValue),
});

const now = () => Date.now();

const fnv1a = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

type LessonDocumentDraft = Infer<typeof lessonDocumentSchema>;

async function ensureUniqueSlug(
  ctx: QueryCtx | MutationCtx,
  table: 'units' | 'topics' | 'lessons',
  base: string,
  excludeId?: Id<'units'> | Id<'topics'> | Id<'lessons'>,
) {
  let candidate = base || 'item';
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await ctx.db
      .query(table)
      .withIndex('by_slug', (q) => q.eq('slug', candidate))
      .first();
    if (!existing || (excludeId && existing._id === excludeId)) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

async function nextOrder(
  ctx: QueryCtx | MutationCtx,
  table: 'units' | 'topics' | 'lessons',
  filter?: { field: 'unitId' | 'topicId'; value: Id<'units'> | Id<'topics'> },
) {
  if (table === 'units') {
    const existing = await ctx.db.query('units').collect();
    if (existing.length === 0) return 0;
    return Math.max(...existing.map((item) => item.order)) + 1;
  }

  if (table === 'topics') {
    if (filter?.field === 'unitId') {
      const topics = await ctx.db
        .query('topics')
        .withIndex('by_unit', (q) => q.eq('unitId', filter.value as Id<'units'>))
        .collect();
      if (topics.length === 0) return 0;
      return Math.max(...topics.map((item) => item.order)) + 1;
    }
    const topics = await ctx.db.query('topics').collect();
    if (topics.length === 0) return 0;
    return Math.max(...topics.map((item) => item.order)) + 1;
  }

  if (filter?.field === 'topicId') {
    const lessons = await ctx.db
      .query('lessons')
      .withIndex('by_topic', (q) => q.eq('topicId', filter.value as Id<'topics'>))
      .collect();
    if (lessons.length === 0) return 0;
    return Math.max(...lessons.map((item) => item.order)) + 1;
  }

  const lessons = await ctx.db.query('lessons').collect();
  if (lessons.length === 0) return 0;
  return Math.max(...lessons.map((item) => item.order)) + 1;
}

function sortByOrder<T extends { order: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function defaultLessonDocument(
  slug: string,
  topicId: Id<'topics'>,
  title: string,
): Infer<typeof lessonDocumentSchema> {
  const timestamp = now();
  const document = {
    version: '1.0' as const,
    lesson: {
      id: slug,
      topicId,
      title,
      summary: '',
      focusSkills: [],
      estimatedDurationMinutes: 15,
      primaryMaterialId: 'golden-beads',
      materials: [],
      segments: [],
    },
    meta: {
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };
  return normalizeLessonDocumentTimelines(document);
}

const mapSegmentsForManifest = (
  segments: LessonDocumentDraft['lesson']['segments'],
): Array<{ type: string; representation?: string }> =>
  segments.map((segment) => ({
    type: segment.type,
    representation: segment.representation ?? undefined,
  }));

export const listCurriculumTree = query({
  args: {},
  handler: async (ctx) => {
    const units = await ctx.db.query('units').collect();
    const topics = await ctx.db.query('topics').collect();
    const lessons = await ctx.db.query('lessons').collect();

    const topicsByUnit = new Map<Id<'units'>, Doc<'topics'>[]>();
    for (const topic of topics) {
      const existing = topicsByUnit.get(topic.unitId);
      if (existing) {
        existing.push(topic);
      } else {
        topicsByUnit.set(topic.unitId, [topic]);
      }
    }

    const lessonsByTopic = new Map<Id<'topics'>, Doc<'lessons'>[]>();
    for (const lesson of lessons) {
      const existing = lessonsByTopic.get(lesson.topicId);
      if (existing) {
        existing.push(lesson);
      } else {
        lessonsByTopic.set(lesson.topicId, [lesson]);
      }
    }

    return sortByOrder(units).map((unit) => {
      const topicsForUnit = topicsByUnit.get(unit._id) ?? [];
      return {
        ...unit,
        topics: sortByOrder(topicsForUnit).map((topic) => {
          const lessonsForTopic = lessonsByTopic.get(topic._id) ?? [];
          return {
            ...topic,
            lessons: sortByOrder(lessonsForTopic).map((lesson) => ({
              _id: lesson._id,
              slug: lesson.slug,
              order: lesson.order,
              status: lesson.status,
              title: lesson.draft.lesson.title,
              summary: lesson.draft.lesson.summary ?? '',
              updatedAt: lesson.updatedAt,
              authoringStatus: lesson.authoringStatus ?? undefined,
              assigneeId: lesson.assigneeId ?? undefined,
              gradeLevels: lesson.gradeLevels ?? undefined,
            })),
          };
        }),
      };
    });
  },
});

export const getUnitBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const unit = await ctx.db
      .query('units')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (!unit) return undefined;
    const topics = await ctx.db
      .query('topics')
      .withIndex('by_unit', (q) => q.eq('unitId', unit._id))
      .collect();
    const lessons = await ctx.db.query('lessons').collect();
    const lessonsByTopic = new Map<Id<'topics'>, Doc<'lessons'>[]>();
    for (const lesson of lessons) {
      const existing = lessonsByTopic.get(lesson.topicId);
      if (existing) {
        existing.push(lesson);
      } else {
        lessonsByTopic.set(lesson.topicId, [lesson]);
      }
    }
    return {
      ...unit,
      topics: sortByOrder(topics).map((topic) => {
        const lessonsForTopic = lessonsByTopic.get(topic._id) ?? [];
        return {
          ...topic,
          lessons: sortByOrder(lessonsForTopic).map((lesson) => ({
            _id: lesson._id,
            slug: lesson.slug,
            order: lesson.order,
            status: lesson.status,
            title: lesson.draft.lesson.title,
            summary: lesson.draft.lesson.summary ?? '',
            updatedAt: lesson.updatedAt,
            authoringStatus: lesson.authoringStatus ?? undefined,
            assigneeId: lesson.assigneeId ?? undefined,
            gradeLevels: lesson.gradeLevels ?? undefined,
          })),
        };
      }),
    };
  },
});

export const getLessonBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const lesson = await ctx.db
      .query('lessons')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (!lesson) return undefined;
    return lesson;
  },
});

export const getLessonById = query({
  args: { lessonId: v.id('lessons') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});

export const createUnit = mutation({
  args: {
    title: v.string(),
    slug: v.optional(v.string()),
    summary: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    metadata: v.optional(metadataValue),
  },
  handler: async (ctx, args) => {
    const slugBase = slugify(args.slug ?? args.title);
    const slug = await ensureUniqueSlug(ctx, 'units', slugBase);
    const order = await nextOrder(ctx, 'units');
    const timestamp = now();
    const unitId = await ctx.db.insert('units', {
      slug,
      title: args.title,
      summary: args.summary,
      coverImage: args.coverImage,
      order,
      status: 'active',
      metadata: args.metadata,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return { unitId };
  },
});

export const updateUnit = mutation({
  args: {
    unitId: v.id('units'),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    summary: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    metadata: v.optional(metadataValue),
    status: v.optional(v.union(v.literal('active'), v.literal('archived'))),
  },
  handler: async (ctx, args) => {
    const unit = await ctx.db.get(args.unitId);
    if (!unit) throw new Error('Unit not found');
    let slug = unit.slug;
    if (args.slug || args.title) {
      const base = slugify(args.slug ?? args.title ?? unit.title);
      slug = await ensureUniqueSlug(ctx, 'units', base, unit._id);
    }
    await ctx.db.patch(args.unitId, {
      slug,
      title: args.title ?? unit.title,
      summary: args.summary ?? unit.summary,
      coverImage: args.coverImage ?? unit.coverImage,
      metadata: args.metadata ?? unit.metadata,
      status: args.status ?? unit.status,
      updatedAt: now(),
    });
  },
});

async function deleteTopicsForUnit(ctx: MutationCtx, unitId: Id<'units'>) {
  const topics = await ctx.db.query('topics').withIndex('by_unit', (q) => q.eq('unitId', unitId)).collect();
  for (const topic of topics) {
    await deleteLessonsForTopic(ctx, topic._id);
    await ctx.db.delete(topic._id);
  }
}

async function deleteLessonsForTopic(ctx: MutationCtx, topicId: Id<'topics'>) {
  const lessons = await ctx.db.query('lessons').withIndex('by_topic', (q) => q.eq('topicId', topicId)).collect();
  for (const lesson of lessons) {
    await ctx.db.delete(lesson._id);
  }
}

export const deleteUnit = mutation({
  args: { unitId: v.id('units') },
  handler: async (ctx, args) => {
    await deleteTopicsForUnit(ctx, args.unitId);
    await ctx.db.delete(args.unitId);
  },
});

export const reorderUnits = mutation({
  args: { unitIds: v.array(v.id('units')) },
  handler: async (ctx, args) => {
    await Promise.all(
      args.unitIds.map((unitId, index) => ctx.db.patch(unitId, { order: index, updatedAt: now() })),
    );
  },
});

export const createTopic = mutation({
  args: {
    unitId: v.id('units'),
    title: v.string(),
    slug: v.optional(v.string()),
    overview: v.optional(v.string()),
    focusSkills: v.optional(v.array(v.string())),
    estimatedDurationMinutes: v.optional(v.number()),
    metadata: v.optional(metadataValue),
  },
  handler: async (ctx, args) => {
    const unit = await ctx.db.get(args.unitId);
    if (!unit) throw new Error('Unit not found');
    const slugBase = slugify(args.slug ?? args.title);
    const slug = await ensureUniqueSlug(ctx, 'topics', slugBase);
    const order = await nextOrder(ctx, 'topics', { field: 'unitId', value: args.unitId });
    const timestamp = now();
    const topicId = await ctx.db.insert('topics', {
      unitId: args.unitId,
      slug,
      title: args.title,
      overview: args.overview,
      focusSkills: args.focusSkills ?? [],
      estimatedDurationMinutes: args.estimatedDurationMinutes,
      order,
      status: 'active',
      metadata: args.metadata,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return { topicId };
  },
});

export const updateTopic = mutation({
  args: {
    topicId: v.id('topics'),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    overview: v.optional(v.string()),
    focusSkills: v.optional(v.array(v.string())),
    estimatedDurationMinutes: v.optional(v.number()),
    metadata: v.optional(metadataValue),
    status: v.optional(v.union(v.literal('active'), v.literal('archived'))),
  },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error('Topic not found');
    let slug = topic.slug;
    if (args.slug || args.title) {
      const base = slugify(args.slug ?? args.title ?? topic.title);
      slug = await ensureUniqueSlug(ctx, 'topics', base, topic._id);
    }
    await ctx.db.patch(args.topicId, {
      slug,
      title: args.title ?? topic.title,
      overview: args.overview ?? topic.overview,
      focusSkills: args.focusSkills ?? topic.focusSkills,
      estimatedDurationMinutes: args.estimatedDurationMinutes ?? topic.estimatedDurationMinutes,
      metadata: args.metadata ?? topic.metadata,
      status: args.status ?? topic.status,
      updatedAt: now(),
    });
  },
});

export const deleteTopic = mutation({
  args: { topicId: v.id('topics') },
  handler: async (ctx, args) => {
    await deleteLessonsForTopic(ctx, args.topicId);
    await ctx.db.delete(args.topicId);
  },
});

export const moveTopic = mutation({
  args: {
    topicId: v.id('topics'),
    targetUnitId: v.id('units'),
    targetIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error('Topic not found');
    const topicsInTarget = await ctx.db
      .query('topics')
      .withIndex('by_unit', (q) => q.eq('unitId', args.targetUnitId))
      .collect();
    const sorted = sortByOrder(topicsInTarget.filter((t) => t._id !== args.topicId));
    const updatedTopic: Doc<'topics'> = { ...topic, unitId: args.targetUnitId };
    sorted.splice(args.targetIndex, 0, updatedTopic);
    await ctx.db.patch(args.topicId, {
      unitId: args.targetUnitId,
      updatedAt: now(),
    });
    await Promise.all(
      sorted.map((item, index) => ctx.db.patch(item._id, { order: index, updatedAt: now() })),
    );
  },
});

export const reorderTopics = mutation({
  args: {
    unitId: v.id('units'),
    topicIds: v.array(v.id('topics')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('topics')
      .withIndex('by_unit', (q) => q.eq('unitId', args.unitId))
      .collect();
    const existingIds = new Set(existing.map((topic) => topic._id));
    if (args.topicIds.some((id) => !existingIds.has(id))) {
      throw new Error('Topic list must include only topics from the unit');
    }
    await Promise.all(
      args.topicIds.map((topicId, index) => ctx.db.patch(topicId, { order: index, updatedAt: now() })),
    );
  },
});

export const createLesson = mutation({
  args: { topicId: v.id('topics'), title: v.string(), slug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error('Topic not found');
    const slugBase = slugify(args.slug ?? args.title);
    const slug = await ensureUniqueSlug(ctx, 'lessons', slugBase);
    const order = await nextOrder(ctx, 'lessons', { field: 'topicId', value: args.topicId });
    const timestamp = now();
    const lessonId = await ctx.db.insert('lessons', {
      topicId: args.topicId,
      slug,
      order,
      status: 'draft',
      draft: defaultLessonDocument(slug, args.topicId, args.title),
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: undefined,
      authoringStatus: 'not_started',
      assigneeId: undefined,
      authoringNotes: undefined,
      gradeLevels: [],
      manifestHash: undefined,
      manifestGeneratedAt: undefined,
      manifestCommit: undefined,
    });
    return { lessonId };
  },
});

export const saveLessonDraft = mutation({
  args: {
    lessonId: v.id('lessons'),
    draft: lessonDocumentSchema,
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error('Lesson not found');
    const sanitizeTimestamp = (value: unknown, fallback: number) => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string') {
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) return parsed;
      }
      return fallback;
    };

    const draftMeta = args.draft.meta;
    const createdAt = sanitizeTimestamp(
      draftMeta?.createdAt,
      lesson.draft.meta?.createdAt ?? now(),
    );
    const updatedAt = sanitizeTimestamp(draftMeta?.updatedAt, now());

    const draft = {
      ...args.draft,
      meta: {
        ...(draftMeta ?? {}),
        createdAt,
        updatedAt,
      },
    };
    normalizeLessonDocumentTimelines(draft);
    assertInventoryConsistency(draft);
    await ctx.db.patch(args.lessonId, {
      draft,
      updatedAt: now(),
      status: lesson.status,
    });
  },
});

export const publishLesson = mutation({
  args: { lessonId: v.id('lessons') },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error('Lesson not found');
    await ctx.db.patch(args.lessonId, {
      published: lesson.draft,
      status: 'published',
      publishedAt: now(),
      updatedAt: now(),
    });
  },
});

export const deleteLesson = mutation({
  args: { lessonId: v.id('lessons') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.lessonId);
  },
});

export const moveLesson = mutation({
  args: {
    lessonId: v.id('lessons'),
    targetTopicId: v.id('topics'),
    targetIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error('Lesson not found');
    const lessonsInTarget = await ctx.db
      .query('lessons')
      .withIndex('by_topic', (q) => q.eq('topicId', args.targetTopicId))
      .collect();
    const sorted = sortByOrder(lessonsInTarget.filter((l) => l._id !== args.lessonId));
    const updatedLesson: Doc<'lessons'> = { ...lesson, topicId: args.targetTopicId };
    sorted.splice(args.targetIndex, 0, updatedLesson);
    await ctx.db.patch(args.lessonId, {
      topicId: args.targetTopicId,
      updatedAt: now(),
    });
    await Promise.all(
      sorted.map((item, index) => ctx.db.patch(item._id, { order: index, updatedAt: now() })),
    );
  },
});

export const reorderLessons = mutation({
  args: {
    topicId: v.id('topics'),
    lessonIds: v.array(v.id('lessons')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('lessons')
      .withIndex('by_topic', (q) => q.eq('topicId', args.topicId))
      .collect();
    const existingIds = new Set(existing.map((lesson) => lesson._id));
    if (args.lessonIds.some((id) => !existingIds.has(id))) {
      throw new Error('Lesson list must include only lessons from the topic');
    }
    await Promise.all(
      args.lessonIds.map((lessonId, index) => ctx.db.patch(lessonId, { order: index, updatedAt: now() })),
    );
  },
});

export const updateLessonAuthoring = mutation({
  args: {
    lessonId: v.id('lessons'),
    authoringStatus: v.optional(v.union(lessonAuthoringStatusValue, v.null())),
    assigneeId: v.optional(v.union(v.string(), v.null())),
    authoringNotes: v.optional(v.union(v.string(), v.null())),
    gradeLevels: v.optional(v.union(v.array(lessonGradeLevelValue), v.null())),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const patch: Partial<Doc<'lessons'>> = {
      updatedAt: now(),
    };

    if (args.authoringStatus !== undefined) {
      patch.authoringStatus = args.authoringStatus ?? undefined;
    }
    if (args.assigneeId !== undefined) {
      patch.assigneeId = args.assigneeId ?? undefined;
    }
    if (args.authoringNotes !== undefined) {
      patch.authoringNotes = args.authoringNotes ?? undefined;
    }
    if (args.gradeLevels !== undefined) {
      patch.gradeLevels = args.gradeLevels === null ? [] : args.gradeLevels;
    }

    await ctx.db.patch(args.lessonId, patch);

    return {
      lessonId: args.lessonId,
      authoringStatus: patch.authoringStatus ?? lesson.authoringStatus ?? null,
      assigneeId: patch.assigneeId ?? lesson.assigneeId ?? null,
      authoringNotes: patch.authoringNotes ?? lesson.authoringNotes ?? null,
      gradeLevels: patch.gradeLevels ?? lesson.gradeLevels ?? [],
      updatedAt: patch.updatedAt ?? lesson.updatedAt,
    };
  },
});

export const syncManifest = mutation({
  args: {
    manifest: curriculumManifestValue,
    options: v.optional(syncManifestOptionsValue),
  },
  handler: async (ctx, args) => {
    const manifest = CurriculumManifestSchema.parse(args.manifest);
    const prune = args.options?.prune ?? false;
    const manifestCommit = args.options?.manifestCommit;
    const defaultStatus = args.options?.defaultStatus ?? 'not_started';
    const timestamp = now();
    const manifestSerialized = JSON.stringify(manifest);
    const manifestHash = fnv1a(manifestSerialized);

    const summary = {
      manifestHash,
      manifestGeneratedAt: manifest.generatedAt,
      manifestCommit,
      createdAt: timestamp,
      updatedAt: timestamp,
      units: { created: 0, updated: 0, deleted: 0 },
      topics: { created: 0, updated: 0, deleted: 0 },
      lessons: { created: 0, updated: 0, deleted: 0 },
    };

    const existingUnits = await ctx.db.query('units').collect();
    const unitsBySlug = new Map(existingUnits.map((unit) => [unit.slug, unit]));
    const touchedUnitIds = new Set<Id<'units'>>();

    for (const [order, unit] of manifest.units.entries()) {
      const existing = unitsBySlug.get(unit.slug);
      if (existing) {
        const patch: Partial<Doc<'units'>> = {
          order,
          updatedAt: timestamp,
        };
        if (existing.title !== unit.title) patch.title = unit.title;
        if (unit.summary !== undefined && existing.summary !== unit.summary) {
          patch.summary = unit.summary;
        }
        await ctx.db.patch(existing._id, patch);
        touchedUnitIds.add(existing._id);
        summary.units.updated += 1;
      } else {
        const unitId = await ctx.db.insert('units', {
          slug: unit.slug,
          title: unit.title,
          summary: unit.summary,
          coverImage: undefined,
          order,
          status: 'active',
          metadata: undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        touchedUnitIds.add(unitId);
        summary.units.created += 1;
      }
    }

    if (prune) {
      for (const unit of existingUnits) {
        if (!touchedUnitIds.has(unit._id)) {
          const topicsToDelete = await ctx.db
            .query('topics')
            .withIndex('by_unit', (q) => q.eq('unitId', unit._id))
            .collect();
          for (const topic of topicsToDelete) {
            const lessonsToDelete = await ctx.db
              .query('lessons')
              .withIndex('by_topic', (q) => q.eq('topicId', topic._id))
              .collect();
            summary.lessons.deleted += lessonsToDelete.length;
            await Promise.all(lessonsToDelete.map((lesson) => ctx.db.delete(lesson._id)));
            summary.topics.deleted += 1;
            await ctx.db.delete(topic._id);
          }
          summary.units.deleted += 1;
          await ctx.db.delete(unit._id);
        }
      }
    }

    const currentUnits = await ctx.db.query('units').collect();
    const unitBySlug = new Map(currentUnits.map((unit) => [unit.slug, unit]));

    const topicOrderMap = new Map<string, Map<string, number>>();
    for (const unit of manifest.units) {
      const orderMap = new Map<string, number>();
      unit.topicOrder.forEach((topicSlug, index) => orderMap.set(topicSlug, index));
      topicOrderMap.set(unit.slug, orderMap);
    }

    const existingTopics = await ctx.db.query('topics').collect();
    const topicsBySlug = new Map(existingTopics.map((topic) => [topic.slug, topic]));
    const touchedTopicIds = new Set<Id<'topics'>>();

    for (const topic of manifest.topics) {
      const unitDoc = unitBySlug.get(topic.unitId);
      if (!unitDoc) continue;
      const existing = topicsBySlug.get(topic.slug);
      const desiredOrder = topicOrderMap.get(unitDoc.slug)?.get(topic.slug);
      const order =
        desiredOrder ??
        existing?.order ??
        (await nextOrder(ctx, 'topics', { field: 'unitId', value: unitDoc._id }));

      if (existing) {
        const patch: Partial<Doc<'topics'>> = {
          unitId: unitDoc._id,
          order,
          updatedAt: timestamp,
          focusSkills: topic.focusSkills,
        };
        if (topic.overview !== undefined && existing.overview !== topic.overview) {
          patch.overview = topic.overview;
        }
        if (existing.title !== topic.title) {
          patch.title = topic.title;
        }
        await ctx.db.patch(existing._id, patch);
        touchedTopicIds.add(existing._id);
        summary.topics.updated += 1;
      } else {
        const topicId = await ctx.db.insert('topics', {
          unitId: unitDoc._id,
          slug: topic.slug,
          title: topic.title,
          overview: topic.overview,
          focusSkills: topic.focusSkills,
          estimatedDurationMinutes: undefined,
          order,
          status: 'active',
          metadata: undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        touchedTopicIds.add(topicId);
        summary.topics.created += 1;
      }
    }

    if (prune) {
      for (const topic of existingTopics) {
        if (!touchedTopicIds.has(topic._id)) {
          const lessonsToDelete = await ctx.db
            .query('lessons')
            .withIndex('by_topic', (q) => q.eq('topicId', topic._id))
            .collect();
          summary.lessons.deleted += lessonsToDelete.length;
          await Promise.all(lessonsToDelete.map((lesson) => ctx.db.delete(lesson._id)));
          summary.topics.deleted += 1;
          await ctx.db.delete(topic._id);
        }
      }
    }

    const currentTopics = await ctx.db.query('topics').collect();
    const topicBySlug = new Map(currentTopics.map((topic) => [topic.slug, topic]));

    const lessonOrderByTopic = new Map<string, Map<string, number>>();
    for (const lesson of manifest.lessons) {
      const map = lessonOrderByTopic.get(lesson.topicId) ?? new Map<string, number>();
      if (!map.has(lesson.slug)) {
        map.set(lesson.slug, map.size);
      }
      lessonOrderByTopic.set(lesson.topicId, map);
    }

    const existingLessons = await ctx.db.query('lessons').collect();
    const lessonsBySlug = new Map(existingLessons.map((lesson) => [lesson.slug, lesson]));
    const touchedLessonIds = new Set<Id<'lessons'>>();

    for (const lesson of manifest.lessons) {
      const topicDoc = topicBySlug.get(lesson.topicId);
      if (!topicDoc) continue;
      const existing = lessonsBySlug.get(lesson.slug);
      const orderMap = lessonOrderByTopic.get(lesson.topicId);
      const desiredOrder = orderMap?.get(lesson.slug);
      const order =
        desiredOrder ??
        existing?.order ??
        (await nextOrder(ctx, 'lessons', { field: 'topicId', value: topicDoc._id }));
      const gradeLevels = lesson.gradeLevels.length > 0 ? lesson.gradeLevels : [];

      if (existing) {
        const patch: Partial<Doc<'lessons'>> = {
          topicId: topicDoc._id,
          order,
          updatedAt: timestamp,
          gradeLevels,
          manifestHash,
          manifestGeneratedAt: manifest.generatedAt,
          manifestCommit,
        };
        if (!existing.authoringStatus) {
          patch.authoringStatus = defaultStatus;
        }
        if (lesson.notes && !existing.authoringNotes) {
          patch.authoringNotes = lesson.notes;
        }
        await ctx.db.patch(existing._id, patch);
        touchedLessonIds.add(existing._id);
        summary.lessons.updated += 1;
      } else {
        const draft = defaultLessonDocument(lesson.slug, topicDoc._id, lesson.title);
        draft.lesson.focusSkills = lesson.skills;
        if (lesson.materialId) {
          draft.lesson.primaryMaterialId = lesson.materialId;
        }
        const lessonId = await ctx.db.insert('lessons', {
          topicId: topicDoc._id,
          slug: lesson.slug,
          order,
          status: 'draft',
          draft,
          published: undefined,
          authorId: undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
          publishedAt: undefined,
          authoringStatus: defaultStatus,
          assigneeId: undefined,
          authoringNotes: lesson.notes,
          gradeLevels,
          manifestHash,
          manifestGeneratedAt: manifest.generatedAt,
          manifestCommit,
        });
        touchedLessonIds.add(lessonId);
        summary.lessons.created += 1;
      }
    }

    if (prune) {
      const allLessons = await ctx.db.query('lessons').collect();
      for (const lesson of allLessons) {
        if (!touchedLessonIds.has(lesson._id)) {
          await ctx.db.delete(lesson._id);
          summary.lessons.deleted += 1;
        }
      }
    }

    return CurriculumSyncSummarySchema.parse(summary);
  },
});

export const exportManifest = query({
  args: {},
  handler: async (ctx) => {
    const [units, topics, lessons] = await Promise.all([
      ctx.db.query('units').collect(),
      ctx.db.query('topics').collect(),
      ctx.db.query('lessons').collect(),
    ]);

    const unitById = new Map(units.map((unit) => [unit._id, unit]));
    const topicById = new Map(topics.map((topic) => [topic._id, topic]));
    const topicSlugById = new Map(topics.map((topic) => [topic._id, topic.slug]));

    const topicsByUnitId = new Map<Id<'units'>, Doc<'topics'>[]>();
    for (const topic of topics) {
      const list = topicsByUnitId.get(topic.unitId);
      if (list) {
        list.push(topic);
      } else {
        topicsByUnitId.set(topic.unitId, [topic]);
      }
    }

    const unitsManifest = sortByOrder(units).map((unit) => ({
      id: unit.slug,
      slug: unit.slug,
      title: unit.title,
      summary: unit.summary ?? undefined,
      domainId: undefined,
      ritRange: undefined,
      primaryCcss: undefined,
      topicOrder: sortByOrder(topicsByUnitId.get(unit._id) ?? []).map((topic) => topic.slug),
    }));

    const topicsManifest = topics.map((topic) => {
      const unit = unitById.get(topic.unitId);
      const unitSlug = unit?.slug ?? topic.unitId;
      return {
        id: topic.slug,
        slug: topic.slug,
        unitId: unitSlug,
        title: topic.title,
        overview: topic.overview ?? undefined,
        focusSkills: topic.focusSkills ?? [],
        ritRange: undefined,
        ccssFocus: topic.focusSkills ?? [],
        priority: undefined,
        prerequisiteTopicIds: [],
      };
    });

    const lessonsManifest = lessons
      .map((lesson) => {
        const topicSlug = topicSlugById.get(lesson.topicId);
        if (!topicSlug) return null;
        const segments = lesson.draft.lesson.segments
          ? mapSegmentsForManifest(lesson.draft.lesson.segments)
          : [];
        return {
          id: lesson.slug,
          slug: lesson.slug,
          topicId: topicSlug,
          title: lesson.draft.lesson.title,
          materialId: lesson.draft.lesson.primaryMaterialId ?? undefined,
          gradeLevels: lesson.gradeLevels ?? [],
          segments,
          prerequisiteLessonIds: [],
          skills: lesson.draft.lesson.focusSkills ?? [],
          notes: lesson.authoringNotes ?? undefined,
        };
      })
      .filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== null);

    const result = {
      generatedAt: new Date().toISOString(),
      domains: [],
      units: unitsManifest,
      topics: topicsManifest,
      lessons: lessonsManifest,
    };

    return CurriculumManifestSchema.parse(result);
  },
});

export const listLessons = query({
  args: { topicId: v.optional(v.id('topics')) },
  handler: async (ctx, args) => {
    const topicId = args.topicId;
    const lessons = topicId
      ? await ctx.db.query('lessons').withIndex('by_topic', (qb) => qb.eq('topicId', topicId)).collect()
      : await ctx.db.query('lessons').collect();
    return lessons.map((lesson) => ({
      ...lesson,
      draft: lesson.draft,
      published: lesson.published,
    }));
  },
});
