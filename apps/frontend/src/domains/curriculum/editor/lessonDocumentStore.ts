import { createEffect, createMemo, createSignal } from 'solid-js';
import type { Accessor } from 'solid-js';

import type {
  LessonDocument,
  LessonMaterialInventory,
  LessonSegment,
} from '@monte/types';

import {
  createLessonEditor,
  createEmptyInventory,
  type LessonEditor,
} from '@monte/lesson-service';

import { createInventoryStore } from './inventoryStore';

interface LessonDocumentStoreOptions {
  defaultMaterialId: string;
}

export interface LessonDocumentStore {
  editor: LessonEditor;
  lessonDocument: Accessor<LessonDocument | undefined>;
  materialInventory: Accessor<LessonMaterialInventory>;
  selectedSegmentId: Accessor<string | undefined>;
  setSelectedSegmentId: (segmentId: string | undefined) => void;
  selectedSegment: Accessor<LessonSegment | undefined>;
  inventory: ReturnType<typeof createInventoryStore>;
}

export const createLessonDocumentStore = ({
  defaultMaterialId,
}: LessonDocumentStoreOptions): LessonDocumentStore => {
  const editor = createLessonEditor();
  const fallbackInventory = createEmptyInventory();

  const lessonDocument = createMemo<LessonDocument | undefined>(() => editor.state.document);

  const materialInventory = createMemo<LessonMaterialInventory>(() => {
    const inventory = lessonDocument()?.lesson.materialInventory;
    return inventory ?? fallbackInventory;
  });

  const [selectedSegmentId, setSelectedSegmentId] = createSignal<string | undefined>(undefined);

  const selectedSegment = createMemo<LessonSegment | undefined>(() => {
    const segmentId = selectedSegmentId();
    if (!segmentId) return undefined;
    const segments = lessonDocument()?.lesson.segments ?? [];
    return segments.find((segment) => segment.id === segmentId);
  });

  createEffect(() => {
    const segments = lessonDocument()?.lesson.segments ?? [];
    if (segments.length === 0) {
      if (selectedSegmentId() !== undefined) {
        setSelectedSegmentId(undefined);
      }
      return;
    }
    const current = selectedSegmentId();
    if (!current || !segments.some((segment) => segment.id === current)) {
      setSelectedSegmentId(segments[0].id);
    }
  });

  const inventory = createInventoryStore({
    editor,
    lessonDocument,
    defaultMaterialId,
  });

  return {
    editor,
    lessonDocument,
    materialInventory,
    selectedSegmentId,
    setSelectedSegmentId,
    selectedSegment,
    inventory,
  } satisfies LessonDocumentStore;
};
