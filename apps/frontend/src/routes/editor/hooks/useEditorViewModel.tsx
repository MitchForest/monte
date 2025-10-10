import {
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  useContext,
  type Accessor,
  type ParentComponent,
  type Setter,
} from 'solid-js';
import { createStore, type SetStoreFunction } from 'solid-js/store';

import type { Id } from '@monte/types';
import {
  createLesson,
  createTopic,
  createUnit,
  deleteLesson,
  deleteTopic,
  deleteUnit,
  fetchCurriculumTree,
  fetchLessonById,
  publishLesson,
  reorderLessons,
  reorderTopics,
  reorderUnits,
  saveLessonDraft,
  updateTopic,
  updateUnit,
  type CurriculumTree,
  type LessonDraftRecord,
} from '../../../domains/curriculum/api/curriculumClient';
import { curriculumMaterials } from '../../../domains/curriculum/materials';
import { createLessonEditor } from '../../../domains/curriculum/state/lessonEditor';
import type { LessonEditor } from '../../../domains/curriculum/state/lessonEditor';
import { toast } from 'solid-sonner';
import type {
  GuidedEvaluatorId,
  GuidedStep,
  LessonDocument,
  LessonMaterialInventory,
  MaterialBankDefinition,
  PracticeQuestion,
  PresentationAction,
  TokenTypeDefinition,
} from '@monte/types';
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
  type ActionTypeValue,
} from '../constants';
import type {
  CreateLessonFormState,
  LessonMetaFormState,
  LessonScenario,
  LessonSegment,
  TopicFormState,
  UnitFormState,
} from '../types';
import {
  clone,
  createPresentationAction,
  createSegment,
  defaultGuidedStep,
  defaultPassCriteria,
  defaultPracticeQuestion,
  ensurePresentationScript,
  moveItem,
  sanitizeScenario,
  slugify,
  validateLessonDocument,
} from '../utils';
import { createEmptyInventory } from '../../../domains/curriculum/utils/inventory';
import { createInventoryStore } from '../state/inventoryStore';

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
  setSelectedSegmentId: (segmentId: string | undefined) => void;
}

import { createConfirmController, type ConfirmController } from '../state/confirmController';
import { createSelectionStore } from '../state/selectionStore';

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

