import { z } from 'zod';

export type Id<TableName extends string = string> = string & { __tableName: TableName };
export const IdSchema = <TableName extends string = string>() =>
  z.string() as unknown as z.ZodType<Id<TableName>>;

export const UserRoleSchema = z.enum(['internal', 'admin', 'guide', 'guardian', 'student']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const OrganizationPlanKeySchema = z.enum([
  'solo_monthly',
  'solo_annual',
  'family_monthly',
  'family_annual',
  'org_monthly',
  'org_annual',
  'org_highvolume_monthly',
  'org_highvolume_annual',
]);
export type OrganizationPlanKey = z.infer<typeof OrganizationPlanKeySchema>;

export const BillingCycleSchema = z.enum(['monthly', 'annual']);
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

export const BillingAccountStatusSchema = z.enum(['trial', 'active', 'past_due', 'paused', 'canceled']);
export type BillingAccountStatus = z.infer<typeof BillingAccountStatusSchema>;

export const OrganizationLifecycleStatusSchema = z.enum(['active', 'inactive', 'archived']);
export type OrganizationLifecycleStatus = z.infer<typeof OrganizationLifecycleStatusSchema>;

export const OrganizationSchema = z.object({
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
  updatedAt: z.number(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const OrgMembershipStatusSchema = z.enum(['pending', 'active', 'invited', 'suspended', 'revoked']);
export type OrgMembershipStatus = z.infer<typeof OrgMembershipStatusSchema>;

export const OrgMembershipSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  role: UserRoleSchema,
  status: OrgMembershipStatusSchema,
  invitedByUserId: z.string().optional(),
  inviteId: z.string().optional(),
  relationships: z
    .object({
      guardianForStudentIds: z.array(z.string()).optional(),
      guideForStudentIds: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })
    .partial()
    .optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type OrgMembership = z.infer<typeof OrgMembershipSchema>;

export const OrgInviteStatusSchema = z.enum(['pending', 'accepted', 'expired', 'revoked']);
export type OrgInviteStatus = z.infer<typeof OrgInviteStatusSchema>;

export const OrgInviteSchema = z.object({
  orgId: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'guide', 'guardian', 'student']),
  token: z.string(),
  status: OrgInviteStatusSchema,
  createdByUserId: z.string(),
  expiresAt: z.number(),
  createdAt: z.number(),
  acceptedAt: z.number().optional(),
  redeemedByUserId: z.string().optional(),
});
export type OrgInvite = z.infer<typeof OrgInviteSchema>;

export const BillingAccountSchema = z.object({
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
  updatedAt: z.number(),
});
export type BillingAccount = z.infer<typeof BillingAccountSchema>;

export const UserProfileSchema = z.object({
  userId: z.string(),
  accountRole: UserRoleSchema,
  displayName: z.string().optional(),
  activeOrgId: z.string().optional(),
  impersonationState: z
    .object({
      active: z.boolean(),
      actorUserId: z.string(),
      startedAt: z.number(),
    })
    .optional(),
  preferences: z
    .object({
      theme: z.string(),
      defaultView: z.string(),
    })
    .partial()
    .optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const SegmentTypeSchema = z.enum(['presentation', 'guided', 'practice']);
export type SegmentType = z.infer<typeof SegmentTypeSchema>;

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const AuthoringMetaSchema = z
  .object({
    label: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
export type AuthoringMeta = z.infer<typeof AuthoringMetaSchema>;

export const LessonScenarioKindSchema = z.enum(['golden-beads', 'stamp-game']);
export type LessonScenarioKind = z.infer<typeof LessonScenarioKindSchema>;

export const LessonScenarioBindingSchema = z
  .object({
    kind: LessonScenarioKindSchema,
    seed: z.number(),
    snapshot: z.record(z.unknown()).optional(),
    notes: z.string().optional(),
  })
  .strict();
export type LessonScenarioBinding = z.infer<typeof LessonScenarioBindingSchema>;

export const EntityMetadataSchema = z
  .object({
    source: z.string().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    scenario: LessonScenarioBindingSchema.optional(),
  })
  .catchall(z.unknown());
export type EntityMetadata = z.infer<typeof EntityMetadataSchema>;

export const MaterialSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    primaryUse: z.literal('multiplication'),
    interaction: z.enum(['manipulate', 'static']),
    media: z
      .object({
        thumbnail: z.string().optional(),
        icon: z.string().optional(),
      })
      .optional(),
  })
  .strict();
export type Material = z.infer<typeof MaterialSchema>;

export const RepresentationSchema = z.enum(['concrete', 'abstract']);
export type Representation = z.infer<typeof RepresentationSchema>;

export const MaterialUsageSchema = z
  .object({
    materialId: z.string(),
    purpose: z.string(),
    optional: z.boolean().optional(),
  })
  .strict();
export type MaterialUsage = z.infer<typeof MaterialUsageSchema>;

export const WorkspaceKindSchema = z.enum(['golden-beads', 'stamp-game']);
export type WorkspaceKind = z.infer<typeof WorkspaceKindSchema>;

export const BankQuantityMapSchema = z.record(z.number());
export type BankQuantityMap = z.infer<typeof BankQuantityMapSchema>;

export const CanvasAnchorSchema = z
  .object({
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    width: z.number().optional(),
    height: z.number().optional(),
    align: z.enum(['start', 'center', 'end']).optional(),
  })
  .strict();
export type CanvasAnchor = z.infer<typeof CanvasAnchorSchema>;

export const ExchangeRuleSchema = z
  .object({
    triggerTokenType: z.string(),
    produces: z.array(
      z.object({
        tokenType: z.string(),
        quantity: z.number(),
      }),
    ),
    consumes: z.array(
      z.object({
        tokenType: z.string(),
        quantity: z.number(),
      }),
    ),
  })
  .strict();
export type ExchangeRule = z.infer<typeof ExchangeRuleSchema>;

export const ReplenishRuleSchema = z
  .object({
    whenBankId: z.string(),
    method: z.enum(['reset-on-exit', 'reset-on-undo', 'custom']),
    customHandlerId: z.string().optional(),
  })
  .strict();
export type ReplenishRule = z.infer<typeof ReplenishRuleSchema>;

export const ConsumptionRuleSchema = z
  .object({
    bankId: z.string(),
    allowNegative: z.boolean().optional(),
    blockWhenEmpty: z.boolean().optional(),
  })
  .strict();
export type ConsumptionRule = z.infer<typeof ConsumptionRuleSchema>;

export const InventoryRuleSetSchema = z
  .object({
    onExchange: z.array(ExchangeRuleSchema).optional(),
    onReplenish: z.array(ReplenishRuleSchema).optional(),
    onConsumption: z.array(ConsumptionRuleSchema).optional(),
  })
  .strict();
export type InventoryRuleSet = z.infer<typeof InventoryRuleSetSchema>;

export const TokenVisualDefinitionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('bead'),
    place: z.enum(['unit', 'ten', 'hundred', 'thousand']),
  }),
  z.object({
    kind: z.literal('card'),
    value: z.number(),
    size: z.enum(['sm', 'md', 'lg']),
  }),
  z.object({
    kind: z.literal('stamp'),
    value: z.union([z.literal(1), z.literal(10), z.literal(100)]),
  }),
  z.object({
    kind: z.literal('custom'),
    componentId: z.string(),
    props: z.record(z.unknown()).optional(),
  }),
]);
export type TokenVisualDefinition = z.infer<typeof TokenVisualDefinitionSchema>;

