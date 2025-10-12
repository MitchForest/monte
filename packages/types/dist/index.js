// src/core/index.ts
import { z } from "zod";
var IdSchema = () => z.string();

// src/auth/index.ts
import { z as z2 } from "zod";
var coerceDate = z2.preprocess((value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? void 0 : date;
  }
  return void 0;
}, z2.date());
var UserRoleSchema = z2.enum(["user", "admin"]);
var AuthOrganizationSchema = z2.object({
  id: z2.string(),
  name: z2.string(),
  slug: z2.string(),
  createdAt: coerceDate,
  logo: z2.string().optional().nullable(),
  metadata: z2.record(z2.unknown()).optional()
});
var AuthMemberSchema = z2.object({
  id: z2.string(),
  organizationId: z2.string(),
  userId: z2.string(),
  role: z2.string(),
  createdAt: coerceDate,
  user: z2.object({
    email: z2.string().optional(),
    name: z2.string().optional(),
    image: z2.string().optional().nullable()
  }).partial().optional()
});
var AuthInvitationSchema = z2.object({
  id: z2.string(),
  organizationId: z2.string(),
  email: z2.string().email(),
  role: z2.string(),
  status: z2.enum(["pending", "accepted", "rejected", "canceled"]),
  inviterId: z2.string(),
  expiresAt: coerceDate,
  teamId: z2.string().optional().nullable()
});
var OrganizationOverviewSchema = z2.object({
  organization: AuthOrganizationSchema,
  members: z2.array(AuthMemberSchema),
  invitations: z2.array(AuthInvitationSchema)
});

