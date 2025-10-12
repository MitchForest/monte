import type { GuidedEvaluatorId, GuidedStep, PracticePassCriteria, PracticeQuestion, PresentationScript } from '@monte/types';
export interface GoldenBeadScenario {
    kind: 'golden-beads';
    seed: number;
    multiplicand: number;
    multiplier: number;
    digits: {
        thousands: number;
        hundreds: number;
        tens: number;
        units: number;
    };
    unitTotal: number;
    unitRemainder: number;
    unitCarry: number;
    tensTotal: number;
    tensRemainder: number;
    tensCarry: number;
    hundredsTotal: number;
    hundredsRemainder: number;
    hundredsCarry: number;
    thousandsTotal: number;
    product: number;
}
export interface StampGameScenario {
    kind: 'stamp-game';
    seed: number;
    multiplicand: number;
    multiplier: number;
    digits: {
        hundreds: number;
        tens: number;
        units: number;
    };
    unitsTotal: number;
    unitsRemainder: number;
    unitsCarry: number;
    tensTotal: number;
    tensRemainder: number;
    tensCarry: number;
    hundredsTotal: number;
    hundredsRemainder: number;
    hundredsCarry: number;
    thousandsTotal: number;
    product: number;
}
export declare const generateGoldenBeadScenario: (seed?: number) => GoldenBeadScenario;
export declare const generateStampGameScenario: (seed?: number) => StampGameScenario;
export declare const buildGoldenBeadPresentationScript: (scenario: GoldenBeadScenario) => PresentationScript;
export declare const buildStampGamePresentationScript: (scenario: StampGameScenario) => PresentationScript;
export declare const buildGoldenBeadGuidedSteps: (scenario: GoldenBeadScenario) => (GuidedStep & {
    evaluatorId: GuidedEvaluatorId;
})[];
export declare const buildStampGameGuidedSteps: (scenario: StampGameScenario) => (GuidedStep & {
    evaluatorId: GuidedEvaluatorId;
})[];
export declare const buildGoldenBeadPractice: (scenario: GoldenBeadScenario) => PracticeQuestion[];
export declare const buildStampGamePractice: (scenario: StampGameScenario) => PracticeQuestion[];
export declare const goldenBeadPassCriteria: PracticePassCriteria;
export declare const stampGamePassCriteria: PracticePassCriteria;
//# sourceMappingURL=multiplication.d.ts.map