interface EditorResources {
  curriculumTree: Accessor<CurriculumTree | undefined>;
  setCurriculumTree: (tree: CurriculumTree) => void;
  refetchTree: () => Promise<CurriculumTree | undefined>;
  lessonRecord: Accessor<LessonDraftRecord | undefined>;
  refetchLessonRecord: () => Promise<LessonDraftRecord | undefined>;
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

interface EditorActions {
  handleSelectLesson: (lessonId: Id<'lessons'>) => Promise<void>;
  handleSave: () => Promise<void>;
  handlePublish: () => Promise<void>;
  handleReset: () => Promise<void>;
  submitCreateUnit: (event: Event) => Promise<void>;
  startCreateUnit: () => void;
  cancelCreateUnit: () => void;
  handleUnitFormSubmit: (event: Event) => Promise<void>;
  handleDeleteUnit: (unit: UnitNode) => Promise<void>;
  handleMoveUnit: (unitId: Id<'units'>, direction: -1 | 1) => Promise<void>;
  submitCreateTopic: (event: Event) => Promise<void>;
  startCreateTopic: () => void;
  cancelCreateTopic: () => void;
  handleTopicFormSubmit: (event: Event) => Promise<void>;
  handleDeleteTopic: (topic: TopicNode) => Promise<void>;
  handleMoveTopic: (topicId: Id<'topics'>, direction: -1 | 1) => Promise<void>;
  submitCreateLesson: (event: Event) => Promise<void>;
  startCreateLesson: () => void;
  cancelCreateLesson: () => void;
  handleDeleteLesson: (lesson: LessonNode) => Promise<void>;
  handleMoveLessonOrder: (lessonId: Id<'lessons'>, direction: -1 | 1) => Promise<void>;
  handleLessonFieldChange: (field: 'title' | 'summary', value: string) => void;
  handleLessonDurationChange: (value: number) => void;
  handleLessonPrimaryMaterialChange: (value: string) => void;
  handleLessonSkillChange: (value: string) => void;
  handleLessonMaterialChange: (
    index: number,
    field: 'materialId' | 'purpose' | 'optional',
    value: string | boolean,
  ) => void;
  handleAddLessonMaterial: () => void;
  handleRemoveLessonMaterial: (index: number) => void;
  handleLessonMetaChange: (field: keyof LessonMetaFormState, value: string) => void;
  handleDocumentScenarioUpdate: (updater: (scenario: LessonScenario) => LessonScenario) => void;
  handleSegmentScenarioUpdate: (segmentId: string, updater: (scenario: LessonScenario) => LessonScenario) => void;
  handleSegmentTitleChange: (segmentId: string, value: string) => void;
  handleAddSegment: (type: LessonSegment['type']) => void;
  handleRemoveSegment: (segmentId: string) => void;
  handleMoveSegment: (segmentId: string, direction: -1 | 1) => void;
  handleSegmentSkillsChange: (segmentId: string, value: string) => void;
  handleSegmentRepresentationChange: (segmentId: string, value: 'concrete' | 'abstract') => void;
  handleSegmentMaterialChange: (
    segmentId: string,
    index: number,
    field: 'materialId' | 'purpose' | 'optional',
    value: string | boolean,
  ) => void;
  handleAddSegmentMaterial: (segmentId: string) => void;
  handleRemoveSegmentMaterial: (segmentId: string, index: number) => void;
  handleActionTypeChange: (segmentId: string, actionId: string, actionType: ActionTypeValue) => void;
  handleMoveAction: (segmentId: string, actionId: string, direction: 'up' | 'down') => void;
  handleRemoveAction: (segmentId: string, actionId: string) => void;
  handleAddAction: (segmentId: string, type: ActionTypeValue) => void;
  handleUpdateAction: (
    segmentId: string,
    actionId: string,
    mutate: (action: PresentationAction) => PresentationAction,
  ) => void;
  handleGuidedStepChange: (
    segmentId: string,
    stepId: string,
    mutate: (step: GuidedStep & { evaluatorId: GuidedEvaluatorId }) => GuidedStep & {
      evaluatorId: GuidedEvaluatorId;
    },
  ) => void;
  handleRemoveGuidedStep: (segmentId: string, stepId: string) => void;
  handleAddGuidedStep: (segmentId: string, workspace: 'golden-beads' | 'stamp-game') => void;
  handleMoveGuidedStep: (segmentId: string, stepId: string, direction: 'up' | 'down') => void;
  handlePracticeQuestionChange: (
    segmentId: string,
    questionId: string,
    mutate: (question: PracticeQuestion) => PracticeQuestion,
  ) => void;
  handleRemovePracticeQuestion: (segmentId: string, questionId: string) => void;
  handleAddPracticeQuestion: (segmentId: string) => void;
  handleMovePracticeQuestion: (segmentId: string, questionId: string, direction: 'up' | 'down') => void;
  handlePassCriteriaChange: (
    segmentId: string,
    field: keyof typeof defaultPassCriteria,
    value: number,
  ) => void;
  handleGuidedWorkspaceChange: (segmentId: string, workspace: 'golden-beads' | 'stamp-game') => void;
  handlePracticeWorkspaceChange: (segmentId: string, workspace: 'golden-beads' | 'stamp-game') => void;
  handleSegmentMaterialBankChange: (segmentId: string, bankId: string | undefined) => void;
  handleAddTokenType: () => void;
  handleUpdateTokenType: (
    tokenId: string,
    mutate: (token: TokenTypeDefinition) => TokenTypeDefinition,
  ) => void;
  handleRemoveTokenType: (tokenId: string) => void;
  handleAddMaterialBank: (scope?: 'lesson' | 'segment', segmentId?: string) => void;
  handleUpdateMaterialBank: (
    bankId: string,
    mutate: (bank: MaterialBankDefinition) => MaterialBankDefinition,
  ) => void;
  handleRemoveMaterialBank: (bankId: string) => void;
  registerInventorySnapshot: (accessor?: () => LessonMaterialInventory) => void;
  selectSegment: (segmentId: string | undefined) => void;
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

export const useEditorViewModel = () => {
  const editor: LessonEditor = createLessonEditor();
  const [curriculumTree, { mutate: mutateCurriculumTree, refetch: refetchTree }] =
    createResource<CurriculumTree | undefined>(fetchCurriculumTree);

  const defaultMaterialId = curriculumMaterials[0]?.id ?? 'golden-beads';
  const emptyInventory = createEmptyInventory();

  const confirm = createConfirmController();

  let resetTopicCreation = () => {};
  let resetLessonCreation = () => {};

  const selectionStore = createSelectionStore({
    curriculumTree: () => curriculumTree() ?? undefined,
    editor,
    onResetTopicCreation: () => resetTopicCreation(),
    onResetLessonCreation: () => resetLessonCreation(),
  });

  const {
    selectedUnitId,
    setSelectedUnitId,
    selectedTopicId,
    setSelectedTopicId,
    selectedLessonId,
    setSelectedLessonId,
    selectedSegmentId,
    selectSegment,
    units,
    currentUnit,
    topics,
    currentTopic,
    lessons,
  } = selectionStore;
  const materialInventory = createMemo<LessonMaterialInventory>(
    () => editor.state.document?.lesson.materialInventory ?? emptyInventory,
  );

  const updateCurriculumTree = (mutator: (tree: CurriculumTree) => CurriculumTree) => {
    const tree = curriculumTree();
    if (!tree) return;
    mutateCurriculumTree(mutator(clone(tree)));
  };

  const reportActionError = (message: string, error: unknown) => {
    console.error(message, error);
    window.alert(message);
  };

  const [unitForm, setUnitForm] = createStore<UnitFormState>({
    title: '',
    slug: '',
    summary: '',
    coverImage: '',
    status: 'active',
  });
  const [unitFormError, setUnitFormError] = createSignal<string | undefined>(undefined);

  const [topicForm, setTopicForm] = createStore<TopicFormState>({
    title: '',
    slug: '',
    overview: '',
    focusSkills: '',
    estimatedDurationMinutes: '',
    status: 'active',
  });
  const [topicFormError, setTopicFormError] = createSignal<string | undefined>(undefined);

  const [lessonMetaForm, setLessonMetaForm] = createStore<LessonMetaFormState>({
    author: '',
    notes: '',
  });

  const [activeMetaTab, setActiveMetaTab] = createSignal<'unit' | 'topic' | 'lesson'>('unit');

  const [isCreatingUnit, setIsCreatingUnit] = createSignal(false);
  const [createUnitForm, setCreateUnitForm] = createStore<UnitFormState>({
    title: '',
    slug: '',
    summary: '',
    coverImage: '',
    status: 'active',
  });
  const [createUnitError, setCreateUnitError] = createSignal<string | undefined>(undefined);

  const [isCreatingTopic, setIsCreatingTopic] = createSignal(false);
  const [createTopicForm, setCreateTopicForm] = createStore<TopicFormState>({
    title: '',
    slug: '',
    overview: '',
    focusSkills: '',
    estimatedDurationMinutes: '',
    status: 'active',
  });
  const [createTopicError, setCreateTopicError] = createSignal<string | undefined>(undefined);

  const [isCreatingLesson, setIsCreatingLesson] = createSignal(false);
  resetTopicCreation = () => setIsCreatingTopic(false);
  resetLessonCreation = () => setIsCreatingLesson(false);
  const [createLessonForm, setCreateLessonForm] = createStore<CreateLessonFormState>({
    title: '',
    slug: '',
  });
  const [createLessonError, setCreateLessonError] = createSignal<string | undefined>(undefined);

  const [lessonRecord, { refetch: refetchLessonRecord }] = createResource<
    LessonDraftRecord | undefined,
    Id<'lessons'> | undefined
  >(
    () => selectedLessonId(),
    async (lessonId) => {
      if (!lessonId) return undefined;
      const record = await fetchLessonById(lessonId);
      return record ?? undefined;
    },
  );

  createEffect(() => {
    const unit = currentUnit();
    if (!unit) return;
    setUnitForm({
      title: unit.title,
      slug: unit.slug,
      summary: unit.summary ?? '',
      coverImage: unit.coverImage ?? '',
      status: unit.status ?? 'active',
    });
    setUnitFormError(undefined);
  });

  createEffect(() => {
    const topic = currentTopic();
    if (!topic) return;
    setTopicForm({
      title: topic.title,
      slug: topic.slug,
      overview: topic.overview ?? '',
      focusSkills: (topic.focusSkills ?? []).join(', '),
      estimatedDurationMinutes: topic.estimatedDurationMinutes?.toString() ?? '',
      status: topic.status ?? 'active',
    });
    setTopicFormError(undefined);
  });

  createEffect(() => {
    const tab = activeMetaTab();
    const topic = currentTopic();
    const doc = lessonDocument();
    if (tab === 'lesson' && !doc) {
      setActiveMetaTab(topic ? 'topic' : 'unit');
    } else if (tab === 'topic' && !topic) {
      setActiveMetaTab('unit');
    }
  });

  let lastLoadedLessonId: Id<'lessons'> | undefined;
  createEffect(() => {
    const record = lessonRecord();
    if (!record) return;
    if (record._id === lastLoadedLessonId && editor.state.dirty) return;
    editor.loadDocument(record.draft);
    lastLoadedLessonId = record._id;
  });

  const handleSelectLesson = async (lessonId: Id<'lessons'>) => {
    if (editor.state.dirty && lessonId !== selectedLessonId()) {
      const confirmNavigation = await confirm.request({
        message: 'You have unsaved changes. Navigating away will discard them. Continue?',
        confirmLabel: 'Discard changes',
        cancelLabel: 'Stay here',
      });
      if (!confirmNavigation) return;
    }
    setSelectedLessonId(lessonId);
  };

  const refreshLessonAndTree = async () => {
    await Promise.all([refetchLessonRecord(), refetchTree()]);
  };

  const handleSave = async () => {
    const lessonId = selectedLessonId();
    if (!lessonId) return;
    inventoryStore.applyInventorySnapshot();
    const document = editor.state.document;
    if (!document) return;
    const validationErrors = validateLessonDocument(document);
    if (validationErrors.length > 0) {
      editor.setError(`Cannot save yet:\n${validationErrors.join('\n')}`);
      return;
    }
    try {
      editor.beginSaving();
      await saveLessonDraft(lessonId, document);
      editor.markSaved();
      await refreshLessonAndTree();
      toast.success('Draft saved');
    } catch (error) {
      editor.setError((error as Error).message);
      toast.error('Unable to save draft', { description: (error as Error).message });
    }
  };

  const handlePublish = async () => {
    const lessonId = selectedLessonId();
    if (!lessonId) return;
    inventoryStore.applyInventorySnapshot();
    const document = editor.state.document;
    if (!document) return;
    const validationErrors = validateLessonDocument(document);
    if (validationErrors.length > 0) {
      editor.setError(`Cannot publish yet:\n${validationErrors.join('\n')}`);
      return;
    }
    try {
      editor.beginSaving();
      await publishLesson(lessonId);
      editor.markSaved();
      await refreshLessonAndTree();
      toast.success('Lesson published');
    } catch (error) {
      editor.setError((error as Error).message);
      toast.error('Unable to publish lesson', { description: (error as Error).message });
    }
  };

  const handleReset = async () => {
    if (editor.state.dirty) {
    const confirmReset = await confirm.request({
        message: 'Discard unsaved changes?',
        confirmLabel: 'Discard',
        cancelLabel: 'Cancel',
      });
      if (!confirmReset) return;
    }
    editor.resetToInitial();
    toast.info('Changes discarded');
  };

  const resetCreateUnitForm = () => {
    setCreateUnitForm({ title: '', slug: '', summary: '', coverImage: '', status: 'active' });
    setCreateUnitError(undefined);
  };

  const startCreateUnit = () => {
    resetCreateUnitForm();
    setIsCreatingUnit(true);
    setIsCreatingTopic(false);
    setIsCreatingLesson(false);
  };

  const cancelCreateUnit = () => {
    setIsCreatingUnit(false);
    resetCreateUnitForm();
  };

  const submitCreateUnit = async (event: Event) => {
    event.preventDefault();
    const title = createUnitForm.title.trim();
    if (!title) {
      setCreateUnitError('Title is required');
      return;
    }
    const rawSlug = createUnitForm.slug.trim();
    const slug = slugify(rawSlug || title);
    const summary = createUnitForm.summary.trim();
    const coverImage = createUnitForm.coverImage.trim();

    try {
      const result = await createUnit({
        title,
        slug,
        summary: summary || undefined,
        coverImage: coverImage || undefined,
        metadata: { source: 'lesson-editor' },
      });
      await refetchTree();
      setSelectedUnitId(result.unitId);
      setSelectedTopicId(undefined);
      setSelectedLessonId(undefined);
      cancelCreateUnit();
      toast.success('Unit created');
    } catch (error) {
      setCreateUnitError((error as Error).message);
      toast.error('Unable to create unit', { description: (error as Error).message });
    }
  };

  const handleUnitFormSubmit = async (event: Event) => {
    event.preventDefault();
    const unit = currentUnit();
    if (!unit) return;
    const title = unitForm.title.trim();
    if (!title) {
      setUnitFormError('Title is required');
      return;
    }
    const slug = slugify((unitForm.slug || title).trim());
    const summary = unitForm.summary.trim();
    const coverImage = unitForm.coverImage.trim();

    try {
      await updateUnit({
        unitId: unit._id,
        title,
        slug,
        summary: summary || undefined,
        coverImage: coverImage || undefined,
        status: unitForm.status,
      });
      await refetchTree();
      setUnitForm('slug', slug);
      setUnitFormError(undefined);
      toast.success('Unit updated');
    } catch (error) {
      setUnitFormError((error as Error).message);
      toast.error('Unable to update unit', { description: (error as Error).message });
    }
  };

  const handleDeleteUnit = async (unit: UnitNode) => {
    const confirmDelete = await confirm.request({
      message: `Delete unit "${unit.title}" and all nested topics/lessons?`,
      confirmLabel: 'Delete unit',
      cancelLabel: 'Cancel',
    });
    if (!confirmDelete) return;
    const currentUnits = units();
    const index = currentUnits.findIndex((item) => item._id === unit._id);
    const fallbackUnit = currentUnits[index + 1] ?? currentUnits[index - 1];
    try {
      await deleteUnit(unit._id);
      updateCurriculumTree((tree) => tree.filter((item) => item._id !== unit._id));
      await refetchTree();
      setSelectedUnitId(fallbackUnit?._id);
      setSelectedTopicId(undefined);
      setSelectedLessonId(undefined);
      toast.success('Unit deleted');
    } catch (error) {
      reportActionError('Unable to delete unit. Please try again.', error);
      toast.error('Unable to delete unit', { description: (error as Error).message });
    }
  };

  const handleMoveUnit = async (unitId: Id<'units'>, direction: -1 | 1) => {
    const currentUnits = units();
    const index = currentUnits.findIndex((unit) => unit._id === unitId);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= currentUnits.length) return;
    const reordered = moveItem(currentUnits, index, targetIndex);
    try {
      await reorderUnits(reordered.map((unit) => unit._id));
      updateCurriculumTree((tree) => moveItem(tree, index, targetIndex));
      await refetchTree();
      setSelectedUnitId(unitId);
    } catch (error) {
      reportActionError('Unable to reorder units. Please try again.', error);
    }
  };

