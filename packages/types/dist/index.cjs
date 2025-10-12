"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AuthInvitationSchema: () => AuthInvitationSchema,
  AuthMemberSchema: () => AuthMemberSchema,
  AuthOrganizationSchema: () => AuthOrganizationSchema,
  AuthoringMetaSchema: () => AuthoringMetaSchema,
  BankQuantityMapSchema: () => BankQuantityMapSchema,
  CanvasAnchorSchema: () => CanvasAnchorSchema,
  ConsumptionRuleSchema: () => ConsumptionRuleSchema,
  CurriculumManifestLessonSchema: () => CurriculumManifestLessonSchema,
  CurriculumManifestSchema: () => CurriculumManifestSchema,
  CurriculumManifestTopicSchema: () => CurriculumManifestTopicSchema,
  CurriculumManifestUnitSchema: () => CurriculumManifestUnitSchema,
  CurriculumSkillSchema: () => CurriculumSkillSchema,
  CurriculumSyncSummarySchema: () => CurriculumSyncSummarySchema,
  CurriculumTreeLessonSchema: () => CurriculumTreeLessonSchema,
  CurriculumTreeSchema: () => CurriculumTreeSchema,
  CurriculumTreeTopicSchema: () => CurriculumTreeTopicSchema,
  CurriculumTreeUnitSchema: () => CurriculumTreeUnitSchema,
  DifficultySchema: () => DifficultySchema,
  EntityMetadataSchema: () => EntityMetadataSchema,
  ExchangeRuleSchema: () => ExchangeRuleSchema,
  GuidedEvaluatorIdSchema: () => GuidedEvaluatorIdSchema,
  GuidedSegmentSchema: () => GuidedSegmentSchema,
  GuidedStepSchema: () => GuidedStepSchema,
  IdSchema: () => IdSchema,
  InventoryRuleSetSchema: () => InventoryRuleSetSchema,
  LessonAuthoringStatusSchema: () => LessonAuthoringStatusSchema,
  LessonDocumentMetaSchema: () => LessonDocumentMetaSchema,
  LessonDocumentSchema: () => LessonDocumentSchema,
  LessonDraftRecordSchema: () => LessonDraftRecordSchema,
  LessonGradeLevelSchema: () => LessonGradeLevelSchema,
  LessonMaterialInventorySchema: () => LessonMaterialInventorySchema,
  LessonPlanSchema: () => LessonPlanSchema,
  LessonScenarioBindingSchema: () => LessonScenarioBindingSchema,
  LessonScenarioKindSchema: () => LessonScenarioKindSchema,
  LessonSchema: () => LessonSchema,
  LessonSegmentSchema: () => LessonSegmentSchema,
  LessonStatusSchema: () => LessonStatusSchema,
  LessonTaskSchema: () => LessonTaskSchema,
  MaterialBankDefinitionSchema: () => MaterialBankDefinitionSchema,
  MaterialSchema: () => MaterialSchema,
  MaterialUsageSchema: () => MaterialUsageSchema,
  OrganizationOverviewSchema: () => OrganizationOverviewSchema,
  PracticePassCriteriaSchema: () => PracticePassCriteriaSchema,
  PracticeQuestionSchema: () => PracticeQuestionSchema,
  PracticeSegmentSchema: () => PracticeSegmentSchema,
  PresentationActionInputSchema: () => PresentationActionInputSchema,
  PresentationActionSchema: () => PresentationActionSchema,
  PresentationScriptSchema: () => PresentationScriptSchema,
  PresentationSegmentSchema: () => PresentationSegmentSchema,
  ReplenishRuleSchema: () => ReplenishRuleSchema,
  RepresentationSchema: () => RepresentationSchema,
  SegmentStepSchema: () => SegmentStepSchema,
  SegmentTimelineSchema: () => SegmentTimelineSchema,
  SegmentTypeSchema: () => SegmentTypeSchema,
  TaskCategorySchema: () => TaskCategorySchema,
  TimelineInteractionSchema: () => TimelineInteractionSchema,
  TimelineKeyframeSchema: () => TimelineKeyframeSchema,
  TimelineTrackSchema: () => TimelineTrackSchema,
  TimelineTransformSchema: () => TimelineTransformSchema,
  TokenTypeDefinitionSchema: () => TokenTypeDefinitionSchema,
  TokenVisualDefinitionSchema: () => TokenVisualDefinitionSchema,
  TopicSchema: () => TopicSchema,
  TopicStatusSchema: () => TopicStatusSchema,
  UnitSchema: () => UnitSchema,
  UnitStatusSchema: () => UnitStatusSchema,
  UnitTopicRefSchema: () => UnitTopicRefSchema,
  UserRoleSchema: () => UserRoleSchema,
  WorkspaceKindSchema: () => WorkspaceKindSchema
});
module.exports = __toCommonJS(index_exports);

