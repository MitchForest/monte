import {
  createContext,
  createMemo,
  useContext,
  type Accessor,
  type ParentComponent,
  type Setter,
} from 'solid-js';
import type { SetStoreFunction } from 'solid-js/store';

import type { LessonEditor } from '@monte/lesson-service';
import type { LessonDocument, LessonMaterialInventory, LessonSegment } from '@monte/types';
import type { Id } from '@monte/types';
import type { CurriculumTree } from '@monte/api';

import {
  actionTypeOptions,
  beadPlaceOptions,
  difficultyOptions,
  exchangeFromOptions,
  exchangeToOptions,
  guidedEvaluatorOptions,
  positionOptions,
  representationOptions,
  scenarioKindOptions,
  workspaceOptions,
} from '../constants';
import {
  createEditorState,
  type ConfirmController,
  type EditorResources,
  type EditorState,
} from '../../../domains/curriculum/editor/editorState';
import {
  createEditorActions,
  type EditorActions,
} from '../../../domains/curriculum/editor/editorActions';
import type {
  CreateLessonFormState,
  LessonMetaFormState,
  LessonScenario,
  TopicFormState,
  UnitFormState,
} from '../../../domains/curriculum/editor/types';

type UnitNode = CurriculumTree[number];
type TopicNode = UnitNode['topics'][number];
type LessonNode = TopicNode['lessons'][number];

interface CurriculumSelection {
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

interface EditorForms {
  unit: {
    form: UnitFormState;
    setForm: SetStoreFunction<UnitFormState>;
    error: Accessor<string | undefined>;
    setError: Setter<string | undefined>;
  };
  topic: {
    form: TopicFormState;
    setForm: SetStoreFunction<TopicFormState>;
    error: Accessor<string | undefined>;
    setError: Setter<string | undefined>;
  };
  lessonMeta: {
    form: LessonMetaFormState;
    setForm: SetStoreFunction<LessonMetaFormState>;
  };
  createUnit: {
    form: UnitFormState;
    setForm: SetStoreFunction<UnitFormState>;
    error: Accessor<string | undefined>;
    setError: Setter<string | undefined>;
    isCreating: Accessor<boolean>;
    setIsCreating: Setter<boolean>;
  };
  createTopic: {
    form: TopicFormState;
    setForm: SetStoreFunction<TopicFormState>;
    error: Accessor<string | undefined>;
    setError: Setter<string | undefined>;
    isCreating: Accessor<boolean>;
    setIsCreating: Setter<boolean>;
  };
  createLesson: {
    form: CreateLessonFormState;
    setForm: SetStoreFunction<CreateLessonFormState>;
    error: Accessor<string | undefined>;
    setError: Setter<string | undefined>;
    isCreating: Accessor<boolean>;
    setIsCreating: Setter<boolean>;
  };
}

interface EditorComputed {
  defaultMaterialId: string;
  units: Accessor<UnitNode[]>;
  currentUnit: Accessor<UnitNode | undefined>;
  topics: Accessor<TopicNode[]>;
  currentTopic: Accessor<TopicNode | undefined>;
  lessons: Accessor<LessonNode[]>;
  lessonDocument: Accessor<LessonDocument | undefined>;
  currentLessonMeta: Accessor<LessonNode | undefined>;
  materialInventory: Accessor<LessonMaterialInventory>;
  selectedSegment: Accessor<LessonSegment | undefined>;
}

interface EditorOptions {
  actionTypeOptions: typeof actionTypeOptions;
  guidedEvaluatorOptions: typeof guidedEvaluatorOptions;
  positionOptions: typeof positionOptions;
  beadPlaceOptions: typeof beadPlaceOptions;
  exchangeFromOptions: typeof exchangeFromOptions;
  exchangeToOptions: typeof exchangeToOptions;
  representationOptions: typeof representationOptions;
  workspaceOptions: typeof workspaceOptions;
  difficultyOptions: typeof difficultyOptions;
  scenarioKindOptions: typeof scenarioKindOptions;
}

export interface EditorViewModel {
  editor: LessonEditor;
  options: EditorOptions;
  selection: CurriculumSelection;
  resources: EditorResources;
  forms: EditorForms;
  computed: EditorComputed;
  metaTab: {
    active: Accessor<'unit' | 'topic' | 'lesson'>;
    setActive: Setter<'unit' | 'topic' | 'lesson'>;
  };
  confirm: ConfirmController;
  actions: EditorActions;
}

const EditorStoresContext = createContext<EditorViewModel>();

const mapForms = (state: EditorState): EditorForms => ({
  unit: state.forms.unit,
  topic: state.forms.topic,
  lessonMeta: state.forms.lessonMeta,
  createUnit: state.forms.createUnit,
  createTopic: state.forms.createTopic,
  createLesson: state.forms.createLesson,
});

const mapSelection = (state: EditorState): CurriculumSelection => state.selection;

const mapComputed = (
  state: EditorState,
  selection: CurriculumSelection,
): EditorComputed => {
  const currentLessonMeta = createMemo(() => {
    const lessonId = selection.selectedLessonId();
    if (!lessonId) return undefined;
    return selection.lessons().find((lesson) => lesson._id === lessonId);
  });

  return {
    defaultMaterialId: state.defaultMaterialId,
    units: selection.units,
    currentUnit: selection.currentUnit,
    topics: selection.topics,
    currentTopic: selection.currentTopic,
    lessons: selection.lessons,
    lessonDocument: state.document.lessonDocument,
    currentLessonMeta,
    materialInventory: state.document.materialInventory,
    selectedSegment: state.document.selectedSegment,
  };
};

export const useEditorViewModel = (): EditorViewModel => {
  const state = createEditorState();
  const actions = createEditorActions(state);

  const selection = mapSelection(state);
  const forms = mapForms(state);
  const computed = mapComputed(state, selection);

  const options: EditorOptions = {
    actionTypeOptions,
    guidedEvaluatorOptions,
    positionOptions,
    beadPlaceOptions,
    exchangeFromOptions,
    exchangeToOptions,
    representationOptions,
    workspaceOptions,
    difficultyOptions,
    scenarioKindOptions,
  };

  return {
    editor: state.editor,
    options,
    selection,
    resources: state.resources,
    forms,
    computed,
    metaTab: state.forms.metaTab,
    confirm: state.confirm.controller,
    actions,
  };
};

export const EditorStoresProvider: ParentComponent = (props) => {
  const stores = useEditorViewModel();
  return <EditorStoresContext.Provider value={stores}>{props.children}</EditorStoresContext.Provider>;
};

export const EditorStoresStaticProvider: ParentComponent<{ value: EditorViewModel }> = (props) => (
  <EditorStoresContext.Provider value={props.value}>{props.children}</EditorStoresContext.Provider>
);

export const useEditorStores = () => {
  const ctx = useContext(EditorStoresContext);
  if (!ctx) {
    throw new Error('Editor context not available. Wrap components in <EditorStoresProvider>.');
  }
  return ctx;
};

export const useEditorSelection = () => useEditorStores().selection;
export const useEditorResources = () => useEditorStores().resources;
export const useEditorForms = () => useEditorStores().forms;
export const useEditorComputed = () => useEditorStores().computed;
export const useEditorMetaTab = () => useEditorStores().metaTab;
export const useEditorConfirm = () => useEditorStores().confirm;
export const useEditorActions = () => useEditorStores().actions;
export const useEditorOptions = () => useEditorStores().options;
export const useLessonEditor = () => useEditorStores().editor;
