import type { LessonDocument, LessonSegment, SegmentTimeline } from '@monte/types';

const createEmptyTimeline = (): SegmentTimeline => ({
  version: 1,
  steps: [],
});

const normalizeTimelineSteps = (timeline: SegmentTimeline | undefined): SegmentTimeline['steps'] =>
  (timeline?.steps ?? []).map((step) => ({
    ...step,
    keyframes: step.keyframes ?? [],
    interactions: step.interactions ?? [],
  }));

export const normalizeSegmentTimeline = <T extends LessonSegment>(segment: T): T => {
  const timeline = segment.timeline ?? createEmptyTimeline();
  return {
    ...segment,
    timeline: {
      version: timeline.version ?? 1,
      label: timeline.label,
      metadata: timeline.metadata,
      steps: normalizeTimelineSteps(timeline),
    },
  };
};

export const normalizeLessonDocumentTimelines = <T extends LessonDocument>(document: T): T => {
  document.lesson.segments = document.lesson.segments.map((segment) => normalizeSegmentTimeline(segment));
  return document;
};
