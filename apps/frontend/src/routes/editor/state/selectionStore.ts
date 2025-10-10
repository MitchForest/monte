import { createEffect, createMemo, createSignal, type Accessor, type Setter } from 'solid-js';

import type { Id } from '@monte/types';
import type { CurriculumTree } from '../../../domains/curriculum/api/curriculumClient';
import type { LessonEditor } from '../../../domains/curriculum/state/lessonEditor';

type UnitNode = CurriculumTree[number];
type TopicNode = UnitNode['topics'][number];
type LessonNode = TopicNode['lessons'][number];

export interface SelectionStore {
  selectedUnitId: Accessor<Id<'units'> | undefined>;
  setSelectedUnitId: Setter<Id<'units'> | undefined>;
  selectedTopicId: Accessor<Id<'topics'> | undefined>;
  setSelectedTopicId: Setter<Id<'topics'> | undefined>;
  selectedLessonId: Accessor<Id<'lessons'> | undefined>;
  setSelectedLessonId: Setter<Id<'lessons'> | undefined>;
  selectedSegmentId: Accessor<string | undefined>;
  selectSegment: (segmentId: string | undefined) => void;
  units: Accessor<UnitNode[]>;
  currentUnit: Accessor<UnitNode | undefined>;
  topics: Accessor<TopicNode[]>;
  currentTopic: Accessor<TopicNode | undefined>;
  lessons: Accessor<LessonNode[]>;
}

interface CreateSelectionStoreOptions {
  curriculumTree: Accessor<CurriculumTree | undefined>;
  editor: LessonEditor;
  onResetTopicCreation: () => void;
  onResetLessonCreation: () => void;
}

export const createSelectionStore = ({
  curriculumTree,
  editor,
  onResetTopicCreation,
  onResetLessonCreation,
}: CreateSelectionStoreOptions): SelectionStore => {
  const [selectedUnitId, setSelectedUnitId] = createSignal<Id<'units'> | undefined>();
  const [selectedTopicId, setSelectedTopicId] = createSignal<Id<'topics'> | undefined>();
  const [selectedLessonId, setSelectedLessonId] = createSignal<Id<'lessons'> | undefined>();
  const [selectedSegmentIdValue, setSelectedSegmentIdValue] = createSignal<string | undefined>(undefined);

  const units = createMemo<UnitNode[]>(() => curriculumTree() ?? []);
  const currentUnit = createMemo<UnitNode | undefined>(() => units().find((unit) => unit._id === selectedUnitId()));

  createEffect(() => {
    const tree = curriculumTree();
    if (!tree || tree.length === 0) return;
    if (!selectedUnitId() || !tree.some((unit) => unit._id === selectedUnitId())) {
      setSelectedUnitId(tree[0]._id);
    }
  });

  createEffect(() => {
    const unit = currentUnit();
    if (!unit) {
      setSelectedTopicId(undefined);
      setSelectedLessonId(undefined);
      onResetTopicCreation();
      onResetLessonCreation();
      return;
    }
    if (!selectedTopicId() || unit.topics.every((topic) => topic._id !== selectedTopicId())) {
      const firstTopic = unit.topics[0];
      setSelectedTopicId(firstTopic?._id);
      setSelectedLessonId(firstTopic?.lessons[0]?._id);
    }
  });

  const topics = createMemo<TopicNode[]>(() => currentUnit()?.topics ?? []);
  const currentTopic = createMemo<TopicNode | undefined>(() => topics().find((topic) => topic._id === selectedTopicId()));

  createEffect(() => {
    const topic = currentTopic();
    if (!topic) {
      setSelectedLessonId(undefined);
      onResetLessonCreation();
      return;
    }
    if (!selectedLessonId() || topic.lessons.every((lesson) => lesson._id !== selectedLessonId())) {
      setSelectedLessonId(topic.lessons[0]?._id);
    }
  });

  const lessons = createMemo<LessonNode[]>(() => currentTopic()?.lessons ?? []);

  const selectSegment = (segmentId: string | undefined) => {
    const previous = selectedSegmentIdValue();
    if (previous !== segmentId) {
      setSelectedSegmentIdValue(segmentId);
    }
    if (segmentId) {
      editor.select({ kind: 'segment', segmentId });
    } else {
      editor.select({ kind: 'lesson' });
    }
  };

  return {
    selectedUnitId,
    setSelectedUnitId,
    selectedTopicId,
    setSelectedTopicId,
    selectedLessonId,
    setSelectedLessonId,
    selectedSegmentId: selectedSegmentIdValue,
    selectSegment,
    units,
    currentUnit,
    topics,
    currentTopic,
    lessons,
  };
};
