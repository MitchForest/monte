import type { LessonDocument } from '@monte/types';

export type TimelineValidationIssue = {
  lessonId: string;
  segmentId: string;
  type: 'missing_timeline' | 'empty_steps';
  message: string;
};

export const validateLessonTimelines = (document: LessonDocument): TimelineValidationIssue[] => {
  const issues: TimelineValidationIssue[] = [];

  for (const segment of document.lesson.segments) {
    if (!segment.timeline) {
      issues.push({
        lessonId: document.lesson.id,
        segmentId: segment.id,
        type: 'missing_timeline',
        message: `Segment ${segment.id} is missing a timeline`,
      });
      continue;
    }
    const steps = segment.timeline.steps ?? [];
    if (steps.length === 0) {
      issues.push({
        lessonId: document.lesson.id,
        segmentId: segment.id,
        type: 'empty_steps',
        message: `Segment ${segment.id} has no timeline steps`,
      });
    }
  }

  return issues;
};
