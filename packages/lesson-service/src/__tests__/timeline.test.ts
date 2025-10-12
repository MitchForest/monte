import { describe, expect, it } from 'vitest';

import { normalizeLessonDocumentTimelines } from '../index.js';

const createSegment = (overrides: Partial<{
  id: string;
  type: 'presentation';
  title: string;
  materials: [];
  skills: [];
  timeline?: {
    version?: number;
    label?: string;
    metadata?: Record<string, unknown>;
    steps?: Array<Record<string, unknown>>;
  };
}> = {}) => ({
  id: 'segment-1',
  type: 'presentation' as const,
  title: 'Segment',
  materials: [],
  skills: [],
  timeline: undefined,
  ...overrides,
});

describe('normalizeLessonDocumentTimelines', () => {
  it('fills missing timelines with defaults', () => {
    const document = {
      version: '1.0' as const,
      lesson: {
        id: 'lesson-1',
        topicId: 'topic-1',
        title: 'Lesson',
        estimatedDurationMinutes: 10,
        primaryMaterialId: 'material-1',
        segments: [createSegment()],
        materials: [],
      },
    };

    const normalized = normalizeLessonDocumentTimelines(document);

    expect(normalized.lesson.segments[0].timeline).toEqual({
      version: 1,
      label: undefined,
      metadata: undefined,
      steps: [],
    });
  });

  it('preserves existing timelines while normalizing nested arrays', () => {
    const document = {
      version: '1.0' as const,
      lesson: {
        id: 'lesson-1',
        topicId: 'topic-1',
        title: 'Lesson',
        estimatedDurationMinutes: 10,
        primaryMaterialId: 'material-1',
        segments: [
          createSegment({
            timeline: {
              version: 2,
              label: 'Existing',
              metadata: { foo: 'bar' },
              steps: [
                {
                  id: 'step-1',
                  label: 'Step',
                },
              ],
            },
          }),
        ],
        materials: [],
      },
    };

    const normalized = normalizeLessonDocumentTimelines(document);

    expect(normalized.lesson.segments[0].timeline).toEqual({
      version: 2,
      label: 'Existing',
      metadata: { foo: 'bar' },
      steps: [
        {
          id: 'step-1',
          label: 'Step',
          keyframes: [],
          interactions: [],
        },
      ],
    });
  });
});
