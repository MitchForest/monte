import type {
  LessonDocument,
  LessonSegment,
  SegmentStep,
  SegmentTimeline,
  TimelineTrack,
  TimelineTransform,
} from '@monte/types';

const createEmptyTimeline = (): SegmentTimeline => ({
  version: 1,
  steps: [],
});

export const normalizeTimelineTransform = (transform?: TimelineTransform): TimelineTransform => ({
  position: {
    x: transform?.position?.x ?? 0,
    y: transform?.position?.y ?? 0,
  },
  rotation: transform?.rotation ?? 0,
  scale: {
    x: transform?.scale?.x ?? 1,
    y: transform?.scale?.y ?? 1,
  },
  opacity: transform?.opacity ?? 1,
});

const normalizeTimelineTrack = (track: TimelineTrack): TimelineTrack => ({
  nodeId: track.nodeId,
  keyframes: (track.keyframes ?? []).map((keyframe) => ({
    timeMs: keyframe.timeMs,
    transform: normalizeTimelineTransform(keyframe.transform),
    easing: keyframe.easing,
    metadata: keyframe.metadata,
  })),
  metadata: track.metadata,
});

export const normalizeTimelineStep = (step: SegmentStep): SegmentStep => ({
  ...step,
  keyframes: (step.keyframes ?? []).map((track) => normalizeTimelineTrack(track)),
  interactions: step.interactions ?? [],
});

const normalizeTimelineSteps = (timeline: SegmentTimeline | undefined): SegmentTimeline['steps'] =>
  (timeline?.steps ?? []).map((step) => normalizeTimelineStep(step));

export const normalizeTimeline = (timeline?: SegmentTimeline): SegmentTimeline => {
  const baseline = timeline ?? createEmptyTimeline();
  return {
    version: baseline.version ?? 1,
    label: baseline.label,
    metadata: baseline.metadata,
    steps: normalizeTimelineSteps(baseline),
  };
};

export const normalizeSegmentTimeline = <T extends LessonSegment>(segment: T): T => {
  return {
    ...segment,
    timeline: normalizeTimeline(segment.timeline),
  };
};

export const normalizeLessonDocumentTimelines = <T extends LessonDocument>(document: T): T => {
  document.lesson.segments = document.lesson.segments.map((segment) => normalizeSegmentTimeline(segment));
  return document;
};