// src/core/index.ts
var import_zod = require("zod");
var IdSchema = () => import_zod.z.string();

// src/auth/index.ts
var import_zod2 = require("zod");
var coerceDate = import_zod2.z.preprocess((value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? void 0 : date;
  }
  return void 0;
}, import_zod2.z.date());
var UserRoleSchema = import_zod2.z.enum(["user", "admin"]);
var AuthOrganizationSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  name: import_zod2.z.string(),
  slug: import_zod2.z.string(),
  createdAt: coerceDate,
  logo: import_zod2.z.string().optional().nullable(),
  metadata: import_zod2.z.record(import_zod2.z.unknown()).optional()
});
var AuthMemberSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  organizationId: import_zod2.z.string(),
  userId: import_zod2.z.string(),
  role: import_zod2.z.string(),
  createdAt: coerceDate,
  user: import_zod2.z.object({
    email: import_zod2.z.string().optional(),
    name: import_zod2.z.string().optional(),
    image: import_zod2.z.string().optional().nullable()
  }).partial().optional()
});
var AuthInvitationSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  organizationId: import_zod2.z.string(),
  email: import_zod2.z.string().email(),
  role: import_zod2.z.string(),
  status: import_zod2.z.enum(["pending", "accepted", "rejected", "canceled"]),
  inviterId: import_zod2.z.string(),
  expiresAt: coerceDate,
  teamId: import_zod2.z.string().optional().nullable()
});
var OrganizationOverviewSchema = import_zod2.z.object({
  organization: AuthOrganizationSchema,
  members: import_zod2.z.array(AuthMemberSchema),
  invitations: import_zod2.z.array(AuthInvitationSchema)
});

