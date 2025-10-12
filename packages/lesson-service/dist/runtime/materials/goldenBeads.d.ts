import type { LessonMaterialInventory } from '@monte/types';
export declare const GOLDEN_BEADS_MATERIAL_ID = "golden-beads";
type SceneNode = NonNullable<LessonMaterialInventory['sceneNodes']>[number];
export declare const buildGoldenBeadScene: () => SceneNode[];
export type GoldenBeadSceneNode = ReturnType<typeof buildGoldenBeadScene>[number];
export {};
//# sourceMappingURL=goldenBeads.d.ts.map