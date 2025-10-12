import type { LessonDocument, LessonScenarioBinding, LessonSegment as LessonSegmentType, PracticePassCriteria, PracticeQuestion, PresentationAction, PresentationScript, WorkspaceKind } from '@monte/types';
type LessonSegment = LessonDocument['lesson']['segments'][number];
type PresentationSegment = Extract<LessonSegment, {
    type: 'presentation';
}>;
type GuidedSegment = Extract<LessonSegment, {
    type: 'guided';
}>;
type GuidedStepWithEvaluator = GuidedSegment['steps'][number];
export declare const generateId: (prefix: string) => string;
export declare const createPresentationAction: (type: PresentationAction["type"], id?: string) => PresentationAction;
export declare const defaultPracticeQuestion: () => PracticeQuestion;
export declare const defaultPassCriteria: PracticePassCriteria;
export declare const defaultGuidedStep: (workspace: WorkspaceKind) => GuidedStepWithEvaluator;
export declare const createSegment: (type: LessonSegment["type"], defaultMaterialId: string) => LessonSegmentType;
export declare const ensurePresentationScript: (segment: PresentationSegment) => PresentationScript;
export declare const sanitizeScenario: (scenario: LessonScenarioBinding | undefined, fallbackKind?: LessonScenarioBinding["kind"]) => LessonScenarioBinding;
export {};
//# sourceMappingURL=factories.d.ts.map