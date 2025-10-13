import { z } from 'zod';

import {
  AuthoringMetaSchema,
  DifficultySchema,
  LessonScenarioBindingSchema,
  RepresentationSchema,
} from './primitives.js';
import { MaterialUsageSchema, WorkspaceKindSchema } from './inventory.js';

export const TimelineTransformSchema = z
  .object({
    position: z.object({ x: z.number(), y: z.number() }),
    rotation: z.number().optional(),
    scale: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    opacity: z.number().optional(),
  })
  .strict();
export type TimelineTransform = z.infer<typeof TimelineTransformSchema>;

export const TimelineKeyframeSchema = z
  .object({
    timeMs: z.number(),
    transform: TimelineTransformSchema,
    easing: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
export type TimelineKeyframe = z.infer<typeof TimelineKeyframeSchema>;

export const TimelineTrackSchema = z
  .object({
    nodeId: z.string(),
    keyframes: z.array(TimelineKeyframeSchema),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
export type TimelineTrack = z.infer<typeof TimelineTrackSchema>;

export const TimelineInteractionSchema = z
  .object({
    id: z.string(),
    kind: z.enum(['drop-zone', 'input', 'custom']),
    targetNodeId: z.string().optional(),
    props: z.record(z.unknown()).optional(),
  })
  .strict();
export type TimelineInteraction = z.infer<typeof TimelineInteractionSchema>;

const SegmentStepBaseSchema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    caption: z.string().optional(),
    actor: z.enum(['guide', 'student']),
    durationMs: z.number(),
    keyframes: z.array(TimelineTrackSchema),
    interactions: z.array(TimelineInteractionSchema).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const SegmentStepSchema = SegmentStepBaseSchema;
export type SegmentStep = z.infer<typeof SegmentStepSchema>;

export const SegmentTimelineSchema = z
  .object({
    version: z.literal(1),
    label: z.string().optional(),
    steps: z.array(SegmentStepSchema),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
export type SegmentTimeline = z.infer<typeof SegmentTimelineSchema>;

const PresentationActionDetailsSchema = z
  .object({
    durationMs: z.number().optional(),
    authoring: AuthoringMetaSchema.optional(),
  })
  .strict();

const presentationActionNarrate = PresentationActionDetailsSchema.extend({
  type: z.literal('narrate'),
  text: z.string(),
});

const presentationActionShowCard = PresentationActionDetailsSchema.extend({
  type: z.literal('showCard'),
  card: z.string(),
  position: z.enum(['multiplicand-stack', 'multiplier', 'paper']),
});

const presentationActionPlaceBeads = PresentationActionDetailsSchema.extend({
  type: z.literal('placeBeads'),
  place: z.enum(['thousand', 'hundred', 'ten', 'unit']),
  quantity: z.number(),
  tray: z.number(),
});

const presentationActionDuplicateTray = PresentationActionDetailsSchema.extend({
  type: z.literal('duplicateTray'),
  count: z.number(),
});

const presentationActionExchange = PresentationActionDetailsSchema.extend({
  type: z.literal('exchange'),
  from: z.enum(['unit', 'ten', 'hundred']),
  to: z.enum(['ten', 'hundred', 'thousand']),
  quantity: z.number(),
  remainder: z.number(),
});

const presentationActionMoveBeadsBelowLine = PresentationActionDetailsSchema.extend({
  type: z.literal('moveBeadsBelowLine'),
  place: z.enum(['unit', 'ten', 'hundred']),
  totalCount: z.number(),
});

const presentationActionGroupForExchange = PresentationActionDetailsSchema.extend({
  type: z.literal('groupForExchange'),
  place: z.enum(['unit', 'ten', 'hundred']),
  groupsOfTen: z.number(),
  remainder: z.number(),
});

const presentationActionExchangeBeads = PresentationActionDetailsSchema.extend({
  type: z.literal('exchangeBeads'),
  from: z.enum(['unit', 'ten', 'hundred']),
  to: z.enum(['ten', 'hundred', 'thousand']),
  groupsOfTen: z.number(),
});

const presentationActionPlaceResultCard = PresentationActionDetailsSchema.extend({
  type: z.literal('placeResultCard'),
  place: z.enum(['unit', 'ten', 'hundred', 'thousand']),
  value: z.number(),
});

const presentationActionStackPlaceValues = PresentationActionDetailsSchema.extend({
  type: z.literal('stackPlaceValues'),
  order: z.array(z.enum(['thousand', 'hundred', 'ten', 'unit'])),
});

const presentationActionWriteResult = PresentationActionDetailsSchema.extend({
  type: z.literal('writeResult'),
  value: z.string(),
});

const presentationActionHighlight = PresentationActionDetailsSchema.extend({
  type: z.literal('highlight'),
  target: z.string(),
  text: z.string().optional(),
});

const presentationActionShowStamp = PresentationActionDetailsSchema.extend({
  type: z.literal('showStamp'),
  stamp: z.union([z.literal('1'), z.literal('10'), z.literal('100')]),
  columns: z.number(),
  rows: z.number(),
});

const presentationActionCountTotal = PresentationActionDetailsSchema.extend({
  type: z.literal('countTotal'),
  value: z.string(),
});

const presentationActionInputOptions = [
  presentationActionNarrate,
  presentationActionShowCard,
  presentationActionPlaceBeads,
  presentationActionDuplicateTray,
  presentationActionExchange,
  presentationActionMoveBeadsBelowLine,
  presentationActionGroupForExchange,
  presentationActionExchangeBeads,
  presentationActionPlaceResultCard,
  presentationActionStackPlaceValues,
  presentationActionWriteResult,
  presentationActionHighlight,
  presentationActionShowStamp,
  presentationActionCountTotal,
] as const;

const presentationActionOptionsWithId = [
  presentationActionNarrate.extend({ id: z.string() }),
  presentationActionShowCard.extend({ id: z.string() }),
  presentationActionPlaceBeads.extend({ id: z.string() }),
  presentationActionDuplicateTray.extend({ id: z.string() }),
  presentationActionExchange.extend({ id: z.string() }),
  presentationActionMoveBeadsBelowLine.extend({ id: z.string() }),
  presentationActionGroupForExchange.extend({ id: z.string() }),
  presentationActionExchangeBeads.extend({ id: z.string() }),
  presentationActionPlaceResultCard.extend({ id: z.string() }),
  presentationActionStackPlaceValues.extend({ id: z.string() }),
  presentationActionWriteResult.extend({ id: z.string() }),
  presentationActionHighlight.extend({ id: z.string() }),
  presentationActionShowStamp.extend({ id: z.string() }),
  presentationActionCountTotal.extend({ id: z.string() }),
] as const;

export const PresentationActionInputSchema = z.discriminatedUnion('type', presentationActionInputOptions);
export type PresentationActionInput = z.infer<typeof PresentationActionInputSchema>;

export const PresentationActionSchema = z.discriminatedUnion('type', presentationActionOptionsWithId);
export type PresentationAction = z.infer<typeof PresentationActionSchema>;

export const PresentationScriptSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    actions: z.array(PresentationActionSchema),
    summary: z.string().optional(),
  })
  .strict();
export type PresentationScript = z.infer<typeof PresentationScriptSchema>;

export const GuidedStepSchema = z
  .object({
    id: z.string(),
    prompt: z.string(),
    expectation: z.string(),
    successCheck: z.string(),
    nudge: z.string(),
    explanation: z.string().optional(),
    durationMs: z.number().optional(),
    authoring: AuthoringMetaSchema.optional(),
  })
  .strict();
export type GuidedStep = z.infer<typeof GuidedStepSchema>;

export const GuidedEvaluatorIdSchema = z.enum([
  'golden-beads-build-base',
  'golden-beads-duplicate',
  'golden-beads-exchange-units',
  'golden-beads-exchange-tens',
  'golden-beads-exchange-hundreds',
  'golden-beads-stack-result',
  'stamp-game-build',
  'stamp-game-repeat-columns',
  'stamp-game-exchange',
  'stamp-game-read-result',
]);
export type GuidedEvaluatorId = z.infer<typeof GuidedEvaluatorIdSchema>;

export const PresentationSegmentSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    type: z.literal('presentation'),
    representation: RepresentationSchema.optional(),
    primaryMaterialId: z.string().optional(),
    materials: z.array(MaterialUsageSchema),
    skills: z.array(z.string()),
    scriptId: z.string().optional(),
    script: PresentationScriptSchema.optional(),
    scenario: LessonScenarioBindingSchema.optional(),
    materialBankId: z.string().optional(),
    timeline: SegmentTimelineSchema.optional(),
  })
  .strict();
export type PresentationSegment = z.infer<typeof PresentationSegmentSchema>;

export const GuidedSegmentSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    type: z.literal('guided'),
    representation: RepresentationSchema.optional(),
    materials: z.array(MaterialUsageSchema),
    skills: z.array(z.string()),
    workspace: WorkspaceKindSchema,
    steps: z.array(
      GuidedStepSchema.extend({
        evaluatorId: GuidedEvaluatorIdSchema,
      }),
    ),
    scenario: LessonScenarioBindingSchema.optional(),
    materialBankId: z.string().optional(),
    timeline: SegmentTimelineSchema.optional(),
  })
  .strict();
