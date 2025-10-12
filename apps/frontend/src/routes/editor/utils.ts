import type { LessonDocument } from '@monte/types';

export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const moveItem = <T,>(items: readonly T[], from: number, to: number): T[] => {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const validateLessonDocument = (document: LessonDocument): string[] => {
  const errors: string[] = [];
  const lesson = document.lesson;

  if (!lesson.title.trim()) {
    errors.push('Lesson title is required');
  }

  if (!lesson.segments.length) {
    errors.push('Add at least one segment');
  }

  lesson.segments.forEach((segment, index) => {
    if (!segment.title.trim()) {
      errors.push(`Segment ${index + 1} is missing a title`);
    }
    if (!segment.materials || segment.materials.length === 0) {
      errors.push(`Segment ${index + 1} needs at least one material`);
    }
    if (!segment.skills || segment.skills.length === 0) {
      errors.push(`Segment ${index + 1} should reference at least one skill`);
    }

    if (segment.type === 'presentation') {
      if (!segment.script || segment.script.actions.length === 0) {
        errors.push(`Presentation segment "${segment.title}" needs at least one script action`);
      }
    }

    if (segment.type === 'guided') {
      if (!segment.steps.length) {
        errors.push(`Guided segment "${segment.title}" requires at least one step`);
      }
    }

    if (segment.type === 'practice') {
      if (!segment.questions.length) {
        errors.push(`Practice segment "${segment.title}" needs at least one question`);
      }
      if (!segment.passCriteria) {
        errors.push(`Practice segment "${segment.title}" is missing pass criteria`);
      }
    }
  });

  return errors;
};

export {
  createPresentationAction,
  createSegment,
  defaultGuidedStep,
  defaultPassCriteria,
  defaultPracticeQuestion,
  ensurePresentationScript,
  sanitizeScenario,
  generateId,
} from '@monte/lesson-service';