export const TokenTypeDefinitionSchema = z
  .object({
    id: z.string(),
    materialId: z.string(),
    workspace: WorkspaceKindSchema,
    label: z.string(),
    visual: TokenVisualDefinitionSchema,
    quantityPerToken: z.number().optional(),
    authoring: AuthoringMetaSchema.optional(),
  })
  .strict();
export type TokenTypeDefinition = z.infer<typeof TokenTypeDefinitionSchema>;

export const MaterialBankDefinitionSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    scope: z.enum(['lesson', 'segment']),
    segmentId: z.string().optional(),
    materialId: z.string(),
    accepts: z.array(z.string()),
    initialQuantity: z.union([z.number(), BankQuantityMapSchema]),
    depletion: z.enum(['static', 'consume', 'replenish']).optional(),
    layout: CanvasAnchorSchema.optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
export type MaterialBankDefinition = z.infer<typeof MaterialBankDefinitionSchema>;

export const LessonMaterialInventorySchema = z
  .object({
    version: z.literal(1),
    tokenTypes: z.array(TokenTypeDefinitionSchema),
    banks: z.array(MaterialBankDefinitionSchema),
    defaultRules: InventoryRuleSetSchema.optional(),
    sceneNodes: z
      .array(
        z
          .object({
            id: z.string(),
            materialId: z.string(),
            label: z.string().optional(),
            transform: z
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
              .optional(),
            metadata: z.record(z.unknown()).optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();
export type LessonMaterialInventory = z.infer<typeof LessonMaterialInventorySchema>;

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

export const LessonSchema = z
  .object({
    id: z.string(),
    topicId: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    focusSkills: z.array(z.string()).optional(),
    estimatedDurationMinutes: z.number(),
    primaryMaterialId: z.string(),
    segments: z.array(LessonSegmentSchema),
    materials: z.array(MaterialUsageSchema),
    materialInventory: LessonMaterialInventorySchema.optional(),
  })
  .strict();
export type Lesson = z.infer<typeof LessonSchema>;

export const LessonDocumentMetaSchema = z
  .object({
    createdAt: z.union([z.string(), z.number()]).optional(),
    updatedAt: z.union([z.string(), z.number()]).optional(),
    author: z.string().optional(),
    notes: z.string().optional(),
    metadata: EntityMetadataSchema.optional(),
    scenario: LessonScenarioBindingSchema.optional(),
  })
  .strict();
export type LessonDocumentMeta = z.infer<typeof LessonDocumentMetaSchema>;

export const LessonDocumentSchema = z
  .object({
    version: z.literal('1.0'),
    lesson: LessonSchema,
    meta: LessonDocumentMetaSchema.optional(),
  })
  .strict();
export type LessonDocument = z.infer<typeof LessonDocumentSchema>;

export const TopicSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    overview: z.string(),
    focusSkills: z.array(z.string()),
    estimatedDurationMinutes: z.number(),
    lessons: z.array(LessonSchema),
  })
  .strict();
export type Topic = z.infer<typeof TopicSchema>;

export const TaskCategorySchema = z.enum([
  'tutorial',
  'guided-practice',
  'practice-question',
  'independent-question',
]);
export type TaskCategory = z.infer<typeof TaskCategorySchema>;

export const LessonTaskSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    category: TaskCategorySchema,
    segmentId: z.string(),
    stepId: z.string().optional(),
    questionId: z.string().optional(),
    order: z.number(),
  })
  .strict();
export type LessonTask = z.infer<typeof LessonTaskSchema>;

export const LessonPlanSchema = z
  .object({
    lessonId: z.string(),
    label: z.string(),
    tasks: z.array(LessonTaskSchema),
  })
  .strict();
export type LessonPlan = z.infer<typeof LessonPlanSchema>;

export const UnitTopicRefSchema = z
  .object({
    topicId: z.string(),
    lessonIds: z.array(z.string()).optional(),
  })
  .strict();
export type UnitTopicRef = z.infer<typeof UnitTopicRefSchema>;

export const UnitSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    summary: z.string(),
    coverImage: z.string(),
    topics: z.array(UnitTopicRefSchema),
  })
  .strict();
