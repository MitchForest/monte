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
  AuthAccess: () => access_exports,
  AuthoringMetaSchema: () => AuthoringMetaSchema,
  BankQuantityMapSchema: () => BankQuantityMapSchema,
  BillingAccountSchema: () => BillingAccountSchema,
  BillingAccountStatusSchema: () => BillingAccountStatusSchema,
  BillingCycleSchema: () => BillingCycleSchema,
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
  OrgInviteSchema: () => OrgInviteSchema,
  OrgInviteStatusSchema: () => OrgInviteStatusSchema,
  OrgMembershipSchema: () => OrgMembershipSchema,
  OrgMembershipStatusSchema: () => OrgMembershipStatusSchema,
  OrganizationLifecycleStatusSchema: () => OrganizationLifecycleStatusSchema,
  OrganizationPlanKeySchema: () => OrganizationPlanKeySchema,
  OrganizationSchema: () => OrganizationSchema,
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
  UserProfileSchema: () => UserProfileSchema,
  UserRoleSchema: () => UserRoleSchema,
  WorkspaceKindSchema: () => WorkspaceKindSchema
});
module.exports = __toCommonJS(index_exports);
var import_zod = require("zod");

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
var IdSchema = () => import_zod.z.string();
var UserRoleSchema = import_zod.z.enum(["internal", "admin", "guide", "guardian", "student"]);
var OrganizationPlanKeySchema = import_zod.z.enum([
  "solo_monthly",
  "solo_annual",
  "family_monthly",
  "family_annual",
  "org_monthly",
  "org_annual",
  "org_highvolume_monthly",
  "org_highvolume_annual"
]);
var BillingCycleSchema = import_zod.z.enum(["monthly", "annual"]);
var BillingAccountStatusSchema = import_zod.z.enum(["trial", "active", "past_due", "paused", "canceled"]);
var OrganizationLifecycleStatusSchema = import_zod.z.enum(["active", "inactive", "archived"]);
var OrganizationSchema = import_zod.z.object({
  name: import_zod.z.string(),
  slug: import_zod.z.string(),
  joinCode: import_zod.z.string(),
  planKey: OrganizationPlanKeySchema,
  billingCycle: BillingCycleSchema,
  lifecycleStatus: OrganizationLifecycleStatusSchema,
  primaryAdminId: import_zod.z.string(),
  seatLimit: import_zod.z.number().nullable().optional(),
  seatsInUse: import_zod.z.number().optional(),
  metadata: import_zod.z.record(import_zod.z.unknown()).optional(),
  createdAt: import_zod.z.number(),
  updatedAt: import_zod.z.number()
});
var OrgMembershipStatusSchema = import_zod.z.enum(["pending", "active", "invited", "suspended", "revoked"]);
var OrgMembershipSchema = import_zod.z.object({
  userId: import_zod.z.string(),
  orgId: import_zod.z.string(),
  role: UserRoleSchema,
  status: OrgMembershipStatusSchema,
  invitedByUserId: import_zod.z.string().optional(),
  inviteId: import_zod.z.string().optional(),
  relationships: import_zod.z.object({
    guardianForStudentIds: import_zod.z.array(import_zod.z.string()).optional(),
    guideForStudentIds: import_zod.z.array(import_zod.z.string()).optional(),
    notes: import_zod.z.string().optional()
  }).partial().optional(),
  createdAt: import_zod.z.number(),
  updatedAt: import_zod.z.number()
});
var OrgInviteStatusSchema = import_zod.z.enum(["pending", "accepted", "expired", "revoked"]);
var OrgInviteSchema = import_zod.z.object({
  orgId: import_zod.z.string(),
  email: import_zod.z.string().email(),
  role: import_zod.z.enum(["admin", "guide", "guardian", "student"]),
  token: import_zod.z.string(),
  status: OrgInviteStatusSchema,
  createdByUserId: import_zod.z.string(),
  expiresAt: import_zod.z.number(),
  createdAt: import_zod.z.number(),
  acceptedAt: import_zod.z.number().optional(),
  redeemedByUserId: import_zod.z.string().optional()
});
var BillingAccountSchema = import_zod.z.object({
  orgId: import_zod.z.string(),
  planKey: OrganizationPlanKeySchema,
  billingCycle: BillingCycleSchema,
  seatsIncluded: import_zod.z.number(),
  seatsInUse: import_zod.z.number(),
  basePriceCents: import_zod.z.number(),
  pricePerSeatCents: import_zod.z.number(),
  overageSeatPriceCents: import_zod.z.number().optional(),
  externalCustomerId: import_zod.z.string().optional(),
  externalSubscriptionId: import_zod.z.string().optional(),
  trialEndsAt: import_zod.z.number().optional(),
  status: BillingAccountStatusSchema,
  createdAt: import_zod.z.number(),
  updatedAt: import_zod.z.number()
});
var UserProfileSchema = import_zod.z.object({
  userId: import_zod.z.string(),
  accountRole: UserRoleSchema,
  displayName: import_zod.z.string().optional(),
  activeOrgId: import_zod.z.string().optional(),
  impersonationState: import_zod.z.object({
    active: import_zod.z.boolean(),
    actorUserId: import_zod.z.string(),
    startedAt: import_zod.z.number()
  }).optional(),
  preferences: import_zod.z.object({
    theme: import_zod.z.string(),
    defaultView: import_zod.z.string()
  }).partial().optional(),
  createdAt: import_zod.z.number(),
  updatedAt: import_zod.z.number()
});
var SegmentTypeSchema = import_zod.z.enum(["presentation", "guided", "practice"]);
var DifficultySchema = import_zod.z.enum(["easy", "medium", "hard"]);
var AuthoringMetaSchema = import_zod.z.object({
  label: import_zod.z.string().optional(),
  description: import_zod.z.string().optional(),
  notes: import_zod.z.string().optional(),
  tags: import_zod.z.array(import_zod.z.string()).optional(),
  metadata: import_zod.z.record(import_zod.z.unknown()).optional()
}).strict();
var LessonScenarioKindSchema = import_zod.z.enum(["golden-beads", "stamp-game"]);
var LessonScenarioBindingSchema = import_zod.z.object({
  kind: LessonScenarioKindSchema,
  seed: import_zod.z.number(),
  snapshot: import_zod.z.record(import_zod.z.unknown()).optional(),
  notes: import_zod.z.string().optional()
}).strict();
var EntityMetadataSchema = import_zod.z.object({
  source: import_zod.z.string().optional(),
  tags: import_zod.z.array(import_zod.z.string()).optional(),
  notes: import_zod.z.string().optional(),
  scenario: LessonScenarioBindingSchema.optional()
}).catchall(import_zod.z.unknown());
var MaterialSchema = import_zod.z.object({
  id: import_zod.z.string(),
  name: import_zod.z.string(),
  description: import_zod.z.string(),
  tags: import_zod.z.array(import_zod.z.string()),
  primaryUse: import_zod.z.literal("multiplication"),
  interaction: import_zod.z.enum(["manipulate", "static"]),
  media: import_zod.z.object({
    thumbnail: import_zod.z.string().optional(),
    icon: import_zod.z.string().optional()
  }).optional()
}).strict();
var RepresentationSchema = import_zod.z.enum(["concrete", "abstract"]);
var MaterialUsageSchema = import_zod.z.object({
  materialId: import_zod.z.string(),
  purpose: import_zod.z.string(),
  optional: import_zod.z.boolean().optional()
}).strict();
var WorkspaceKindSchema = import_zod.z.enum(["golden-beads", "stamp-game"]);
var BankQuantityMapSchema = import_zod.z.record(import_zod.z.number());
var CanvasAnchorSchema = import_zod.z.object({
  position: import_zod.z.object({
    x: import_zod.z.number(),
    y: import_zod.z.number()
  }),
  width: import_zod.z.number().optional(),
  height: import_zod.z.number().optional(),
  align: import_zod.z.enum(["start", "center", "end"]).optional()
}).strict();
var ExchangeRuleSchema = import_zod.z.object({
  triggerTokenType: import_zod.z.string(),
  produces: import_zod.z.array(
    import_zod.z.object({
      tokenType: import_zod.z.string(),
      quantity: import_zod.z.number()
    })
  ),
  consumes: import_zod.z.array(
    import_zod.z.object({
      tokenType: import_zod.z.string(),
      quantity: import_zod.z.number()
    })
  )
}).strict();
var ReplenishRuleSchema = import_zod.z.object({
  whenBankId: import_zod.z.string(),
  method: import_zod.z.enum(["reset-on-exit", "reset-on-undo", "custom"]),
  customHandlerId: import_zod.z.string().optional()
}).strict();
var ConsumptionRuleSchema = import_zod.z.object({
  bankId: import_zod.z.string(),
  allowNegative: import_zod.z.boolean().optional(),
  blockWhenEmpty: import_zod.z.boolean().optional()
}).strict();
var InventoryRuleSetSchema = import_zod.z.object({
  onExchange: import_zod.z.array(ExchangeRuleSchema).optional(),
  onReplenish: import_zod.z.array(ReplenishRuleSchema).optional(),
  onConsumption: import_zod.z.array(ConsumptionRuleSchema).optional()
}).strict();
var TokenVisualDefinitionSchema = import_zod.z.discriminatedUnion("kind", [
  import_zod.z.object({
    kind: import_zod.z.literal("bead"),
    place: import_zod.z.enum(["unit", "ten", "hundred", "thousand"])
  }),
  import_zod.z.object({
    kind: import_zod.z.literal("card"),
    value: import_zod.z.number(),
    size: import_zod.z.enum(["sm", "md", "lg"])
  }),
  import_zod.z.object({
    kind: import_zod.z.literal("stamp"),
    value: import_zod.z.union([import_zod.z.literal(1), import_zod.z.literal(10), import_zod.z.literal(100)])
  }),
  import_zod.z.object({
    kind: import_zod.z.literal("custom"),
    componentId: import_zod.z.string(),
    props: import_zod.z.record(import_zod.z.unknown()).optional()
  })
]);
var TokenTypeDefinitionSchema = import_zod.z.object({
  id: import_zod.z.string(),
  materialId: import_zod.z.string(),
  workspace: WorkspaceKindSchema,
  label: import_zod.z.string(),
  visual: TokenVisualDefinitionSchema,
  quantityPerToken: import_zod.z.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var MaterialBankDefinitionSchema = import_zod.z.object({
  id: import_zod.z.string(),
  label: import_zod.z.string(),
  scope: import_zod.z.enum(["lesson", "segment"]),
  segmentId: import_zod.z.string().optional(),
  materialId: import_zod.z.string(),
  accepts: import_zod.z.array(import_zod.z.string()),
  initialQuantity: import_zod.z.union([import_zod.z.number(), BankQuantityMapSchema]),
  depletion: import_zod.z.enum(["static", "consume", "replenish"]).optional(),
  layout: CanvasAnchorSchema.optional(),
  metadata: import_zod.z.record(import_zod.z.unknown()).optional()
}).strict();
var LessonMaterialInventorySchema = import_zod.z.object({
  version: import_zod.z.literal(1),
  tokenTypes: import_zod.z.array(TokenTypeDefinitionSchema),
  banks: import_zod.z.array(MaterialBankDefinitionSchema),
  defaultRules: InventoryRuleSetSchema.optional(),
  sceneNodes: import_zod.z.array(
    import_zod.z.object({
      id: import_zod.z.string(),
      materialId: import_zod.z.string(),
      label: import_zod.z.string().optional(),
      transform: import_zod.z.object({
        position: import_zod.z.object({ x: import_zod.z.number(), y: import_zod.z.number() }),
        rotation: import_zod.z.number().optional(),
        scale: import_zod.z.object({
          x: import_zod.z.number(),
          y: import_zod.z.number()
        }).optional(),
        opacity: import_zod.z.number().optional()
      }).optional(),
      metadata: import_zod.z.record(import_zod.z.unknown()).optional()
    }).strict()
  ).optional()
}).strict();
var TimelineTransformSchema = import_zod.z.object({
  position: import_zod.z.object({ x: import_zod.z.number(), y: import_zod.z.number() }),
  rotation: import_zod.z.number().optional(),
  scale: import_zod.z.object({
    x: import_zod.z.number(),
    y: import_zod.z.number()
  }).optional(),
  opacity: import_zod.z.number().optional()
}).strict();
var TimelineKeyframeSchema = import_zod.z.object({
  timeMs: import_zod.z.number(),
  transform: TimelineTransformSchema,
  easing: import_zod.z.string().optional(),
  metadata: import_zod.z.record(import_zod.z.unknown()).optional()
}).strict();
var TimelineTrackSchema = import_zod.z.object({
  nodeId: import_zod.z.string(),
  keyframes: import_zod.z.array(TimelineKeyframeSchema),
  metadata: import_zod.z.record(import_zod.z.unknown()).optional()
}).strict();
var TimelineInteractionSchema = import_zod.z.object({
  id: import_zod.z.string(),
  kind: import_zod.z.enum(["drop-zone", "input", "custom"]),
  targetNodeId: import_zod.z.string().optional(),
  props: import_zod.z.record(import_zod.z.unknown()).optional()
}).strict();
var SegmentStepBaseSchema = import_zod.z.object({
  id: import_zod.z.string(),
  title: import_zod.z.string().optional(),
  caption: import_zod.z.string().optional(),
  actor: import_zod.z.enum(["guide", "student"]),
  durationMs: import_zod.z.number(),
  keyframes: import_zod.z.array(TimelineTrackSchema),
  interactions: import_zod.z.array(TimelineInteractionSchema).optional(),
  metadata: import_zod.z.record(import_zod.z.unknown()).optional()
}).strict();
var SegmentStepSchema = SegmentStepBaseSchema;
var SegmentTimelineSchema = import_zod.z.object({
  version: import_zod.z.literal(1),
  label: import_zod.z.string().optional(),
  steps: import_zod.z.array(SegmentStepSchema),
  metadata: import_zod.z.record(import_zod.z.unknown()).optional()
}).strict();
var PresentationActionDetailsSchema = import_zod.z.object({
  durationMs: import_zod.z.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var presentationActionNarrate = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("narrate"),
  text: import_zod.z.string()
});
var presentationActionShowCard = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("showCard"),
  card: import_zod.z.string(),
  position: import_zod.z.enum(["multiplicand-stack", "multiplier", "paper"])
});
var presentationActionPlaceBeads = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("placeBeads"),
  place: import_zod.z.enum(["thousand", "hundred", "ten", "unit"]),
  quantity: import_zod.z.number(),
  tray: import_zod.z.number()
});
var presentationActionDuplicateTray = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("duplicateTray"),
  count: import_zod.z.number()
});
var presentationActionExchange = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("exchange"),
  from: import_zod.z.enum(["unit", "ten", "hundred"]),
  to: import_zod.z.enum(["ten", "hundred", "thousand"]),
  quantity: import_zod.z.number(),
  remainder: import_zod.z.number()
});
var presentationActionMoveBeadsBelowLine = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("moveBeadsBelowLine"),
  place: import_zod.z.enum(["unit", "ten", "hundred"]),
  totalCount: import_zod.z.number()
});
var presentationActionGroupForExchange = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("groupForExchange"),
  place: import_zod.z.enum(["unit", "ten", "hundred"]),
  groupsOfTen: import_zod.z.number(),
  remainder: import_zod.z.number()
});
var presentationActionExchangeBeads = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("exchangeBeads"),
  from: import_zod.z.enum(["unit", "ten", "hundred"]),
  to: import_zod.z.enum(["ten", "hundred", "thousand"]),
  groupsOfTen: import_zod.z.number()
});
var presentationActionPlaceResultCard = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("placeResultCard"),
  place: import_zod.z.enum(["unit", "ten", "hundred", "thousand"]),
  value: import_zod.z.number()
});
var presentationActionStackPlaceValues = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("stackPlaceValues"),
  order: import_zod.z.array(import_zod.z.enum(["thousand", "hundred", "ten", "unit"]))
});
var presentationActionWriteResult = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("writeResult"),
  value: import_zod.z.string()
});
var presentationActionHighlight = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("highlight"),
  target: import_zod.z.string(),
  text: import_zod.z.string().optional()
});
var presentationActionShowStamp = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("showStamp"),
  stamp: import_zod.z.union([import_zod.z.literal("1"), import_zod.z.literal("10"), import_zod.z.literal("100")]),
  columns: import_zod.z.number(),
  rows: import_zod.z.number()
});
var presentationActionCountTotal = PresentationActionDetailsSchema.extend({
  type: import_zod.z.literal("countTotal"),
  value: import_zod.z.string()
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
  presentationActionNarrate.extend({ id: import_zod.z.string() }),
  presentationActionShowCard.extend({ id: import_zod.z.string() }),
  presentationActionPlaceBeads.extend({ id: import_zod.z.string() }),
  presentationActionDuplicateTray.extend({ id: import_zod.z.string() }),
  presentationActionExchange.extend({ id: import_zod.z.string() }),
  presentationActionMoveBeadsBelowLine.extend({ id: import_zod.z.string() }),
  presentationActionGroupForExchange.extend({ id: import_zod.z.string() }),
  presentationActionExchangeBeads.extend({ id: import_zod.z.string() }),
  presentationActionPlaceResultCard.extend({ id: import_zod.z.string() }),
  presentationActionStackPlaceValues.extend({ id: import_zod.z.string() }),
  presentationActionWriteResult.extend({ id: import_zod.z.string() }),
  presentationActionHighlight.extend({ id: import_zod.z.string() }),
  presentationActionShowStamp.extend({ id: import_zod.z.string() }),
  presentationActionCountTotal.extend({ id: import_zod.z.string() })
];
var PresentationActionInputSchema = import_zod.z.discriminatedUnion("type", presentationActionInputOptions);
var PresentationActionSchema = import_zod.z.discriminatedUnion("type", presentationActionOptionsWithId);
var PresentationScriptSchema = import_zod.z.object({
  id: import_zod.z.string(),
  title: import_zod.z.string(),
  actions: import_zod.z.array(PresentationActionSchema),
  summary: import_zod.z.string().optional()
}).strict();
var GuidedStepSchema = import_zod.z.object({
  id: import_zod.z.string(),
  prompt: import_zod.z.string(),
  expectation: import_zod.z.string(),
  successCheck: import_zod.z.string(),
  nudge: import_zod.z.string(),
  explanation: import_zod.z.string().optional(),
  durationMs: import_zod.z.number().optional(),
  authoring: AuthoringMetaSchema.optional()
}).strict();
var GuidedEvaluatorIdSchema = import_zod.z.enum([
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
var PresentationSegmentSchema = import_zod.z.object({
  id: import_zod.z.string(),
  title: import_zod.z.string(),
  description: import_zod.z.string().optional(),
  type: import_zod.z.literal("presentation"),
  representation: RepresentationSchema.optional(),
  primaryMaterialId: import_zod.z.string().optional(),
  materials: import_zod.z.array(MaterialUsageSchema),
  skills: import_zod.z.array(import_zod.z.string()),
  scriptId: import_zod.z.string().optional(),
  script: PresentationScriptSchema.optional(),
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: import_zod.z.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var GuidedSegmentSchema = import_zod.z.object({
  id: import_zod.z.string(),
  title: import_zod.z.string(),
  description: import_zod.z.string().optional(),
  type: import_zod.z.literal("guided"),
  representation: RepresentationSchema.optional(),
  materials: import_zod.z.array(MaterialUsageSchema),
  skills: import_zod.z.array(import_zod.z.string()),
  workspace: WorkspaceKindSchema,
  steps: import_zod.z.array(
    GuidedStepSchema.extend({
      evaluatorId: GuidedEvaluatorIdSchema
    })
  ),
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: import_zod.z.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var PracticeQuestionSchema = import_zod.z.object({
  id: import_zod.z.string(),
  multiplicand: import_zod.z.number(),
  multiplier: import_zod.z.number(),
  prompt: import_zod.z.string(),
  correctAnswer: import_zod.z.number(),
  difficulty: DifficultySchema,
  authoring: AuthoringMetaSchema.optional()
}).strict();
var PracticePassCriteriaSchema = import_zod.z.object({
  type: import_zod.z.literal("threshold"),
  firstCorrect: import_zod.z.number(),
  totalCorrect: import_zod.z.number(),
  maxMisses: import_zod.z.number()
}).strict();
var PracticeSegmentSchema = import_zod.z.object({
  id: import_zod.z.string(),
  title: import_zod.z.string(),
  description: import_zod.z.string().optional(),
  type: import_zod.z.literal("practice"),
  representation: RepresentationSchema.optional(),
  materials: import_zod.z.array(MaterialUsageSchema),
  skills: import_zod.z.array(import_zod.z.string()),
  workspace: WorkspaceKindSchema,
  questions: import_zod.z.array(PracticeQuestionSchema),
  passCriteria: PracticePassCriteriaSchema,
  scenario: LessonScenarioBindingSchema.optional(),
  materialBankId: import_zod.z.string().optional(),
  timeline: SegmentTimelineSchema.optional()
}).strict();
var LessonSegmentSchema = import_zod.z.discriminatedUnion("type", [
  PresentationSegmentSchema,
  GuidedSegmentSchema,
  PracticeSegmentSchema
]);
var LessonSchema = import_zod.z.object({
  id: import_zod.z.string(),
  topicId: import_zod.z.string(),
  title: import_zod.z.string(),
  summary: import_zod.z.string().optional(),
  focusSkills: import_zod.z.array(import_zod.z.string()).optional(),
  estimatedDurationMinutes: import_zod.z.number(),
  primaryMaterialId: import_zod.z.string(),
  segments: import_zod.z.array(LessonSegmentSchema),
  materials: import_zod.z.array(MaterialUsageSchema),
  materialInventory: LessonMaterialInventorySchema.optional()
}).strict();
var LessonDocumentMetaSchema = import_zod.z.object({
  createdAt: import_zod.z.union([import_zod.z.string(), import_zod.z.number()]).optional(),
  updatedAt: import_zod.z.union([import_zod.z.string(), import_zod.z.number()]).optional(),
  author: import_zod.z.string().optional(),
  notes: import_zod.z.string().optional(),
  metadata: EntityMetadataSchema.optional(),
  scenario: LessonScenarioBindingSchema.optional()
}).strict();
var LessonDocumentSchema = import_zod.z.object({
  version: import_zod.z.literal("1.0"),
  lesson: LessonSchema,
  meta: LessonDocumentMetaSchema.optional()
}).strict();
var TopicSchema = import_zod.z.object({
  id: import_zod.z.string(),
  title: import_zod.z.string(),
  overview: import_zod.z.string(),
  focusSkills: import_zod.z.array(import_zod.z.string()),
  estimatedDurationMinutes: import_zod.z.number(),
  lessons: import_zod.z.array(LessonSchema)
}).strict();
var TaskCategorySchema = import_zod.z.enum([
  "tutorial",
  "guided-practice",
  "practice-question",
  "independent-question"
]);
var LessonTaskSchema = import_zod.z.object({
  id: import_zod.z.string(),
  title: import_zod.z.string(),
  description: import_zod.z.string().optional(),
  category: TaskCategorySchema,
  segmentId: import_zod.z.string(),
  stepId: import_zod.z.string().optional(),
  questionId: import_zod.z.string().optional(),
  order: import_zod.z.number()
}).strict();
var LessonPlanSchema = import_zod.z.object({
  lessonId: import_zod.z.string(),
  label: import_zod.z.string(),
  tasks: import_zod.z.array(LessonTaskSchema)
}).strict();
var UnitTopicRefSchema = import_zod.z.object({
  topicId: import_zod.z.string(),
  lessonIds: import_zod.z.array(import_zod.z.string()).optional()
}).strict();
var UnitSchema = import_zod.z.object({
  id: import_zod.z.string(),
  name: import_zod.z.string(),
  summary: import_zod.z.string(),
  coverImage: import_zod.z.string(),
  topics: import_zod.z.array(UnitTopicRefSchema)
}).strict();
var LessonStatusSchema = import_zod.z.enum(["draft", "published"]);
var LessonAuthoringStatusSchema = import_zod.z.enum([
  "not_started",
  "outline",
  "presentation",
  "guided",
  "practice",
  "qa",
  "published"
]);
var LessonGradeLevelSchema = import_zod.z.enum(["kindergarten", "grade1", "grade2", "grade3"]);
var TopicStatusSchema = import_zod.z.enum(["active", "archived"]);
var UnitStatusSchema = TopicStatusSchema;
var CurriculumTreeLessonSchema = import_zod.z.object({
  _id: IdSchema(),
  slug: import_zod.z.string(),
  order: import_zod.z.number(),
  status: LessonStatusSchema,
  title: import_zod.z.string(),
  summary: import_zod.z.string(),
  updatedAt: import_zod.z.number(),
  authoringStatus: LessonAuthoringStatusSchema.optional(),
  assigneeId: import_zod.z.string().optional(),
  gradeLevels: import_zod.z.array(LessonGradeLevelSchema).optional()
}).strict();
var CurriculumTreeTopicSchema = import_zod.z.object({
  _id: IdSchema(),
  unitId: IdSchema(),
  slug: import_zod.z.string(),
  title: import_zod.z.string(),
  overview: import_zod.z.string().optional(),
  focusSkills: import_zod.z.array(import_zod.z.string()),
  estimatedDurationMinutes: import_zod.z.number().optional(),
  order: import_zod.z.number(),
  status: TopicStatusSchema,
  lessons: import_zod.z.array(CurriculumTreeLessonSchema)
}).strict();
var CurriculumTreeUnitSchema = import_zod.z.object({
  _id: IdSchema(),
  slug: import_zod.z.string(),
  title: import_zod.z.string(),
  summary: import_zod.z.string().optional(),
  coverImage: import_zod.z.string().optional(),
  order: import_zod.z.number(),
  status: UnitStatusSchema,
  metadata: EntityMetadataSchema.optional(),
  createdAt: import_zod.z.number(),
  updatedAt: import_zod.z.number(),
  topics: import_zod.z.array(CurriculumTreeTopicSchema)
}).strict();
var CurriculumTreeSchema = import_zod.z.array(CurriculumTreeUnitSchema);
var LessonDraftRecordSchema = import_zod.z.object({
  _id: IdSchema(),
  draft: LessonDocumentSchema,
  published: LessonDocumentSchema.optional(),
  topicId: IdSchema(),
  slug: import_zod.z.string(),
  title: import_zod.z.string(),
  summary: import_zod.z.string().optional(),
  order: import_zod.z.number(),
  status: LessonStatusSchema,
  createdAt: import_zod.z.number(),
  updatedAt: import_zod.z.number(),
  metadata: EntityMetadataSchema.optional(),
  authoringStatus: LessonAuthoringStatusSchema.optional(),
  assigneeId: import_zod.z.string().optional(),
  authoringNotes: import_zod.z.string().optional(),
  gradeLevels: import_zod.z.array(LessonGradeLevelSchema).optional(),
  manifestHash: import_zod.z.string().optional(),
  manifestGeneratedAt: import_zod.z.string().optional(),
  manifestCommit: import_zod.z.string().optional()
}).strict();
var RitRangeSchema = import_zod.z.object({
  min: import_zod.z.number(),
  max: import_zod.z.number()
}).strict();
var CurriculumSkillPracticeSchema = import_zod.z.object({
  easy: import_zod.z.array(import_zod.z.string()).optional(),
  medium: import_zod.z.array(import_zod.z.string()).optional(),
  hard: import_zod.z.array(import_zod.z.string()).optional()
}).strict().optional();
var CurriculumSkillSchema = import_zod.z.object({
  id: import_zod.z.string(),
  name: import_zod.z.string(),
  description: import_zod.z.string(),
  domainId: import_zod.z.string(),
  unitId: import_zod.z.string().optional(),
  topicId: import_zod.z.string().optional(),
  ccss: import_zod.z.array(import_zod.z.string()).optional(),
  ritBand: RitRangeSchema.optional(),
  representations: import_zod.z.array(import_zod.z.string()).optional(),
  practice: CurriculumSkillPracticeSchema,
  mentalMathEligible: import_zod.z.boolean().optional()
}).passthrough();
var CurriculumManifestUnitSchema = import_zod.z.object({
  id: import_zod.z.string(),
  slug: import_zod.z.string(),
  title: import_zod.z.string(),
  summary: import_zod.z.string().optional(),
  domainId: import_zod.z.string().optional(),
  ritRange: RitRangeSchema.optional(),
  primaryCcss: import_zod.z.array(import_zod.z.string()).optional(),
  topicOrder: import_zod.z.array(import_zod.z.string())
}).strict();
var CurriculumManifestTopicSchema = import_zod.z.object({
  id: import_zod.z.string(),
  slug: import_zod.z.string(),
  unitId: import_zod.z.string(),
  title: import_zod.z.string(),
  overview: import_zod.z.string().optional(),
  focusSkills: import_zod.z.array(import_zod.z.string()),
  ritRange: RitRangeSchema.optional(),
  ccssFocus: import_zod.z.array(import_zod.z.string()).optional(),
  priority: import_zod.z.number().optional(),
  prerequisiteTopicIds: import_zod.z.array(import_zod.z.string())
}).strict();
var CurriculumManifestLessonSchema = import_zod.z.object({
  id: import_zod.z.string(),
  slug: import_zod.z.string(),
  topicId: import_zod.z.string(),
  title: import_zod.z.string(),
  materialId: import_zod.z.string().optional(),
  gradeLevels: import_zod.z.array(LessonGradeLevelSchema),
  segments: import_zod.z.array(
    import_zod.z.object({
      type: import_zod.z.string(),
      representation: import_zod.z.string().optional()
    }).strict()
  ),
  prerequisiteLessonIds: import_zod.z.array(import_zod.z.string()),
  skills: import_zod.z.array(import_zod.z.string()),
  notes: import_zod.z.string().optional()
}).strict();
var CurriculumManifestSchema = import_zod.z.object({
  generatedAt: import_zod.z.string(),
  domains: import_zod.z.array(import_zod.z.record(import_zod.z.unknown())),
  units: import_zod.z.array(CurriculumManifestUnitSchema),
  topics: import_zod.z.array(CurriculumManifestTopicSchema),
  lessons: import_zod.z.array(CurriculumManifestLessonSchema)
}).strict();
var CurriculumSyncSummarySchema = import_zod.z.object({
  manifestHash: import_zod.z.string(),
  manifestGeneratedAt: import_zod.z.string(),
  manifestCommit: import_zod.z.string().optional(),
  createdAt: import_zod.z.number(),
  updatedAt: import_zod.z.number(),
  units: import_zod.z.object({
    created: import_zod.z.number(),
    updated: import_zod.z.number(),
    deleted: import_zod.z.number()
  }).strict(),
  topics: import_zod.z.object({
    created: import_zod.z.number(),
    updated: import_zod.z.number(),
    deleted: import_zod.z.number()
  }).strict(),
  lessons: import_zod.z.object({
    created: import_zod.z.number(),
    updated: import_zod.z.number(),
    deleted: import_zod.z.number()
  }).strict()
}).strict();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthAccess,
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
});
