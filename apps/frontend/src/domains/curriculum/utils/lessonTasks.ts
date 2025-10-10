import type { Lesson, LessonTask } from '@monte/types';

export const buildLessonTasks = (lesson: Lesson): LessonTask[] => {
  const tasks: LessonTask[] = [];
  let order = 0;

  for (const segment of lesson.segments) {
    if (segment.type === 'presentation') {
      if (!segment.script || segment.script.actions.length === 0) {
        console.warn(
          `[lessonTasks] Skipping presentation segment "${segment.title}" for lesson "${lesson.id}" – no script actions.`,
        );
        continue;
      }
      tasks.push({
        id: segment.id,
        title: segment.title,
        description: segment.description,
        category: 'tutorial',
        segmentId: segment.id,
        order: order++,
      });
      continue;
    }

    if (segment.type === 'guided') {
      const baseOrder = order;

      if (!segment.steps || segment.steps.length === 0) {
        console.warn(
          `[lessonTasks] Skipping guided segment "${segment.title}" for lesson "${lesson.id}" – no steps authored.`,
        );
        continue;
      }

      segment.steps.forEach((step, index) => {
        tasks.push({
          id: `${segment.id}-${step.id}`,
          title: step.prompt,
          description: step.expectation,
          category: 'guided-practice',
          segmentId: segment.id,
          stepId: step.id,
          order: baseOrder + index,
        });
      });

      order = baseOrder + segment.steps.length;
      continue;
    }

    if (segment.type === 'practice') {
      if (!segment.questions || segment.questions.length === 0) {
        console.warn(
          `[lessonTasks] Skipping practice segment "${segment.title}" for lesson "${lesson.id}" – no questions authored.`,
        );
        continue;
      }
      if (!segment.passCriteria) {
        console.warn(
          `[lessonTasks] Practice segment "${segment.title}" for lesson "${lesson.id}" missing pass criteria; skipping.`,
        );
        continue;
      }

      segment.questions.forEach((question) => {
        tasks.push({
          id: `${segment.id}-${question.id}`,
          title: question.prompt,
          description: `Solve ${question.multiplicand} × ${question.multiplier}.`,
          category: 'practice-question',
          segmentId: segment.id,
          questionId: question.id,
          order: order++,
        });
      });
    }
  }

  return tasks;
};