// src/curriculum/lesson.ts
var import_zod3 = require("zod");
var SegmentTypeSchema = import_zod3.z.enum(["presentation", "guided", "practice"]);
var DifficultySchema = import_zod3.z.enum(["easy", "medium", "hard"]);
var AuthoringMetaSchema = import_zod3.z.object({
  label: import_zod3.z.string().optional(),
  description: import_zod3.z.string().optional(),
  notes: import_zod3.z.string().optional(),
  tags: import_zod3.z.array(import_zod3.z.string()).optional(),
  metadata: import_zod3.z.record(import_zod3.z.unknown()).optional()
}).strict();
var LessonScenarioKindSchema = import_zod3.z.enum(["golden-beads", "stamp-game"]);
var LessonScenarioBindingSchema = import_zod3.z.object({
  kind: LessonScenarioKindSchema,
  seed: import_zod3.z.number(),
  snapshot: import_zod3.z.record(import_zod3.z.unknown()).optional(),
  notes: import_zod3.z.string().optional()
}).strict();
var EntityMetadataSchema = import_zod3.z.object({
  source: import_zod3.z.string().optional(),
  tags: import_zod3.z.array(import_zod3.z.string()).optional(),
  notes: import_zod3.z.string().optional(),
  scenario: LessonScenarioBindingSchema.optional()
}).catchall(import_zod3.z.unknown());
var MaterialSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  name: import_zod3.z.string(),
  description: import_zod3.z.string(),
  tags: import_zod3.z.array(import_zod3.z.string()),
  primaryUse: import_zod3.z.literal("multiplication"),
  interaction: import_zod3.z.enum(["manipulate", "static"]),
  media: import_zod3.z.object({
    thumbnail: import_zod3.z.string().optional(),
    icon: import_zod3.z.string().optional()
  }).optional()
}).strict();
var RepresentationSchema = import_zod3.z.enum(["concrete", "abstract"]);
var MaterialUsageSchema = import_zod3.z.object({
  materialId: import_zod3.z.string(),
  purpose: import_zod3.z.string(),
  optional: import_zod3.z.boolean().optional()
}).strict();
var WorkspaceKindSchema = import_zod3.z.enum(["golden-beads", "stamp-game"]);
var BankQuantityMapSchema = import_zod3.z.record(import_zod3.z.number());
var CanvasAnchorSchema = import_zod3.z.object({
  position: import_zod3.z.object({
    x: import_zod3.z.number(),
    y: import_zod3.z.number()
  }),
  width: import_zod3.z.number().optional(),
  height: import_zod3.z.number().optional(),
  align: import_zod3.z.enum(["start", "center", "end"]).optional()
}).strict();
var ExchangeRuleSchema = import_zod3.z.object({
  triggerTokenType: import_zod3.z.string(),
  produces: import_zod3.z.array(
    import_zod3.z.object({
      tokenType: import_zod3.z.string(),
      quantity: import_zod3.z.number()
    })
  ),
  consumes: import_zod3.z.array(
    import_zod3.z.object({
      tokenType: import_zod3.z.string(),
      quantity: import_zod3.z.number()
    })
  )
}).strict();
var ReplenishRuleSchema = import_zod3.z.object({
  whenBankId: import_zod3.z.string(),
  method: import_zod3.z.enum(["reset-on-exit", "reset-on-undo", "custom"]),
  customHandlerId: import_zod3.z.string().optional()
}).strict();
var ConsumptionRuleSchema = import_zod3.z.object({
  bankId: import_zod3.z.string(),
  allowNegative: import_zod3.z.boolean().optional(),
  blockWhenEmpty: import_zod3.z.boolean().optional()
}).strict();
var InventoryRuleSetSchema = import_zod3.z.object({
  onExchange: import_zod3.z.array(ExchangeRuleSchema).optional(),
  onReplenish: import_zod3.z.array(ReplenishRuleSchema).optional(),
  onConsumption: import_zod3.z.array(ConsumptionRuleSchema).optional()
}).strict();
var TokenVisualDefinitionSchema = import_zod3.z.discriminatedUnion("kind", [
  import_zod3.z.object({
    kind: import_zod3.z.literal("bead"),
    place: import_zod3.z.enum(["unit", "ten", "hundred", "thousand"])
  }),
  import_zod3.z.object({
    kind: import_zod3.z.literal("card"),
    value: import_zod3.z.number(),
    size: import_zod3.z.enum(["sm", "md", "lg"])
  }),
  import_zod3.z.object({
    kind: import_zod3.z.literal("stamp"),
    value: import_zod3.z.union([import_zod3.z.literal(1), import_zod3.z.literal(10), import_zod3.z.literal(100)])
  }),
  import_zod3.z.object({
    kind: import_zod3.z.literal("custom"),
    componentId: import_zod3.z.string(),
    props: import_zod3.z.record(import_zod3.z.unknown()).optional()
  })
]);
var TokenTypeDefinitionSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  materialId: import_zod3.z.string(),
  workspace: WorkspaceKindSchema,
  label: import_zod3.z.string(),
  visual: TokenVisualDefinitionSchema,
  quantityPerToken: import_zod3.z.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var MaterialBankDefinitionSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  label: import_zod3.z.string(),
  scope: import_zod3.z.enum(["lesson", "segment"]),
  segmentId: import_zod3.z.string().optional(),
  materialId: import_zod3.z.string(),
  accepts: import_zod3.z.array(import_zod3.z.string()),
  initialQuantity: import_zod3.z.union([import_zod3.z.number(), BankQuantityMapSchema]),
  depletion: import_zod3.z.enum(["static", "consume", "replenish"]).optional(),
  layout: CanvasAnchorSchema.optional(),
  metadata: import_zod3.z.record(import_zod3.z.unknown()).optional()
}).strict();
var LessonMaterialInventorySchema = import_zod3.z.object({
  version: import_zod3.z.literal(1),
  tokenTypes: import_zod3.z.array(TokenTypeDefinitionSchema),
  banks: import_zod3.z.array(MaterialBankDefinitionSchema),
  defaultRules: InventoryRuleSetSchema.optional(),
  sceneNodes: import_zod3.z.array(
    import_zod3.z.object({
      id: import_zod3.z.string(),
      materialId: import_zod3.z.string(),
      label: import_zod3.z.string().optional(),
      transform: import_zod3.z.object({
        position: import_zod3.z.object({ x: import_zod3.z.number(), y: import_zod3.z.number() }),
        rotation: import_zod3.z.number().optional(),
        scale: import_zod3.z.object({
          x: import_zod3.z.number(),
          y: import_zod3.z.number()
        }).optional(),
        opacity: import_zod3.z.number().optional()
      }).optional(),
      metadata: import_zod3.z.record(import_zod3.z.unknown()).optional()
    }).strict()
  ).optional()
}).strict();
var TimelineTransformSchema = import_zod3.z.object({
  position: import_zod3.z.object({ x: import_zod3.z.number(), y: import_zod3.z.number() }),
  rotation: import_zod3.z.number().optional(),
  scale: import_zod3.z.object({
    x: import_zod3.z.number(),
    y: import_zod3.z.number()
  }).optional(),
  opacity: import_zod3.z.number().optional()
}).strict();
var TimelineKeyframeSchema = import_zod3.z.object({
  timeMs: import_zod3.z.number(),
  transform: TimelineTransformSchema,
  easing: import_zod3.z.string().optional(),
  metadata: import_zod3.z.record(import_zod3.z.unknown()).optional()
}).strict();
var TimelineTrackSchema = import_zod3.z.object({
  nodeId: import_zod3.z.string(),
  keyframes: import_zod3.z.array(TimelineKeyframeSchema),
  metadata: import_zod3.z.record(import_zod3.z.unknown()).optional()
}).strict();
var TimelineInteractionSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  kind: import_zod3.z.enum(["drop-zone", "input", "custom"]),
  targetNodeId: import_zod3.z.string().optional(),
  props: import_zod3.z.record(import_zod3.z.unknown()).optional()
}).strict();
var SegmentStepBaseSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string().optional(),
  caption: import_zod3.z.string().optional(),
  actor: import_zod3.z.enum(["guide", "student"]),
  durationMs: import_zod3.z.number(),
  keyframes: import_zod3.z.array(TimelineTrackSchema),
  interactions: import_zod3.z.array(TimelineInteractionSchema).optional(),
  metadata: import_zod3.z.record(import_zod3.z.unknown()).optional()
}).strict();
var SegmentStepSchema = SegmentStepBaseSchema;
var SegmentTimelineSchema = import_zod3.z.object({
  version: import_zod3.z.literal(1),
  label: import_zod3.z.string().optional(),
  steps: import_zod3.z.array(SegmentStepSchema),
  metadata: import_zod3.z.record(import_zod3.z.unknown()).optional()
}).strict();
var PresentationActionDetailsSchema = import_zod3.z.object({
  durationMs: import_zod3.z.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var presentationActionNarrate = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("narrate"),
  text: import_zod3.z.string()
});
var presentationActionShowCard = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("showCard"),
  card: import_zod3.z.string(),
  position: import_zod3.z.enum(["multiplicand-stack", "multiplier", "paper"])
});
var presentationActionPlaceBeads = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("placeBeads"),
  place: import_zod3.z.enum(["thousand", "hundred", "ten", "unit"]),
  quantity: import_zod3.z.number(),
  tray: import_zod3.z.number()
});
var presentationActionDuplicateTray = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("duplicateTray"),
  count: import_zod3.z.number()
});
var presentationActionExchange = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("exchange"),
  from: import_zod3.z.enum(["unit", "ten", "hundred"]),
  to: import_zod3.z.enum(["ten", "hundred", "thousand"]),
  quantity: import_zod3.z.number(),
  remainder: import_zod3.z.number()
});
var presentationActionMoveBeadsBelowLine = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("moveBeadsBelowLine"),
  place: import_zod3.z.enum(["unit", "ten", "hundred"]),
  totalCount: import_zod3.z.number()
});
var presentationActionGroupForExchange = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("groupForExchange"),
  place: import_zod3.z.enum(["unit", "ten", "hundred"]),
  groupsOfTen: import_zod3.z.number(),
  remainder: import_zod3.z.number()
});
var presentationActionExchangeBeads = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("exchangeBeads"),
  from: import_zod3.z.enum(["unit", "ten", "hundred"]),
  to: import_zod3.z.enum(["ten", "hundred", "thousand"]),
  groupsOfTen: import_zod3.z.number()
});
var presentationActionPlaceResultCard = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("placeResultCard"),
  place: import_zod3.z.enum(["unit", "ten", "hundred", "thousand"]),
  value: import_zod3.z.number()
});
var presentationActionStackPlaceValues = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("stackPlaceValues"),
  order: import_zod3.z.array(import_zod3.z.enum(["thousand", "hundred", "ten", "unit"]))
});
var presentationActionWriteResult = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("writeResult"),
  value: import_zod3.z.string()
});
var presentationActionHighlight = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("highlight"),
  target: import_zod3.z.string(),
  text: import_zod3.z.string().optional()
});
var presentationActionShowStamp = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("showStamp"),
  stamp: import_zod3.z.union([import_zod3.z.literal("1"), import_zod3.z.literal("10"), import_zod3.z.literal("100")]),
  columns: import_zod3.z.number(),
  rows: import_zod3.z.number()
});
var presentationActionCountTotal = PresentationActionDetailsSchema.extend({
  type: import_zod3.z.literal("countTotal"),
  value: import_zod3.z.string()
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
  presentationActionNarrate.extend({ id: import_zod3.z.string() }),
  presentationActionShowCard.extend({ id: import_zod3.z.string() }),
  presentationActionPlaceBeads.extend({ id: import_zod3.z.string() }),
  presentationActionDuplicateTray.extend({ id: import_zod3.z.string() }),
  presentationActionExchange.extend({ id: import_zod3.z.string() }),
  presentationActionMoveBeadsBelowLine.extend({ id: import_zod3.z.string() }),
  presentationActionGroupForExchange.extend({ id: import_zod3.z.string() }),
  presentationActionExchangeBeads.extend({ id: import_zod3.z.string() }),
  presentationActionPlaceResultCard.extend({ id: import_zod3.z.string() }),
  presentationActionStackPlaceValues.extend({ id: import_zod3.z.string() }),
  presentationActionWriteResult.extend({ id: import_zod3.z.string() }),
  presentationActionHighlight.extend({ id: import_zod3.z.string() }),
  presentationActionShowStamp.extend({ id: import_zod3.z.string() }),
  presentationActionCountTotal.extend({ id: import_zod3.z.string() })
];
var PresentationActionInputSchema = import_zod3.z.discriminatedUnion("type", presentationActionInputOptions);
var PresentationActionSchema = import_zod3.z.discriminatedUnion("type", presentationActionOptionsWithId);
var PresentationScriptSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string(),
  actions: import_zod3.z.array(PresentationActionSchema),
  summary: import_zod3.z.string().optional()
}).strict();
var GuidedStepSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  prompt: import_zod3.z.string(),
  expectation: import_zod3.z.string(),
  successCheck: import_zod3.z.string(),
  nudge: import_zod3.z.string(),
  explanation: import_zod3.z.string().optional(),
  durationMs: import_zod3.z.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var GuidedEvaluatorIdSchema = import_zod3.z.enum([
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
var PresentationSegmentSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string(),
  description: import_zod3.z.string().optional(),
  type: import_zod3.z.literal("presentation"),
  representation: RepresentationSchema.optional(),
  primaryMaterialId: import_zod3.z.string().optional(),
  materials: import_zod3.z.array(MaterialUsageSchema),
  skills: import_zod3.z.array(import_zod3.z.string()),
  scriptId: import_zod3.z.string().optional(),
  script: PresentationScriptSchema.optional(),
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: import_zod3.z.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var GuidedSegmentSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string(),
  description: import_zod3.z.string().optional(),
  type: import_zod3.z.literal("guided"),
  representation: RepresentationSchema.optional(),
  materials: import_zod3.z.array(MaterialUsageSchema),
  skills: import_zod3.z.array(import_zod3.z.string()),
  workspace: WorkspaceKindSchema,
  steps: import_zod3.z.array(
    GuidedStepSchema.extend({
      evaluatorId: GuidedEvaluatorIdSchema
    })
  ),
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: import_zod3.z.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var PracticeQuestionSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  multiplicand: import_zod3.z.number(),
  multiplier: import_zod3.z.number(),
  prompt: import_zod3.z.string(),
  correctAnswer: import_zod3.z.number(),
  difficulty: DifficultySchema,
  authoring: AuthoringMetaSchema.optional()
}).strict();
var PracticePassCriteriaSchema = import_zod3.z.object({
  type: import_zod3.z.literal("threshold"),
  firstCorrect: import_zod3.z.number(),
  totalCorrect: import_zod3.z.number(),
  maxMisses: import_zod3.z.number()
}).strict();
var PracticeSegmentSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string(),
  description: import_zod3.z.string().optional(),
  type: import_zod3.z.literal("practice"),
  representation: RepresentationSchema.optional(),
  materials: import_zod3.z.array(MaterialUsageSchema),
  skills: import_zod3.z.array(import_zod3.z.string()),
  workspace: WorkspaceKindSchema,
  questions: import_zod3.z.array(PracticeQuestionSchema),
  passCriteria: PracticePassCriteriaSchema,
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: import_zod3.z.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var LessonSegmentSchema = import_zod3.z.discriminatedUnion("type", [
  PresentationSegmentSchema,
  GuidedSegmentSchema,
  PracticeSegmentSchema
]);
var LessonSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  topicId: import_zod3.z.string(),
  title: import_zod3.z.string(),
  summary: import_zod3.z.string().optional(),
  focusSkills: import_zod3.z.array(import_zod3.z.string()).optional(),
  estimatedDurationMinutes: import_zod3.z.number(),
  primaryMaterialId: import_zod3.z.string(),
  segments: import_zod3.z.array(LessonSegmentSchema),
  materials: import_zod3.z.array(MaterialUsageSchema),
  materialInventory: LessonMaterialInventorySchema.optional()
}).strict();
var LessonDocumentMetaSchema = import_zod3.z.object({
  createdAt: import_zod3.z.union([import_zod3.z.string(), import_zod3.z.number()]).optional(),
  updatedAt: import_zod3.z.union([import_zod3.z.string(), import_zod3.z.number()]).optional(),
  author: import_zod3.z.string().optional(),
  notes: import_zod3.z.string().optional(),
  metadata: EntityMetadataSchema.optional(),
  scenario: LessonScenarioBindingSchema.optional()
}).strict();
var LessonDocumentSchema = import_zod3.z.object({
  version: import_zod3.z.literal("1.0"),
  lesson: LessonSchema,
  meta: LessonDocumentMetaSchema.optional()
}).strict();
var TopicSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string(),
  overview: import_zod3.z.string(),
  focusSkills: import_zod3.z.array(import_zod3.z.string()),
  estimatedDurationMinutes: import_zod3.z.number(),
  lessons: import_zod3.z.array(LessonSchema)
}).strict();
var TaskCategorySchema = import_zod3.z.enum([
  "tutorial",
  "guided-practice",
  "practice-question",
  "independent-question"
]);
var LessonTaskSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string(),
  description: import_zod3.z.string().optional(),
  category: TaskCategorySchema,
  segmentId: import_zod3.z.string(),
  stepId: import_zod3.z.string().optional(),
  questionId: import_zod3.z.string().optional(),
  order: import_zod3.z.number()
}).strict();
var LessonPlanSchema = import_zod3.z.object({
  lessonId: import_zod3.z.string(),
  label: import_zod3.z.string(),
  tasks: import_zod3.z.array(LessonTaskSchema)
}).strict();
var UnitTopicRefSchema = import_zod3.z.object({
  topicId: import_zod3.z.string(),
  lessonIds: import_zod3.z.array(import_zod3.z.string()).optional()
}).strict();
var UnitSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  name: import_zod3.z.string(),
  summary: import_zod3.z.string(),
  coverImage: import_zod3.z.string(),
  topics: import_zod3.z.array(UnitTopicRefSchema)
}).strict();
var LessonStatusSchema = import_zod3.z.enum(["draft", "published"]);
var LessonAuthoringStatusSchema = import_zod3.z.enum([
  "not_started",
  "outline",
  "presentation",
  "guided",
  "practice",
  "qa",
  "published"
]);
var LessonGradeLevelSchema = import_zod3.z.enum(["kindergarten", "grade1", "grade2", "grade3"]);
var LessonDraftRecordSchema = import_zod3.z.object({
  _id: IdSchema(),
  draft: LessonDocumentSchema,
  published: LessonDocumentSchema.optional(),
  topicId: IdSchema(),
  slug: import_zod3.z.string(),
  title: import_zod3.z.string(),
  summary: import_zod3.z.string().optional(),
  order: import_zod3.z.number(),
  status: LessonStatusSchema,
  createdAt: import_zod3.z.number(),
  updatedAt: import_zod3.z.number(),
  metadata: EntityMetadataSchema.optional(),
  authoringStatus: LessonAuthoringStatusSchema.optional(),
  assigneeId: import_zod3.z.string().optional(),
  authoringNotes: import_zod3.z.string().optional(),
  gradeLevels: import_zod3.z.array(LessonGradeLevelSchema).optional(),
  manifestHash: import_zod3.z.string().optional(),
  manifestGeneratedAt: import_zod3.z.string().optional(),
  manifestCommit: import_zod3.z.string().optional()
}).strict();

