import type { Unit } from '../types';

export const curriculumUnits: Unit[] = [
  {
    id: 'unit-multiplication',
    name: 'Multiplication',
    summary: 'Multiply multi-digit numbers with Montessori golden beads and the stamp game.',
    coverImage: '/assets/units/numeracy-foundations.svg',
    topics: [
      {
        topicId: 'topic-multiplication',
        lessonIds: ['lesson-multiplication-golden-beads', 'lesson-multiplication-stamp-game'],
      },
    ],
  },
];
