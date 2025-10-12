import type { LessonMaterialInventory } from '@monte/types';
export type ManipulativeSceneNode = NonNullable<LessonMaterialInventory['sceneNodes']>[number];
export interface ManipulativeDefinition {
    id: string;
    buildScene: () => ManipulativeSceneNode[];
}
export declare const getManipulativeDefinition: (id: string) => ManipulativeDefinition | undefined;
export declare const listManipulativeDefinitions: () => ManipulativeDefinition[];
export declare const getManipulativeManifest: (id: string) => ManipulativeDefinition | undefined;
export declare const listManipulativeManifests: () => ManipulativeDefinition[];
//# sourceMappingURL=registry.d.ts.map