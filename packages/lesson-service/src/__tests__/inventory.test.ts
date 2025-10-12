import { describe, expect, it } from 'vitest';

import {
  assertInventoryConsistency,
  buildRuntimeState,
  detectInventoryConsistencyIssues,
  deriveAcceptedTokenIds,
  type InventoryDelta,
} from '../index.js';

const sampleInventory = {
  version: 1 as const,
  tokenTypes: [
    {
      id: 'token-a',
      materialId: 'material-1',
      workspace: 'golden-beads' as const,
      label: 'Token A',
      visual: { kind: 'bead', place: 'unit' as const },
    },
  ],
  banks: [
    {
      id: 'bank-1',
      label: 'Bank',
      scope: 'lesson' as const,
      materialId: 'material-1',
      accepts: [],
      initialQuantity: 5,
    },
  ],
};

describe('inventory helpers', () => {
  it('derives accepted tokens when accepts list is empty', () => {
    expect(deriveAcceptedTokenIds(sampleInventory.banks[0], sampleInventory)).toEqual(['token-a']);
  });

  it('builds runtime state with expected quantities', () => {
    const runtime = buildRuntimeState(sampleInventory);
    expect(runtime.banks['bank-1']).toEqual({
      available: { 'token-a': 5 },
      initial: { 'token-a': 5 },
    });
  });

  it('detects inventory inconsistencies from deltas', () => {
    const runtime = buildRuntimeState(sampleInventory);

    const deltas: InventoryDelta[] = [
      { tokenTypeId: 'token-a', delta: -2, reason: 'consume', bankId: 'bank-1' },
    ];

    runtime.banks['bank-1'].available['token-a'] = 10;

    const issues = detectInventoryConsistencyIssues(sampleInventory, runtime, deltas);
    expect(issues).toEqual([
      {
        bankId: 'bank-1',
        tokenTypeId: 'token-a',
        expected: 3,
        actual: 10,
      },
    ]);
  });

  it('asserts inventory consistency', () => {
    expect(() =>
      assertInventoryConsistency({
        version: '1.0',
        lesson: {
          id: 'lesson-1',
          topicId: 'topic-1',
          title: 'Lesson',
          estimatedDurationMinutes: 10,
          primaryMaterialId: 'material-1',
          segments: [
            {
              id: 'segment-1',
              type: 'presentation',
              title: 'Segment',
              materials: [],
              skills: [],
              timeline: {
                version: 1,
                steps: [],
              },
              materialBankId: 'bank-1',
            },
          ],
          materials: [],
          materialInventory: sampleInventory,
        },
      }),
    ).not.toThrow();

    expect(() =>
      assertInventoryConsistency({
        version: '1.0',
        lesson: {
          id: 'lesson-1',
          topicId: 'topic-1',
          title: 'Lesson',
          estimatedDurationMinutes: 10,
          primaryMaterialId: 'material-1',
          segments: [
            {
              id: 'segment-1',
              type: 'presentation',
              title: 'Segment',
              materials: [],
              skills: [],
              timeline: {
                version: 1,
                steps: [],
              },
              materialBankId: 'missing-bank',
            },
          ],
          materials: [],
          materialInventory: sampleInventory,
        },
      }),
    ).toThrow(/missing bank/);
  });
});
