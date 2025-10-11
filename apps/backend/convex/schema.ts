import { zodToConvex } from 'convex-helpers/server/zod';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

import {
  EntityMetadataSchema,
  LessonDocumentSchema,
  LessonAuthoringStatusSchema,
  LessonGradeLevelSchema,
} from '@monte/types';

export const lessonDocument = zodToConvex(LessonDocumentSchema);
const entityMetadata = zodToConvex(EntityMetadataSchema);
const lessonAuthoringStatus = zodToConvex(LessonAuthoringStatusSchema);
const lessonGradeLevel = zodToConvex(LessonGradeLevelSchema);

export default defineSchema({
  units: defineTable({
    slug: v.string(),
    title: v.string(),
    summary: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    order: v.number(),
    status: v.union(v.literal('active'), v.literal('archived')),
    metadata: v.optional(entityMetadata),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_order', ['order']),

  topics: defineTable({
    unitId: v.id('units'),
    slug: v.string(),
    title: v.string(),
    overview: v.optional(v.string()),
    focusSkills: v.array(v.string()),
    estimatedDurationMinutes: v.optional(v.number()),
    order: v.number(),
    status: v.union(v.literal('active'), v.literal('archived')),
    metadata: v.optional(entityMetadata),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_unit', ['unitId'])
    .index('by_unit_order', ['unitId', 'order']),

  lessons: defineTable({
    topicId: v.id('topics'),
    slug: v.string(),
    order: v.number(),
    status: v.union(v.literal('draft'), v.literal('published')),
    draft: lessonDocument,
    published: v.optional(lessonDocument),
    authorId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
    authoringStatus: v.optional(lessonAuthoringStatus),
    assigneeId: v.optional(v.string()),
    authoringNotes: v.optional(v.string()),
    gradeLevels: v.optional(v.array(lessonGradeLevel)),
    manifestHash: v.optional(v.string()),
    manifestGeneratedAt: v.optional(v.string()),
    manifestCommit: v.optional(v.string()),
  })
    .index('by_slug', ['slug'])
    .index('by_topic', ['topicId'])
    .index('by_topic_order', ['topicId', 'order']),


});