  const resetCreateTopicForm = () => {
    setCreateTopicForm({
      title: '',
      slug: '',
      overview: '',
      focusSkills: '',
      estimatedDurationMinutes: '',
      status: 'active',
    });
    setCreateTopicError(undefined);
  };

  const startCreateTopic = () => {
    resetCreateTopicForm();
    setIsCreatingTopic(true);
    setIsCreatingLesson(false);
  };

  const cancelCreateTopic = () => {
    setIsCreatingTopic(false);
    resetCreateTopicForm();
  };

  const submitCreateTopic = async (event: Event) => {
    event.preventDefault();
    const unitId = selectedUnitId();
    if (!unitId) {
      setCreateTopicError('Select a unit before adding a topic');
      return;
    }
    const title = createTopicForm.title.trim();
    if (!title) {
      setCreateTopicError('Title is required');
      return;
    }
    const slug = slugify((createTopicForm.slug || title).trim());
    const overview = createTopicForm.overview.trim();
    const focusSkills = createTopicForm.focusSkills
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const minutes = Number(createTopicForm.estimatedDurationMinutes);
    const estimatedDurationMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;

    try {
      const result = await createTopic({
        unitId,
        title,
        slug,
        overview: overview || undefined,
        focusSkills: focusSkills.length ? focusSkills : undefined,
        estimatedDurationMinutes,
        metadata: { source: 'lesson-editor' },
      });
      await refetchTree();
      setSelectedUnitId(unitId);
      setSelectedTopicId(result.topicId);
      setSelectedLessonId(undefined);
      cancelCreateTopic();
      toast.success('Topic created');
    } catch (error) {
      setCreateTopicError((error as Error).message);
      toast.error('Unable to create topic', { description: (error as Error).message });
    }
  };

