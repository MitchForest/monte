import type { LessonMaterialInventory } from '@monte/types';

export const GOLDEN_BEADS_MATERIAL_ID = 'golden-beads';

type SceneNode = NonNullable<LessonMaterialInventory['sceneNodes']>[number];

type SceneNodeTemplate = Omit<SceneNode, 'transform'> & {
  transform: NonNullable<SceneNode['transform']>;
};

const template: SceneNodeTemplate[] = [
  {
    id: 'tray-base',
    materialId: 'golden-beads-tray',
    label: 'Tray',
    transform: {
      position: { x: 0, y: 0 },
      scale: { x: 3.6, y: 3.6 },
    },
  },
  {
    id: 'thousands-bank',
    materialId: 'golden-beads-thousand',
    label: '1000',
    transform: {
      position: { x: -180, y: -60 },
      scale: { x: 3.2, y: 3.2 },
    },
  },
  {
    id: 'hundreds-bank',
    materialId: 'golden-beads-hundred',
    label: '100',
    transform: {
      position: { x: -90, y: -60 },
      scale: { x: 3.2, y: 3.2 },
    },
  },
  {
    id: 'tens-bank',
    materialId: 'golden-beads-ten',
    label: '10',
    transform: {
      position: { x: 0, y: -50 },
      scale: { x: 3.4, y: 3.4 },
    },
  },
  {
    id: 'units-bank',
    materialId: 'golden-beads-unit',
    label: '1',
    transform: {
      position: { x: 110, y: -45 },
      scale: { x: 3.8, y: 3.8 },
    },
  },
  {
    id: 'ribbon',
    materialId: 'golden-beads-ribbon',
    label: 'Ribbon',
    transform: {
      position: { x: -20, y: 100 },
      scale: { x: 1.4, y: 1.4 },
    },
  },
];

const cloneTransform = (transform: SceneNodeTemplate['transform']): SceneNodeTemplate['transform'] => ({
  position: { ...transform.position },
  rotation: transform.rotation,
  scale: transform.scale ? { ...transform.scale } : undefined,
  opacity: transform.opacity,
});

const cloneNode = (node: SceneNodeTemplate): SceneNode => ({
  ...node,
  transform: cloneTransform(node.transform),
  metadata: node.metadata ? { ...node.metadata } : undefined,
});

export const buildGoldenBeadScene = (): SceneNode[] => template.map(cloneNode);

export type GoldenBeadSceneNode = ReturnType<typeof buildGoldenBeadScene>[number];
