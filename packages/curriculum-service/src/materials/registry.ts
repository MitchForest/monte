import type { LessonMaterialInventory } from '@monte/types';

import { GOLDEN_BEADS_MATERIAL_ID, buildGoldenBeadScene } from './goldenBeads.js';

export type ManipulativeSceneNode = NonNullable<LessonMaterialInventory['sceneNodes']>[number];

export interface ManipulativeDefinition {
  id: string;
  buildScene: () => ManipulativeSceneNode[];
}

const registry = new Map<string, ManipulativeDefinition>();
registry.set(GOLDEN_BEADS_MATERIAL_ID, {
  id: GOLDEN_BEADS_MATERIAL_ID,
  buildScene: buildGoldenBeadScene,
});

export const getManipulativeDefinition = (id: string) => registry.get(id);
export const listManipulativeDefinitions = () => Array.from(registry.values());

// Backwards-compatible aliases while downstream code migrates to the new API.
export const getManipulativeManifest = getManipulativeDefinition;
export const listManipulativeManifests = listManipulativeDefinitions;