export type GuidedSegment = z.infer<typeof GuidedSegmentSchema>;

export const PracticeQuestionSchema = z
  .object({
    id: z.string(),
    multiplicand: z.number(),
    multiplier: z.number(),
    prompt: z.string(),
    correctAnswer: z.number(),
    difficulty: DifficultySchema,
    authoring: AuthoringMetaSchema.optional(),
  })
  .strict();
export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>;

export const PracticePassCriteriaSchema = z
  .object({
    type: z.literal('threshold'),
    firstCorrect: z.number(),
    totalCorrect: z.number(),
    maxMisses: z.number(),
  })
  .strict();
export type PracticePassCriteria = z.infer<typeof PracticePassCriteriaSchema>;

export const PracticeSegmentSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    type: z.literal('practice'),
    representation: RepresentationSchema.optional(),
    materials: z.array(MaterialUsageSchema),
    skills: z.array(z.string()),
    workspace: WorkspaceKindSchema,
    questions: z.array(PracticeQuestionSchema),
    passCriteria: PracticePassCriteriaSchema,
    scenario: LessonScenarioBindingSchema.optional(),
    materialBankId: z.string().optional(),
    timeline: SegmentTimelineSchema.optional(),
  })
  .strict();
export type PracticeSegment = z.infer<typeof PracticeSegmentSchema>;

export const LessonSegmentSchema = z.discriminatedUnion('type', [
  PresentationSegmentSchema,
  GuidedSegmentSchema,
  PracticeSegmentSchema,
]);
export type LessonSegment = z.infer<typeof LessonSegmentSchema>;