  const handleTopicFormSubmit = async (event: Event) => {
    event.preventDefault();
    const topic = currentTopic();
    if (!topic) return;
    const title = topicForm.title.trim();
    if (!title) {
      setTopicFormError('Title is required');
      return;
    }
    const slug = slugify((topicForm.slug || title).trim());
    const overview = topicForm.overview.trim();
    const focusSkills = topicForm.focusSkills
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const minutes = Number(topicForm.estimatedDurationMinutes);
    const estimatedDurationMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;

    try {
      await updateTopic({
        topicId: topic._id,
        title,
        slug,
        overview: overview || undefined,
        focusSkills,
        estimatedDurationMinutes,
        status: topicForm.status,
      });
      await refetchTree();
      setTopicForm('slug', slug);
      setTopicFormError(undefined);
      toast.success('Topic updated');
    } catch (error) {
      setTopicFormError((error as Error).message);
      toast.error('Unable to update topic', { description: (error as Error).message });
    }
  };

  const handleDeleteTopic = async (topic: TopicNode) => {
    const confirmDelete = await confirm.request({
      message: `Delete topic "${topic.title}" and all nested lessons?`,
      confirmLabel: 'Delete topic',
      cancelLabel: 'Cancel',
    });
    if (!confirmDelete) return;
    const topicList = topics();
    const index = topicList.findIndex((item) => item._id === topic._id);
    const fallbackTopic = topicList[index + 1] ?? topicList[index - 1];
    try {
      await deleteTopic(topic._id);
      updateCurriculumTree((tree) =>
        tree.map((unit) =>
          unit._id === topic.unitId
            ? {
                ...unit,
                topics: unit.topics.filter((item) => item._id !== topic._id),
              }
            : unit,
        ),
      );
      await refetchTree();
      setSelectedTopicId(fallbackTopic?._id);
      setSelectedLessonId(undefined);
      toast.success('Topic deleted');
    } catch (error) {
      reportActionError('Unable to delete topic. Please try again.', error);
      toast.error('Unable to delete topic', { description: (error as Error).message });
    }
  };

