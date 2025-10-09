import type { GuidedEvaluatorId } from '../../curriculum/types';

export const actionTypeOptions = [
  { value: 'narrate', label: 'Narration' },
  { value: 'showCard', label: 'Show card' },
  { value: 'placeBeads', label: 'Place beads' },
  { value: 'duplicateTray', label: 'Duplicate tray' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'moveBeadsBelowLine', label: 'Move beads below line' },
  { value: 'groupForExchange', label: 'Group for exchange' },
  { value: 'exchangeBeads', label: 'Exchange beads' },
  { value: 'placeResultCard', label: 'Place result card' },
  { value: 'stackPlaceValues', label: 'Stack place values' },
  { value: 'writeResult', label: 'Write result' },
  { value: 'highlight', label: 'Highlight' },
  { value: 'showStamp', label: 'Show stamp' },
  { value: 'countTotal', label: 'Count total' },
] as const;

export type ActionTypeOption = (typeof actionTypeOptions)[number];
export type ActionTypeValue = ActionTypeOption['value'];

export const guidedEvaluatorOptions: GuidedEvaluatorId[] = [
  'golden-beads-build-base',
  'golden-beads-duplicate',
  'golden-beads-exchange-units',
  'golden-beads-exchange-tens',
  'golden-beads-exchange-hundreds',
  'golden-beads-stack-result',
  'stamp-game-build',
  'stamp-game-repeat-columns',
  'stamp-game-exchange',
  'stamp-game-read-result',
];

export const positionOptions = ['paper', 'multiplicand-stack', 'multiplier'] as const;
export const beadPlaceOptions = ['thousand', 'hundred', 'ten', 'unit'] as const;
export const exchangeFromOptions = ['unit', 'ten', 'hundred'] as const;
export const exchangeToOptions = ['ten', 'hundred', 'thousand'] as const;

export const representationOptions = [
  { value: 'concrete', label: 'Concrete' },
  { value: 'abstract', label: 'Abstract' },
] as const;

export const workspaceOptions = [
  { value: 'golden-beads', label: 'Golden beads' },
  { value: 'stamp-game', label: 'Stamp game' },
] as const;

export const difficultyOptions = ['easy', 'medium', 'hard'] as const;
export const scenarioKindOptions = ['golden-beads', 'stamp-game'] as const;
