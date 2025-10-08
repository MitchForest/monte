import type { Topic } from '../types';

export const multiplicationTopic: Topic = {
  id: 'topic-multiplication',
  title: 'Multiplication',
  overview:
    'Learners build multiplication fluency with Montessori golden beads and stamp game materials, moving from guided demonstrations to independent practice.',
  focusSkills: ['skill.multiply-3-digit-by-1-digit', 'skill.multiply-4-digit-by-1-digit'],
  estimatedDurationMinutes: 40,
  lessons: [
    {
      id: 'lesson-multiplication-golden-beads',
      topicId: 'topic-multiplication',
      title: 'Golden Bead Multiplication',
      summary: 'Model four-digit multiplication by a single digit using the golden bead material.',
      primaryMaterialId: 'golden-beads',
      focusSkills: ['skill.multiply-4-digit-by-1-digit'],
      estimatedDurationMinutes: 22,
      materials: [
        { materialId: 'golden-beads', purpose: 'Concrete representation of place value products' },
        { materialId: 'golden-bead-cards', purpose: 'Record multiplicand and multiplier' },
        { materialId: 'multiplication-ribbon', purpose: 'Mark the repeated groups' },
      ],
      segments: [
        {
          id: 'presentation-golden-beads',
          title: 'Golden Bead Demonstration',
          type: 'presentation',
          representation: 'concrete',
          primaryMaterialId: 'golden-beads',
          materials: [
            { materialId: 'golden-beads', purpose: 'Show place value quantities' },
            { materialId: 'golden-bead-cards', purpose: 'Display 2344 × 3' },
            { materialId: 'multiplication-ribbon', purpose: 'Indicate multiplication layout' },
          ],
          skills: ['skill.multiply-4-digit-by-1-digit'],
          scriptId: 'presentation.multiplication.goldenBeads',
        },
        {
          id: 'guided-golden-beads',
          title: 'Guided Golden Bead Build',
          type: 'guided',
          representation: 'concrete',
          materials: [
            { materialId: 'golden-beads', purpose: 'Manipulate quantities while following prompts' },
          ],
          skills: ['skill.multiply-4-digit-by-1-digit'],
          workspace: 'golden-beads',
          steps: [],
        },
        {
          id: 'practice-golden-beads',
          title: 'Golden Bead Practice',
          type: 'practice',
          representation: 'concrete',
          materials: [
            { materialId: 'golden-beads', purpose: 'Model independent multiplication problems' },
          ],
          skills: ['skill.multiply-4-digit-by-1-digit'],
          workspace: 'golden-beads',
          questions: [],
          passCriteria: {
            type: 'threshold',
            firstCorrect: 2,
            totalCorrect: 3,
            maxMisses: 3,
          },
        },
      ],
    },
    {
      id: 'lesson-multiplication-stamp-game',
      topicId: 'topic-multiplication',
      title: 'Stamp Game Multiplication',
      summary: 'Transfer multiplication strategies to the stamp game with repeated addition and exchanges.',
      primaryMaterialId: 'stamp-game',
      focusSkills: ['skill.multiply-3-digit-by-1-digit'],
      estimatedDurationMinutes: 18,
      materials: [
        { materialId: 'stamp-game', purpose: 'Concrete multiplication with tiles' },
      ],
      segments: [
        {
          id: 'presentation-stamp-game',
          title: 'Stamp Game Demonstration',
          type: 'presentation',
          representation: 'concrete',
          primaryMaterialId: 'stamp-game',
          materials: [
            { materialId: 'stamp-game', purpose: 'Show 321 × 3 and 543 × 4' },
          ],
          skills: ['skill.multiply-3-digit-by-1-digit'],
          scriptId: 'presentation.multiplication.stampGame',
        },
        {
          id: 'guided-stamp-game',
          title: 'Guided Stamp Game Build',
          type: 'guided',
          representation: 'concrete',
          materials: [{ materialId: 'stamp-game', purpose: 'Move tiles according to prompts' }],
          skills: ['skill.multiply-3-digit-by-1-digit'],
          workspace: 'stamp-game',
          steps: [],
        },
        {
          id: 'practice-stamp-game',
          title: 'Stamp Game Practice',
          type: 'practice',
          representation: 'concrete',
          materials: [{ materialId: 'stamp-game', purpose: 'Independent multiplication with tiles' }],
          skills: ['skill.multiply-3-digit-by-1-digit'],
          workspace: 'stamp-game',
          questions: [],
          passCriteria: {
            type: 'threshold',
            firstCorrect: 2,
            totalCorrect: 3,
            maxMisses: 3,
          },
        },
      ],
    },
  ],
};
