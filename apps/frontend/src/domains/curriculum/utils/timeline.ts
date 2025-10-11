import type {
  LessonDocument,
  LessonSegment,
  SegmentStep,
  SegmentTimeline,
} from '@monte/types';

const createEmptyTimeline = (): SegmentTimeline => ({
  version: 1,
  steps: [],
});

const normalizeStep = (step: SegmentStep): SegmentStep => ({
  ...step,
  keyframes: step.keyframes ?? [],
  interactions: step.interactions ?? [],
});

export const ensureSegmentTimeline = <T extends LessonSegment>(segment: T): T => {
  const timeline = segment.timeline ?? createEmptyTimeline();
  const steps = (timeline.steps ?? []).map(normalizeStep);

  return {
    ...segment,
    timeline: {
      version: timeline.version ?? 1,
      label: timeline.label,
      metadata: timeline.metadata,
      steps,
    },
  };
};

export const ensureLessonDocumentTimelines = <T extends LessonDocument>(document: T): T => {
  document.lesson.segments = document.lesson.segments.map((segment) =>
    ensureSegmentTimeline(segment),
  );
  return document;
};
