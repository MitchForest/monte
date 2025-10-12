import type {
  GuidedEvaluatorId,
  LessonDocument,
  LessonScenarioBinding,
  LessonSegment as LessonSegmentType,
  PracticePassCriteria,
  PracticeQuestion,
  PresentationAction,
  PresentationScript,
  WorkspaceKind,
} from '@monte/types';

type LessonSegment = LessonDocument['lesson']['segments'][number];
type PresentationSegment = Extract<LessonSegment, { type: 'presentation' }>;
type GuidedSegment = Extract<LessonSegment, { type: 'guided' }>;
type PracticeSegment = Extract<LessonSegment, { type: 'practice' }>;
type GuidedStepWithEvaluator = GuidedSegment['steps'][number];

const BEAD_PLACE_ORDER: Array<'thousand' | 'hundred' | 'ten' | 'unit'> = [
  'thousand',
  'hundred',
  'ten',
  'unit',
];

const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export const generateId = (prefix: string) => `${prefix}-${randomId().slice(0, 8)}`;

export const createPresentationAction = (
  type: PresentationAction['type'],
  id: string = generateId(`action-${type}`),
): PresentationAction => {
  const common = {
    id,
    durationMs: undefined,
    authoring: undefined,
  } as const;

  switch (type) {
    case 'narrate':
      return { ...common, type: 'narrate', text: '' };
    case 'showCard':
      return {
        ...common,
        type: 'showCard',
        card: '',
        position: 'paper',
      };
    case 'placeBeads':
      return {
        ...common,
        type: 'placeBeads',
        place: 'unit',
        quantity: 1,
        tray: 1,
      };
    case 'duplicateTray':
      return {
        ...common,
        type: 'duplicateTray',
        count: 2,
      };
    case 'exchange':
      return {
        ...common,
        type: 'exchange',
        from: 'unit',
        to: 'ten',
        quantity: 10,
        remainder: 0,
      };
    case 'moveBeadsBelowLine':
      return {
        ...common,
        type: 'moveBeadsBelowLine',
        place: 'unit',
        totalCount: 0,
      };
    case 'groupForExchange':
      return {
        ...common,
        type: 'groupForExchange',
        place: 'unit',
        groupsOfTen: 0,
        remainder: 0,
      };
    case 'exchangeBeads':
      return {
        ...common,
        type: 'exchangeBeads',
        from: 'unit',
        to: 'ten',
        groupsOfTen: 0,
      };
    case 'placeResultCard':
      return {
        ...common,
        type: 'placeResultCard',
        place: 'unit',
        value: 0,
      };
    case 'stackPlaceValues':
      return {
        ...common,
        type: 'stackPlaceValues',
        order: [...BEAD_PLACE_ORDER],
      };
    case 'writeResult':
      return {
        ...common,
        type: 'writeResult',
        value: '',
      };
    case 'highlight':
      return {
        ...common,
        type: 'highlight',
        target: '',
        text: '',
      };
    case 'showStamp':
      return {
        ...common,
        type: 'showStamp',
        stamp: '1',
        columns: 1,
        rows: 1,
      };
    case 'countTotal':
      return {
        ...common,
        type: 'countTotal',
        value: '',
      };
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unsupported presentation action: ${exhaustiveCheck as string}`);
    }
  }
};

export const defaultPracticeQuestion = (): PracticeQuestion => ({
  id: generateId('question'),
  multiplicand: 100,
  multiplier: 2,
  prompt: 'Solve 100 × 2.',
  correctAnswer: 200,
  difficulty: 'easy',
  authoring: undefined,
});

export const defaultPassCriteria: PracticePassCriteria = {
  type: 'threshold',
  firstCorrect: 2,
  totalCorrect: 3,
  maxMisses: 3,
};

export const defaultGuidedStep = (
  workspace: WorkspaceKind,
): GuidedStepWithEvaluator => ({
  id: generateId('step'),
  prompt: 'Describe the guided action.',
  expectation: 'Expectation description.',
  successCheck: 'Success criteria.',
  nudge: 'Helpful hint to guide the learner.',
  explanation: undefined,
  durationMs: undefined,
  authoring: undefined,
  evaluatorId: (workspace === 'stamp-game'
    ? 'stamp-game-build'
    : 'golden-beads-build-base') as GuidedEvaluatorId,
});

export const createSegment = (
  type: LessonSegment['type'],
  defaultMaterialId: string,
): LessonSegmentType => {
  const baseId = generateId(`segment-${type}`);

  if (type === 'presentation') {
    const segment: PresentationSegment = {
      id: baseId,
      title: 'New presentation segment',
      description: '',
      type: 'presentation',
      representation: 'concrete',
      primaryMaterialId: defaultMaterialId,
      materials: [],
      skills: [],
      scriptId: `script-${baseId}`,
      script: {
        id: `script-${baseId}`,
        title: 'Presentation script',
        summary: '',
        actions: [createPresentationAction('narrate')],
      },
      scenario: { kind: 'golden-beads', seed: Date.now() },
      materialBankId: undefined,
      timeline: undefined,
    };
    return segment;
  }

  if (type === 'guided') {
    const segment: GuidedSegment = {
      id: baseId,
      title: 'New guided segment',
      description: '',
      type: 'guided',
      representation: 'concrete',
      materials: [],
      skills: [],
      workspace: 'golden-beads',
      steps: [defaultGuidedStep('golden-beads')],
      scenario: { kind: 'golden-beads', seed: Date.now() },
      materialBankId: undefined,
      timeline: undefined,
    };
    return segment;
  }

  const segment: PracticeSegment = {
    id: baseId,
    title: 'New practice segment',
    description: '',
    type: 'practice',
    representation: 'concrete',
    materials: [],
    skills: [],
    workspace: 'golden-beads',
    questions: [defaultPracticeQuestion()],
    passCriteria: { ...defaultPassCriteria },
    scenario: { kind: 'golden-beads', seed: Date.now() },
    materialBankId: undefined,
    timeline: undefined,
  };
  return segment;
};

export const ensurePresentationScript = (segment: PresentationSegment): PresentationScript => {
  if (!segment.script) {
    segment.script = {
      id: segment.scriptId ?? `script-${segment.id}`,
      title: segment.title,
      summary: '',
      actions: [],
    };
  }
  return segment.script;
};

export const sanitizeScenario = (
  scenario: LessonScenarioBinding | undefined,
  fallbackKind: LessonScenarioBinding['kind'] = 'golden-beads',
): LessonScenarioBinding => {
  if (!scenario) {
    return { kind: fallbackKind, seed: Date.now() };
  }
  return scenario;
};
