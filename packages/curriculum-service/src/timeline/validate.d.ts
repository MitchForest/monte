import type { LessonDocument } from '@monte/types';
export type TimelineValidationIssue = {
    lessonId: string;
    segmentId: string;
    type: 'missing_timeline' | 'empty_steps';
    message: string;
};
export declare const validateLessonTimelines: (document: LessonDocument) => TimelineValidationIssue[];
//# sourceMappingURL=validate.d.ts.map