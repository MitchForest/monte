import { zodToConvex } from 'convex-helpers/server/zod';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

import { EntityMetadataSchema, LessonDocumentSchema, UserRoleSchema } from '@monte/types';

export const lessonDocument = zodToConvex(LessonDocumentSchema);
const userRole = zodToConvex(UserRoleSchema);
const entityMetadata = zodToConvex(EntityMetadataSchema);

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
  })
    .index('by_slug', ['slug'])
    .index('by_topic', ['topicId'])
    .index('by_topic_order', ['topicId', 'order']),

  organizations: defineTable({
    name: v.string(),
    plan: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
    createdAt: v.number(),
  }),

  userProfiles: defineTable({
    userId: v.string(),
    role: userRole,
    organizationId: v.optional(v.id('organizations')),
    preferences: v.optional(
      v.object({
        theme: v.string(),
        defaultView: v.string(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_organization', ['organizationId']),
});
