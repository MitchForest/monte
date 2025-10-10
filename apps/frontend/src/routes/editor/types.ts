import type {
  GuidedEvaluatorId,
  GuidedStep,
  LessonDocument,
  PracticeQuestion,
  PresentationAction,
  WorkspaceKind,
} from '@monte/types';

export interface UnitFormState {
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  status: 'active' | 'archived';
}

export interface TopicFormState {
  title: string;
  slug: string;
  overview: string;
  focusSkills: string;
  estimatedDurationMinutes: string;
  status: 'active' | 'archived';
}

export interface LessonMetaFormState {
  author: string;
  notes: string;
}

export interface CreateLessonFormState {
  title: string;
  slug: string;
}

export type LessonSegment = LessonDocument['lesson']['segments'][number];
export type LessonScenario = NonNullable<LessonSegment['scenario']>;
export type PresentationSegmentType = Extract<LessonSegment, { type: 'presentation' }>;

export type GuidedStepWithEvaluator = GuidedStep & { evaluatorId: GuidedEvaluatorId };

export interface PracticeSegmentDefaults {
  defaultWorkspace: WorkspaceKind;
  defaultQuestion: PracticeQuestion;
}

export interface PresentationActionUpdate {
  segmentId: string;
  actionId: string;
  mutate: (action: PresentationAction) => PresentationAction;
}
