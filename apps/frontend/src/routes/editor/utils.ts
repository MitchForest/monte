import type {
  GuidedEvaluatorId,
  LessonDocument,
  PracticeQuestion,
  PresentationAction,
} from '@monte/types';
import {
  beadPlaceOptions,
  type ActionTypeValue,
} from './constants';
import type {
  GuidedStepWithEvaluator,
  LessonScenario,
  LessonSegment,
  PresentationSegmentType,
} from './types';

export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const moveItem = <T,>(items: readonly T[], from: number, to: number): T[] => {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export const generateId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${(crypto.randomUUID() as string).slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const validateLessonDocument = (document: LessonDocument): string[] => {
  const errors: string[] = [];
  const lesson = document.lesson;

  if (!lesson.title.trim()) {
    errors.push('Lesson title is required');
  }

  if (!lesson.segments.length) {
    errors.push('Add at least one segment');
  }

  lesson.segments.forEach((segment, index) => {
    if (!segment.title.trim()) {
      errors.push(`Segment ${index + 1} is missing a title`);
    }
    if (!segment.materials || segment.materials.length === 0) {
      errors.push(`Segment ${index + 1} needs at least one material`);
    }
    if (!segment.skills || segment.skills.length === 0) {
      errors.push(`Segment ${index + 1} should reference at least one skill`);
    }

    if (segment.type === 'presentation') {
      if (!segment.script || segment.script.actions.length === 0) {
        errors.push(`Presentation segment "${segment.title}" needs at least one script action`);
      }
    }

    if (segment.type === 'guided') {
      if (!segment.steps.length) {
        errors.push(`Guided segment "${segment.title}" requires at least one step`);
      }
    }

    if (segment.type === 'practice') {
      if (!segment.questions.length) {
        errors.push(`Practice segment "${segment.title}" needs at least one question`);
      }
      if (!segment.passCriteria) {
        errors.push(`Practice segment "${segment.title}" is missing pass criteria`);
      }
    }
  });

  return errors;
};

export const createPresentationAction = (
  type: ActionTypeValue,
  id: string = generateId(`action-${type}`),
): PresentationAction => {
  const common = {
    id,
    durationMs: undefined,
    authoring: undefined,
  } as const;

  switch (type) {
    case 'narrate':
      return {
        ...common,
        type: 'narrate',
        text: '',
      };
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
        order: [...beadPlaceOptions],
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
    default:
      return {
        ...common,
        type: 'narrate',
        text: '',
      };
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

export const defaultPassCriteria = {
  type: 'threshold' as const,
  firstCorrect: 2,
  totalCorrect: 3,
  maxMisses: 3,
};

export const defaultGuidedStep = (
  workspace: 'golden-beads' | 'stamp-game',
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
): LessonSegment => {
  const baseId = generateId(`segment-${type}`);
  if (type === 'presentation') {
    return {
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
    } satisfies PresentationSegmentType;
  }
  if (type === 'guided') {
    return {
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
    };
  }
  return {
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
  };
};

export const ensurePresentationScript = (segment: PresentationSegmentType) => {
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
  scenario: LessonScenario | undefined,
  fallbackKind: LessonScenario['kind'] = 'golden-beads',
): LessonScenario => {
  if (!scenario) {
    return { kind: fallbackKind, seed: Date.now() };
  }
  return scenario;
};