export type Unit = z.infer<typeof UnitSchema>;

export const LessonStatusSchema = z.enum(['draft', 'published']);
export type LessonStatus = z.infer<typeof LessonStatusSchema>;

export const LessonAuthoringStatusSchema = z.enum([
  'not_started',
  'outline',
  'presentation',
  'guided',
  'practice',
  'qa',
  'published',
]);
export type LessonAuthoringStatus = z.infer<typeof LessonAuthoringStatusSchema>;

export const LessonGradeLevelSchema = z.enum(['kindergarten', 'grade1', 'grade2', 'grade3']);
export type LessonGradeLevel = z.infer<typeof LessonGradeLevelSchema>;

export const TopicStatusSchema = z.enum(['active', 'archived']);
export type TopicStatus = z.infer<typeof TopicStatusSchema>;

export const UnitStatusSchema = TopicStatusSchema;
export type UnitStatus = TopicStatus;

export const CurriculumTreeLessonSchema = z
  .object({
    _id: IdSchema<'lessons'>(),
    slug: z.string(),
    order: z.number(),
    status: LessonStatusSchema,
    title: z.string(),
    summary: z.string(),
    updatedAt: z.number(),
    authoringStatus: LessonAuthoringStatusSchema.optional(),
    assigneeId: z.string().optional(),
    gradeLevels: z.array(LessonGradeLevelSchema).optional(),
  })
  .strict();
export type CurriculumTreeLesson = z.infer<typeof CurriculumTreeLessonSchema>;

