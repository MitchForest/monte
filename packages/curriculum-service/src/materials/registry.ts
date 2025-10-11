import type { GoldenBeadManifest } from './goldenBeads.js';
import { goldenBeadManifest } from './goldenBeads.js';

export type ManipulativeManifest = GoldenBeadManifest;

const registry = new Map<string, ManipulativeManifest>();
registry.set(goldenBeadManifest.id, goldenBeadManifest);

export const getManipulativeManifest = (id: string) => registry.get(id);
export const listManipulativeManifests = () => Array.from(registry.values());
