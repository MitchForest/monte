import type { Doc, Id } from './_generated/dataModel.js';
import { mutation, query } from './_generated/server.js';
import type { MutationCtx, QueryCtx } from './_generated/server.js';
import { v, type Infer } from 'convex/values';

import { lessonDocument as lessonDocumentSchema } from './schema.js';

const now = () => Date.now();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

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
  return {
    version: '1.0',
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
}

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
    metadata: v.optional(v.any()),
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
    metadata: v.optional(v.any()),
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
    metadata: v.optional(v.any()),
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
    metadata: v.optional(v.any()),
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
  args: { unitId: v.id('units'), topicIds: v.array(v.id('topics')) },
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
  args: {
    topicId: v.id('topics'),
    title: v.string(),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error('Topic not found');
    const slugBase = slugify(args.slug ?? args.title);
    const slug = await ensureUniqueSlug(ctx, 'lessons', slugBase);
    const order = await nextOrder(ctx, 'lessons', { field: 'topicId', value: args.topicId });
    const timestamp = now();
    const draft = defaultLessonDocument(slug, args.topicId, args.title);
    const lessonId = await ctx.db.insert('lessons', {
      topicId: args.topicId,
      slug,
      order,
      status: 'draft',
      draft,
      published: undefined,
      authorId: undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: undefined,
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
