import type { LessonDocument, LessonSegment, SegmentTimeline } from '@monte/types';

type TimelineStep = SegmentTimeline['steps'][number];

const createEmptyTimeline = (): SegmentTimeline => ({
  version: 1,
  steps: [],
});

export const normalizeSegmentTimeline = <T extends LessonSegment>(segment: T): T => {
  const timeline = segment.timeline ?? createEmptyTimeline();
  const steps = (timeline.steps ?? []).map((step): TimelineStep => ({
    ...step,
    keyframes: step.keyframes ?? [],
    interactions: step.interactions ?? [],
  }));

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

export const normalizeLessonDocumentTimelines = <T extends LessonDocument>(document: T): T => {
  document.lesson.segments = document.lesson.segments.map((segment: LessonSegment) =>
    normalizeSegmentTimeline(segment),
  );
  return document;
};