  const handleMoveTopic = async (topicId: Id<'topics'>, direction: -1 | 1) => {
    const unitId = selectedUnitId();
    if (!unitId) return;
    const topicList = topics();
    const index = topicList.findIndex((topic) => topic._id === topicId);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= topicList.length) return;
    const reordered = moveItem(topicList, index, targetIndex);
    try {
      await reorderTopics(unitId, reordered.map((topic) => topic._id));
      updateCurriculumTree((tree) =>
        tree.map((unit) =>
          unit._id === unitId
            ? {
                ...unit,
                topics: moveItem(unit.topics, index, targetIndex),
              }
            : unit,
        ),
      );
      await refetchTree();
      setSelectedTopicId(topicId);
    } catch (error) {
      reportActionError('Unable to reorder topics. Please try again.', error);
    }
  };

  const resetCreateLessonForm = () => {
    setCreateLessonForm({ title: '', slug: '' });
    setCreateLessonError(undefined);
  };

  const startCreateLesson = () => {
    resetCreateLessonForm();
    setIsCreatingLesson(true);
  };

  const cancelCreateLesson = () => {
    setIsCreatingLesson(false);
    resetCreateLessonForm();
  };

  const submitCreateLesson = async (event: Event) => {
    event.preventDefault();
    const topicId = selectedTopicId();
    if (!topicId) {
      setCreateLessonError('Select a topic before adding a lesson');
      return;
    }
    const title = createLessonForm.title.trim();
    if (!title) {
      setCreateLessonError('Title is required');
      return;
    }
    const slug = slugify((createLessonForm.slug || title).trim());

    try {
      const result = await createLesson({ topicId, title, slug });
      await refetchTree();
      setSelectedLessonId(result.lessonId);
      cancelCreateLesson();
      toast.success('Lesson created');
    } catch (error) {
      setCreateLessonError((error as Error).message);
      toast.error('Unable to create lesson', { description: (error as Error).message });
    }
  };

  const handleDeleteLesson = async (lesson: LessonNode) => {
    const confirmDelete = await confirm.request({
      message: `Delete lesson "${lesson.title}"?`,
      confirmLabel: 'Delete lesson',
      cancelLabel: 'Cancel',
    });
    if (!confirmDelete) return;
    const lessonList = lessons();
    const index = lessonList.findIndex((item) => item._id === lesson._id);
    const fallbackLesson = lessonList[index + 1] ?? lessonList[index - 1];
    const unitId = selectedUnitId();
    const topicId = selectedTopicId();
    if (!unitId || !topicId) return;
    try {
      await deleteLesson(lesson._id);
      updateCurriculumTree((tree) =>
        tree.map((unit) =>
          unit._id === unitId
            ? {
                ...unit,
                topics: unit.topics.map((topic) =>
                  topic._id === topicId
                    ? {
                        ...topic,
                        lessons: topic.lessons.filter((item) => item._id !== lesson._id),
                      }
                    : topic,
                ),
              }
            : unit,
        ),
      );
      await refetchTree();
      setSelectedLessonId(fallbackLesson?._id);
      if (!fallbackLesson) {
        editor.resetToInitial();
      }
      toast.success('Lesson deleted');
    } catch (error) {
      reportActionError('Unable to delete lesson. Please try again.', error);
      toast.error('Unable to delete lesson', { description: (error as Error).message });
    }
  };

