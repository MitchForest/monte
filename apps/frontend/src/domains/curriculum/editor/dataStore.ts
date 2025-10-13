import { createEffect, createResource, createSignal, type Accessor } from 'solid-js';

import type { Id, LessonDraftRecord } from '@monte/types';

import {
  fetchCurriculumTree,
  fetchLessonById,
  type CurriculumTree,
} from '../api/curriculumClient';

const cloneTree = <Value>(value: Value): Value =>
  JSON.parse(JSON.stringify(value)) as Value;

export interface EditorDataStore {
  curriculumTree: Accessor<CurriculumTree | undefined>;
  setCurriculumTree: (tree: CurriculumTree) => void;
  updateCurriculumTree: (mutator: (tree: CurriculumTree) => CurriculumTree) => void;
  refetchTree: () => Promise<CurriculumTree | undefined>;
  lessonRecord: Accessor<LessonDraftRecord | undefined>;
  refetchLessonRecord: () => Promise<LessonDraftRecord | undefined>;
  refreshLessonAndTree: () => Promise<void>;
  bindSelectedLessonId: (accessor: Accessor<Id<'lessons'> | undefined>) => void;
}

export const createEditorDataStore = (): EditorDataStore => {
  const [curriculumTree, { mutate: mutateCurriculumTree, refetch: refetchTree }] =
    createResource<CurriculumTree | undefined>(fetchCurriculumTree);

  const [selectedLessonId, setSelectedLessonId] = createSignal<Id<'lessons'> | undefined>();
  const [lessonRecord, { refetch: refetchLessonRecord }] = createResource<
    LessonDraftRecord | undefined,
    Id<'lessons'> | undefined
  >(selectedLessonId, async (lessonId) => {
    if (!lessonId) return undefined;
    const record = await fetchLessonById(lessonId);
    return record ?? undefined;
  });

  const setCurriculumTree = (tree: CurriculumTree) => {
    mutateCurriculumTree?.(tree);
  };

  const updateCurriculumTree = (mutator: (tree: CurriculumTree) => CurriculumTree) => {
    const current = curriculumTree();
    if (!current) return;
    const next = mutator(cloneTree(current));
    mutateCurriculumTree?.(next);
  };

  const refreshLessonAndTree = async () => {
    await Promise.all([refetchLessonRecord(), refetchTree()]);
  };

  const bindSelectedLessonId = (accessor: Accessor<Id<'lessons'> | undefined>) => {
    createEffect(() => {
      setSelectedLessonId(accessor());
    });
  };

  return {
    curriculumTree: () => curriculumTree() ?? undefined,
    setCurriculumTree,
    updateCurriculumTree,
    refetchTree: async () => (await refetchTree()) ?? undefined,
    lessonRecord: () => lessonRecord() ?? undefined,
    refetchLessonRecord: async () => (await refetchLessonRecord()) ?? undefined,
    refreshLessonAndTree,
    bindSelectedLessonId,
  };
};
