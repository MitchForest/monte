import type { Material } from './types';

export const curriculumMaterials: Material[] = [
  {
    id: 'golden-beads',
    name: 'Golden Beads',
    description:
      'Thousand cubes, hundred squares, ten bars, and unit beads used to compose large numbers concretely.',
    tags: ['place value', 'multiplication'],
    primaryUse: 'multiplication',
    interaction: 'manipulate',
  },
  {
    id: 'golden-bead-cards',
    name: 'Golden Bead Number Cards',
    description: 'Stackable place value cards representing thousands, hundreds, tens, and units.',
    tags: ['notation', 'multiplication'],
    primaryUse: 'multiplication',
    interaction: 'static',
  },
  {
    id: 'multiplication-ribbon',
    name: 'Multiplication Ribbon',
    description: 'Yellow ribbon placed under layouts to signal repeated groups in multiplication.',
    tags: ['organization'],
    primaryUse: 'multiplication',
    interaction: 'static',
  },
  {
    id: 'stamp-game',
    name: 'Stamp Game',
    description: 'Colored tiles valued at 1, 10, 100 for repeated addition and multiplication.',
    tags: ['place value', 'multiplication'],
    primaryUse: 'multiplication',
    interaction: 'manipulate',
  },
];
