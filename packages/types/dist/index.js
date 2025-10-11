var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
import { z } from "zod";

// src/auth/access.ts
var access_exports = {};
__export(access_exports, {
  ADMIN_ROLE_PERMISSIONS: () => ADMIN_ROLE_PERMISSIONS,
  ADMIN_STATEMENTS: () => ADMIN_STATEMENTS,
  ORGANIZATION_ROLE_PERMISSIONS: () => ORGANIZATION_ROLE_PERMISSIONS,
  ORGANIZATION_STATEMENTS: () => ORGANIZATION_STATEMENTS
});
var ADMIN_STATEMENTS = {
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password"],
  session: ["list", "revoke", "delete"]
};
var ADMIN_ROLE_PERMISSIONS = {
  internal: {
    user: [...ADMIN_STATEMENTS.user],
    session: [...ADMIN_STATEMENTS.session]
  },
  admin: {
    user: ["list", "set-role", "impersonate"],
    session: ["list", "revoke"]
  },
  guide: {
    user: [],
    session: []
  },
  guardian: {
    user: [],
    session: []
  },
  student: {
    user: [],
    session: []
  }
};
var ORGANIZATION_STATEMENTS = {
  organization: ["update", "billing", "set-plan", "set-join-code", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"]
};
var ORGANIZATION_ROLE_PERMISSIONS = {
  owner: {
    organization: [...ORGANIZATION_STATEMENTS.organization],
    member: [...ORGANIZATION_STATEMENTS.member],
    invitation: [...ORGANIZATION_STATEMENTS.invitation]
  },
  admin: {
    organization: ["update", "set-plan", "set-join-code"],
    member: [...ORGANIZATION_STATEMENTS.member],
    invitation: [...ORGANIZATION_STATEMENTS.invitation]
  },
  member: {
    organization: [],
    member: [],
    invitation: []
  },
  guide: {
    organization: [],
    member: [],
    invitation: []
  },
  guardian: {
    organization: [],
    member: [],
    invitation: []
  },
  student: {
    organization: [],
    member: [],
    invitation: []
  }
};

// src/index.ts
var IdSchema = () => z.string();
var UserRoleSchema = z.enum(["internal", "admin", "guide", "guardian", "student"]);
var OrganizationPlanKeySchema = z.enum([
  "solo_monthly",
  "solo_annual",
  "family_monthly",
  "family_annual",
  "org_monthly",
  "org_annual",
  "org_highvolume_monthly",
  "org_highvolume_annual"
]);
var BillingCycleSchema = z.enum(["monthly", "annual"]);
var BillingAccountStatusSchema = z.enum(["trial", "active", "past_due", "paused", "canceled"]);
var OrganizationLifecycleStatusSchema = z.enum(["active", "inactive", "archived"]);
var OrganizationSchema = z.object({
  name: z.string(),
  slug: z.string(),
  joinCode: z.string(),
  planKey: OrganizationPlanKeySchema,
  billingCycle: BillingCycleSchema,
  lifecycleStatus: OrganizationLifecycleStatusSchema,
  primaryAdminId: z.string(),
  seatLimit: z.number().nullable().optional(),
  seatsInUse: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.number(),
  updatedAt: z.number()
});
var OrgMembershipStatusSchema = z.enum(["pending", "active", "invited", "suspended", "revoked"]);
var OrgMembershipSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  role: UserRoleSchema,
  status: OrgMembershipStatusSchema,
  invitedByUserId: z.string().optional(),
  inviteId: z.string().optional(),
  relationships: z.object({
    guardianForStudentIds: z.array(z.string()).optional(),
    guideForStudentIds: z.array(z.string()).optional(),
    notes: z.string().optional()
  }).partial().optional(),
  createdAt: z.number(),
  updatedAt: z.number()
});
var OrgInviteStatusSchema = z.enum(["pending", "accepted", "expired", "revoked"]);
var OrgInviteSchema = z.object({
  orgId: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "guide", "guardian", "student"]),
  token: z.string(),
  status: OrgInviteStatusSchema,
  createdByUserId: z.string(),
  expiresAt: z.number(),
  createdAt: z.number(),
  acceptedAt: z.number().optional(),
  redeemedByUserId: z.string().optional()
});
var BillingAccountSchema = z.object({
  orgId: z.string(),
  planKey: OrganizationPlanKeySchema,
  billingCycle: BillingCycleSchema,
  seatsIncluded: z.number(),
  seatsInUse: z.number(),
  basePriceCents: z.number(),
  pricePerSeatCents: z.number(),
  overageSeatPriceCents: z.number().optional(),
  externalCustomerId: z.string().optional(),
  externalSubscriptionId: z.string().optional(),
  trialEndsAt: z.number().optional(),
  status: BillingAccountStatusSchema,
  createdAt: z.number(),
  updatedAt: z.number()
});
var UserProfileSchema = z.object({
  userId: z.string(),
  accountRole: UserRoleSchema,
  displayName: z.string().optional(),
  activeOrgId: z.string().optional(),
  impersonationState: z.object({
    active: z.boolean(),
    actorUserId: z.string(),
    startedAt: z.number()
  }).optional(),
  preferences: z.object({
    theme: z.string(),
    defaultView: z.string()
  }).partial().optional(),
  createdAt: z.number(),
  updatedAt: z.number()
});
var SegmentTypeSchema = z.enum(["presentation", "guided", "practice"]);
var DifficultySchema = z.enum(["easy", "medium", "hard"]);
var AuthoringMetaSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
}).strict();
var LessonScenarioKindSchema = z.enum(["golden-beads", "stamp-game"]);
var LessonScenarioBindingSchema = z.object({
  kind: LessonScenarioKindSchema,
  seed: z.number(),
  snapshot: z.record(z.unknown()).optional(),
  notes: z.string().optional()
}).strict();
var EntityMetadataSchema = z.object({
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  scenario: LessonScenarioBindingSchema.optional()
}).catchall(z.unknown());
var MaterialSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  primaryUse: z.literal("multiplication"),
  interaction: z.enum(["manipulate", "static"]),
  media: z.object({
    thumbnail: z.string().optional(),
    icon: z.string().optional()
  }).optional()
}).strict();
var RepresentationSchema = z.enum(["concrete", "abstract"]);
var MaterialUsageSchema = z.object({
  materialId: z.string(),
  purpose: z.string(),
  optional: z.boolean().optional()
}).strict();
var WorkspaceKindSchema = z.enum(["golden-beads", "stamp-game"]);
var BankQuantityMapSchema = z.record(z.number());
var CanvasAnchorSchema = z.object({
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  width: z.number().optional(),
  height: z.number().optional(),
  align: z.enum(["start", "center", "end"]).optional()
}).strict();
var ExchangeRuleSchema = z.object({
  triggerTokenType: z.string(),
  produces: z.array(
    z.object({
      tokenType: z.string(),
      quantity: z.number()
    })
  ),
  consumes: z.array(
    z.object({
      tokenType: z.string(),
      quantity: z.number()
    })
  )
}).strict();
var ReplenishRuleSchema = z.object({
  whenBankId: z.string(),
  method: z.enum(["reset-on-exit", "reset-on-undo", "custom"]),
  customHandlerId: z.string().optional()
}).strict();
var ConsumptionRuleSchema = z.object({
  bankId: z.string(),
  allowNegative: z.boolean().optional(),
  blockWhenEmpty: z.boolean().optional()
}).strict();
var InventoryRuleSetSchema = z.object({
  onExchange: z.array(ExchangeRuleSchema).optional(),
  onReplenish: z.array(ReplenishRuleSchema).optional(),
  onConsumption: z.array(ConsumptionRuleSchema).optional()
}).strict();
var TokenVisualDefinitionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("bead"),
    place: z.enum(["unit", "ten", "hundred", "thousand"])
  }),
  z.object({
    kind: z.literal("card"),
    value: z.number(),
    size: z.enum(["sm", "md", "lg"])
  }),
  z.object({
    kind: z.literal("stamp"),
    value: z.union([z.literal(1), z.literal(10), z.literal(100)])
  }),
  z.object({
    kind: z.literal("custom"),
    componentId: z.string(),
    props: z.record(z.unknown()).optional()
  })
]);
var TokenTypeDefinitionSchema = z.object({
  id: z.string(),
  materialId: z.string(),
  workspace: WorkspaceKindSchema,
  label: z.string(),
  visual: TokenVisualDefinitionSchema,
  quantityPerToken: z.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var MaterialBankDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  scope: z.enum(["lesson", "segment"]),
  segmentId: z.string().optional(),
  materialId: z.string(),
  accepts: z.array(z.string()),
  initialQuantity: z.union([z.number(), BankQuantityMapSchema]),
  depletion: z.enum(["static", "consume", "replenish"]).optional(),
  layout: CanvasAnchorSchema.optional(),
  metadata: z.record(z.unknown()).optional()
}).strict();
var LessonMaterialInventorySchema = z.object({
  version: z.literal(1),
  tokenTypes: z.array(TokenTypeDefinitionSchema),
  banks: z.array(MaterialBankDefinitionSchema),
  defaultRules: InventoryRuleSetSchema.optional(),
  sceneNodes: z.array(
    z.object({
      id: z.string(),
      materialId: z.string(),
      label: z.string().optional(),
      transform: z.object({
        position: z.object({ x: z.number(), y: z.number() }),
        rotation: z.number().optional(),
        scale: z.object({
          x: z.number(),
          y: z.number()
        }).optional(),
        opacity: z.number().optional()
      }).optional(),
      metadata: z.record(z.unknown()).optional()
    }).strict()
  ).optional()
}).strict();
var TimelineTransformSchema = z.object({
  position: z.object({ x: z.number(), y: z.number() }),
  rotation: z.number().optional(),
  scale: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  opacity: z.number().optional()
}).strict();
var TimelineKeyframeSchema = z.object({
  timeMs: z.number(),
  transform: TimelineTransformSchema,
  easing: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
}).strict();
var TimelineTrackSchema = z.object({
  nodeId: z.string(),
  keyframes: z.array(TimelineKeyframeSchema),
  metadata: z.record(z.unknown()).optional()
}).strict();
var TimelineInteractionSchema = z.object({
  id: z.string(),
  kind: z.enum(["drop-zone", "input", "custom"]),
  targetNodeId: z.string().optional(),
  props: z.record(z.unknown()).optional()
}).strict();
var SegmentStepBaseSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  caption: z.string().optional(),
  actor: z.enum(["guide", "student"]),
  durationMs: z.number(),
  keyframes: z.array(TimelineTrackSchema),
  interactions: z.array(TimelineInteractionSchema).optional(),
  metadata: z.record(z.unknown()).optional()
}).strict();
var SegmentStepSchema = SegmentStepBaseSchema;
var SegmentTimelineSchema = z.object({
  version: z.literal(1),
  label: z.string().optional(),
  steps: z.array(SegmentStepSchema),
  metadata: z.record(z.unknown()).optional()
}).strict();
var PresentationActionDetailsSchema = z.object({
  durationMs: z.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var presentationActionNarrate = PresentationActionDetailsSchema.extend({
  type: z.literal("narrate"),
  text: z.string()
});
var presentationActionShowCard = PresentationActionDetailsSchema.extend({
  type: z.literal("showCard"),
  card: z.string(),
  position: z.enum(["multiplicand-stack", "multiplier", "paper"])
});
var presentationActionPlaceBeads = PresentationActionDetailsSchema.extend({
  type: z.literal("placeBeads"),
  place: z.enum(["thousand", "hundred", "ten", "unit"]),
  quantity: z.number(),
  tray: z.number()
});
var presentationActionDuplicateTray = PresentationActionDetailsSchema.extend({
  type: z.literal("duplicateTray"),
  count: z.number()
});
var presentationActionExchange = PresentationActionDetailsSchema.extend({
  type: z.literal("exchange"),
  from: z.enum(["unit", "ten", "hundred"]),
  to: z.enum(["ten", "hundred", "thousand"]),
  quantity: z.number(),
  remainder: z.number()
});
var presentationActionMoveBeadsBelowLine = PresentationActionDetailsSchema.extend({
  type: z.literal("moveBeadsBelowLine"),
  place: z.enum(["unit", "ten", "hundred"]),
  totalCount: z.number()
});
var presentationActionGroupForExchange = PresentationActionDetailsSchema.extend({
  type: z.literal("groupForExchange"),
  place: z.enum(["unit", "ten", "hundred"]),
  groupsOfTen: z.number(),
  remainder: z.number()
});
var presentationActionExchangeBeads = PresentationActionDetailsSchema.extend({
  type: z.literal("exchangeBeads"),
  from: z.enum(["unit", "ten", "hundred"]),
  to: z.enum(["ten", "hundred", "thousand"]),
  groupsOfTen: z.number()
});
var presentationActionPlaceResultCard = PresentationActionDetailsSchema.extend({
  type: z.literal("placeResultCard"),
  place: z.enum(["unit", "ten", "hundred", "thousand"]),
  value: z.number()
});
var presentationActionStackPlaceValues = PresentationActionDetailsSchema.extend({
  type: z.literal("stackPlaceValues"),
  order: z.array(z.enum(["thousand", "hundred", "ten", "unit"]))
});
var presentationActionWriteResult = PresentationActionDetailsSchema.extend({
  type: z.literal("writeResult"),
  value: z.string()
});
var presentationActionHighlight = PresentationActionDetailsSchema.extend({
  type: z.literal("highlight"),
  target: z.string(),
  text: z.string().optional()
});
var presentationActionShowStamp = PresentationActionDetailsSchema.extend({
  type: z.literal("showStamp"),
  stamp: z.union([z.literal("1"), z.literal("10"), z.literal("100")]),
  columns: z.number(),
  rows: z.number()
});
var presentationActionCountTotal = PresentationActionDetailsSchema.extend({
  type: z.literal("countTotal"),
  value: z.string()
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
  presentationActionCountTotal.extend({ id: z.string() })
];
var PresentationActionInputSchema = z.discriminatedUnion("type", presentationActionInputOptions);
var PresentationActionSchema = z.discriminatedUnion("type", presentationActionOptionsWithId);
var PresentationScriptSchema = z.object({
  id: z.string(),
  title: z.string(),
  actions: z.array(PresentationActionSchema),
  summary: z.string().optional()
}).strict();
var GuidedStepSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  expectation: z.string(),
  successCheck: z.string(),
  nudge: z.string(),
  explanation: z.string().optional(),
  durationMs: z.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var GuidedEvaluatorIdSchema = z.enum([
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
var PresentationSegmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.literal("presentation"),
  representation: RepresentationSchema.optional(),
  primaryMaterialId: z.string().optional(),
  materials: z.array(MaterialUsageSchema),
  skills: z.array(z.string()),
  scriptId: z.string().optional(),
  script: PresentationScriptSchema.optional(),
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: z.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var GuidedSegmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.literal("guided"),
  representation: RepresentationSchema.optional(),
  materials: z.array(MaterialUsageSchema),
  skills: z.array(z.string()),
  workspace: WorkspaceKindSchema,
  steps: z.array(
    GuidedStepSchema.extend({
      evaluatorId: GuidedEvaluatorIdSchema
    })
  ),
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: z.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var PracticeQuestionSchema = z.object({
  id: z.string(),
  multiplicand: z.number(),
  multiplier: z.number(),
  prompt: z.string(),
  correctAnswer: z.number(),
  difficulty: DifficultySchema,
  authoring: AuthoringMetaSchema.optional()
}).strict();
var PracticePassCriteriaSchema = z.object({
  type: z.literal("threshold"),
  firstCorrect: z.number(),
  totalCorrect: z.number(),
  maxMisses: z.number()
}).strict();
var PracticeSegmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.literal("practice"),
  representation: RepresentationSchema.optional(),
  materials: z.array(MaterialUsageSchema),
  skills: z.array(z.string()),
  workspace: WorkspaceKindSchema,
  questions: z.array(PracticeQuestionSchema),
  passCriteria: PracticePassCriteriaSchema,
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: z.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var LessonSegmentSchema = z.discriminatedUnion("type", [
  PresentationSegmentSchema,
  GuidedSegmentSchema,
  PracticeSegmentSchema
]);
var LessonSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  focusSkills: z.array(z.string()).optional(),
  estimatedDurationMinutes: z.number(),
  primaryMaterialId: z.string(),
  segments: z.array(LessonSegmentSchema),
  materials: z.array(MaterialUsageSchema),
  materialInventory: LessonMaterialInventorySchema.optional()
}).strict();
var LessonDocumentMetaSchema = z.object({
  createdAt: z.union([z.string(), z.number()]).optional(),
  updatedAt: z.union([z.string(), z.number()]).optional(),
  author: z.string().optional(),
  notes: z.string().optional(),
  metadata: EntityMetadataSchema.optional(),
  scenario: LessonScenarioBindingSchema.optional()
}).strict();
var LessonDocumentSchema = z.object({
  version: z.literal("1.0"),
  lesson: LessonSchema,
  meta: LessonDocumentMetaSchema.optional()
}).strict();
var TopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  overview: z.string(),
  focusSkills: z.array(z.string()),
  estimatedDurationMinutes: z.number(),
  lessons: z.array(LessonSchema)
}).strict();
var TaskCategorySchema = z.enum([
  "tutorial",
  "guided-practice",
  "practice-question",
  "independent-question"
]);
var LessonTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: TaskCategorySchema,
  segmentId: z.string(),
  stepId: z.string().optional(),
  questionId: z.string().optional(),
  order: z.number()
}).strict();
var LessonPlanSchema = z.object({
  lessonId: z.string(),
  label: z.string(),
  tasks: z.array(LessonTaskSchema)
}).strict();
var UnitTopicRefSchema = z.object({
  topicId: z.string(),
  lessonIds: z.array(z.string()).optional()
}).strict();
var UnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  coverImage: z.string(),
  topics: z.array(UnitTopicRefSchema)
}).strict();
var LessonStatusSchema = z.enum(["draft", "published"]);
var LessonAuthoringStatusSchema = z.enum([
  "not_started",
  "outline",
  "presentation",
  "guided",
  "practice",
  "qa",
  "published"
]);
var LessonGradeLevelSchema = z.enum(["kindergarten", "grade1", "grade2", "grade3"]);
var TopicStatusSchema = z.enum(["active", "archived"]);
var UnitStatusSchema = TopicStatusSchema;
var CurriculumTreeLessonSchema = z.object({
  _id: IdSchema(),
  slug: z.string(),
  order: z.number(),
  status: LessonStatusSchema,
  title: z.string(),
  summary: z.string(),
  updatedAt: z.number(),
  authoringStatus: LessonAuthoringStatusSchema.optional(),
  assigneeId: z.string().optional(),
  gradeLevels: z.array(LessonGradeLevelSchema).optional()
}).strict();
var CurriculumTreeTopicSchema = z.object({
  _id: IdSchema(),
  unitId: IdSchema(),
  slug: z.string(),
  title: z.string(),
  overview: z.string().optional(),
  focusSkills: z.array(z.string()),
  estimatedDurationMinutes: z.number().optional(),
  order: z.number(),
  status: TopicStatusSchema,
  lessons: z.array(CurriculumTreeLessonSchema)
}).strict();
var CurriculumTreeUnitSchema = z.object({
  _id: IdSchema(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  coverImage: z.string().optional(),
  order: z.number(),
  status: UnitStatusSchema,
  metadata: EntityMetadataSchema.optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  topics: z.array(CurriculumTreeTopicSchema)
}).strict();
var CurriculumTreeSchema = z.array(CurriculumTreeUnitSchema);
var LessonDraftRecordSchema = z.object({
  _id: IdSchema(),
  draft: LessonDocumentSchema,
  published: LessonDocumentSchema.optional(),
  topicId: IdSchema(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  order: z.number(),
  status: LessonStatusSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  metadata: EntityMetadataSchema.optional(),
  authoringStatus: LessonAuthoringStatusSchema.optional(),
  assigneeId: z.string().optional(),
  authoringNotes: z.string().optional(),
  gradeLevels: z.array(LessonGradeLevelSchema).optional(),
  manifestHash: z.string().optional(),
  manifestGeneratedAt: z.string().optional(),
  manifestCommit: z.string().optional()
}).strict();
var RitRangeSchema = z.object({
  min: z.number(),
  max: z.number()
}).strict();
var CurriculumSkillPracticeSchema = z.object({
  easy: z.array(z.string()).optional(),
  medium: z.array(z.string()).optional(),
  hard: z.array(z.string()).optional()
}).strict().optional();
var CurriculumSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  domainId: z.string(),
  unitId: z.string().optional(),
  topicId: z.string().optional(),
  ccss: z.array(z.string()).optional(),
  ritBand: RitRangeSchema.optional(),
  representations: z.array(z.string()).optional(),
  practice: CurriculumSkillPracticeSchema,
  mentalMathEligible: z.boolean().optional()
}).passthrough();
var CurriculumManifestUnitSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  domainId: z.string().optional(),
  ritRange: RitRangeSchema.optional(),
  primaryCcss: z.array(z.string()).optional(),
  topicOrder: z.array(z.string())
}).strict();
var CurriculumManifestTopicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  unitId: z.string(),
  title: z.string(),
  overview: z.string().optional(),
  focusSkills: z.array(z.string()),
  ritRange: RitRangeSchema.optional(),
  ccssFocus: z.array(z.string()).optional(),
  priority: z.number().optional(),
  prerequisiteTopicIds: z.array(z.string())
}).strict();
var CurriculumManifestLessonSchema = z.object({
  id: z.string(),
  slug: z.string(),
  topicId: z.string(),
  title: z.string(),
  materialId: z.string().optional(),
  gradeLevels: z.array(LessonGradeLevelSchema),
  segments: z.array(
    z.object({
      type: z.string(),
      representation: z.string().optional()
    }).strict()
  ),
  prerequisiteLessonIds: z.array(z.string()),
  skills: z.array(z.string()),
  notes: z.string().optional()
}).strict();
var CurriculumManifestSchema = z.object({
  generatedAt: z.string(),
  domains: z.array(z.record(z.unknown())),
  units: z.array(CurriculumManifestUnitSchema),
  topics: z.array(CurriculumManifestTopicSchema),
  lessons: z.array(CurriculumManifestLessonSchema)
}).strict();
var CurriculumSyncSummarySchema = z.object({
  manifestHash: z.string(),
  manifestGeneratedAt: z.string(),
  manifestCommit: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  units: z.object({
    created: z.number(),
    updated: z.number(),
    deleted: z.number()
  }).strict(),
  topics: z.object({
    created: z.number(),
    updated: z.number(),
    deleted: z.number()
  }).strict(),
  lessons: z.object({
    created: z.number(),
    updated: z.number(),
    deleted: z.number()
  }).strict()
}).strict();
export {
  access_exports as AuthAccess,
  AuthoringMetaSchema,
  BankQuantityMapSchema,
  BillingAccountSchema,
  BillingAccountStatusSchema,
  BillingCycleSchema,
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
  OrgInviteSchema,
  OrgInviteStatusSchema,
  OrgMembershipSchema,
  OrgMembershipStatusSchema,
  OrganizationLifecycleStatusSchema,
  OrganizationPlanKeySchema,
  OrganizationSchema,
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
  UserProfileSchema,
  UserRoleSchema,
  WorkspaceKindSchema
};
