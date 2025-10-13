export {
  normalizeLessonDocumentTimelines,
  normalizeSegmentTimeline,
  normalizeTimeline,
  normalizeTimelineStep,
  normalizeTimelineTransform,
  normalizeLessonDocumentTimelines as ensureLessonDocumentTimelines,
  normalizeSegmentTimeline as ensureSegmentTimeline,
  normalizeTimeline as ensureTimeline,
  normalizeTimelineStep as ensureTimelineStep,
  normalizeTimelineTransform as ensureTimelineTransform,
} from './timeline.js';
export {
  createLessonPlayerMachine,
  type PlayerEvent,
  type PlayerStatus,
} from './player.js';
export {
  createSegment,
  createPresentationAction,
  defaultGuidedStep,
  defaultPassCriteria,
  defaultPracticeQuestion,
  ensurePresentationScript,
  sanitizeScenario,
  generateId,
} from './factories.js';
