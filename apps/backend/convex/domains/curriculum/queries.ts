import type { Doc, Id } from '@monte/api/convex/_generated/dataModel.js';
import { query } from '@monte/api/convex/_generated/server.js';
import { v } from 'convex/values';
import { CurriculumManifestSchema } from '@monte/types';

import {
  DEFAULT_TREE_PAGE_SIZE,
  ensureMemberAccess,
  mapSegmentsForManifest,
  sortByOrder,
} from './services.js';

export const listCurriculumTree = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ensureMemberAccess(ctx);
    const limit = Math.min(Math.max(args.limit ?? DEFAULT_TREE_PAGE_SIZE, 1), 100);
    const { page: unitPage, continueCursor, isDone } = await ctx.db
      .query('units')
      .withIndex('by_order')
      .paginate({ numItems: limit, cursor: args.cursor ?? null });

    const topicsForUnit = async (unitId: Id<'units'>) => {
      const topics: Doc<'topics'>[] = [];
      const cursorQuery = ctx.db
        .query('topics')
        .withIndex('by_unit_order', (q) => q.eq('unitId', unitId));
      for await (const topic of cursorQuery) {
        topics.push(topic);
      }
      return topics;
    };

    const lessonsForTopic = async (topicId: Id<'topics'>) => {
      const lessons: Doc<'lessons'>[] = [];
      const cursorQuery = ctx.db
        .query('lessons')
        .withIndex('by_topic_order', (q) => q.eq('topicId', topicId));
      for await (const lesson of cursorQuery) {
        lessons.push(lesson);
      }
      return lessons;
    };

    const tree = [];
    for (const unit of unitPage) {
      const topics = await topicsForUnit(unit._id);
      const topicsWithLessons = [];
      for (const topic of topics) {
        const lessons = await lessonsForTopic(topic._id);
        topicsWithLessons.push({
          ...topic,
          lessons: lessons.map((lesson) => ({
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
        });
      }
      tree.push({
        ...unit,
        topics: topicsWithLessons,
      });
    }

    return {
      tree,
      cursor: isDone ? null : continueCursor,
      isDone,
    };
  },
});

export const getUnitBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    await ensureMemberAccess(ctx);
    const unit = await ctx.db
      .query('units')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (!unit) return undefined;
    const topics: Doc<'topics'>[] = [];
    for await (const topic of ctx.db
      .query('topics')
      .withIndex('by_unit_order', (q) => q.eq('unitId', unit._id))) {
      topics.push(topic);
    }

    const topicsWithLessons = [] as Array<Doc<'topics'> & {
      lessons: Array<{
        _id: Id<'lessons'>;
        slug: string;
        order: number;
        status: 'draft' | 'published';
        title: string;
        summary: string;
        updatedAt: number;
        authoringStatus?: Doc<'lessons'>['authoringStatus'];
        assigneeId?: string;
        gradeLevels?: Doc<'lessons'>['gradeLevels'];
      }>;
    }>;

    for (const topic of topics) {
      const lessons: Doc<'lessons'>[] = [];
      for await (const lesson of ctx.db
        .query('lessons')
        .withIndex('by_topic_order', (q) => q.eq('topicId', topic._id))) {
        lessons.push(lesson);
      }

      topicsWithLessons.push({
        ...topic,
        lessons: lessons.map((lesson) => ({
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
      });
    }

    return {
      ...unit,
      topics: topicsWithLessons,
    };
  },
});

export const getLessonBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    await ensureMemberAccess(ctx);
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
    await ensureMemberAccess(ctx);
    return await ctx.db.get(args.lessonId);
  },
});

export const exportManifest = query({
  args: {},
  handler: async (ctx) => {
    await ensureMemberAccess(ctx);
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
    await ensureMemberAccess(ctx);
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

export const listLessonsByUnit = query({
  args: { unitId: v.id('units') },
  handler: async (ctx, args) => {
    await ensureMemberAccess(ctx);
    const topics = await ctx.db
      .query('topics')
      .withIndex('by_unit', (q) => q.eq('unitId', args.unitId))
      .collect();

    const lessons: Doc<'lessons'>[] = [];
    for (const topic of topics) {
      const topicLessons = await ctx.db
        .query('lessons')
        .withIndex('by_topic', (q) => q.eq('topicId', topic._id))
        .collect();
      lessons.push(...topicLessons);
    }

    return lessons.map((lesson) => ({
      ...lesson,
      draft: lesson.draft,
      published: lesson.published,
    }));
  },
});