export const CurriculumTreeTopicSchema = z
  .object({
    _id: IdSchema<'topics'>(),
    unitId: IdSchema<'units'>(),
    slug: z.string(),
    title: z.string(),
    overview: z.string().optional(),
    focusSkills: z.array(z.string()),
    estimatedDurationMinutes: z.number().optional(),
    order: z.number(),
    status: TopicStatusSchema,
    lessons: z.array(CurriculumTreeLessonSchema),
  })
  .strict();
export type CurriculumTreeTopic = z.infer<typeof CurriculumTreeTopicSchema>;

export const CurriculumTreeUnitSchema = z
  .object({
    _id: IdSchema<'units'>(),
    slug: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    coverImage: z.string().optional(),
    order: z.number(),
    status: UnitStatusSchema,
    metadata: EntityMetadataSchema.optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
    topics: z.array(CurriculumTreeTopicSchema),
  })
  .strict();
export type CurriculumTreeUnit = z.infer<typeof CurriculumTreeUnitSchema>;

export const CurriculumTreeSchema = z.array(CurriculumTreeUnitSchema);
export type CurriculumTree = z.infer<typeof CurriculumTreeSchema>;

export const LessonDraftRecordSchema = z
  .object({
    _id: IdSchema<'lessons'>(),
    draft: LessonDocumentSchema,
    published: LessonDocumentSchema.optional(),
    topicId: IdSchema<'topics'>(),
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
    manifestCommit: z.string().optional(),
  })
  .strict();
export type LessonDraftRecord = z.infer<typeof LessonDraftRecordSchema>;

const RitRangeSchema = z
  .object({
    min: z.number(),
    max: z.number(),
  })
  .strict();

const CurriculumSkillPracticeSchema = z
  .object({
    easy: z.array(z.string()).optional(),
    medium: z.array(z.string()).optional(),
    hard: z.array(z.string()).optional(),
  })
  .strict()
  .optional();

export const CurriculumSkillSchema = z
  .object({
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
    mentalMathEligible: z.boolean().optional(),
  })
  .passthrough();
export type CurriculumSkill = z.infer<typeof CurriculumSkillSchema>;

export const CurriculumManifestUnitSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string().optional(),
    domainId: z.string().optional(),
    ritRange: RitRangeSchema.optional(),
    primaryCcss: z.array(z.string()).optional(),
    topicOrder: z.array(z.string()),
  })
  .strict();
export type CurriculumManifestUnit = z.infer<typeof CurriculumManifestUnitSchema>;

export const CurriculumManifestTopicSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    unitId: z.string(),
    title: z.string(),
    overview: z.string().optional(),
    focusSkills: z.array(z.string()),
    ritRange: RitRangeSchema.optional(),
    ccssFocus: z.array(z.string()).optional(),
    priority: z.number().optional(),
    prerequisiteTopicIds: z.array(z.string()),
  })
  .strict();
export type CurriculumManifestTopic = z.infer<typeof CurriculumManifestTopicSchema>;

export const CurriculumManifestLessonSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    topicId: z.string(),
    title: z.string(),
    materialId: z.string().optional(),
    gradeLevels: z.array(LessonGradeLevelSchema),
    segments: z.array(
      z
        .object({
          type: z.string(),
          representation: z.string().optional(),
        })
        .strict(),
    ),
    prerequisiteLessonIds: z.array(z.string()),
    skills: z.array(z.string()),
    notes: z.string().optional(),
  })
  .strict();
export type CurriculumManifestLesson = z.infer<typeof CurriculumManifestLessonSchema>;

export const CurriculumManifestSchema = z
  .object({
    generatedAt: z.string(),
    domains: z.array(z.record(z.unknown())),
    units: z.array(CurriculumManifestUnitSchema),
    topics: z.array(CurriculumManifestTopicSchema),
    lessons: z.array(CurriculumManifestLessonSchema),
  })
  .strict();
export type CurriculumManifest = z.infer<typeof CurriculumManifestSchema>;

export const CurriculumSyncSummarySchema = z
  .object({
    manifestHash: z.string(),
    manifestGeneratedAt: z.string(),
    manifestCommit: z.string().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
    units: z
      .object({
        created: z.number(),
        updated: z.number(),
        deleted: z.number(),
      })
      .strict(),
    topics: z
      .object({
        created: z.number(),
        updated: z.number(),
        deleted: z.number(),
      })
      .strict(),
    lessons: z
      .object({
        created: z.number(),
        updated: z.number(),
        deleted: z.number(),
      })
      .strict(),
  })
  .strict();
export type CurriculumSyncSummary = z.infer<typeof CurriculumSyncSummarySchema>;

export * as AuthAccess from './auth/access.js';
