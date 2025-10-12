export {
  normalizeLessonDocumentTimelines,
  normalizeSegmentTimeline,
  normalizeLessonDocumentTimelines as ensureLessonDocumentTimelines,
  normalizeSegmentTimeline as ensureSegmentTimeline,
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