// src/curriculum/lesson.ts
import { z as z3 } from "zod";
var SegmentTypeSchema = z3.enum(["presentation", "guided", "practice"]);
var DifficultySchema = z3.enum(["easy", "medium", "hard"]);
var AuthoringMetaSchema = z3.object({
  label: z3.string().optional(),
  description: z3.string().optional(),
  notes: z3.string().optional(),
  tags: z3.array(z3.string()).optional(),
  metadata: z3.record(z3.unknown()).optional()
}).strict();
var LessonScenarioKindSchema = z3.enum(["golden-beads", "stamp-game"]);
var LessonScenarioBindingSchema = z3.object({
  kind: LessonScenarioKindSchema,
  seed: z3.number(),
  snapshot: z3.record(z3.unknown()).optional(),
  notes: z3.string().optional()
}).strict();
var EntityMetadataSchema = z3.object({
  source: z3.string().optional(),
  tags: z3.array(z3.string()).optional(),
  notes: z3.string().optional(),
  scenario: LessonScenarioBindingSchema.optional()
}).catchall(z3.unknown());
var MaterialSchema = z3.object({
  id: z3.string(),
  name: z3.string(),
  description: z3.string(),
  tags: z3.array(z3.string()),
  primaryUse: z3.literal("multiplication"),
  interaction: z3.enum(["manipulate", "static"]),
  media: z3.object({
    thumbnail: z3.string().optional(),
    icon: z3.string().optional()
  }).optional()
}).strict();
var RepresentationSchema = z3.enum(["concrete", "abstract"]);
var MaterialUsageSchema = z3.object({
  materialId: z3.string(),
  purpose: z3.string(),
  optional: z3.boolean().optional()
}).strict();
var WorkspaceKindSchema = z3.enum(["golden-beads", "stamp-game"]);
var BankQuantityMapSchema = z3.record(z3.number());
var CanvasAnchorSchema = z3.object({
  position: z3.object({
    x: z3.number(),
    y: z3.number()
  }),
  width: z3.number().optional(),
  height: z3.number().optional(),
  align: z3.enum(["start", "center", "end"]).optional()
}).strict();
var ExchangeRuleSchema = z3.object({
  triggerTokenType: z3.string(),
  produces: z3.array(
    z3.object({
      tokenType: z3.string(),
      quantity: z3.number()
    })
  ),
  consumes: z3.array(
    z3.object({
      tokenType: z3.string(),
      quantity: z3.number()
    })
  )
}).strict();
var ReplenishRuleSchema = z3.object({
  whenBankId: z3.string(),
  method: z3.enum(["reset-on-exit", "reset-on-undo", "custom"]),
  customHandlerId: z3.string().optional()
}).strict();
var ConsumptionRuleSchema = z3.object({
  bankId: z3.string(),
  allowNegative: z3.boolean().optional(),
  blockWhenEmpty: z3.boolean().optional()
}).strict();
var InventoryRuleSetSchema = z3.object({
  onExchange: z3.array(ExchangeRuleSchema).optional(),
  onReplenish: z3.array(ReplenishRuleSchema).optional(),
  onConsumption: z3.array(ConsumptionRuleSchema).optional()
}).strict();
var TokenVisualDefinitionSchema = z3.discriminatedUnion("kind", [
  z3.object({
    kind: z3.literal("bead"),
    place: z3.enum(["unit", "ten", "hundred", "thousand"])
  }),
  z3.object({
    kind: z3.literal("card"),
    value: z3.number(),
    size: z3.enum(["sm", "md", "lg"])
  }),
  z3.object({
    kind: z3.literal("stamp"),
    value: z3.union([z3.literal(1), z3.literal(10), z3.literal(100)])
  }),
  z3.object({
    kind: z3.literal("custom"),
    componentId: z3.string(),
    props: z3.record(z3.unknown()).optional()
  })
]);
var TokenTypeDefinitionSchema = z3.object({
  id: z3.string(),
  materialId: z3.string(),
  workspace: WorkspaceKindSchema,
  label: z3.string(),
  visual: TokenVisualDefinitionSchema,
  quantityPerToken: z3.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var MaterialBankDefinitionSchema = z3.object({
  id: z3.string(),
  label: z3.string(),
  scope: z3.enum(["lesson", "segment"]),
  segmentId: z3.string().optional(),
  materialId: z3.string(),
  accepts: z3.array(z3.string()),
  initialQuantity: z3.union([z3.number(), BankQuantityMapSchema]),
  depletion: z3.enum(["static", "consume", "replenish"]).optional(),
  layout: CanvasAnchorSchema.optional(),
  metadata: z3.record(z3.unknown()).optional()
}).strict();
var LessonMaterialInventorySchema = z3.object({
  version: z3.literal(1),
  tokenTypes: z3.array(TokenTypeDefinitionSchema),
  banks: z3.array(MaterialBankDefinitionSchema),
  defaultRules: InventoryRuleSetSchema.optional(),
  sceneNodes: z3.array(
    z3.object({
      id: z3.string(),
      materialId: z3.string(),
      label: z3.string().optional(),
      transform: z3.object({
        position: z3.object({ x: z3.number(), y: z3.number() }),
        rotation: z3.number().optional(),
        scale: z3.object({
          x: z3.number(),
          y: z3.number()
        }).optional(),
        opacity: z3.number().optional()
      }).optional(),
      metadata: z3.record(z3.unknown()).optional()
    }).strict()
  ).optional()
}).strict();
var TimelineTransformSchema = z3.object({
  position: z3.object({ x: z3.number(), y: z3.number() }),
  rotation: z3.number().optional(),
  scale: z3.object({
    x: z3.number(),
    y: z3.number()
  }).optional(),
  opacity: z3.number().optional()
}).strict();
var TimelineKeyframeSchema = z3.object({
  timeMs: z3.number(),
  transform: TimelineTransformSchema,
  easing: z3.string().optional(),
  metadata: z3.record(z3.unknown()).optional()
}).strict();
var TimelineTrackSchema = z3.object({
  nodeId: z3.string(),
  keyframes: z3.array(TimelineKeyframeSchema),
  metadata: z3.record(z3.unknown()).optional()
}).strict();
var TimelineInteractionSchema = z3.object({
  id: z3.string(),
  kind: z3.enum(["drop-zone", "input", "custom"]),
  targetNodeId: z3.string().optional(),
  props: z3.record(z3.unknown()).optional()
}).strict();
var SegmentStepBaseSchema = z3.object({
  id: z3.string(),
  title: z3.string().optional(),
  caption: z3.string().optional(),
  actor: z3.enum(["guide", "student"]),
  durationMs: z3.number(),
  keyframes: z3.array(TimelineTrackSchema),
  interactions: z3.array(TimelineInteractionSchema).optional(),
  metadata: z3.record(z3.unknown()).optional()
}).strict();
var SegmentStepSchema = SegmentStepBaseSchema;
var SegmentTimelineSchema = z3.object({
  version: z3.literal(1),
  label: z3.string().optional(),
  steps: z3.array(SegmentStepSchema),
  metadata: z3.record(z3.unknown()).optional()
}).strict();
var PresentationActionDetailsSchema = z3.object({
  durationMs: z3.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var presentationActionNarrate = PresentationActionDetailsSchema.extend({
  type: z3.literal("narrate"),
  text: z3.string()
});
var presentationActionShowCard = PresentationActionDetailsSchema.extend({
  type: z3.literal("showCard"),
  card: z3.string(),
  position: z3.enum(["multiplicand-stack", "multiplier", "paper"])
});
var presentationActionPlaceBeads = PresentationActionDetailsSchema.extend({
  type: z3.literal("placeBeads"),
  place: z3.enum(["thousand", "hundred", "ten", "unit"]),
  quantity: z3.number(),
  tray: z3.number()
});
var presentationActionDuplicateTray = PresentationActionDetailsSchema.extend({
  type: z3.literal("duplicateTray"),
  count: z3.number()
});
var presentationActionExchange = PresentationActionDetailsSchema.extend({
  type: z3.literal("exchange"),
  from: z3.enum(["unit", "ten", "hundred"]),
  to: z3.enum(["ten", "hundred", "thousand"]),
  quantity: z3.number(),
  remainder: z3.number()
});
var presentationActionMoveBeadsBelowLine = PresentationActionDetailsSchema.extend({
  type: z3.literal("moveBeadsBelowLine"),
  place: z3.enum(["unit", "ten", "hundred"]),
  totalCount: z3.number()
});
var presentationActionGroupForExchange = PresentationActionDetailsSchema.extend({
  type: z3.literal("groupForExchange"),
  place: z3.enum(["unit", "ten", "hundred"]),
  groupsOfTen: z3.number(),
  remainder: z3.number()
});
var presentationActionExchangeBeads = PresentationActionDetailsSchema.extend({
  type: z3.literal("exchangeBeads"),
  from: z3.enum(["unit", "ten", "hundred"]),
  to: z3.enum(["ten", "hundred", "thousand"]),
  groupsOfTen: z3.number()
});
var presentationActionPlaceResultCard = PresentationActionDetailsSchema.extend({
  type: z3.literal("placeResultCard"),
  place: z3.enum(["unit", "ten", "hundred", "thousand"]),
  value: z3.number()
});
var presentationActionStackPlaceValues = PresentationActionDetailsSchema.extend({
  type: z3.literal("stackPlaceValues"),
  order: z3.array(z3.enum(["thousand", "hundred", "ten", "unit"]))
});
var presentationActionWriteResult = PresentationActionDetailsSchema.extend({
  type: z3.literal("writeResult"),
  value: z3.string()
});
var presentationActionHighlight = PresentationActionDetailsSchema.extend({
  type: z3.literal("highlight"),
  target: z3.string(),
  text: z3.string().optional()
});
var presentationActionShowStamp = PresentationActionDetailsSchema.extend({
  type: z3.literal("showStamp"),
  stamp: z3.union([z3.literal("1"), z3.literal("10"), z3.literal("100")]),
  columns: z3.number(),
  rows: z3.number()
});
var presentationActionCountTotal = PresentationActionDetailsSchema.extend({
  type: z3.literal("countTotal"),
  value: z3.string()
});
var presentationActionInputOptions = [
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
  presentationActionCountTotal
];
var presentationActionOptionsWithId = [
  presentationActionNarrate.extend({ id: z3.string() }),
  presentationActionShowCard.extend({ id: z3.string() }),
  presentationActionPlaceBeads.extend({ id: z3.string() }),
  presentationActionDuplicateTray.extend({ id: z3.string() }),
  presentationActionExchange.extend({ id: z3.string() }),
  presentationActionMoveBeadsBelowLine.extend({ id: z3.string() }),
  presentationActionGroupForExchange.extend({ id: z3.string() }),
  presentationActionExchangeBeads.extend({ id: z3.string() }),
  presentationActionPlaceResultCard.extend({ id: z3.string() }),
  presentationActionStackPlaceValues.extend({ id: z3.string() }),
  presentationActionWriteResult.extend({ id: z3.string() }),
  presentationActionHighlight.extend({ id: z3.string() }),
  presentationActionShowStamp.extend({ id: z3.string() }),
  presentationActionCountTotal.extend({ id: z3.string() })
];
var PresentationActionInputSchema = z3.discriminatedUnion("type", presentationActionInputOptions);
var PresentationActionSchema = z3.discriminatedUnion("type", presentationActionOptionsWithId);
var PresentationScriptSchema = z3.object({
  id: z3.string(),
  title: z3.string(),
  actions: z3.array(PresentationActionSchema),
  summary: z3.string().optional()
}).strict();
var GuidedStepSchema = z3.object({
  id: z3.string(),
  prompt: z3.string(),
  expectation: z3.string(),
  successCheck: z3.string(),
  nudge: z3.string(),
  explanation: z3.string().optional(),
  durationMs: z3.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var GuidedEvaluatorIdSchema = z3.enum([
  "golden-beads-build-base",
  "golden-beads-duplicate",
  "golden-beads-exchange-units",
  "golden-beads-exchange-tens",
  "golden-beads-exchange-hundreds",
  "golden-beads-stack-result",
  "stamp-game-build",
  "stamp-game-repeat-columns",
  "stamp-game-exchange",
  "stamp-game-read-result"
]);
var PresentationSegmentSchema = z3.object({
  id: z3.string(),
  title: z3.string(),
  description: z3.string().optional(),
  type: z3.literal("presentation"),
  representation: RepresentationSchema.optional(),
  primaryMaterialId: z3.string().optional(),
  materials: z3.array(MaterialUsageSchema),
  skills: z3.array(z3.string()),
  scriptId: z3.string().optional(),
  script: PresentationScriptSchema.optional(),
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: z3.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var GuidedSegmentSchema = z3.object({
  id: z3.string(),
  title: z3.string(),
  description: z3.string().optional(),
  type: z3.literal("guided"),
  representation: RepresentationSchema.optional(),
  materials: z3.array(MaterialUsageSchema),
  skills: z3.array(z3.string()),
  workspace: WorkspaceKindSchema,
  steps: z3.array(
    GuidedStepSchema.extend({
      evaluatorId: GuidedEvaluatorIdSchema
    })
  ),
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: z3.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var PracticeQuestionSchema = z3.object({
  id: z3.string(),
  multiplicand: z3.number(),
  multiplier: z3.number(),
  prompt: z3.string(),
  correctAnswer: z3.number(),
  difficulty: DifficultySchema,
  authoring: AuthoringMetaSchema.optional()
}).strict();
var PracticePassCriteriaSchema = z3.object({
  type: z3.literal("threshold"),
  firstCorrect: z3.number(),
  totalCorrect: z3.number(),
  maxMisses: z3.number()
}).strict();
var PracticeSegmentSchema = z3.object({
  id: z3.string(),
  title: z3.string(),
  description: z3.string().optional(),
  type: z3.literal("practice"),
  representation: RepresentationSchema.optional(),
  materials: z3.array(MaterialUsageSchema),
  skills: z3.array(z3.string()),
  workspace: WorkspaceKindSchema,
  questions: z3.array(PracticeQuestionSchema),
  passCriteria: PracticePassCriteriaSchema,
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: z3.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var LessonSegmentSchema = z3.discriminatedUnion("type", [
  PresentationSegmentSchema,
  GuidedSegmentSchema,
  PracticeSegmentSchema
]);
var LessonSchema = z3.object({
  id: z3.string(),
  topicId: z3.string(),
  title: z3.string(),
  summary: z3.string().optional(),
  focusSkills: z3.array(z3.string()).optional(),
  estimatedDurationMinutes: z3.number(),
  primaryMaterialId: z3.string(),
  segments: z3.array(LessonSegmentSchema),
  materials: z3.array(MaterialUsageSchema),
  materialInventory: LessonMaterialInventorySchema.optional()
}).strict();
var LessonDocumentMetaSchema = z3.object({
  createdAt: z3.union([z3.string(), z3.number()]).optional(),
  updatedAt: z3.union([z3.string(), z3.number()]).optional(),
  author: z3.string().optional(),
  notes: z3.string().optional(),
  metadata: EntityMetadataSchema.optional(),
  scenario: LessonScenarioBindingSchema.optional()
}).strict();
var LessonDocumentSchema = z3.object({
  version: z3.literal("1.0"),
  lesson: LessonSchema,
  meta: LessonDocumentMetaSchema.optional()
}).strict();
var TopicSchema = z3.object({
  id: z3.string(),
  title: z3.string(),
  overview: z3.string(),
  focusSkills: z3.array(z3.string()),
  estimatedDurationMinutes: z3.number(),
  lessons: z3.array(LessonSchema)
}).strict();
var TaskCategorySchema = z3.enum([
  "tutorial",
  "guided-practice",
  "practice-question",
  "independent-question"
]);
var LessonTaskSchema = z3.object({
  id: z3.string(),
  title: z3.string(),
  description: z3.string().optional(),
  category: TaskCategorySchema,
  segmentId: z3.string(),
  stepId: z3.string().optional(),
  questionId: z3.string().optional(),
  order: z3.number()
}).strict();
var LessonPlanSchema = z3.object({
  lessonId: z3.string(),
  label: z3.string(),
  tasks: z3.array(LessonTaskSchema)
}).strict();
var UnitTopicRefSchema = z3.object({
  topicId: z3.string(),
  lessonIds: z3.array(z3.string()).optional()
}).strict();
var UnitSchema = z3.object({
  id: z3.string(),
  name: z3.string(),
  summary: z3.string(),
  coverImage: z3.string(),
  topics: z3.array(UnitTopicRefSchema)
}).strict();
var LessonStatusSchema = z3.enum(["draft", "published"]);
var LessonAuthoringStatusSchema = z3.enum([
  "not_started",
  "outline",
  "presentation",
  "guided",
  "practice",
  "qa",
  "published"
]);
var LessonGradeLevelSchema = z3.enum(["kindergarten", "grade1", "grade2", "grade3"]);
var LessonDraftRecordSchema = z3.object({
  _id: IdSchema(),
  draft: LessonDocumentSchema,
  published: LessonDocumentSchema.optional(),
  topicId: IdSchema(),
  slug: z3.string(),
  title: z3.string(),
  summary: z3.string().optional(),
  order: z3.number(),
  status: LessonStatusSchema,
  createdAt: z3.number(),
  updatedAt: z3.number(),
  metadata: EntityMetadataSchema.optional(),
  authoringStatus: LessonAuthoringStatusSchema.optional(),
  assigneeId: z3.string().optional(),
  authoringNotes: z3.string().optional(),
  gradeLevels: z3.array(LessonGradeLevelSchema).optional(),
  manifestHash: z3.string().optional(),
  manifestGeneratedAt: z3.string().optional(),
  manifestCommit: z3.string().optional()
}).strict();

// src/curriculum/manifest.ts
import { z as z4 } from "zod";
var RitRangeSchema = z4.object({
  min: z4.number(),
  max: z4.number()
}).strict();
var CurriculumSkillPracticeSchema = z4.object({
  easy: z4.array(z4.string()).optional(),
  medium: z4.array(z4.string()).optional(),
  hard: z4.array(z4.string()).optional()
}).strict().optional();
var CurriculumSkillSchema = z4.object({
  id: z4.string(),
  name: z4.string(),
  description: z4.string(),
  domainId: z4.string(),
  unitId: z4.string().optional(),
  topicId: z4.string().optional(),
  ccss: z4.array(z4.string()).optional(),
  ritBand: RitRangeSchema.optional(),
  representations: z4.array(z4.string()).optional(),
  practice: CurriculumSkillPracticeSchema,
  mentalMathEligible: z4.boolean().optional()
}).passthrough();
var CurriculumManifestUnitSchema = z4.object({
  id: z4.string(),
  slug: z4.string(),
  title: z4.string(),
  summary: z4.string().optional(),
  domainId: z4.string().optional(),
  ritRange: RitRangeSchema.optional(),
  primaryCcss: z4.array(z4.string()).optional(),
  topicOrder: z4.array(z4.string())
}).strict();
var CurriculumManifestTopicSchema = z4.object({
  id: z4.string(),
  slug: z4.string(),
  unitId: z4.string(),
  title: z4.string(),
  overview: z4.string().optional(),
  focusSkills: z4.array(z4.string()),
  ritRange: RitRangeSchema.optional(),
  ccssFocus: z4.array(z4.string()).optional(),
  priority: z4.number().optional(),
  prerequisiteTopicIds: z4.array(z4.string())
}).strict();
var CurriculumManifestLessonSchema = z4.object({
  id: z4.string(),
  slug: z4.string(),
  topicId: z4.string(),
  title: z4.string(),
  materialId: z4.string().optional(),
  gradeLevels: z4.array(LessonGradeLevelSchema),
  segments: z4.array(
    z4.object({
      type: z4.string(),
      representation: z4.string().optional()
    }).strict()
  ),
  prerequisiteLessonIds: z4.array(z4.string()),
  skills: z4.array(z4.string()),
  notes: z4.string().optional()
}).strict();
var CurriculumManifestSchema = z4.object({
  generatedAt: z4.string(),
  domains: z4.array(z4.record(z4.unknown())),
  units: z4.array(CurriculumManifestUnitSchema),
  topics: z4.array(CurriculumManifestTopicSchema),
  lessons: z4.array(CurriculumManifestLessonSchema)
}).strict();
var CurriculumSyncSummarySchema = z4.object({
  manifestHash: z4.string(),
  manifestGeneratedAt: z4.string(),
  manifestCommit: z4.string().optional(),
  createdAt: z4.number(),
  updatedAt: z4.number(),
  units: z4.object({
    created: z4.number(),
    updated: z4.number(),
    deleted: z4.number()
  }).strict(),
  topics: z4.object({
    created: z4.number(),
    updated: z4.number(),
    deleted: z4.number()
  }).strict(),
  lessons: z4.object({
    created: z4.number(),
    updated: z4.number(),
    deleted: z4.number()
  }).strict()
}).strict();
var CurriculumTreeLessonSchema = z4.object({
  _id: IdSchema(),
  slug: z4.string(),
  order: z4.number(),
  status: LessonStatusSchema,
  title: z4.string(),
  summary: z4.string(),
  updatedAt: z4.number(),
  authoringStatus: LessonAuthoringStatusSchema.optional(),
  assigneeId: z4.string().optional(),
  gradeLevels: z4.array(LessonGradeLevelSchema).optional()
}).strict();
var TopicStatusSchema = z4.enum(["active", "archived"]);
var UnitStatusSchema = TopicStatusSchema;
var CurriculumTreeTopicSchema = z4.object({
  _id: IdSchema(),
  unitId: IdSchema(),
  slug: z4.string(),
  title: z4.string(),
  overview: z4.string().optional(),
  focusSkills: z4.array(z4.string()),
  estimatedDurationMinutes: z4.number().optional(),
  order: z4.number(),
  status: TopicStatusSchema,
  lessons: z4.array(CurriculumTreeLessonSchema)
}).strict();
var CurriculumTreeUnitSchema = z4.object({
  _id: IdSchema(),
  slug: z4.string(),
  title: z4.string(),
  summary: z4.string().optional(),
  coverImage: z4.string().optional(),
  order: z4.number(),
  status: UnitStatusSchema,
  metadata: EntityMetadataSchema.optional(),
  createdAt: z4.number(),
  updatedAt: z4.number(),
  topics: z4.array(CurriculumTreeTopicSchema)
}).strict();
var CurriculumTreeSchema = z4.array(CurriculumTreeUnitSchema);
export {
  AuthInvitationSchema,
  AuthMemberSchema,
  AuthOrganizationSchema,
  AuthoringMetaSchema,
  BankQuantityMapSchema,
  CanvasAnchorSchema,
  ConsumptionRuleSchema,
  CurriculumManifestLessonSchema,
  CurriculumManifestSchema,
  CurriculumManifestTopicSchema,
  CurriculumManifestUnitSchema,
  CurriculumSkillSchema,
  CurriculumSyncSummarySchema,
  CurriculumTreeLessonSchema,
  CurriculumTreeSchema,
  CurriculumTreeTopicSchema,
  CurriculumTreeUnitSchema,
  DifficultySchema,
  EntityMetadataSchema,
  ExchangeRuleSchema,
  GuidedEvaluatorIdSchema,
  GuidedSegmentSchema,
  GuidedStepSchema,
  IdSchema,
  InventoryRuleSetSchema,
  LessonAuthoringStatusSchema,
  LessonDocumentMetaSchema,
  LessonDocumentSchema,
  LessonDraftRecordSchema,
  LessonGradeLevelSchema,
  LessonMaterialInventorySchema,
  LessonPlanSchema,
  LessonScenarioBindingSchema,
  LessonScenarioKindSchema,
  LessonSchema,
  LessonSegmentSchema,
  LessonStatusSchema,
  LessonTaskSchema,
  MaterialBankDefinitionSchema,
  MaterialSchema,
  MaterialUsageSchema,
  OrganizationOverviewSchema,
  PracticePassCriteriaSchema,
  PracticeQuestionSchema,
  PracticeSegmentSchema,
  PresentationActionInputSchema,
  PresentationActionSchema,
  PresentationScriptSchema,
  PresentationSegmentSchema,
  ReplenishRuleSchema,
  RepresentationSchema,
  SegmentStepSchema,
  SegmentTimelineSchema,
  SegmentTypeSchema,
  TaskCategorySchema,
  TimelineInteractionSchema,
  TimelineKeyframeSchema,
  TimelineTrackSchema,
  TimelineTransformSchema,
  TokenTypeDefinitionSchema,
  TokenVisualDefinitionSchema,
  TopicSchema,
  TopicStatusSchema,
  UnitSchema,
  UnitStatusSchema,
  UnitTopicRefSchema,
  UserRoleSchema,
  WorkspaceKindSchema
};
