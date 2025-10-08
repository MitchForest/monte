import type { Lesson, LessonTask } from '../types';

export const buildLessonTasks = (lesson: Lesson): LessonTask[] => {
  const tasks: LessonTask[] = [];
  let order = 0;

  for (const segment of lesson.segments) {
    if (segment.type === 'presentation') {
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

      if (segment.steps.length === 0) {
        tasks.push({
          id: `${segment.id}-guided`,
          title: segment.title,
          description: segment.description,
          category: 'guided-practice',
          segmentId: segment.id,
          order: baseOrder,
        });
        order += 1;
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
      if (segment.questions.length === 0) {
        tasks.push({
          id: `${segment.id}-practice`,
          title: segment.title,
          description: segment.description,
          category: 'practice-question',
          segmentId: segment.id,
          order: order++,
        });
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
