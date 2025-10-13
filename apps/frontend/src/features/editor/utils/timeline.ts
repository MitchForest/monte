import { buildGoldenBeadScene, GOLDEN_BEADS_MATERIAL_ID } from '@monte/lesson-service';
import type {
  LessonDocument,
  LessonMaterialInventory,
  LessonSegment,
  TimelineTransform,
} from '@monte/types';

import type { SceneNodeState } from '../types/timeline';

type RawSceneNode = {
  id: string;
  materialId: string;
  label?: string;
  transform?: TimelineTransform;
  metadata?: Record<string, unknown>;
};

interface MapInventoryNodesInput {
  document: LessonDocument;
  segment: LessonSegment | undefined;
}

const cloneTransform = (transform: TimelineTransform | undefined): TimelineTransform => ({
  position: {
    x: transform?.position.x ?? 0,
    y: transform?.position.y ?? 0,
  },
  rotation: transform?.rotation ?? 0,
  scale: {
    x: transform?.scale?.x ?? 1,
    y: transform?.scale?.y ?? 1,
  },
  opacity: transform?.opacity ?? 1,
});

const resolveSceneNodes = (
  inventory: LessonMaterialInventory | undefined,
  document: LessonDocument,
  segment: LessonSegment | undefined,
) : RawSceneNode[] => {
  if (inventory?.sceneNodes && inventory.sceneNodes.length > 0) {
    return inventory.sceneNodes as RawSceneNode[];
  }

  if (usesGoldenBeads(document, segment, inventory)) {
    return buildGoldenBeadScene();
  }

  return [];
};

const usesGoldenBeads = (
  document: LessonDocument,
  segment: LessonSegment | undefined,
  inventory: LessonMaterialInventory | undefined,
): boolean => {
  const materialIds = new Set<string>();

  const push = (id: string | undefined) => {
    if (id) {
      materialIds.add(id);
    }
  };

  push(document.lesson.primaryMaterialId);
  for (const material of document.lesson.materials ?? []) {
    push(material.materialId);
  }

  if (inventory) {
    for (const tokenType of inventory.tokenTypes) {
      push(tokenType.materialId);
    }
    for (const bank of inventory.banks) {
      push(bank.materialId);
    }
  }

  if (document.meta?.scenario?.kind === GOLDEN_BEADS_MATERIAL_ID) {
    return true;
  }

  for (const lessonSegment of document.lesson.segments) {
    for (const material of lessonSegment.materials ?? []) {
      push(material.materialId);
    }
    if (lessonSegment.scenario?.kind === GOLDEN_BEADS_MATERIAL_ID) {
      return true;
    }
    if (lessonSegment.type === 'presentation') {
      push(lessonSegment.primaryMaterialId);
    } else if ('workspace' in lessonSegment && lessonSegment.workspace === GOLDEN_BEADS_MATERIAL_ID) {
      return true;
    }
  }

  if (segment) {
    if (segment.scenario?.kind === GOLDEN_BEADS_MATERIAL_ID) {
      return true;
    }
    if ('workspace' in segment && segment.workspace === GOLDEN_BEADS_MATERIAL_ID) {
      return true;
    }
    for (const material of segment.materials ?? []) {
      push(material.materialId);
    }
    if (segment.type === 'presentation') {
      push(segment.primaryMaterialId);
    }
  }

  return materialIds.has(GOLDEN_BEADS_MATERIAL_ID);
};

export const mapInventoryNodes = ({ document, segment }: MapInventoryNodesInput): SceneNodeState[] => {
  const inventory = document.lesson.materialInventory;
  const nodes = resolveSceneNodes(inventory, document, segment);
  return nodes.map((node): SceneNodeState => ({
    id: node.id,
    materialId: node.materialId,
    label: node.label,
    transform: cloneTransform(node.transform),
    metadata: node.metadata,
  }));
};
