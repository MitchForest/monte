import { describe, expect, it } from 'vitest';

import type { LessonMaterialInventory } from '@monte/types';
import {
  buildRuntimeState,
  detectInventoryConsistencyIssues,
  type InventoryDelta,
} from '../consistency';

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
      initialQuantity: { 'token-unit': 4 },
    },
  ],
});

const bankId = 'bank-lesson';
const tokenId = 'token-unit';

describe('detectInventoryConsistencyIssues', () => {
  it('returns no issues when runtime matches net deltas', () => {
    const inventory = buildInventory();
    const runtime = buildRuntimeState(inventory);
    const bankRuntime = runtime.banks[bankId];
    bankRuntime.available[tokenId] = 4;

    const deltas: InventoryDelta[] = [
      { bankId, tokenTypeId: tokenId, delta: -1, reason: 'consume' },
      { bankId, tokenTypeId: tokenId, delta: 1, reason: 'replenish' },
    ];

    const issues = detectInventoryConsistencyIssues(inventory, runtime, deltas);
    expect(issues).toHaveLength(0);
  });

  it('returns issues when runtime diverges from net deltas', () => {
    const inventory = buildInventory();
    const runtime = buildRuntimeState(inventory);
    const bankRuntime = runtime.banks[bankId];
    bankRuntime.available[tokenId] = 4;

    const deltas: InventoryDelta[] = [{ bankId, tokenTypeId: tokenId, delta: -1, reason: 'consume' }];

    const issues = detectInventoryConsistencyIssues(inventory, runtime, deltas);
    expect(issues).toEqual([
      {
        bankId,
        tokenTypeId: tokenId,
        expected: 3,
        actual: 4,
      },
    ]);
  });
});
