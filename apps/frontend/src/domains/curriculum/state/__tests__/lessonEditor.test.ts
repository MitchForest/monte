import { describe, expect, it } from 'vitest';

import type { LessonDocument, LessonMaterialInventory } from '@monte/types';

import { createLessonEditor } from '@monte/lesson-service';

const buildInventory = (): LessonMaterialInventory => ({
  version: 1,
  tokenTypes: [
    {
      id: 'token-unit',
      materialId: 'golden-beads',
      workspace: 'golden-beads',
      label: 'Unit bead',
      visual: { kind: 'bead', place: 'unit' },
      quantityPerToken: 1,
    },
  ],
  banks: [
    {
      id: 'bank-lesson',
      label: 'Lesson bank',
      scope: 'lesson',
      materialId: 'golden-beads',
      accepts: ['token-unit'],
      initialQuantity: { 'token-unit': 5 },
    },
  ],
});

const buildLessonDocument = (): LessonDocument =>
  ({
    lesson: {
      id: 'lesson-1',
      title: 'Test Lesson',
      summary: 'summary',
      subject: 'math',
      gradeLevel: '3',
      status: 'draft',
      durationMinutes: 10,
      materials: [],
      skills: [],
      focusSkills: [],
      segments: [],
      materialInventory: buildInventory(),
    },
    meta: {
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  } as unknown as LessonDocument);

describe('createLessonEditor inventory history', () => {
  it('applies inventory updates and records undo history', () => {
    const editor = createLessonEditor();
    const document = buildLessonDocument();

    editor.loadDocument(document);

    editor.applyInventoryUpdate((inventory) => ({
      ...inventory,
      banks: inventory.banks.map((bank) =>
        bank.id === 'bank-lesson'
          ? {
              ...bank,
              initialQuantity:
                typeof bank.initialQuantity === 'number'
                  ? { 'token-unit': bank.initialQuantity }
                  : { ...bank.initialQuantity, 'token-unit': 3 },
            }
          : bank,
      ),
    }));

    const updatedInventory = editor.state.document?.lesson.materialInventory;
    expect(updatedInventory?.banks[0]).toBeDefined();
    const bank = updatedInventory!.banks[0];
    const quantityAfterUpdate =
      typeof bank.initialQuantity === 'number'
        ? bank.initialQuantity
        : bank.initialQuantity['token-unit'];
    expect(quantityAfterUpdate).toBe(3);

    editor.undo();

    const revertedInventory = editor.state.document?.lesson.materialInventory;
    expect(revertedInventory?.banks[0]).toBeDefined();
    const revertedBank = revertedInventory!.banks[0];
    const quantityAfterUndo =
      typeof revertedBank.initialQuantity === 'number'
        ? revertedBank.initialQuantity
        : revertedBank.initialQuantity['token-unit'];
    expect(quantityAfterUndo).toBe(5);

    editor.redo();

    const redoInventory = editor.state.document?.lesson.materialInventory;
    expect(redoInventory?.banks[0]).toBeDefined();
    const redoBank = redoInventory!.banks[0];
    const quantityAfterRedo =
      typeof redoBank.initialQuantity === 'number'
        ? redoBank.initialQuantity
        : redoBank.initialQuantity['token-unit'];
    expect(quantityAfterRedo).toBe(3);
  });
});