// src/curriculum/manifest.ts
var import_zod4 = require("zod");
var RitRangeSchema = import_zod4.z.object({
  min: import_zod4.z.number(),
  max: import_zod4.z.number()
}).strict();
var CurriculumSkillPracticeSchema = import_zod4.z.object({
  easy: import_zod4.z.array(import_zod4.z.string()).optional(),
  medium: import_zod4.z.array(import_zod4.z.string()).optional(),
  hard: import_zod4.z.array(import_zod4.z.string()).optional()
}).strict().optional();
var CurriculumSkillSchema = import_zod4.z.object({
  id: import_zod4.z.string(),
  name: import_zod4.z.string(),
  description: import_zod4.z.string(),
  domainId: import_zod4.z.string(),
  unitId: import_zod4.z.string().optional(),
  topicId: import_zod4.z.string().optional(),
  ccss: import_zod4.z.array(import_zod4.z.string()).optional(),
  ritBand: RitRangeSchema.optional(),
  representations: import_zod4.z.array(import_zod4.z.string()).optional(),
  practice: CurriculumSkillPracticeSchema,
  mentalMathEligible: import_zod4.z.boolean().optional()
}).passthrough();
var CurriculumManifestUnitSchema = import_zod4.z.object({
  id: import_zod4.z.string(),
  slug: import_zod4.z.string(),
  title: import_zod4.z.string(),
  summary: import_zod4.z.string().optional(),
  domainId: import_zod4.z.string().optional(),
  ritRange: RitRangeSchema.optional(),
  primaryCcss: import_zod4.z.array(import_zod4.z.string()).optional(),
  topicOrder: import_zod4.z.array(import_zod4.z.string())
}).strict();
var CurriculumManifestTopicSchema = import_zod4.z.object({
  id: import_zod4.z.string(),
  slug: import_zod4.z.string(),
  unitId: import_zod4.z.string(),
  title: import_zod4.z.string(),
  overview: import_zod4.z.string().optional(),
  focusSkills: import_zod4.z.array(import_zod4.z.string()),
  ritRange: RitRangeSchema.optional(),
  ccssFocus: import_zod4.z.array(import_zod4.z.string()).optional(),
  priority: import_zod4.z.number().optional(),
  prerequisiteTopicIds: import_zod4.z.array(import_zod4.z.string())
}).strict();
var CurriculumManifestLessonSchema = import_zod4.z.object({
  id: import_zod4.z.string(),
  slug: import_zod4.z.string(),
  topicId: import_zod4.z.string(),
  title: import_zod4.z.string(),
  materialId: import_zod4.z.string().optional(),
  gradeLevels: import_zod4.z.array(LessonGradeLevelSchema),
  segments: import_zod4.z.array(
    import_zod4.z.object({
      type: import_zod4.z.string(),
      representation: import_zod4.z.string().optional()
    }).strict()
  ),
  prerequisiteLessonIds: import_zod4.z.array(import_zod4.z.string()),
  skills: import_zod4.z.array(import_zod4.z.string()),
  notes: import_zod4.z.string().optional()
}).strict();
var CurriculumManifestSchema = import_zod4.z.object({
  generatedAt: import_zod4.z.string(),
  domains: import_zod4.z.array(import_zod4.z.record(import_zod4.z.unknown())),
  units: import_zod4.z.array(CurriculumManifestUnitSchema),
  topics: import_zod4.z.array(CurriculumManifestTopicSchema),
  lessons: import_zod4.z.array(CurriculumManifestLessonSchema)
}).strict();
var CurriculumSyncSummarySchema = import_zod4.z.object({
  manifestHash: import_zod4.z.string(),
  manifestGeneratedAt: import_zod4.z.string(),
  manifestCommit: import_zod4.z.string().optional(),
  createdAt: import_zod4.z.number(),
  updatedAt: import_zod4.z.number(),
  units: import_zod4.z.object({
    created: import_zod4.z.number(),
    updated: import_zod4.z.number(),
    deleted: import_zod4.z.number()
  }).strict(),
  topics: import_zod4.z.object({
    created: import_zod4.z.number(),
    updated: import_zod4.z.number(),
    deleted: import_zod4.z.number()
  }).strict(),
  lessons: import_zod4.z.object({
    created: import_zod4.z.number(),
    updated: import_zod4.z.number(),
    deleted: import_zod4.z.number()
  }).strict()
}).strict();
var CurriculumTreeLessonSchema = import_zod4.z.object({
  _id: IdSchema(),
  slug: import_zod4.z.string(),
  order: import_zod4.z.number(),
  status: LessonStatusSchema,
  title: import_zod4.z.string(),
  summary: import_zod4.z.string(),
  updatedAt: import_zod4.z.number(),
  authoringStatus: LessonAuthoringStatusSchema.optional(),
  assigneeId: import_zod4.z.string().optional(),
  gradeLevels: import_zod4.z.array(LessonGradeLevelSchema).optional()
}).strict();
var TopicStatusSchema = import_zod4.z.enum(["active", "archived"]);
var UnitStatusSchema = TopicStatusSchema;
var CurriculumTreeTopicSchema = import_zod4.z.object({
  _id: IdSchema(),
  unitId: IdSchema(),
  slug: import_zod4.z.string(),
  title: import_zod4.z.string(),
  overview: import_zod4.z.string().optional(),
  focusSkills: import_zod4.z.array(import_zod4.z.string()),
  estimatedDurationMinutes: import_zod4.z.number().optional(),
  order: import_zod4.z.number(),
  status: TopicStatusSchema,
  lessons: import_zod4.z.array(CurriculumTreeLessonSchema)
}).strict();
var CurriculumTreeUnitSchema = import_zod4.z.object({
  _id: IdSchema(),
  slug: import_zod4.z.string(),
  title: import_zod4.z.string(),
  summary: import_zod4.z.string().optional(),
  coverImage: import_zod4.z.string().optional(),
  order: import_zod4.z.number(),
  status: UnitStatusSchema,
  metadata: EntityMetadataSchema.optional(),
  createdAt: import_zod4.z.number(),
  updatedAt: import_zod4.z.number(),
  topics: import_zod4.z.array(CurriculumTreeTopicSchema)
}).strict();
var CurriculumTreeSchema = import_zod4.z.array(CurriculumTreeUnitSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
