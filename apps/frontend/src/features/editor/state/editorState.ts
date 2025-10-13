import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  type Accessor,
  type Setter,
} from 'solid-js';
import { createStore, type SetStoreFunction } from 'solid-js/store';

import {
  createEmptyInventory,
  createLessonEditor,
  createDefaultMaterialBank,
  createDefaultTokenType,
  removeTokenFromBank,
  type LessonEditor,
} from '@monte/lesson-service';
import type {
  LessonDocument,
  LessonMaterialInventory,
  LessonSegment,
  MaterialBankDefinition,
  TokenTypeDefinition,
  WorkspaceKind,
} from '@monte/types';
import type { Id } from '@monte/types';
import {
  fetchCurriculumTree,
  fetchLessonById,
  type CurriculumTree,
  type LessonDraftRecord,
} from '@monte/api';

import type {
  CreateLessonFormState,
  LessonMetaFormState,
  TopicFormState,
  UnitFormState,
} from '../types';

const clone = <Value,>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value;

type UnitNode = CurriculumTree[number];
type TopicNode = UnitNode['topics'][number];
type LessonNode = TopicNode['lessons'][number];

export interface ConfirmRequestOptions {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ConfirmState {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

export interface ConfirmController {
  state: Accessor<ConfirmState | null>;
  resolve: (result: boolean) => void;
  request: (options: ConfirmRequestOptions) => Promise<boolean>;
}

const createConfirmController = (): ConfirmController => {
  const [confirmRequest, setConfirmRequest] = createSignal<(ConfirmState & { resolve: (result: boolean) => void }) | null>(
    null,
  );

  const request = (options: ConfirmRequestOptions) =>
    new Promise<boolean>((resolve) => {
      setConfirmRequest({
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        resolve,
      });
    });

  const resolve = (result: boolean) => {
    const current = confirmRequest();
    if (!current) return;
    current.resolve(result);
    setConfirmRequest(null);
  };

  const state = createMemo<ConfirmState | null>(() => {
    const current = confirmRequest();
    if (!current) return null;
    const { resolve: _resolve, ...rest } = current;
    void _resolve;
    return rest;
  });

  return {
    state,
    resolve,
    request,
  };
};

interface FormWithError<T> {
  form: T;
  setForm: SetStoreFunction<T>;
  error: Accessor<string | undefined>;
  setError: Setter<string | undefined>;
}

interface CreationForm<T> extends FormWithError<T> {
  isCreating: Accessor<boolean>;
  setIsCreating: Setter<boolean>;
}

interface LessonMetaForm {
  form: LessonMetaFormState;
  setForm: SetStoreFunction<LessonMetaFormState>;
}

interface EditorForms {
  unit: FormWithError<UnitFormState>;
  topic: FormWithError<TopicFormState>;
  lessonMeta: LessonMetaForm;
  createUnit: CreationForm<UnitFormState>;
  createTopic: CreationForm<TopicFormState>;
  createLesson: CreationForm<CreateLessonFormState>;
  metaTab: {
    active: Accessor<'unit' | 'topic' | 'lesson'>;
    setActive: Setter<'unit' | 'topic' | 'lesson'>;
  };
  helpers: {
    resetCreateUnitForm: () => void;
    resetCreateTopicForm: () => void;
    resetCreateLessonForm: () => void;
  };
}

const defaultUnitForm = (): UnitFormState => ({
  title: '',
  slug: '',
  summary: '',
  coverImage: '',
  status: 'active',
});

const defaultTopicForm = (): TopicFormState => ({
  title: '',
  slug: '',
  overview: '',
  focusSkills: '',
  estimatedDurationMinutes: '',
  status: 'active',
});

const defaultLessonMetaForm = (): LessonMetaFormState => ({
  author: '',
  notes: '',
});

const defaultCreateLessonForm = (): CreateLessonFormState => ({
  title: '',
  slug: '',
});

const createEditorForms = (): EditorForms => {
  const [unitForm, setUnitForm] = createStore<UnitFormState>(defaultUnitForm());
  const [unitError, setUnitError] = createSignal<string | undefined>(undefined);

  const [topicForm, setTopicForm] = createStore<TopicFormState>(defaultTopicForm());
  const [topicError, setTopicError] = createSignal<string | undefined>(undefined);

  const [lessonMetaForm, setLessonMetaForm] = createStore<LessonMetaFormState>(defaultLessonMetaForm());

  const [activeMetaTab, setActiveMetaTab] = createSignal<'unit' | 'topic' | 'lesson'>('unit');

  const [createUnitForm, setCreateUnitForm] = createStore<UnitFormState>(defaultUnitForm());
  const [createUnitError, setCreateUnitError] = createSignal<string | undefined>(undefined);
  const [isCreatingUnit, setIsCreatingUnit] = createSignal(false);

  const [createTopicForm, setCreateTopicForm] = createStore<TopicFormState>(defaultTopicForm());
  const [createTopicError, setCreateTopicError] = createSignal<string | undefined>(undefined);
  const [isCreatingTopic, setIsCreatingTopic] = createSignal(false);

  const [createLessonForm, setCreateLessonForm] = createStore<CreateLessonFormState>(defaultCreateLessonForm());
  const [createLessonError, setCreateLessonError] = createSignal<string | undefined>(undefined);
  const [isCreatingLesson, setIsCreatingLesson] = createSignal(false);

  const resetCreateUnitForm = () => {
    setCreateUnitForm(defaultUnitForm());
    setCreateUnitError(undefined);
  };

  const resetCreateTopicForm = () => {
    setCreateTopicForm(defaultTopicForm());
    setCreateTopicError(undefined);
  };

  const resetCreateLessonForm = () => {
    setCreateLessonForm(defaultCreateLessonForm());
    setCreateLessonError(undefined);
  };

  return {
    unit: {
      form: unitForm,
      setForm: setUnitForm,
      error: unitError,
      setError: setUnitError,
    },
    topic: {
      form: topicForm,
      setForm: setTopicForm,
      error: topicError,
      setError: setTopicError,
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
    metaTab: {
      active: activeMetaTab,
      setActive: setActiveMetaTab,
    },
    helpers: {
      resetCreateUnitForm,
      resetCreateTopicForm,
      resetCreateLessonForm,
    },
  };
};

export interface InventorySnapshotRegistration {
  snapshot?: () => LessonMaterialInventory;
  verify?: () => void;
}

interface InventoryStore {
  registerInventorySnapshot: (options?: InventorySnapshotRegistration) => void;
  applyInventorySnapshot: () => void;
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
}

const createInventoryStore = ({
  editor,
  lessonDocument,
  defaultMaterialId,
}: {
  editor: LessonEditor;
  lessonDocument: Accessor<LessonDocument | undefined>;
  defaultMaterialId: string;
}): InventoryStore => {
  let resolveInventorySnapshot: (() => LessonMaterialInventory) | undefined;
  let resolveInventoryVerifier: (() => void) | undefined;

  const registerInventorySnapshot = (options?: InventorySnapshotRegistration) => {
    resolveInventorySnapshot = options?.snapshot;
    resolveInventoryVerifier = options?.verify;
  };

  const applyInventorySnapshot = () => {
    if (resolveInventoryVerifier) {
      resolveInventoryVerifier();
    }
    if (!resolveInventorySnapshot) return;
    const snapshot = resolveInventorySnapshot();
    if (!snapshot) return;
    editor.applyUpdate((draft) => {
      draft.lesson.materialInventory = clone(snapshot);
    });
  };

  const handleInventoryUpdate = (
    mutator: (inventory: LessonMaterialInventory) => LessonMaterialInventory,
  ) => {
    editor.applyInventoryUpdate((currentInventory) => mutator(clone(currentInventory)));
  };

  const handleAddTokenType = () => {
    handleInventoryUpdate((inventory) => {
      const fallbackMaterial = inventory.tokenTypes[0]?.materialId ?? defaultMaterialId;
      const segments = lessonDocument()?.lesson.segments ?? [];
      const firstWorkspaceSegment = segments.find(
        (segment): segment is LessonSegment & { workspace: WorkspaceKind } => 'workspace' in segment,
      );
      const fallbackWorkspace: WorkspaceKind =
        inventory.tokenTypes[0]?.workspace ?? firstWorkspaceSegment?.workspace ?? 'golden-beads';
      const token = createDefaultTokenType(fallbackMaterial, fallbackWorkspace);
      return {
        ...inventory,
        tokenTypes: [...inventory.tokenTypes, token],
      };
    });
  };

  const handleUpdateTokenType = (
    tokenId: string,
    mutate: (token: TokenTypeDefinition) => TokenTypeDefinition,
  ) => {
    handleInventoryUpdate((inventory) => ({
      ...inventory,
      tokenTypes: inventory.tokenTypes.map((token) =>
        token.id === tokenId ? mutate(clone(token)) : token,
      ),
    }));
  };

  const handleRemoveTokenType = (tokenId: string) => {
    handleInventoryUpdate((inventory) => ({
      ...inventory,
      tokenTypes: inventory.tokenTypes.filter((token) => token.id !== tokenId),
      banks: inventory.banks.map((bank) => removeTokenFromBank(bank, tokenId)),
    }));
  };

  const handleAddMaterialBank = (scope: 'lesson' | 'segment' = 'lesson', segmentId?: string) => {
    handleInventoryUpdate((inventory) => {
      const segments = lessonDocument()?.lesson.segments ?? [];
      const resolvedSegmentId = scope === 'segment' ? segmentId ?? segments[0]?.id : undefined;
      const accepts = inventory.tokenTypes.length > 0 ? [inventory.tokenTypes[0].id] : [];
      const bank = createDefaultMaterialBank({
        materialId: defaultMaterialId,
        scope,
        segmentId: resolvedSegmentId,
        accepts,
        initialQuantity: 0,
      });
      return {
        ...inventory,
        banks: [...inventory.banks, bank],
      };
    });
  };

  const handleUpdateMaterialBank = (
    bankId: string,
    mutate: (bank: MaterialBankDefinition) => MaterialBankDefinition,
  ) => {
    handleInventoryUpdate((inventory) => ({
      ...inventory,
      banks: inventory.banks.map((bank) => (bank.id === bankId ? mutate(clone(bank)) : bank)),
    }));
  };

  const handleRemoveMaterialBank = (bankId: string) => {
    handleInventoryUpdate((inventory) => ({
      ...inventory,
      banks: inventory.banks.filter((bank) => bank.id !== bankId),
    }));
  };

  return {
    registerInventorySnapshot,
    applyInventorySnapshot,
    handleAddTokenType,
    handleUpdateTokenType,
    handleRemoveTokenType,
    handleAddMaterialBank,
    handleUpdateMaterialBank,
    handleRemoveMaterialBank,
  };
};

interface SelectionStore {
  selectedUnitId: Accessor<Id<'units'> | undefined>;
  setSelectedUnitId: Setter<Id<'units'> | undefined>;
  selectedTopicId: Accessor<Id<'topics'> | undefined>;
  setSelectedTopicId: Setter<Id<'topics'> | undefined>;
  selectedLessonId: Accessor<Id<'lessons'> | undefined>;
  setSelectedLessonId: Setter<Id<'lessons'> | undefined>;
  selectedSegmentId: Accessor<string | undefined>;
  setSelectedSegmentId: (segmentId: string | undefined) => void;
  selectSegment: (segmentId: string | undefined) => void;
  units: Accessor<UnitNode[]>;
  currentUnit: Accessor<UnitNode | undefined>;
  topics: Accessor<TopicNode[]>;
  currentTopic: Accessor<TopicNode | undefined>;
  lessons: Accessor<LessonNode[]>;
}

const createSelectionStore = ({
  curriculumTree,
  editor,
  selectedSegmentId,
  setSelectedSegmentId,
  resetTopicCreation,
  resetLessonCreation,
}: {
  curriculumTree: Accessor<CurriculumTree | undefined>;
  editor: LessonEditor;
  selectedSegmentId: Accessor<string | undefined>;
  setSelectedSegmentId: (segmentId: string | undefined) => void;
  resetTopicCreation: () => void;
  resetLessonCreation: () => void;
}): SelectionStore => {
  const [selectedUnitId, setSelectedUnitId] = createSignal<Id<'units'> | undefined>();
  const [selectedTopicId, setSelectedTopicId] = createSignal<Id<'topics'> | undefined>();
  const [selectedLessonId, setSelectedLessonId] = createSignal<Id<'lessons'> | undefined>();

  const units = createMemo<UnitNode[]>(() => curriculumTree() ?? []);
  const currentUnit = createMemo<UnitNode | undefined>(() =>
    units().find((unit) => unit._id === selectedUnitId()),
  );

  createEffect(() => {
    const tree = curriculumTree();
    if (!tree || tree.length === 0) return;
    const current = selectedUnitId();
    if (!current || !tree.some((unit) => unit._id === current)) {
      setSelectedUnitId(tree[0]._id);
    }
  });

  createEffect(() => {
    const unit = currentUnit();
    if (!unit) {
      setSelectedTopicId(undefined);
      setSelectedLessonId(undefined);
      resetTopicCreation();
      resetLessonCreation();
      return;
    }
    const current = selectedTopicId();
    if (!current || unit.topics.every((topic) => topic._id !== current)) {
      const firstTopic = unit.topics[0];
      setSelectedTopicId(firstTopic?._id);
      setSelectedLessonId(firstTopic?.lessons[0]?._id);
    }
  });

  const topics = createMemo<TopicNode[]>(() => currentUnit()?.topics ?? []);
  const currentTopic = createMemo<TopicNode | undefined>(() =>
    topics().find((topic) => topic._id === selectedTopicId()),
  );

  createEffect(() => {
    const topic = currentTopic();
    if (!topic) {
      setSelectedLessonId(undefined);
      resetLessonCreation();
      return;
    }
    const current = selectedLessonId();
    if (!current || topic.lessons.every((lesson) => lesson._id !== current)) {
      setSelectedLessonId(topic.lessons[0]?._id);
    }
  });

  const lessons = createMemo<LessonNode[]>(() => currentTopic()?.lessons ?? []);

  const selectSegment = (segmentId: string | undefined) => {
    const previous = selectedSegmentId();
    if (previous !== segmentId) {
      setSelectedSegmentId(segmentId);
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
    selectedSegmentId,
    setSelectedSegmentId,
    selectSegment,
    units,
    currentUnit,
    topics,
    currentTopic,
    lessons,
  };
};

export interface EditorDocumentState {
  lessonDocument: Accessor<LessonDocument | undefined>;
  materialInventory: Accessor<LessonMaterialInventory>;
  selectedSegmentId: Accessor<string | undefined>;
  selectedSegment: Accessor<LessonSegment | undefined>;
}

export interface EditorResources {
  curriculumTree: Accessor<CurriculumTree | undefined>;
  setCurriculumTree: (tree: CurriculumTree) => void;
  updateCurriculumTree: (mutator: (tree: CurriculumTree) => CurriculumTree) => void;
  refetchTree: () => Promise<CurriculumTree | undefined>;
  lessonRecord: Accessor<LessonDraftRecord | undefined>;
  refetchLessonRecord: () => Promise<LessonDraftRecord | undefined>;
  refreshLessonAndTree: () => Promise<void>;
}

export interface EditorState {
  defaultMaterialId: string;
  editor: LessonEditor;
  document: EditorDocumentState;
  inventory: InventoryStore;
  selection: SelectionStore;
  forms: EditorForms;
  resources: EditorResources;
  confirm: {
    controller: ConfirmController;
    ensureLessonNavigationAllowed: (
      nextLessonId: Id<'lessons'>,
      currentLessonId: Id<'lessons'> | undefined,
    ) => Promise<boolean>;
    confirmReset: () => Promise<boolean>;
  };
}

export const createEditorState = (): EditorState => {
  const defaultMaterialId = 'golden-beads';
  const editor: LessonEditor = createLessonEditor();
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

  const forms = createEditorForms();

  const confirmController = createConfirmController();

  const [
    curriculumTreeResource,
    { mutate: mutateCurriculumTree, refetch: refetchTree },
  ] = createResource<CurriculumTree | undefined>(fetchCurriculumTree);

  const selection = createSelectionStore({
    curriculumTree: () => curriculumTreeResource() ?? undefined,
    editor,
    selectedSegmentId,
    setSelectedSegmentId,
    resetTopicCreation: () => {
      forms.createTopic.setIsCreating(false);
      forms.helpers.resetCreateTopicForm();
    },
    resetLessonCreation: () => {
      forms.createLesson.setIsCreating(false);
      forms.helpers.resetCreateLessonForm();
    },
  });

  const [lessonRecordResource, { refetch: refetchLessonRecord }] = createResource<
    LessonDraftRecord | undefined,
    Id<'lessons'> | undefined
  >(
    selection.selectedLessonId,
    async (lessonId) => {
      if (!lessonId) return undefined;
      const record = await fetchLessonById(lessonId);
      return record ?? undefined;
    },
  );

  const setCurriculumTree = (tree: CurriculumTree) => {
    mutateCurriculumTree?.(tree);
  };

  const updateCurriculumTree = (mutator: (tree: CurriculumTree) => CurriculumTree) => {
    const current = curriculumTreeResource();
    if (!current) return;
    const next = mutator(clone(current));
    mutateCurriculumTree?.(next);
  };

  const inventory: InventoryStore = createInventoryStore({
    editor,
    lessonDocument,
    defaultMaterialId,
  });

  let lastLoadedLessonId: Id<'lessons'> | undefined;
  createEffect(() => {
    const record = lessonRecordResource();
    if (!record) return;
    if (record._id === lastLoadedLessonId && editor.state.dirty) return;
    editor.loadDocument(record.draft);
    lastLoadedLessonId = record._id;
  });

  createEffect(() => {
    const unit = selection.currentUnit();
    if (!unit) return;
    forms.unit.setForm({
      title: unit.title,
      slug: unit.slug,
      summary: unit.summary ?? '',
      coverImage: unit.coverImage ?? '',
      status: unit.status,
    });
    forms.unit.setError(undefined);
  });

  createEffect(() => {
    const topic = selection.currentTopic();
    if (!topic) return;
    forms.topic.setForm({
      title: topic.title,
      slug: topic.slug,
      overview: topic.overview ?? '',
      focusSkills: (topic.focusSkills ?? []).join(', '),
      estimatedDurationMinutes: topic.estimatedDurationMinutes?.toString() ?? '',
      status: topic.status,
    });
    forms.topic.setError(undefined);
  });

  createEffect(() => {
    const document = lessonDocument();
    if (!document) {
      forms.lessonMeta.setForm({ author: '', notes: '' });
      return;
    }
    forms.lessonMeta.setForm({
      author: document.meta?.author ?? '',
      notes: document.meta?.notes ?? '',
    });
  });

  createEffect(() => {
    const tab = forms.metaTab.active();
    const topic = selection.currentTopic();
    const document = lessonDocument();
    if (tab === 'lesson' && !document) {
      forms.metaTab.setActive(topic ? 'topic' : 'unit');
    } else if (tab === 'topic' && !topic) {
      forms.metaTab.setActive('unit');
    }
  });

  const confirm = {
    controller: confirmController,
    ensureLessonNavigationAllowed: async (
      nextLessonId: Id<'lessons'>,
      currentLessonId: Id<'lessons'> | undefined,
    ) => {
      if (!editor.state.dirty) return true;
      if (currentLessonId && currentLessonId === nextLessonId) return true;
      return await confirmController.request({
        message: 'You have unsaved changes. Navigating away will discard them. Continue?',
        confirmLabel: 'Discard changes',
        cancelLabel: 'Stay here',
      });
    },
    confirmReset: async () => {
      if (!editor.state.dirty) return true;
      return await confirmController.request({
        message: 'Discard unsaved changes?',
        confirmLabel: 'Discard',
        cancelLabel: 'Cancel',
      });
    },
  };

  const resources: EditorResources = {
    curriculumTree: () => curriculumTreeResource() ?? undefined,
    setCurriculumTree,
    updateCurriculumTree,
    refetchTree: async () => (await refetchTree()) ?? undefined,
    lessonRecord: () => lessonRecordResource() ?? undefined,
    refetchLessonRecord: async () => (await refetchLessonRecord()) ?? undefined,
    refreshLessonAndTree: async () => {
      await Promise.all([refetchLessonRecord(), refetchTree()]);
    },
  };

  return {
    defaultMaterialId,
    editor,
    document: {
      lessonDocument,
      materialInventory,
      selectedSegmentId,
      selectedSegment,
    },
    inventory,
    selection,
    forms,
    resources,
    confirm,
  };
};
