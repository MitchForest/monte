import type { Doc, Id } from '@monte/api/convex/_generated/dataModel.js';
import type { MutationCtx, QueryCtx } from '@monte/api/convex/_generated/server.js';
import { type Infer } from 'convex/values';
import { normalizeLessonDocumentTimelines } from '@monte/lesson-service';

import { lessonDocument as lessonDocumentSchema } from '../../schema/index.js';
import { requireMembershipRole } from '../../core/auth/hooks.js';

export type LessonDocumentDraft = Infer<typeof lessonDocumentSchema>;

export const ensureMemberAccess = (ctx: QueryCtx | MutationCtx) =>
  requireMembershipRole(ctx, ['owner', 'admin', 'member']);

export const ensureEditorAccess = (ctx: QueryCtx | MutationCtx) =>
  requireMembershipRole(ctx, ['owner', 'admin']);

export const now = () => Date.now();

export const fnv1a = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export async function ensureUniqueSlug(
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

export async function nextOrder(
  ctx: QueryCtx | MutationCtx,
  table: 'units' | 'topics' | 'lessons',
  filter?: { field: 'unitId' | 'topicId'; value: Id<'units'> | Id<'topics'> },
) {
  if (table === 'units') {
    const { page } = await ctx.db
      .query('units')
      .withIndex('by_order')
      .order('desc')
      .paginate({ numItems: 1, cursor: null });
    const last = page[0];
    if (!last) return 0;
    return last.order + 1;
  }

  if (table === 'topics') {
    if (filter?.field === 'unitId') {
      const { page } = await ctx.db
        .query('topics')
        .withIndex('by_unit_order', (q) => q.eq('unitId', filter.value as Id<'units'>))
        .order('desc')
        .paginate({ numItems: 1, cursor: null });
      const last = page[0];
      if (!last) return 0;
      return last.order + 1;
    }
    throw new Error('nextOrder for topics requires unitId filter');
  }

  if (filter?.field === 'topicId') {
    const { page } = await ctx.db
      .query('lessons')
      .withIndex('by_topic_order', (q) => q.eq('topicId', filter.value as Id<'topics'>))
      .order('desc')
      .paginate({ numItems: 1, cursor: null });
    const last = page[0];
    if (!last) return 0;
    return last.order + 1;
  }

  throw new Error('nextOrder for lessons requires topicId filter');
}

export function sortByOrder<T extends { order: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function defaultLessonDocument(
  slug: string,
  topicId: Id<'topics'>,
  title: string,
) {
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

export const mapSegmentsForManifest = (
  segments: LessonDocumentDraft['lesson']['segments'],
): Array<{ type: string; representation?: string }> =>
  segments.map((segment) => ({
    type: segment.type,
    representation: segment.representation ?? undefined,
  }));

export const DEFAULT_TREE_PAGE_SIZE = 25;
