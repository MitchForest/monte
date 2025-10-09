import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const authoringMeta = v.object({
  label: v.optional(v.string()),
  description: v.optional(v.string()),
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  metadata: v.optional(v.any()),
});

const materialUsage = v.object({
  materialId: v.string(),
  purpose: v.string(),
  optional: v.optional(v.boolean()),
});

const lessonScenarioBinding = v.object({
  kind: v.union(v.literal('golden-beads'), v.literal('stamp-game')),
  seed: v.number(),
  snapshot: v.optional(v.any()),
  notes: v.optional(v.string()),
});

const placeValueLiteral = v.union(
  v.literal('thousand'),
  v.literal('hundred'),
  v.literal('ten'),
  v.literal('unit'),
);

const presentationActionCommon = {
  id: v.string(),
  durationMs: v.optional(v.number()),
  authoring: v.optional(authoringMeta),
};

const presentationAction = v.union(
  v.object({
    ...presentationActionCommon,
    type: v.literal('narrate'),
    text: v.string(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('showCard'),
    card: v.string(),
    position: v.union(
      v.literal('multiplicand-stack'),
      v.literal('multiplier'),
      v.literal('paper'),
    ),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('placeBeads'),
    place: placeValueLiteral,
    quantity: v.number(),
    tray: v.number(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('duplicateTray'),
    count: v.number(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('exchange'),
    from: v.union(v.literal('unit'), v.literal('ten'), v.literal('hundred')),
    to: v.union(v.literal('ten'), v.literal('hundred'), v.literal('thousand')),
    quantity: v.number(),
    remainder: v.number(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('moveBeadsBelowLine'),
    place: v.union(v.literal('unit'), v.literal('ten'), v.literal('hundred')),
    totalCount: v.number(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('groupForExchange'),
    place: v.union(v.literal('unit'), v.literal('ten'), v.literal('hundred')),
    groupsOfTen: v.number(),
    remainder: v.number(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('exchangeBeads'),
    from: v.union(v.literal('unit'), v.literal('ten'), v.literal('hundred')),
    to: v.union(v.literal('ten'), v.literal('hundred'), v.literal('thousand')),
    groupsOfTen: v.number(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('placeResultCard'),
    place: placeValueLiteral,
    value: v.number(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('stackPlaceValues'),
    order: v.array(placeValueLiteral),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('writeResult'),
    value: v.string(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('highlight'),
    target: v.string(),
    text: v.optional(v.string()),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('showStamp'),
    stamp: v.union(v.literal('1'), v.literal('10'), v.literal('100')),
    columns: v.number(),
    rows: v.number(),
  }),
  v.object({
    ...presentationActionCommon,
    type: v.literal('countTotal'),
    value: v.string(),
  }),
);

const presentationScript = v.object({
  id: v.string(),
  title: v.string(),
  summary: v.optional(v.string()),
  actions: v.array(presentationAction),
});

const representation = v.union(v.literal('concrete'), v.literal('abstract'));
const workspaceKind = v.union(v.literal('golden-beads'), v.literal('stamp-game'));
const guidedEvaluatorId = v.union(
  v.literal('golden-beads-build-base'),
  v.literal('golden-beads-duplicate'),
  v.literal('golden-beads-exchange-units'),
  v.literal('golden-beads-exchange-tens'),
  v.literal('golden-beads-exchange-hundreds'),
  v.literal('golden-beads-stack-result'),
  v.literal('stamp-game-build'),
  v.literal('stamp-game-repeat-columns'),
  v.literal('stamp-game-exchange'),
  v.literal('stamp-game-read-result'),
);

const guidedStep = v.object({
  id: v.string(),
  prompt: v.string(),
  expectation: v.string(),
  successCheck: v.string(),
  nudge: v.string(),
  explanation: v.optional(v.string()),
  durationMs: v.optional(v.number()),
  authoring: v.optional(authoringMeta),
  evaluatorId: guidedEvaluatorId,
});

const practicePassCriteria = v.object({
  type: v.literal('threshold'),
  firstCorrect: v.number(),
  totalCorrect: v.number(),
  maxMisses: v.number(),
});

const practiceQuestion = v.object({
  id: v.string(),
  multiplicand: v.number(),
  multiplier: v.number(),
  prompt: v.string(),
  correctAnswer: v.number(),
  difficulty: v.union(v.literal('easy'), v.literal('medium'), v.literal('hard')),
  authoring: v.optional(authoringMeta),
});

const presentationSegment = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  type: v.literal('presentation'),
  representation: v.optional(representation),
  primaryMaterialId: v.optional(v.string()),
  materials: v.array(materialUsage),
  skills: v.array(v.string()),
  scriptId: v.optional(v.string()),
  script: v.optional(presentationScript),
  scenario: v.optional(lessonScenarioBinding),
});

const guidedSegment = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  type: v.literal('guided'),
  representation: v.optional(representation),
  materials: v.array(materialUsage),
  skills: v.array(v.string()),
  workspace: workspaceKind,
  steps: v.array(guidedStep),
  scenario: v.optional(lessonScenarioBinding),
});

const practiceSegment = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  type: v.literal('practice'),
  representation: v.optional(representation),
  materials: v.array(materialUsage),
  skills: v.array(v.string()),
  workspace: workspaceKind,
  questions: v.array(practiceQuestion),
  passCriteria: practicePassCriteria,
  scenario: v.optional(lessonScenarioBinding),
});

const lessonSegment = v.union(presentationSegment, guidedSegment, practiceSegment);

const lessonMeta = v.object({
  createdAt: v.number(),
  updatedAt: v.number(),
  author: v.optional(v.string()),
  notes: v.optional(v.string()),
  metadata: v.optional(v.any()),
});

const lessonContent = v.object({
  id: v.string(),
  topicId: v.string(),
  title: v.string(),
  summary: v.optional(v.string()),
  focusSkills: v.array(v.string()),
  estimatedDurationMinutes: v.number(),
  primaryMaterialId: v.string(),
  materials: v.array(materialUsage),
  segments: v.array(lessonSegment),
});

export const lessonDocument = v.object({
  version: v.string(),
  lesson: lessonContent,
  meta: v.optional(lessonMeta),
});

export default defineSchema({
  units: defineTable({
    slug: v.string(),
    title: v.string(),
    summary: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    order: v.number(),
    status: v.union(v.literal('active'), v.literal('archived')),
    metadata: v.optional(v.any()),
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
    metadata: v.optional(v.any()),
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
});
