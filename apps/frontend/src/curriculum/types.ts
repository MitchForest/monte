export type SegmentType = 'presentation' | 'guided' | 'practice';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Material {
  id: string;
  name: string;
  description: string;
  tags: string[];
  primaryUse: 'multiplication';
  interaction: 'manipulate' | 'static';
  media?: {
    thumbnail?: string;
    icon?: string;
  };
}

export type Representation = 'concrete' | 'abstract';

export interface MaterialUsage {
  materialId: string;
  purpose: string;
  optional?: boolean;
}

export type WorkspaceKind = 'golden-beads' | 'stamp-game';

export type PresentationAction =
  | { type: 'narrate'; text: string }
  | { type: 'showCard'; card: string; position: 'multiplicand-stack' | 'multiplier' | 'paper' }
  | { type: 'placeBeads'; place: 'thousand' | 'hundred' | 'ten' | 'unit'; quantity: number; tray: number }
  | { type: 'duplicateTray'; count: number }
  | { type: 'exchange'; from: 'unit' | 'ten' | 'hundred'; to: 'ten' | 'hundred' | 'thousand'; quantity: number; remainder: number }
  | { type: 'stackPlaceValues'; order: ('thousand' | 'hundred' | 'ten' | 'unit')[] }
  | { type: 'writeResult'; value: string }
  | { type: 'highlight'; target: string; text?: string }
  | { type: 'showStamp'; stamp: '1' | '10' | '100'; columns: number; rows: number }
  | { type: 'countTotal'; value: string };

export interface PresentationScript {
  id: string;
  title: string;
  actions: PresentationAction[];
  summary?: string;
}

export interface GuidedStep {
  id: string;
  prompt: string;
  expectation: string;
  successCheck: string;
  nudge: string;
  explanation?: string;
}

export type GuidedEvaluatorId =
  | 'golden-beads-build-base'
  | 'golden-beads-duplicate'
  | 'golden-beads-exchange-units'
  | 'golden-beads-exchange-tens'
  | 'golden-beads-exchange-hundreds'
  | 'golden-beads-stack-result'
  | 'stamp-game-build'
  | 'stamp-game-repeat-columns'
  | 'stamp-game-exchange'
  | 'stamp-game-read-result';

export interface GuidedSegment {
  id: string;
  title: string;
  description?: string;
  type: 'guided';
  representation?: Representation;
  materials: MaterialUsage[];
  skills: string[];
  workspace: WorkspaceKind;
  steps: (GuidedStep & { evaluatorId: GuidedEvaluatorId })[];
}

export interface PresentationSegment {
  id: string;
  title: string;
  description?: string;
  type: 'presentation';
  representation?: Representation;
  primaryMaterialId?: string;
  materials: MaterialUsage[];
  skills: string[];
  scriptId: string;
}

export interface PracticeQuestion {
  id: string;
  multiplicand: number;
  multiplier: number;
  prompt: string;
  correctAnswer: number;
  difficulty: Difficulty;
}

export interface PracticePassCriteria {
  type: 'threshold';
  firstCorrect: number;
  totalCorrect: number;
  maxMisses: number;
}

export interface PracticeSegment {
  id: string;
  title: string;
  description?: string;
  type: 'practice';
  representation?: Representation;
  materials: MaterialUsage[];
  skills: string[];
  workspace: WorkspaceKind;
  questions: PracticeQuestion[];
  passCriteria: PracticePassCriteria;
}

export type LessonSegment = PresentationSegment | GuidedSegment | PracticeSegment;

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  summary?: string;
  focusSkills?: string[];
  estimatedDurationMinutes: number;
  primaryMaterialId: string;
  segments: LessonSegment[];
  materials: MaterialUsage[];
}

export interface Topic {
  id: string;
  title: string;
  overview: string;
  focusSkills: string[];
  estimatedDurationMinutes: number;
  lessons: Lesson[];
}

export type TaskCategory =
  | 'tutorial'
  | 'guided-practice'
  | 'practice-question'
  | 'independent-question';

export interface LessonTask {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  segmentId: string;
  stepId?: string;
  questionId?: string;
  order: number;
}

export interface LessonPlan {
  lessonId: string;
  label: string;
  tasks: LessonTask[];
}

export interface UnitTopicRef {
  topicId: string;
  lessonIds?: string[];
}

export interface Unit {
  id: string;
  name: string;
  summary: string;
  coverImage: string;
  topics: UnitTopicRef[];
}
