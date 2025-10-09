import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildGoldenBeadGuidedSteps,
  buildGoldenBeadPractice,
  buildGoldenBeadPresentationScript,
  buildStampGameGuidedSteps,
  buildStampGamePractice,
  buildStampGamePresentationScript,
  generateGoldenBeadScenario,
  generateStampGameScenario,
  goldenBeadPassCriteria,
  stampGamePassCriteria,
} from '../scenarios/multiplication';
import type { LessonDocument } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = join(__dirname, '../data/lessons');

const nowIso = new Date().toISOString();

const goldenScenario = generateGoldenBeadScenario(240317);
const stampScenario = generateStampGameScenario(532101);

const goldenBeadLessonDocument: LessonDocument = {
  version: '1.0',
  lesson: {
    id: 'lesson-multiplication-golden-beads',
    topicId: 'topic-multiplication',
    title: 'Golden Bead Multiplication',
    summary: 'Model four-digit multiplication by a single digit using the golden bead material.',
    focusSkills: ['skill.multiply-4-digit-by-1-digit'],
    estimatedDurationMinutes: 22,
    primaryMaterialId: 'golden-beads',
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
          { materialId: 'golden-bead-cards', purpose: 'Display multiplicand and multiplier' },
          { materialId: 'multiplication-ribbon', purpose: 'Indicate multiplication layout' },
        ],
        skills: ['skill.multiply-4-digit-by-1-digit'],
        scriptId: 'presentation.multiplication.goldenBeads',
        script: buildGoldenBeadPresentationScript(goldenScenario),
        scenario: { kind: 'golden-beads', seed: goldenScenario.seed },
      },
      {
        id: 'guided-golden-beads',
        title: 'Guided Golden Bead Build',
        type: 'guided',
        representation: 'concrete',
        materials: [{ materialId: 'golden-beads', purpose: 'Manipulate quantities while following prompts' }],
        skills: ['skill.multiply-4-digit-by-1-digit'],
        workspace: 'golden-beads',
        steps: buildGoldenBeadGuidedSteps(goldenScenario),
        scenario: { kind: 'golden-beads', seed: goldenScenario.seed },
      },
      {
        id: 'practice-golden-beads',
        title: 'Golden Bead Practice',
        type: 'practice',
        representation: 'concrete',
        materials: [{ materialId: 'golden-beads', purpose: 'Model independent multiplication problems' }],
        skills: ['skill.multiply-4-digit-by-1-digit'],
        workspace: 'golden-beads',
        questions: buildGoldenBeadPractice(goldenScenario),
        passCriteria: goldenBeadPassCriteria,
        scenario: { kind: 'golden-beads', seed: goldenScenario.seed },
      },
    ],
  },
  meta: {
    createdAt: nowIso,
    updatedAt: nowIso,
    scenario: { kind: 'golden-beads', seed: goldenScenario.seed },
    metadata: {
      source: 'exportLessonDocuments.ts',
    },
  },
};

const stampGameLessonDocument: LessonDocument = {
  version: '1.0',
  lesson: {
    id: 'lesson-multiplication-stamp-game',
    topicId: 'topic-multiplication',
    title: 'Stamp Game Multiplication',
    summary: 'Transfer multiplication strategies to the stamp game with repeated addition and exchanges.',
    focusSkills: ['skill.multiply-3-digit-by-1-digit'],
    estimatedDurationMinutes: 18,
    primaryMaterialId: 'stamp-game',
    materials: [{ materialId: 'stamp-game', purpose: 'Concrete multiplication with tiles' }],
    segments: [
      {
        id: 'presentation-stamp-game',
        title: 'Stamp Game Demonstration',
        type: 'presentation',
        representation: 'concrete',
        primaryMaterialId: 'stamp-game',
        materials: [{ materialId: 'stamp-game', purpose: 'Show multiplicand and multiplier layouts' }],
        skills: ['skill.multiply-3-digit-by-1-digit'],
        scriptId: 'presentation.multiplication.stampGame',
        script: buildStampGamePresentationScript(stampScenario),
        scenario: { kind: 'stamp-game', seed: stampScenario.seed },
      },
      {
        id: 'guided-stamp-game',
        title: 'Guided Stamp Game Build',
        type: 'guided',
        representation: 'concrete',
        materials: [{ materialId: 'stamp-game', purpose: 'Move tiles according to prompts' }],
        skills: ['skill.multiply-3-digit-by-1-digit'],
        workspace: 'stamp-game',
        steps: buildStampGameGuidedSteps(stampScenario),
        scenario: { kind: 'stamp-game', seed: stampScenario.seed },
      },
      {
        id: 'practice-stamp-game',
        title: 'Stamp Game Practice',
        type: 'practice',
        representation: 'concrete',
        materials: [{ materialId: 'stamp-game', purpose: 'Independent multiplication with tiles' }],
        skills: ['skill.multiply-3-digit-by-1-digit'],
        workspace: 'stamp-game',
        questions: buildStampGamePractice(stampScenario),
        passCriteria: stampGamePassCriteria,
        scenario: { kind: 'stamp-game', seed: stampScenario.seed },
      },
    ],
  },
  meta: {
    createdAt: nowIso,
    updatedAt: nowIso,
    scenario: { kind: 'stamp-game', seed: stampScenario.seed },
    metadata: {
      source: 'exportLessonDocuments.ts',
    },
  },
};

const documents = [goldenBeadLessonDocument, stampGameLessonDocument];

mkdirSync(outputDir, { recursive: true });

for (const document of documents) {
  const filename = join(outputDir, `${document.lesson.id}.json`);
  writeFileSync(filename, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
}