  const handleMoveLessonOrder = async (lessonId: Id<'lessons'>, direction: -1 | 1) => {
    const topicId = selectedTopicId();
    if (!topicId) return;
    const unitId = selectedUnitId();
    if (!unitId) return;
    const lessonList = lessons();
    const index = lessonList.findIndex((lesson) => lesson._id === lessonId);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= lessonList.length) return;
    const reordered = moveItem(lessonList, index, targetIndex);
    try {
      await reorderLessons(topicId, reordered.map((lesson) => lesson._id));
      updateCurriculumTree((tree) =>
        tree.map((unit) =>
          unit._id === unitId
            ? {
                ...unit,
                topics: unit.topics.map((topic) =>
                  topic._id === topicId
                    ? {
                        ...topic,
                        lessons: moveItem(topic.lessons, index, targetIndex),
                      }
                    : topic,
                ),
              }
            : unit,
        ),
      );
      await refetchTree();
      setSelectedLessonId(lessonId);
    } catch (error) {
      reportActionError('Unable to reorder lessons. Please try again.', error);
    }
  };

  const handleLessonFieldChange = (field: 'title' | 'summary', value: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson[field] = value;
    });
  };

  const handleLessonDurationChange = (value: number) => {
    editor.applyUpdate((draft) => {
      draft.lesson.estimatedDurationMinutes = Number.isNaN(value)
        ? draft.lesson.estimatedDurationMinutes
        : value;
    });
  };

  const handleLessonPrimaryMaterialChange = (value: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.primaryMaterialId = value;
    });
  };

  const handleLessonSkillChange = (value: string) => {
    const skills = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    editor.applyUpdate((draft) => {
      draft.lesson.focusSkills = skills;
    });
  };

  const handleLessonMaterialChange = (
    index: number,
    field: 'materialId' | 'purpose' | 'optional',
    value: string | boolean,
  ) => {
    editor.applyUpdate((draft) => {
      const materials = [...draft.lesson.materials];
      const target = materials[index];
      if (!target) return;
      materials[index] = {
        ...target,
        [field]: value,
      } as typeof target;
      draft.lesson.materials = materials;
    });
  };

  const handleAddLessonMaterial = () => {
    editor.applyUpdate((draft) => {
      draft.lesson.materials = [
        ...draft.lesson.materials,
        { materialId: defaultMaterialId, purpose: '', optional: false },
      ];
    });
  };

  const handleRemoveLessonMaterial = (index: number) => {
    editor.applyUpdate((draft) => {
      draft.lesson.materials = draft.lesson.materials.filter((_, materialIndex) => materialIndex !== index);
    });
  };

  const handleMetaFieldChange = (field: 'author' | 'notes', value: string) => {
    editor.applyUpdate((draft) => {
      const nextMeta: LessonDocument['meta'] = {
        ...(draft.meta ?? {}),
      };
      if (field === 'author') {
        nextMeta.author = value;
      } else {
        nextMeta.notes = value;
      }
      draft.meta = nextMeta;
    });
  };

  const handleLessonMetaChange = (field: keyof LessonMetaFormState, value: string) => {
    setLessonMetaForm(field, value);
    handleMetaFieldChange(field, value);
  };

  const handleDocumentScenarioUpdate = (updater: (scenario: LessonScenario) => LessonScenario) => {
    editor.applyUpdate((draft) => {
      const currentScenario = draft.meta?.scenario;
      const defaultScenario: LessonScenario = { kind: 'golden-beads', seed: Date.now() };
      const nextScenario = updater(currentScenario ?? defaultScenario);
      draft.meta = {
        ...(draft.meta ?? {}),
        scenario: nextScenario,
      };
    });
  };

  const handleSegmentScenarioUpdate = (
    segmentId: string,
    updater: (scenario: LessonScenario) => LessonScenario,
  ) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId) return segment;
        const nextScenario = updater(sanitizeScenario(segment.scenario, 'golden-beads'));
        return {
          ...segment,
          scenario: nextScenario,
        };
      });
    });
  };

  const handleSegmentTitleChange = (segmentId: string, value: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId) return segment;
        if (segment.type === 'presentation') {
          return {
            ...segment,
            title: value,
            script: segment.script ? { ...segment.script, title: value } : segment.script,
          };
        }
        return { ...segment, title: value };
      });
    });
  };

  const handleAddSegment = (type: LessonSegment['type']) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = [...draft.lesson.segments, createSegment(type, defaultMaterialId)];
    });
  };

  const handleRemoveSegment = (segmentId: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.filter((segment) => segment.id !== segmentId);
    });
  };

  const handleMoveSegment = (segmentId: string, direction: -1 | 1) => {
    editor.applyUpdate((draft) => {
      const index = draft.lesson.segments.findIndex((segment) => segment.id === segmentId);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= draft.lesson.segments.length) return;
      draft.lesson.segments = moveItem(draft.lesson.segments, index, targetIndex);
    });
  };

  const handleSegmentSkillsChange = (segmentId: string, value: string) => {
    const skills = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) =>
        segment.id === segmentId
          ? {
              ...segment,
              skills,
            }
          : segment,
      );
    });
  };

  const handleSegmentRepresentationChange = (segmentId: string, value: 'concrete' | 'abstract') => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) =>
        segment.id === segmentId
          ? {
              ...segment,
              representation: value,
            }
          : segment,
      );
    });
  };

  const handleSegmentMaterialChange = (
    segmentId: string,
    index: number,
    field: 'materialId' | 'purpose' | 'optional',
    value: string | boolean,
  ) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId) return segment;
        const materials = [...segment.materials];
        const target = materials[index];
        if (!target) return segment;
        materials[index] = {
          ...target,
          [field]: value,
        } as typeof target;
        return {
          ...segment,
          materials,
        } as LessonSegment;
      });
    });
  };

  const handleAddSegmentMaterial = (segmentId: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) =>
        segment.id === segmentId
          ? {
              ...segment,
              materials: [
                ...segment.materials,
                { materialId: defaultMaterialId, purpose: '', optional: false },
              ],
            }
          : segment,
      );
    });
  };

  const handleRemoveSegmentMaterial = (segmentId: string, index: number) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) =>
        segment.id === segmentId
          ? {
              ...segment,
              materials: segment.materials.filter((_, materialIndex) => materialIndex !== index),
            }
          : segment,
      );
    });
  };

  const handleActionTypeChange = (
    segmentId: string,
    actionId: string,
    actionType: ActionTypeValue,
  ) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'presentation') return segment;
        const script = ensurePresentationScript(segment);
        const index = script.actions.findIndex((action) => action.id === actionId);
        if (index === -1) return segment;
        script.actions.splice(index, 1, createPresentationAction(actionType, actionId));
        return {
          ...segment,
          script: { ...script },
        };
      });
    });
  };

  const handleMoveAction = (segmentId: string, actionId: string, direction: 'up' | 'down') => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'presentation' || !segment.script) return segment;
        const index = segment.script.actions.findIndex((action) => action.id === actionId);
        const delta = direction === 'up' ? -1 : 1;
        const targetIndex = index + delta;
        if (index === -1 || targetIndex < 0 || targetIndex >= segment.script.actions.length) return segment;
        return {
          ...segment,
          script: {
            ...segment.script,
            actions: moveItem(segment.script.actions, index, targetIndex),
          },
        };
      });
    });
  };

  const handleRemoveAction = (segmentId: string, actionId: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'presentation' || !segment.script) return segment;
        return {
          ...segment,
          script: {
            ...segment.script,
            actions: segment.script.actions.filter((action) => action.id !== actionId),
          },
        };
      });
    });
  };

  const handleAddAction = (segmentId: string, type: ActionTypeValue) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'presentation') return segment;
        const script = ensurePresentationScript(segment);
        return {
          ...segment,
          script: {
            ...script,
            actions: [...script.actions, createPresentationAction(type)],
          },
        };
      });
    });
  };

  const handleUpdateAction = (
    segmentId: string,
    actionId: string,
    mutate: (action: PresentationAction) => PresentationAction,
  ) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'presentation' || !segment.script) return segment;
        return {
          ...segment,
          script: {
            ...segment.script,
            actions: segment.script.actions.map((action) =>
              action.id === actionId ? mutate(action) : action,
            ),
          },
        };
      });
    });
  };

  const handleGuidedStepChange = (
    segmentId: string,
    stepId: string,
    mutate: (step: GuidedStep & { evaluatorId: GuidedEvaluatorId }) => GuidedStep & {
      evaluatorId: GuidedEvaluatorId;
    },
  ) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'guided') return segment;
        return {
          ...segment,
          steps: segment.steps.map((step) => (step.id === stepId ? mutate(step) : step)),
        };
      });
    });
  };

  const handleRemoveGuidedStep = (segmentId: string, stepId: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'guided') return segment;
        return {
          ...segment,
          steps: segment.steps.filter((step) => step.id !== stepId),
        };
      });
    });
  };

  const handleAddGuidedStep = (segmentId: string, workspace: 'golden-beads' | 'stamp-game') => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'guided') return segment;
        return {
          ...segment,
          steps: [...segment.steps, defaultGuidedStep(workspace)],
        };
      });
    });
  };

  const handleMoveGuidedStep = (segmentId: string, stepId: string, direction: 'up' | 'down') => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'guided') return segment;
        const index = segment.steps.findIndex((step) => step.id === stepId);
        const delta = direction === 'up' ? -1 : 1;
        const targetIndex = index + delta;
        if (index === -1 || targetIndex < 0 || targetIndex >= segment.steps.length) return segment;
        return {
          ...segment,
          steps: moveItem(segment.steps, index, targetIndex),
        };
      });
    });
  };

  const handlePracticeQuestionChange = (
    segmentId: string,
    questionId: string,
    mutate: (question: PracticeQuestion) => PracticeQuestion,
  ) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'practice') return segment;
        return {
          ...segment,
          questions: segment.questions.map((question) =>
            question.id === questionId ? mutate(question) : question,
          ),
        };
      });
    });
  };

  const handleRemovePracticeQuestion = (segmentId: string, questionId: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'practice') return segment;
        return {
          ...segment,
          questions: segment.questions.filter((question) => question.id !== questionId),
        };
      });
    });
  };

  const handleAddPracticeQuestion = (segmentId: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'practice') return segment;
        return {
          ...segment,
          questions: [...segment.questions, defaultPracticeQuestion()],
        };
      });
    });
  };

  const handleMovePracticeQuestion = (
    segmentId: string,
    questionId: string,
    direction: 'up' | 'down',
  ) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'practice') return segment;
        const index = segment.questions.findIndex((question) => question.id === questionId);
        const delta = direction === 'up' ? -1 : 1;
        const targetIndex = index + delta;
        if (index === -1 || targetIndex < 0 || targetIndex >= segment.questions.length) return segment;
        return {
          ...segment,
          questions: moveItem(segment.questions, index, targetIndex),
        };
      });
    });
  };

  const handlePassCriteriaChange = (
    segmentId: string,
    field: keyof typeof defaultPassCriteria,
    value: number,
  ) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'practice') return segment;
        return {
          ...segment,
          passCriteria: {
            ...segment.passCriteria,
            [field]: value,
          },
        };
      });
    });
  };

  const handleGuidedWorkspaceChange = (segmentId: string, workspace: 'golden-beads' | 'stamp-game') => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) =>
        segment.id === segmentId && segment.type === 'guided'
          ? { ...segment, workspace }
          : segment,
      );
    });
  };

  const handlePracticeWorkspaceChange = (segmentId: string, workspace: 'golden-beads' | 'stamp-game') => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) =>
        segment.id === segmentId && segment.type === 'practice'
          ? { ...segment, workspace }
          : segment,
      );
    });
  };

  const handleSegmentMaterialBankChange = (segmentId: string, bankId: string | undefined) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) =>
        segment.id === segmentId ? { ...segment, materialBankId: bankId } : segment,
      );
    });
  };

  const lessonDocument = createMemo<LessonDocument | undefined>(() => editor.state.document);

  const inventoryStore = createInventoryStore({
    editor,
    lessonDocument,
    defaultMaterialId,
  });

  createEffect(() => {
    const doc = lessonDocument();
    const segments = doc?.lesson.segments ?? [];
    if (segments.length === 0) {
      if (selectedSegmentId() !== undefined) {
        selectSegment(undefined);
      }
      return;
    }
    const current = selectedSegmentId();
    if (!current || !segments.some((segment) => segment.id === current)) {
      selectSegment(segments[0].id);
    }
  });

  const currentLessonMeta = createMemo<LessonNode | undefined>(() =>
    lessons().find((lesson) => lesson._id === selectedLessonId()),
  );
  const selectedSegment = createMemo<LessonSegment | undefined>(() => {
    const doc = lessonDocument();
    if (!doc) return undefined;
    const segmentId = selectedSegmentId();
    if (!segmentId) return undefined;
    return doc.lesson.segments.find((segment) => segment.id === segmentId);
  });

  createEffect(() => {
    const doc = lessonDocument();
    if (!doc) {
      setLessonMetaForm({ author: '', notes: '' });
      return;
    }
    setLessonMetaForm({
      author: doc.meta?.author ?? '',
      notes: doc.meta?.notes ?? '',
    });
  });

  const viewModel: EditorViewModel = {
    editor,
    options: {
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
    },
    selection: {
      selectedUnitId,
      setSelectedUnitId,
      selectedTopicId,
      setSelectedTopicId,
      selectedLessonId,
      setSelectedLessonId,
      selectedSegmentId,
      setSelectedSegmentId: selectSegment,
    },
    resources: {
      curriculumTree: () => curriculumTree() ?? undefined,
      setCurriculumTree: (tree: CurriculumTree) => {
        mutateCurriculumTree(tree);
      },
      refetchTree: async () => (await refetchTree()) ?? undefined,
      lessonRecord: () => lessonRecord() ?? undefined,
      refetchLessonRecord: async () => (await refetchLessonRecord()) ?? undefined,
    },
    forms: {
      unit: {
        form: unitForm,
        setForm: setUnitForm,
        error: unitFormError,
        setError: setUnitFormError,
      },
      topic: {
        form: topicForm,
        setForm: setTopicForm,
        error: topicFormError,
        setError: setTopicFormError,
      },
      lessonMeta: {
        form: lessonMetaForm,
        setForm: setLessonMetaForm,
      },
      createUnit: {
        form: createUnitForm,
        setForm: setCreateUnitForm,
        error: createUnitError,
        setError: setCreateUnitError,
        isCreating: isCreatingUnit,
        setIsCreating: setIsCreatingUnit,
      },
      createTopic: {
        form: createTopicForm,
        setForm: setCreateTopicForm,
        error: createTopicError,
        setError: setCreateTopicError,
        isCreating: isCreatingTopic,
        setIsCreating: setIsCreatingTopic,
      },
      createLesson: {
        form: createLessonForm,
        setForm: setCreateLessonForm,
        error: createLessonError,
        setError: setCreateLessonError,
        isCreating: isCreatingLesson,
        setIsCreating: setIsCreatingLesson,
      },
    },
    computed: {
      defaultMaterialId,
      units,
      currentUnit,
      topics,
      currentTopic,
      lessons,
      lessonDocument,
      currentLessonMeta,
      materialInventory,
      selectedSegment,
    },
    metaTab: {
      active: activeMetaTab,
      setActive: setActiveMetaTab,
   },
   confirm: {
      state: confirm.state,
      resolve: confirm.resolve,
      request: confirm.request,
   },
    actions: {
      handleSelectLesson,
      handleSave,
      handlePublish,
      handleReset,
      submitCreateUnit,
      startCreateUnit,
      cancelCreateUnit,
      handleUnitFormSubmit,
      handleDeleteUnit,
      handleMoveUnit,
      submitCreateTopic,
      startCreateTopic,
      cancelCreateTopic,
      handleTopicFormSubmit,
      handleDeleteTopic,
      handleMoveTopic,
      submitCreateLesson,
      startCreateLesson,
      cancelCreateLesson,
      handleDeleteLesson,
      handleMoveLessonOrder,
      handleLessonFieldChange,
      handleLessonDurationChange,
      handleLessonPrimaryMaterialChange,
      handleLessonSkillChange,
      handleLessonMaterialChange,
      handleAddLessonMaterial,
      handleRemoveLessonMaterial,
      handleLessonMetaChange,
      handleDocumentScenarioUpdate,
      handleSegmentScenarioUpdate,
      handleSegmentTitleChange,
      handleAddSegment,
      handleRemoveSegment,
      handleMoveSegment,
      handleSegmentSkillsChange,
      handleSegmentRepresentationChange,
      handleSegmentMaterialChange,
      handleAddSegmentMaterial,
      handleRemoveSegmentMaterial,
      handleActionTypeChange,
      handleMoveAction,
      handleRemoveAction,
      handleAddAction,
      handleUpdateAction,
      handleGuidedStepChange,
      handleRemoveGuidedStep,
      handleAddGuidedStep,
      handleMoveGuidedStep,
      handlePracticeQuestionChange,
      handleRemovePracticeQuestion,
      handleAddPracticeQuestion,
      handleMovePracticeQuestion,
      handlePassCriteriaChange,
      handleGuidedWorkspaceChange,
      handlePracticeWorkspaceChange,
      handleSegmentMaterialBankChange,
      ...inventoryStore,
      selectSegment,
    },
  };
  return viewModel;
};

const EditorStoresContext = createContext<EditorViewModel>();

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
