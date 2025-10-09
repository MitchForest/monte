import {
  For,
  Show,
  createEffect,
  createMemo,
  createResource,
  createSignal,
} from 'solid-js';
import { createStore } from 'solid-js/store';

import type { Id } from '../../../backend/convex/_generated/dataModel';
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
} from '../curriculum/api/curriculumClient';
import type {
  GuidedEvaluatorId,
  GuidedStep,
  LessonDocument,
  PracticeQuestion,
  PresentationAction,
} from '../curriculum/types';
import { createLessonEditor } from '../curriculum/state/lessonEditor';
import { curriculumMaterials } from '../curriculum/materials';
import { Button, Card, Chip, PageSection } from '../design-system';

const DEFAULT_MATERIAL_ID = curriculumMaterials[0]?.id ?? 'golden-beads';

const actionTypeOptions = [
  { value: 'narrate', label: 'Narration' },
  { value: 'showCard', label: 'Show card' },
  { value: 'placeBeads', label: 'Place beads' },
  { value: 'duplicateTray', label: 'Duplicate tray' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'moveBeadsBelowLine', label: 'Move beads below line' },
  { value: 'groupForExchange', label: 'Group for exchange' },
  { value: 'exchangeBeads', label: 'Exchange beads' },
  { value: 'placeResultCard', label: 'Place result card' },
  { value: 'stackPlaceValues', label: 'Stack place values' },
  { value: 'writeResult', label: 'Write result' },
  { value: 'highlight', label: 'Highlight' },
  { value: 'showStamp', label: 'Show stamp' },
  { value: 'countTotal', label: 'Count total' },
] as const;

const guidedEvaluatorOptions: GuidedEvaluatorId[] = [
  'golden-beads-build-base',
  'golden-beads-duplicate',
  'golden-beads-exchange-units',
  'golden-beads-exchange-tens',
  'golden-beads-exchange-hundreds',
  'golden-beads-stack-result',
  'stamp-game-build',
  'stamp-game-repeat-columns',
  'stamp-game-exchange',
  'stamp-game-read-result',
];

const positionOptions = ['paper', 'multiplicand-stack', 'multiplier'] as const;
const beadPlaceOptions = ['thousand', 'hundred', 'ten', 'unit'] as const;
const exchangeFromOptions = ['unit', 'ten', 'hundred'] as const;
const exchangeToOptions = ['ten', 'hundred', 'thousand'] as const;
const representationOptions = [
  { value: 'concrete', label: 'Concrete' },
  { value: 'abstract', label: 'Abstract' },
] as const;
const workspaceOptions = [
  { value: 'golden-beads', label: 'Golden beads' },
  { value: 'stamp-game', label: 'Stamp game' },
] as const;
const difficultyOptions = ['easy', 'medium', 'hard'] as const;
const scenarioKindOptions = ['golden-beads', 'stamp-game'] as const;

interface UnitFormState {
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  status: 'active' | 'archived';
}

interface TopicFormState {
  title: string;
  slug: string;
  overview: string;
  focusSkills: string;
  estimatedDurationMinutes: string;
  status: 'active' | 'archived';
}

interface LessonMetaFormState {
  author: string;
  notes: string;
}

type LessonSegment = LessonDocument['lesson']['segments'][number];
type LessonScenario = NonNullable<LessonDocument['lesson']['segments'][number]['scenario']>;
type PresentationSegmentType = Extract<LessonSegment, { type: 'presentation' }>;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const moveItem = <T,>(items: readonly T[], from: number, to: number): T[] => {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const generateId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${(crypto.randomUUID() as string).slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const validateLessonDocument = (document: LessonDocument): string[] => {
  const errors: string[] = [];
  const lesson = document.lesson;

  if (!lesson.title.trim()) {
    errors.push('Lesson title is required');
  }

  if (!lesson.segments.length) {
    errors.push('Add at least one segment');
  }

  lesson.segments.forEach((segment, index) => {
    if (!segment.title.trim()) {
      errors.push(`Segment ${index + 1} is missing a title`);
    }
    if (!segment.materials || segment.materials.length === 0) {
      errors.push(`Segment ${index + 1} needs at least one material`);
    }
    if (!segment.skills || segment.skills.length === 0) {
      errors.push(`Segment ${index + 1} should reference at least one skill`);
    }

    if (segment.type === 'presentation') {
      if (!segment.script || segment.script.actions.length === 0) {
        errors.push(`Presentation segment "${segment.title}" needs at least one script action`);
      }
    }

    if (segment.type === 'guided') {
      if (!segment.steps.length) {
        errors.push(`Guided segment "${segment.title}" requires at least one step`);
      }
    }

    if (segment.type === 'practice') {
      if (!segment.questions.length) {
        errors.push(`Practice segment "${segment.title}" needs at least one question`);
      }
      if (!segment.passCriteria) {
        errors.push(`Practice segment "${segment.title}" is missing pass criteria`);
      }
    }
  });

  return errors;
};

const createPresentationAction = (
  type: (typeof actionTypeOptions)[number]['value'],
  id: string = generateId(`action-${type}`),
) : PresentationAction => {
  const common = {
    id,
    durationMs: undefined,
    authoring: undefined,
  } as const;

  switch (type) {
    case 'narrate':
      return {
        ...common,
        type: 'narrate' as const,
        text: '',
      };
    case 'showCard':
      return {
        ...common,
        type: 'showCard' as const,
        card: '',
        position: 'paper' as const,
      };
    case 'placeBeads':
      return {
        ...common,
        type: 'placeBeads' as const,
        place: 'unit' as const,
        quantity: 1,
        tray: 1,
      };
    case 'duplicateTray':
      return {
        ...common,
        type: 'duplicateTray' as const,
        count: 2,
      };
    case 'exchange':
      return {
        ...common,
        type: 'exchange' as const,
        from: 'unit' as const,
        to: 'ten' as const,
        quantity: 10,
        remainder: 0,
      };
    case 'stackPlaceValues':
      return {
        ...common,
        type: 'stackPlaceValues' as const,
        order: ['thousand', 'hundred', 'ten', 'unit'] as const,
      };
    case 'writeResult':
      return {
        ...common,
        type: 'writeResult' as const,
        value: '',
      };
    case 'highlight':
      return {
        ...common,
        type: 'highlight' as const,
        target: '',
        text: '',
      };
    case 'showStamp':
      return {
        ...common,
        type: 'showStamp' as const,
        stamp: '1' as const,
        columns: 1,
        rows: 1,
      };
    case 'countTotal':
      return {
        ...common,
        type: 'countTotal' as const,
        value: '',
      };
    case 'moveBeadsBelowLine':
      return {
        ...common,
        type: 'moveBeadsBelowLine' as const,
        place: 'unit' as const,
        totalCount: 0,
      };
    case 'groupForExchange':
      return {
        ...common,
        type: 'groupForExchange' as const,
        place: 'unit' as const,
        groupsOfTen: 0,
        remainder: 0,
      };
    case 'exchangeBeads':
      return {
        ...common,
        type: 'exchangeBeads' as const,
        from: 'unit' as const,
        to: 'ten' as const,
        groupsOfTen: 0,
      };
    case 'placeResultCard':
      return {
        ...common,
        type: 'placeResultCard' as const,
        place: 'unit' as const,
        value: 0,
      };
    default:
      return {
        ...common,
        type: 'narrate' as const,
        text: '',
      };
  }
};

const defaultPracticeQuestion = (): PracticeQuestion => ({
  id: generateId('question'),
  multiplicand: 100,
  multiplier: 2,
  prompt: 'Solve 100 × 2.',
  correctAnswer: 200,
  difficulty: 'easy' as const,
  authoring: undefined,
});

const defaultPassCriteria = {
  type: 'threshold' as const,
  firstCorrect: 2,
  totalCorrect: 3,
  maxMisses: 3,
};

const defaultGuidedStep = (
  workspace: 'golden-beads' | 'stamp-game',
): GuidedStep & { evaluatorId: GuidedEvaluatorId } => ({
  id: generateId('step'),
  prompt: 'Describe the guided action.',
  expectation: 'Expectation description.',
  successCheck: 'Success criteria.',
  nudge: 'Helpful hint to guide the learner.',
  explanation: undefined,
  durationMs: undefined,
  authoring: undefined,
  evaluatorId: (workspace === 'stamp-game'
    ? 'stamp-game-build'
    : 'golden-beads-build-base') as GuidedEvaluatorId,
});

const createSegment = (type: LessonSegment['type']) => {
  const baseId = generateId(`segment-${type}`);
  if (type === 'presentation') {
    return {
      id: baseId,
      title: 'New presentation segment',
      description: '',
      type: 'presentation' as const,
      representation: 'concrete' as const,
      primaryMaterialId: DEFAULT_MATERIAL_ID,
      materials: [],
      skills: [],
      scriptId: `script-${baseId}`,
      script: {
        id: `script-${baseId}`,
        title: 'Presentation script',
        summary: '',
        actions: [createPresentationAction('narrate')],
      },
      scenario: { kind: 'golden-beads' as const, seed: Date.now() },
    } satisfies LessonSegment & { type: 'presentation' };
  }
  if (type === 'guided') {
    return {
      id: baseId,
      title: 'New guided segment',
      description: '',
      type: 'guided' as const,
      representation: 'concrete' as const,
      materials: [],
      skills: [],
      workspace: 'golden-beads' as const,
      steps: [defaultGuidedStep('golden-beads')],
      scenario: { kind: 'golden-beads' as const, seed: Date.now() },
    } satisfies LessonSegment & { type: 'guided' };
  }
  return {
    id: baseId,
    title: 'New practice segment',
    description: '',
    type: 'practice' as const,
    representation: 'concrete' as const,
    materials: [],
    skills: [],
    workspace: 'golden-beads' as const,
    questions: [defaultPracticeQuestion()],
    passCriteria: { ...defaultPassCriteria },
    scenario: { kind: 'golden-beads' as const, seed: Date.now() },
  } satisfies LessonSegment & { type: 'practice' };
};

const ensurePresentationScript = (segment: LessonSegment & { type: 'presentation' }) => {
  if (!segment.script) {
    segment.script = {
      id: segment.scriptId ?? `script-${segment.id}`,
      title: segment.title,
      summary: '',
      actions: [],
    };
  }
  return segment.script;
};

type CurriculumTree = Awaited<ReturnType<typeof fetchCurriculumTree>>;
type UnitNode = CurriculumTree[number];
type TopicNode = UnitNode['topics'][number];
type LessonNode = TopicNode['lessons'][number];

const Editor = () => {
  const editor = createLessonEditor();
  const [curriculumTree, { mutate: setCurriculumTree, refetch: refetchTree }] =
    createResource(fetchCurriculumTree);

  const [selectedUnitId, setSelectedUnitId] = createSignal<Id<'units'> | undefined>();
  const [selectedTopicId, setSelectedTopicId] = createSignal<Id<'topics'> | undefined>();
  const [selectedLessonId, setSelectedLessonId] = createSignal<Id<'lessons'> | undefined>();

  createEffect(() => {
    const tree = curriculumTree();
    if (!tree || tree.length === 0) return;
    if (!selectedUnitId() || !tree.some((unit) => unit._id === selectedUnitId())) {
      setSelectedUnitId(tree[0]._id);
    }
  });

  const units = createMemo(() => curriculumTree() ?? []);
  const currentUnit = createMemo(() => units().find((unit) => unit._id === selectedUnitId()));

  createEffect(() => {
    const unit = currentUnit();
    if (!unit) {
      setSelectedTopicId(undefined);
      setSelectedLessonId(undefined);
      setIsCreatingTopic(false);
      setIsCreatingLesson(false);
      return;
    }
    if (!selectedTopicId() || unit.topics.every((topic) => topic._id !== selectedTopicId())) {
      const firstTopic = unit.topics[0];
      setSelectedTopicId(firstTopic?._id);
      setSelectedLessonId(firstTopic?.lessons[0]?._id);
    }
  });

  const topics = createMemo(() => currentUnit()?.topics ?? []);
  const currentTopic = createMemo(() => topics().find((topic) => topic._id === selectedTopicId()));

  createEffect(() => {
    const topic = currentTopic();
    if (!topic) {
      setSelectedLessonId(undefined);
      setIsCreatingLesson(false);
      return;
    }
    if (!selectedLessonId() || topic.lessons.every((lesson) => lesson._id !== selectedLessonId())) {
      setSelectedLessonId(topic.lessons[0]?._id);
    }
  });

  const lessons = createMemo(() => currentTopic()?.lessons ?? []);

  const updateCurriculumTree = (mutator: (tree: CurriculumTree) => CurriculumTree) => {
    const tree = curriculumTree();
    if (!tree) return;
    setCurriculumTree(mutator(clone(tree)));
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
  const [createLessonForm, setCreateLessonForm] = createStore({
    title: '',
    slug: '',
  });
  const [createLessonError, setCreateLessonError] = createSignal<string | undefined>(undefined);

  const [lessonRecord, { refetch: refetchLessonRecord }] = createResource(
    () => selectedLessonId(),
    async (lessonId) => {
      if (!lessonId) return undefined;
      return await fetchLessonById(lessonId);
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
    editor.loadDocument(record.draft as LessonDocument);
    lastLoadedLessonId = record._id;
  });

  const handleSelectLesson = (lessonId: Id<'lessons'>) => {
    if (editor.state.dirty && lessonId !== selectedLessonId()) {
      const confirmNavigation = window.confirm(
        'You have unsaved changes. Navigating away will discard them. Continue?',
      );
      if (!confirmNavigation) return;
    }
    setSelectedLessonId(lessonId);
  };

  const refreshLessonAndTree = async () => {
    await Promise.all([refetchLessonRecord(), refetchTree()]);
  };

  const handleSave = async () => {
    const lessonId = selectedLessonId();
    const document = editor.state.document;
    if (!lessonId || !document) return;
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
    } catch (error) {
      editor.setError((error as Error).message);
    }
  };

  const handlePublish = async () => {
    const lessonId = selectedLessonId();
    const document = editor.state.document;
    if (!lessonId || !document) return;
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
    } catch (error) {
      editor.setError((error as Error).message);
    }
  };

  const handleReset = () => {
    if (editor.state.dirty) {
      const confirmReset = window.confirm('Discard unsaved changes?');
      if (!confirmReset) return;
    }
    editor.resetToInitial();
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
    } catch (error) {
      setCreateUnitError((error as Error).message);
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
    } catch (error) {
      setUnitFormError((error as Error).message);
    }
  };

  const handleDeleteUnit = async (unit: UnitNode) => {
    const confirmDelete = window.confirm(
      `Delete unit "${unit.title}" and all nested topics/lessons?`,
    );
    if (!confirmDelete) return;
    const currentUnits = units();
    const index = currentUnits.findIndex((item) => item._id === unit._id);
    const fallbackUnit = currentUnits[index + 1] ?? currentUnits[index - 1];
    await deleteUnit(unit._id);
    updateCurriculumTree((tree) => tree.filter((item) => item._id !== unit._id));
    void refetchTree();
    setSelectedUnitId(fallbackUnit?._id);
    setSelectedTopicId(undefined);
    setSelectedLessonId(undefined);
  };

  const handleMoveUnit = async (unitId: Id<'units'>, direction: -1 | 1) => {
    const currentUnits = units();
    const index = currentUnits.findIndex((unit) => unit._id === unitId);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= currentUnits.length) return;
    const reordered = moveItem(currentUnits, index, targetIndex);
    await reorderUnits(reordered.map((unit) => unit._id));
    updateCurriculumTree((tree) => moveItem(tree, index, targetIndex));
    void refetchTree();
    setSelectedUnitId(unitId);
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
    } catch (error) {
      setCreateTopicError((error as Error).message);
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
    } catch (error) {
      setTopicFormError((error as Error).message);
    }
  };

  const handleDeleteTopic = async (topic: TopicNode) => {
    const confirmDelete = window.confirm(
      `Delete topic "${topic.title}" and all nested lessons?`,
    );
    if (!confirmDelete) return;
    const topicList = topics();
    const index = topicList.findIndex((item) => item._id === topic._id);
    const fallbackTopic = topicList[index + 1] ?? topicList[index - 1];
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
    void refetchTree();
    setSelectedTopicId(fallbackTopic?._id);
    setSelectedLessonId(undefined);
  };

  const handleMoveTopic = async (topicId: Id<'topics'>, direction: -1 | 1) => {
    const unitId = selectedUnitId();
    if (!unitId) return;
    const topicList = topics();
    const index = topicList.findIndex((topic) => topic._id === topicId);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= topicList.length) return;
    const reordered = moveItem(topicList, index, targetIndex);
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
    void refetchTree();
    setSelectedTopicId(topicId);
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
    } catch (error) {
      setCreateLessonError((error as Error).message);
    }
  };

  const handleDeleteLesson = async (lesson: LessonNode) => {
    const confirmDelete = window.confirm(`Delete lesson "${lesson.title}"?`);
    if (!confirmDelete) return;
    const lessonList = lessons();
    const index = lessonList.findIndex((item) => item._id === lesson._id);
    const fallbackLesson = lessonList[index + 1] ?? lessonList[index - 1];
    const unitId = selectedUnitId();
    const topicId = selectedTopicId();
    if (!unitId || !topicId) return;
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
    void refetchTree();
    setSelectedLessonId(fallbackLesson?._id);
    if (!fallbackLesson) {
      editor.resetToInitial();
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
    void refetchTree();
    setSelectedLessonId(lessonId);
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
        { materialId: DEFAULT_MATERIAL_ID, purpose: '', optional: false },
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
        const fallbackScenario: LessonScenario = { kind: 'golden-beads', seed: Date.now() };
        return {
          ...segment,
          scenario: updater(segment.scenario ?? fallbackScenario),
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
      draft.lesson.segments = [...draft.lesson.segments, createSegment(type)];
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
                { materialId: DEFAULT_MATERIAL_ID, purpose: '', optional: false },
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
    actionType: (typeof actionTypeOptions)[number]['value'],
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

  const handleAddAction = (segmentId: string, type: (typeof actionTypeOptions)[number]['value']) => {
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
              action.id === actionId ? mutate(clone(action)) : action,
            ),
          },
        };
      });
    });
  };

  const handleGuidedStepChange = (
    segmentId: string,
    stepId: string,
    mutate: (
      step: GuidedStep & { evaluatorId: GuidedEvaluatorId },
    ) => GuidedStep & { evaluatorId: GuidedEvaluatorId },
  ) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'guided') return segment;
        return {
          ...segment,
          steps: segment.steps.map((step) => (step.id === stepId ? mutate(clone(step)) : step)),
        };
      });
    });
  };

  const handleRemoveGuidedStep = (segmentId: string, stepId: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'guided') return segment;
        if (segment.steps.length <= 1) return segment;
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
            question.id === questionId ? mutate(clone(question)) : question,
          ),
        };
      });
    });
  };

  const handleRemovePracticeQuestion = (segmentId: string, questionId: string) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== 'practice') return segment;
        if (segment.questions.length <= 1) return segment;
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

  const handleMovePracticeQuestion = (segmentId: string, questionId: string, direction: 'up' | 'down') => {
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

  const handlePassCriteriaChange = (segmentId: string, field: keyof typeof defaultPassCriteria, value: number) => {
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

  const lessonDocument = createMemo(() => editor.state.document);
  const currentLessonMeta = createMemo(() => lessons().find((lesson) => lesson._id === selectedLessonId()));

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

  return (
    <div class="min-h-screen bg-shell px-4 pb-16 pt-16">
      <PageSection class="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <h1 class="text-3xl font-semibold">Lesson Editor</h1>
            <p class="text-muted text-sm">
              Manage units, topics, and lessons with full draft and publish controls.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="secondary" size="compact" onClick={handleReset}>
              Reset draft
            </Button>
            <Button variant="secondary" size="compact" disabled={!editor.canUndo()} onClick={editor.undo}>
              Undo
            </Button>
            <Button variant="secondary" size="compact" disabled={!editor.canRedo()} onClick={editor.redo}>
              Redo
            </Button>
            <Button
              variant="secondary"
              size="compact"
              disabled={!selectedLessonId()}
              onClick={() => void handlePublish()}
            >
              Publish
            </Button>
            <Button onClick={() => void handleSave()} disabled={!editor.state.dirty || !selectedLessonId()}>
              Save
            </Button>
          </div>
        </header>

        <div class="grid gap-6 lg:grid-cols-[280px,1fr]">
          <aside class="flex flex-col gap-4 lg:sticky lg:top-28">
            <Card variant="soft" class="flex flex-col gap-3 p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-xs font-semibold uppercase tracking-wide text-muted">Units</h2>
                  <p class="text-xs text-muted">Reorder or jump between units.</p>
                </div>
                <Button
                  size="compact"
                  variant="secondary"
                  onClick={() => (isCreatingUnit() ? cancelCreateUnit() : startCreateUnit())}
                >
                  {isCreatingUnit() ? 'Close' : 'New unit'}
                </Button>
              </div>
              <Show when={units().length > 0} fallback={<p class="text-xs text-muted">No units yet.</p>}>
                <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
                  <For each={units()}>
                    {(unit, index) => (
                      <div
                        class={`rounded-md border px-3 py-2 text-sm shadow-sm transition-colors ${
                          unit._id === selectedUnitId()
                            ? 'border-[rgba(64,157,233,0.8)] bg-[rgba(233,245,251,0.6)]'
                            : 'border-[rgba(64,157,233,0.2)] bg-white hover:border-[rgba(64,157,233,0.4)]'
                        }`}
                        onClick={() => {
                          if (editor.state.dirty && unit._id !== selectedUnitId()) {
                            const confirmNavigation = window.confirm(
                              'You have unsaved changes. Navigating away will discard them. Continue?',
                            );
                            if (!confirmNavigation) return;
                          }
                          setSelectedUnitId(unit._id);
                        }}
                      >
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex flex-col">
                            <span class="font-medium">{unit.title}</span>
                            <span class="text-xs text-muted">/{unit.slug}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <Button
                              size="compact"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleMoveUnit(unit._id, -1);
                              }}
                              disabled={index() === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              size="compact"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleMoveUnit(unit._id, 1);
                              }}
                              disabled={index() === units().length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              size="compact"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteUnit(unit);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
              <Show when={isCreatingUnit()}>
                <form
                  class="space-y-2 rounded-md border border-[rgba(64,157,233,0.35)] bg-white p-3 text-sm shadow-sm"
                  onSubmit={(event) => void submitCreateUnit(event)}
                >
                  <div class="grid gap-2">
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Title</span>
                      <input
                        class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 shadow-sm"
                        value={createUnitForm.title}
                        onInput={(event) => setCreateUnitForm('title', event.currentTarget.value)}
                        required
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Slug</span>
                      <input
                        class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                        value={createUnitForm.slug}
                        onInput={(event) => setCreateUnitForm('slug', event.currentTarget.value)}
                        placeholder="auto from title"
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Summary</span>
                      <textarea
                        rows={2}
                        class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                        value={createUnitForm.summary}
                        onInput={(event) => setCreateUnitForm('summary', event.currentTarget.value)}
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Cover image</span>
                      <input
                        class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                        value={createUnitForm.coverImage}
                        onInput={(event) => setCreateUnitForm('coverImage', event.currentTarget.value)}
                        placeholder="/assets/..."
                      />
                    </label>
                  </div>
                  <Show when={createUnitError()}>
                    <p class="text-xs text-danger">{createUnitError()}</p>
                  </Show>
                  <div class="flex justify-end gap-2">
                    <Button type="button" size="compact" variant="ghost" onClick={cancelCreateUnit}>
                      Cancel
                    </Button>
                    <Button type="submit" size="compact">
                      Create unit
                    </Button>
                  </div>
                </form>
              </Show>
            </Card>

            <Card variant="soft" class="flex flex-col gap-3 p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-xs font-semibold uppercase tracking-wide text-muted">Topics</h2>
                  <p class="text-xs text-muted">Manage topics inside this unit.</p>
                </div>
                <Button
                  size="compact"
                  variant="secondary"
                  onClick={() => (isCreatingTopic() ? cancelCreateTopic() : startCreateTopic())}
                  disabled={!selectedUnitId()}
                >
                  {isCreatingTopic() ? 'Close' : 'New topic'}
                </Button>
              </div>
              <Show
                when={topics().length > 0}
                fallback={<p class="text-xs text-muted">No topics in this unit yet.</p>}
              >
                <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
                  <For each={topics()}>
                    {(topic, index) => (
                      <div
                        class={`rounded-md border px-3 py-2 text-sm shadow-sm transition-colors ${
                          topic._id === selectedTopicId()
                            ? 'border-[rgba(140,204,212,0.8)] bg-[rgba(233,245,251,0.75)]'
                            : 'border-[rgba(140,204,212,0.2)] bg-white hover:border-[rgba(140,204,212,0.5)]'
                        }`}
                        onClick={() => {
                          if (editor.state.dirty && topic._id !== selectedTopicId()) {
                            const confirmNavigation = window.confirm(
                              'You have unsaved changes. Navigating away will discard them. Continue?',
                            );
                            if (!confirmNavigation) return;
                          }
                          setSelectedTopicId(topic._id);
                          setSelectedLessonId(topic.lessons[0]?._id);
                        }}
                      >
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex flex-col">
                            <span class="font-medium">{topic.title}</span>
                            <span class="text-xs text-muted">/{topic.slug}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <Button
                              size="compact"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleMoveTopic(topic._id, -1);
                              }}
                              disabled={index() === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              size="compact"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleMoveTopic(topic._id, 1);
                              }}
                              disabled={index() === topics().length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              size="compact"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteTopic(topic);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
              <Show when={isCreatingTopic()}>
                <form
                  class="space-y-2 rounded-md border border-[rgba(140,204,212,0.35)] bg-white p-3 text-sm shadow-sm"
                  onSubmit={(event) => void submitCreateTopic(event)}
                >
                  <div class="grid gap-2">
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Title</span>
                      <input
                        class="rounded-md border border-[rgba(140,204,212,0.4)] bg-white px-3 py-2 shadow-sm"
                        value={createTopicForm.title}
                        onInput={(event) => setCreateTopicForm('title', event.currentTarget.value)}
                        required
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Slug</span>
                      <input
                        class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                        value={createTopicForm.slug}
                        onInput={(event) => setCreateTopicForm('slug', event.currentTarget.value)}
                        placeholder="auto from title"
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Overview</span>
                      <textarea
                        rows={2}
                        class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                        value={createTopicForm.overview}
                        onInput={(event) => setCreateTopicForm('overview', event.currentTarget.value)}
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Focus skills</span>
                      <input
                        class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                        value={createTopicForm.focusSkills}
                        onInput={(event) => setCreateTopicForm('focusSkills', event.currentTarget.value)}
                        placeholder="skill.one, skill.two"
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Estimated minutes</span>
                      <input
                        type="number"
                        min="0"
                        class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                        value={createTopicForm.estimatedDurationMinutes}
                        onInput={(event) => setCreateTopicForm('estimatedDurationMinutes', event.currentTarget.value)}
                      />
                    </label>
                  </div>
                  <Show when={createTopicError()}>
                    <p class="text-xs text-danger">{createTopicError()}</p>
                  </Show>
                  <div class="flex justify-end gap-2">
                    <Button type="button" size="compact" variant="ghost" onClick={cancelCreateTopic}>
                      Cancel
                    </Button>
                    <Button type="submit" size="compact">
                      Create topic
                    </Button>
                  </div>
                </form>
              </Show>
            </Card>

            <Card variant="soft" class="flex flex-col gap-3 p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-xs font-semibold uppercase tracking-wide text-muted">Lessons</h2>
                  <p class="text-xs text-muted">Arrange lessons within the topic.</p>
                </div>
                <Button
                  size="compact"
                  variant="secondary"
                  onClick={() => (isCreatingLesson() ? cancelCreateLesson() : startCreateLesson())}
                  disabled={!selectedTopicId()}
                >
                  {isCreatingLesson() ? 'Close' : 'New lesson'}
                </Button>
              </div>
              <Show when={lessons().length > 0} fallback={<p class="text-xs text-muted">No lessons in this topic.</p>}>
                <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
                  <For each={lessons()}>
                    {(lesson, index) => (
                      <div
                        class={`rounded-md border px-3 py-2 text-sm shadow-sm transition-colors ${
                          lesson._id === selectedLessonId()
                            ? 'border-[rgba(64,157,233,0.8)] bg-[rgba(233,245,251,0.75)]'
                            : 'border-[rgba(64,157,233,0.2)] bg-white hover:border-[rgba(64,157,233,0.4)]'
                        }`}
                        onClick={() => handleSelectLesson(lesson._id)}
                      >
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex flex-col">
                            <span class="font-medium">{lesson.title || 'Untitled lesson'}</span>
                            <span class="text-xs text-muted">
                              {lesson.status === 'published' ? 'Published' : 'Draft'} ·{' '}
                              {new Date(lesson.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div class="flex items-center gap-1">
                            <Button
                              size="compact"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleMoveLessonOrder(lesson._id, -1);
                              }}
                              disabled={index() === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              size="compact"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleMoveLessonOrder(lesson._id, 1);
                              }}
                              disabled={index() === lessons().length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              size="compact"
                              variant="secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteLesson(lesson);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
              <Show when={isCreatingLesson()}>
                <form
                  class="space-y-2 rounded-md border border-[rgba(64,157,233,0.35)] bg-white p-3 text-sm shadow-sm"
                  onSubmit={(event) => void submitCreateLesson(event)}
                >
                  <label class="flex flex-col gap-1">
                    <span class="text-xs font-semibold uppercase tracking-wide text-muted">Title</span>
                    <input
                      class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 shadow-sm"
                      value={createLessonForm.title}
                      onInput={(event) => setCreateLessonForm('title', event.currentTarget.value)}
                      required
                    />
                  </label>
                  <label class="flex flex-col gap-1">
                    <span class="text-xs font-semibold uppercase tracking-wide text-muted">Slug</span>
                    <input
                      class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                      value={createLessonForm.slug}
                      onInput={(event) => setCreateLessonForm('slug', event.currentTarget.value)}
                      placeholder="auto from title"
                    />
                  </label>
                  <Show when={createLessonError()}>
                    <p class="text-xs text-danger">{createLessonError()}</p>
                  </Show>
                  <div class="flex justify-end gap-2">
                    <Button type="button" size="compact" variant="ghost" onClick={cancelCreateLesson}>
                      Cancel
                    </Button>
                    <Button type="submit" size="compact">
                      Create lesson
                    </Button>
                  </div>
                </form>
              </Show>
            </Card>
          </aside>

          <div class="grid gap-6 xl:grid-cols-[320px,1fr]">
            <section class="flex flex-col gap-4">
              <Card variant="soft" class="flex flex-col gap-4 p-5">
                <div>
                  <h2 class="text-xs font-semibold uppercase tracking-wide text-muted">Metadata workspace</h2>
                  <p class="text-xs text-muted">Focus on one layer at a time before saving.</p>
                </div>
                <div class="flex gap-2 rounded-full bg-white p-1 text-sm font-semibold text-[color:var(--color-heading)]">
                  <For
                    each={[
                      { value: 'unit', label: 'Unit', disabled: units().length === 0 },
                      { value: 'topic', label: 'Topic', disabled: !currentTopic() },
                      { value: 'lesson', label: 'Lesson', disabled: !lessonDocument() },
                    ] as const}
                  >
                    {(tab) => (
                      <button
                        type="button"
                        class={`rounded-full px-4 py-2 transition ${
                          activeMetaTab() === tab.value
                            ? 'bg-[rgba(64,157,233,0.15)] text-[color:var(--color-heading)]'
                            : 'text-muted hover:bg-[rgba(12,42,101,0.08)]'
                        }`}
                        disabled={tab.disabled}
                        onClick={() => setActiveMetaTab(tab.value)}
                      >
                        {tab.label}
                      </button>
                    )}
                  </For>
                </div>

                <Show when={activeMetaTab() === 'unit'}>
                  <Show when={currentUnit()} fallback={<p class="text-xs text-muted">Select a unit to edit metadata.</p>}>
                    <form class="space-y-3" onSubmit={(event) => void handleUnitFormSubmit(event)}>
                      <div class="flex items-center justify-between gap-3">
                        <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Unit details</h3>
                        <Button type="submit" size="compact">
                          Save unit
                        </Button>
                      </div>
                      <div class="grid gap-3 md:grid-cols-2">
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Title</span>
                          <input
                            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 shadow-sm"
                            value={unitForm.title}
                            onInput={(event) => setUnitForm('title', event.currentTarget.value)}
                            required
                          />
                        </label>
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Slug</span>
                          <input
                            class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                            value={unitForm.slug}
                            onInput={(event) => setUnitForm('slug', event.currentTarget.value)}
                          />
                        </label>
                        <label class="flex flex-col gap-1 text-sm md:col-span-2">
                          <span class="font-medium">Summary</span>
                          <textarea
                            rows={2}
                            class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                            value={unitForm.summary}
                            onInput={(event) => setUnitForm('summary', event.currentTarget.value)}
                          />
                        </label>
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Cover image</span>
                          <input
                            class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 shadow-sm"
                            value={unitForm.coverImage}
                            onInput={(event) => setUnitForm('coverImage', event.currentTarget.value)}
                          />
                        </label>
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Status</span>
                          <select
                            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 shadow-sm"
                            value={unitForm.status}
                            onChange={(event) => setUnitForm('status', event.currentTarget.value as 'active' | 'archived')}
                          >
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                          </select>
                        </label>
                      </div>
                      <Show when={unitFormError()}>
                        <p class="text-xs text-danger">{unitFormError()}</p>
                      </Show>
                    </form>
                  </Show>
                </Show>

                <Show when={activeMetaTab() === 'topic'}>
                  <Show when={currentTopic()} fallback={<p class="text-xs text-muted">Select a topic to edit metadata.</p>}>
                    <form class="space-y-3" onSubmit={(event) => void handleTopicFormSubmit(event)}>
                      <div class="flex items-center justify-between gap-3">
                        <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Topic details</h3>
                        <Button type="submit" size="compact">
                          Save topic
                        </Button>
                      </div>
                      <div class="grid gap-3 md:grid-cols-2">
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Title</span>
                          <input
                            class="rounded-md border border-[rgba(140,204,212,0.4)] bg-white px-3 py-2 shadow-sm"
                            value={topicForm.title}
                            onInput={(event) => setTopicForm('title', event.currentTarget.value)}
                            required
                          />
                        </label>
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Slug</span>
                          <input
                            class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                            value={topicForm.slug}
                            onInput={(event) => setTopicForm('slug', event.currentTarget.value)}
                          />
                        </label>
                        <label class="flex flex-col gap-1 text-sm md:col-span-2">
                          <span class="font-medium">Overview</span>
                          <textarea
                            rows={2}
                            class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                            value={topicForm.overview}
                            onInput={(event) => setTopicForm('overview', event.currentTarget.value)}
                          />
                        </label>
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Focus skills</span>
                          <input
                            class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                            value={topicForm.focusSkills}
                            onInput={(event) => setTopicForm('focusSkills', event.currentTarget.value)}
                            placeholder="skill.one, skill.two"
                          />
                        </label>
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Estimated minutes</span>
                          <input
                            type="number"
                            min="0"
                            class="rounded-md border border-[rgba(140,204,212,0.2)] bg-white px-3 py-2 shadow-sm"
                            value={topicForm.estimatedDurationMinutes}
                            onInput={(event) => setTopicForm('estimatedDurationMinutes', event.currentTarget.value)}
                          />
                        </label>
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Status</span>
                          <select
                            class="rounded-md border border-[rgba(140,204,212,0.4)] bg-white px-3 py-2 shadow-sm"
                            value={topicForm.status}
                            onChange={(event) => setTopicForm('status', event.currentTarget.value as 'active' | 'archived')}
                          >
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                          </select>
                        </label>
                      </div>
                      <Show when={topicFormError()}>
                        <p class="text-xs text-danger">{topicFormError()}</p>
                      </Show>
                    </form>
                  </Show>
                </Show>

                <Show when={activeMetaTab() === 'lesson'}>
                  <Show when={lessonDocument()} fallback={<p class="text-xs text-muted">Select a lesson to manage metadata.</p>}>
                    {(docAccessor) => (
                      <div class="space-y-4">
                        <div class="flex flex-wrap items-center gap-3">
                          <Chip tone="blue">
                            {currentLessonMeta()?.status === 'published' ? 'Published' : 'Draft'}
                          </Chip>
                          <span class="text-xs text-muted">Slug: {currentLessonMeta()?.slug}</span>
                        </div>
                        <div class="grid gap-3 md:grid-cols-2">
                          <label class="flex flex-col gap-1 text-sm">
                            <span class="font-medium">Title</span>
                            <input
                              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                              value={docAccessor().lesson.title}
                              onInput={(event) => handleLessonFieldChange('title', event.currentTarget.value)}
                            />
                          </label>
                          <label class="flex flex-col gap-1 text-sm">
                            <span class="font-medium">Estimated duration (minutes)</span>
                            <input
                              type="number"
                              min="1"
                              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                              value={docAccessor().lesson.estimatedDurationMinutes}
                              onInput={(event) =>
                                handleLessonDurationChange(Number(event.currentTarget.value))
                              }
                            />
                          </label>
                        </div>
                        <label class="flex flex-col gap-1 text-sm">
                          <span class="font-medium">Summary</span>
                          <textarea
                            rows={3}
                            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                            value={docAccessor().lesson.summary ?? ''}
                            onInput={(event) => handleLessonFieldChange('summary', event.currentTarget.value)}
                          />
                        </label>
                        <div class="grid gap-3 md:grid-cols-2">
                          <label class="flex flex-col gap-1 text-sm">
                            <span class="font-medium">Primary material</span>
                            <select
                              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                              value={docAccessor().lesson.primaryMaterialId}
                              onChange={(event) =>
                                handleLessonPrimaryMaterialChange(event.currentTarget.value)
                              }
                            >
                              <For each={curriculumMaterials}>
                                {(material) => <option value={material.id}>{material.name}</option>}
                              </For>
                            </select>
                          </label>
                          <label class="flex flex-col gap-1 text-sm">
                            <span class="font-medium">Focus skills (comma separated)</span>
                            <input
                              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                              value={(docAccessor().lesson.focusSkills ?? []).join(', ')}
                              onInput={(event) => handleLessonSkillChange(event.currentTarget.value)}
                            />
                          </label>
                        </div>
                        <div class="grid gap-3 md:grid-cols-2">
                          <label class="flex flex-col gap-1 text-sm">
                            <span class="font-medium">Author</span>
                            <input
                              class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 text-sm shadow-sm"
                              value={lessonMetaForm.author}
                              onInput={(event) => handleLessonMetaChange('author', event.currentTarget.value)}
                            />
                          </label>
                          <label class="flex flex-col gap-1 text-sm">
                            <span class="font-medium">Notes</span>
                            <textarea
                              rows={2}
                              class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 text-sm shadow-sm"
                              value={lessonMetaForm.notes}
                              onInput={(event) => handleLessonMetaChange('notes', event.currentTarget.value)}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </Show>
                </Show>
              </Card>
            </section>

            <section class="flex flex-col gap-4">
              <Card variant="floating" class="space-y-6 p-6">
              <Show when={lessonDocument()} fallback={<p>Select a lesson to begin editing.</p>}>
                {(docAccessor) => (
                  <div class="space-y-6">
                    <Show when={editor.state.error}>
                      <div class="rounded-md border border-[rgba(220,38,38,0.35)] bg-[rgba(254,242,242,0.9)] p-3 text-sm text-[rgba(185,28,28,0.9)]">
                        {editor.state.error}
                      </div>
                    </Show>
                    <section class="space-y-3">
                      <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">
                        Lesson materials
                      </h3>
                      <div class="space-y-2">
                        <For each={docAccessor().lesson.materials}>
                          {(material, index) => (
                            <div class="grid gap-2 md:grid-cols-[1fr,2fr,auto]">
                              <select
                                class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-2 py-2 text-sm shadow-sm"
                                value={material.materialId}
                                onChange={(event) =>
                                  handleLessonMaterialChange(index(), 'materialId', event.currentTarget.value)
                                }
                              >
                                <For each={curriculumMaterials}>
                                  {(option) => <option value={option.id}>{option.name}</option>}
                                </For>
                              </select>
                              <input
                                class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-2 py-2 text-sm shadow-sm"
                                value={material.purpose}
                                onInput={(event) =>
                                  handleLessonMaterialChange(index(), 'purpose', event.currentTarget.value)
                                }
                              />
                              <div class="flex items-center gap-2">
                                <label class="flex items-center gap-1 text-xs text-muted">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(material.optional)}
                                    onChange={(event) =>
                                      handleLessonMaterialChange(index(), 'optional', event.currentTarget.checked)
                                    }
                                  />
                                  Optional
                                </label>
                                <Button
                                  size="compact"
                                  variant="secondary"
                                  onClick={() => handleRemoveLessonMaterial(index())}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </For>
                        <Button size="compact" variant="secondary" onClick={handleAddLessonMaterial}>
                          Add material
                        </Button>
                      </div>
                    </section>

                    <section class="space-y-3">
                      <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">
                        Lesson scenario seed
                      </h3>
                      <div class="flex flex-wrap items-center gap-3">
                        <select
                          class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                          value={lessonDocument()?.meta?.scenario?.kind ?? 'golden-beads'}
                          onChange={(event) =>
                            handleDocumentScenarioUpdate((scenario) => ({
                              ...scenario,
                              kind: event.currentTarget.value as (typeof scenarioKindOptions)[number],
                            }))
                          }
                        >
                          <For each={scenarioKindOptions}>
                            {(kind) => <option value={kind}>{kind}</option>}
                          </For>
                        </select>
                        <input
                          type="number"
                          class="w-32 rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                          value={lessonDocument()?.meta?.scenario?.seed ?? Date.now()}
                          onInput={(event) =>
                            handleDocumentScenarioUpdate((scenario) => ({
                              ...scenario,
                              seed: Number(event.currentTarget.value) || Date.now(),
                            }))
                          }
                        />
                      </div>
                    </section>

                    <section class="space-y-4">
                      <div class="flex items-center justify-between">
                        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">Segments</h3>
                        <div class="flex items-center gap-2">
                          <For each={['presentation', 'guided', 'practice'] as const}>
                            {(type) => (
                              <Button size="compact" variant="secondary" onClick={() => handleAddSegment(type)}>
                                Add {type}
                              </Button>
                            )}
                          </For>
                        </div>
                      </div>

                      <Show when={docAccessor().lesson.segments.length > 0} fallback={<p class="text-xs text-muted">No segments yet. Add presentation, guided, or practice segments to begin.</p>}>
                        <div class="space-y-4">
                          <For each={docAccessor().lesson.segments}>
                            {(segment, index) => (
                              <Card variant="soft" class="space-y-4 p-4">
                                <div class="flex flex-wrap items-center justify-between gap-3">
                                  <div class="flex flex-wrap items-center gap-3">
                                    <Chip tone="blue" size="sm">
                                      {segment.type}
                                    </Chip>
                                    <input
                                      class="w-full max-w-sm rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                                      value={segment.title}
                                      onInput={(event) => handleSegmentTitleChange(segment.id, event.currentTarget.value)}
                                    />
                                    <select
                                      class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                                      value={segment.representation ?? 'concrete'}
                                      onChange={(event) =>
                                        handleSegmentRepresentationChange(
                                          segment.id,
                                          event.currentTarget.value as 'concrete' | 'abstract',
                                        )
                                      }
                                    >
                                      <For each={representationOptions}>
                                        {(option) => <option value={option.value}>{option.label}</option>}
                                      </For>
                                    </select>
                                  </div>
                                  <div class="flex items-center gap-2">
                                    <Button
                                      size="compact"
                                      variant="secondary"
                                      disabled={index() === 0}
                                      onClick={() => handleMoveSegment(segment.id, -1)}
                                    >
                                      ↑
                                    </Button>
                                    <Button
                                      size="compact"
                                      variant="secondary"
                                      disabled={index() === docAccessor().lesson.segments.length - 1}
                                      onClick={() => handleMoveSegment(segment.id, 1)}
                                    >
                                      ↓
                                    </Button>
                                    <Button
                                      size="compact"
                                      variant="secondary"
                                      onClick={() => handleRemoveSegment(segment.id)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>

                                <label class="flex flex-col gap-1 text-sm">
                                  <span class="font-medium">Segment skills (comma separated)</span>
                                  <input
                                    class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                                    value={segment.skills.join(', ')}
                                    onInput={(event) => handleSegmentSkillsChange(segment.id, event.currentTarget.value)}
                                  />
                                </label>

                                <div class="space-y-2">
                                  <h4 class="text-xs font-semibold uppercase tracking-wide text-muted">
                                    Materials
                                  </h4>
                                  <For each={segment.materials}>
                                    {(material, materialIndex) => (
                                      <div class="grid gap-2 md:grid-cols-[1fr,2fr,auto]">
                                        <select
                                          class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-2 py-2 text-sm shadow-sm"
                                          value={material.materialId}
                                          onChange={(event) =>
                                            handleSegmentMaterialChange(
                                              segment.id,
                                              materialIndex(),
                                              'materialId',
                                              event.currentTarget.value,
                                            )
                                          }
                                        >
                                          <For each={curriculumMaterials}>
                                            {(option) => <option value={option.id}>{option.name}</option>}
                                          </For>
                                        </select>
                                        <input
                                          class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-2 py-2 text-sm shadow-sm"
                                          value={material.purpose}
                                          onInput={(event) =>
                                            handleSegmentMaterialChange(
                                              segment.id,
                                              materialIndex(),
                                              'purpose',
                                              event.currentTarget.value,
                                            )
                                          }
                                        />
                                        <div class="flex items-center gap-2">
                                          <label class="flex items-center gap-1 text-xs text-muted">
                                            <input
                                              type="checkbox"
                                              checked={Boolean(material.optional)}
                                              onChange={(event) =>
                                                handleSegmentMaterialChange(
                                                  segment.id,
                                                  materialIndex(),
                                                  'optional',
                                                  event.currentTarget.checked,
                                                )
                                              }
                                            />
                                            Optional
                                          </label>
                                          <Button
                                            size="compact"
                                            variant="secondary"
                                            onClick={() => handleRemoveSegmentMaterial(segment.id, materialIndex())}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </For>
                                  <Button
                                    size="compact"
                                    variant="secondary"
                                    onClick={() => handleAddSegmentMaterial(segment.id)}
                                  >
                                    Add material
                                  </Button>
                                </div>

                                <div class="grid gap-2 md:grid-cols-2">
                                  <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                                    <span>Scenario kind</span>
                                    <select
                                      class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                                      value={segment.scenario?.kind ?? 'golden-beads'}
                                      onChange={(event) =>
                                        handleSegmentScenarioUpdate(segment.id, (scenario) => ({
                                          ...scenario,
                                          kind: event.currentTarget.value as (typeof scenarioKindOptions)[number],
                                        }))
                                      }
                                    >
                                      <For each={scenarioKindOptions}>
                                        {(kind) => <option value={kind}>{kind}</option>}
                                      </For>
                                    </select>
                                  </label>
                                  <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                                    <span>Scenario seed</span>
                                    <input
                                      type="number"
                                      class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                                      value={segment.scenario?.seed ?? Date.now()}
                                      onInput={(event) =>
                                        handleSegmentScenarioUpdate(segment.id, (scenario) => ({
                                          ...scenario,
                                          seed: Number(event.currentTarget.value) || Date.now(),
                                        }))
                                      }
                                    />
                                  </label>
                                </div>

                                <Show when={segment.type === 'presentation'}>
                                  <PresentationActionEditor
                                    segment={segment as LessonSegment & { type: 'presentation' }}
                                    onActionTypeChange={handleActionTypeChange}
                                    onMoveAction={handleMoveAction}
                                    onRemoveAction={handleRemoveAction}
                                    onAddAction={handleAddAction}
                                    onUpdateAction={handleUpdateAction}
                                  />
                                </Show>

                                <Show when={segment.type === 'guided'}>
                                  <GuidedStepEditor
                                    segment={segment as LessonSegment & { type: 'guided' }}
                                    onWorkspaceChange={(workspace) =>
                                      editor.applyUpdate((draft) => {
                                        draft.lesson.segments = draft.lesson.segments.map((entry) =>
                                          entry.id === segment.id && entry.type === 'guided'
                                            ? { ...entry, workspace }
                                            : entry,
                                        );
                                      })
                                    }
                                    onStepChange={handleGuidedStepChange}
                                    onRemoveStep={handleRemoveGuidedStep}
                                    onAddStep={(workspace) => handleAddGuidedStep(segment.id, workspace)}
                                    onMoveStep={handleMoveGuidedStep}
                                  />
                                </Show>

                                <Show when={segment.type === 'practice'}>
                                  <PracticeSegmentEditor
                                    segment={segment as LessonSegment & { type: 'practice' }}
                                    onWorkspaceChange={(workspace) =>
                                      editor.applyUpdate((draft) => {
                                        draft.lesson.segments = draft.lesson.segments.map((entry) =>
                                          entry.id === segment.id && entry.type === 'practice'
                                            ? { ...entry, workspace }
                                            : entry,
                                        );
                                      })
                                    }
                                    onQuestionChange={handlePracticeQuestionChange}
                                    onAddQuestion={() => handleAddPracticeQuestion(segment.id)}
                                    onRemoveQuestion={handleRemovePracticeQuestion}
                                    onMoveQuestion={handleMovePracticeQuestion}
                                    onPassCriteriaChange={(field, value) =>
                                      handlePassCriteriaChange(segment.id, field, value)
                                    }
                                  />
                                </Show>
                              </Card>
                            )}
                          </For>
                        </div>
                      </Show>
                    </section>

                    <section class="space-y-3">
                      <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">
                        Document JSON (read-only)
                      </h3>
                      <pre class="max-h-[320px] overflow-auto rounded-md border border-[rgba(64,157,233,0.4)] bg-black/80 p-4 text-xs text-[#e6f7ff]">
                        {JSON.stringify(lessonDocument(), null, 2)}
                      </pre>
                    </section>
                  </div>
                )}
              </Show>
              </Card>
            </section>
          </div>
        </div>
      </PageSection>
    </div>
  );
};

export default Editor;

interface PresentationActionEditorProps {
  segment: PresentationSegmentType;
  onActionTypeChange: (
    segmentId: string,
    actionId: string,
    type: (typeof actionTypeOptions)[number]['value'],
  ) => void;
  onMoveAction: (segmentId: string, actionId: string, direction: 'up' | 'down') => void;
  onRemoveAction: (segmentId: string, actionId: string) => void;
  onAddAction: (segmentId: string, type: (typeof actionTypeOptions)[number]['value']) => void;
  onUpdateAction: (
    segmentId: string,
    actionId: string,
    mutate: (action: PresentationAction) => PresentationAction,
  ) => void;
}

const PresentationActionEditor = (props: PresentationActionEditorProps) => {
  const script = () => props.segment.script ?? { actions: [] as PresentationAction[] };
  const actions = () => script().actions;
  const updateAction = (action: PresentationAction, mutate: (draft: PresentationAction) => void) => {
    props.onUpdateAction(props.segment.id, action.id, (draft) => {
      const cloneDraft = clone(draft);
      mutate(cloneDraft);
      return cloneDraft;
    });
  };
  const renderActionFields = (current: PresentationAction) => {
    switch (current.type) {
      case 'narrate':
        return (
          <textarea
            rows={2}
            class="w-full rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            value={current.text}
            onInput={(event) =>
              updateAction(current, (draft) => {
                if (draft.type === 'narrate') {
                  draft.text = event.currentTarget.value;
                }
              })
            }
          />
        );
      case 'showCard':
        return (
          <div class="grid gap-2 md:grid-cols-2">
            <input
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.card}
              onInput={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'showCard') {
                    draft.card = event.currentTarget.value;
                  }
                })
              }
            />
            <select
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.position}
              onChange={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'showCard') {
                    draft.position = event.currentTarget.value as (typeof positionOptions)[number];
                  }
                })
              }
            >
              <For each={positionOptions}>{(position) => <option value={position}>{position}</option>}</For>
            </select>
          </div>
        );
      case 'placeBeads':
        return (
          <div class="grid gap-2 md:grid-cols-3">
            <select
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.place}
              onChange={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'placeBeads') {
                    draft.place = event.currentTarget.value as (typeof beadPlaceOptions)[number];
                  }
                })
              }
            >
              <For each={beadPlaceOptions}>{(place) => <option value={place}>{place}</option>}</For>
            </select>
            <input
              type="number"
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.quantity}
              onInput={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'placeBeads') {
                    draft.quantity = Number(event.currentTarget.value) || 0;
                  }
                })
              }
            />
            <input
              type="number"
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.tray}
              onInput={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'placeBeads') {
                    draft.tray = Number(event.currentTarget.value) || 0;
                  }
                })
              }
            />
          </div>
        );
      case 'duplicateTray':
        return (
          <input
            type="number"
            min="2"
            class="w-24 rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            value={current.count}
            onInput={(event) =>
              updateAction(current, (draft) => {
                if (draft.type === 'duplicateTray') {
                  draft.count = Number(event.currentTarget.value) || 0;
                }
              })
            }
          />
        );
      case 'exchange':
        return (
          <div class="grid gap-2 md:grid-cols-4">
            <select
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.from}
              onChange={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'exchange') {
                    draft.from = event.currentTarget.value as (typeof exchangeFromOptions)[number];
                  }
                })
              }
            >
              <For each={exchangeFromOptions}>{(option) => <option value={option}>{option}</option>}</For>
            </select>
            <select
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.to}
              onChange={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'exchange') {
                    draft.to = event.currentTarget.value as (typeof exchangeToOptions)[number];
                  }
                })
              }
            >
              <For each={exchangeToOptions}>{(option) => <option value={option}>{option}</option>}</For>
            </select>
            <input
              type="number"
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.quantity}
              onInput={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'exchange') {
                    draft.quantity = Number(event.currentTarget.value) || 0;
                  }
                })
              }
            />
            <input
              type="number"
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.remainder}
              onInput={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'exchange') {
                    draft.remainder = Number(event.currentTarget.value) || 0;
                  }
                })
              }
            />
          </div>
        );
      case 'stackPlaceValues':
        return (
          <input
            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            value={current.order.join(', ')}
            onInput={(event) => {
              const parsed = event.currentTarget.value
                .split(',')
                .map((item) => item.trim())
                .filter(
                  (item): item is (typeof beadPlaceOptions)[number] =>
                    (beadPlaceOptions as readonly string[]).includes(item),
                );
              updateAction(current, (draft) => {
                if (draft.type === 'stackPlaceValues') {
                  draft.order = parsed;
                }
              });
            }}
          />
        );
      case 'writeResult':
        return (
          <input
            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            value={current.value}
            onInput={(event) =>
              updateAction(current, (draft) => {
                if (draft.type === 'writeResult') {
                  draft.value = event.currentTarget.value;
                }
              })
            }
          />
        );
      case 'countTotal':
        return (
          <input
            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            value={current.value}
            onInput={(event) =>
              updateAction(current, (draft) => {
                if (draft.type === 'countTotal') {
                  draft.value = event.currentTarget.value;
                }
              })
            }
          />
        );
      case 'highlight':
        return (
          <div class="grid gap-2 md:grid-cols-2">
            <input
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.target}
              onInput={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'highlight') {
                    draft.target = event.currentTarget.value;
                  }
                })
              }
            />
            <input
              class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
              value={current.text ?? ''}
              onInput={(event) =>
                updateAction(current, (draft) => {
                  if (draft.type === 'highlight') {
                    draft.text = event.currentTarget.value;
                  }
                })
              }
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-semibold uppercase tracking-wide text-muted">Presentation actions</h4>
        <div class="flex items-center gap-2">
          <select
            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            onChange={(event) =>
              props.onAddAction(props.segment.id, event.currentTarget.value as (typeof actionTypeOptions)[number]['value'])
            }
          >
            <option value="">Add action…</option>
            <For each={actionTypeOptions}>{(option) => <option value={option.value}>{option.label}</option>}</For>
          </select>
        </div>
      </div>

      <For each={actions()}>
        {(action: PresentationAction, index) => (
          <div class="space-y-3 rounded-md border border-dashed border-[rgba(64,157,233,0.25)] bg-white p-4 text-sm shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <select
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                  value={action.type}
                  onChange={(event) =>
                    props.onActionTypeChange(
                      props.segment.id,
                      action.id,
                      event.currentTarget.value as (typeof actionTypeOptions)[number]['value'],
                    )
                  }
                >
                  <For each={actionTypeOptions}>{(option) => <option value={option.value}>{option.label}</option>}</For>
                </select>
                <span class="text-xs text-muted">{action.id}</span>
              </div>
              <div class="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="compact"
                  disabled={index() === 0}
                  onClick={() => props.onMoveAction(props.segment.id, action.id, 'up')}
                >
                  ↑
                </Button>
                <Button
                  variant="secondary"
                  size="compact"
                  disabled={index() === actions().length - 1}
                  onClick={() => props.onMoveAction(props.segment.id, action.id, 'down')}
                >
                  ↓
                </Button>
                <Button
                  variant="secondary"
                  size="compact"
                  onClick={() => props.onRemoveAction(props.segment.id, action.id)}
                >
                  Remove
                </Button>
              </div>
            </div>

            {renderActionFields(action)}
          </div>
        )}
      </For>

      <Show when={actions().length === 0}>
        <p class="text-xs text-muted">No actions yet.</p>
      </Show>
    </div>
  );
};

interface GuidedStepEditorProps {
  segment: LessonSegment & { type: 'guided' };
  onWorkspaceChange: (workspace: 'golden-beads' | 'stamp-game') => void;
  onStepChange: (
    segmentId: string,
    stepId: string,
    mutate: (
      step: GuidedStep & { evaluatorId: GuidedEvaluatorId },
    ) => GuidedStep & { evaluatorId: GuidedEvaluatorId },
  ) => void;
  onRemoveStep: (segmentId: string, stepId: string) => void;
  onAddStep: (workspace: 'golden-beads' | 'stamp-game') => void;
  onMoveStep: (segmentId: string, stepId: string, direction: 'up' | 'down') => void;
}

const GuidedStepEditor = (props: GuidedStepEditorProps) => {
  const steps = () => props.segment.steps;

  const updateStep = (
    step: GuidedStep & { evaluatorId: GuidedEvaluatorId },
    mutate: (draft: GuidedStep & { evaluatorId: GuidedEvaluatorId }) => GuidedStep & { evaluatorId: GuidedEvaluatorId },
  ) => {
    props.onStepChange(props.segment.id, step.id, mutate);
  };

  return (
    <div class="space-y-3 rounded-md border border-[rgba(140,204,212,0.35)] bg-white p-4 text-sm shadow-sm">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-wide text-muted">Guided workspace</span>
        <select
          class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
          value={props.segment.workspace}
          onChange={(event) => props.onWorkspaceChange(event.currentTarget.value as 'golden-beads' | 'stamp-game')}
        >
          <For each={workspaceOptions}>{(option) => <option value={option.value}>{option.label}</option>}</For>
        </select>
        <Button size="compact" variant="secondary" onClick={() => props.onAddStep(props.segment.workspace)}>
          Add step
        </Button>
      </div>

      <For each={steps()}>
        {(step, index) => (
          <div class="space-y-2 rounded-md border border-[rgba(64,157,233,0.2)] bg-white p-3 shadow-sm">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-muted">{step.id}</span>
              <div class="flex items-center gap-1">
                <Button
                  size="compact"
                  variant="secondary"
                  disabled={index() === 0}
                  onClick={() => props.onMoveStep(props.segment.id, step.id, 'up')}
                >
                  ↑
                </Button>
                <Button
                  size="compact"
                  variant="secondary"
                  disabled={index() === steps().length - 1}
                  onClick={() => props.onMoveStep(props.segment.id, step.id, 'down')}
                >
                  ↓
                </Button>
                <Button
                  size="compact"
                  variant="secondary"
                  onClick={() => props.onRemoveStep(props.segment.id, step.id)}
                >
                  Remove
                </Button>
              </div>
            </div>

            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
              <span>Prompt</span>
              <textarea
                rows={2}
                class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                value={step.prompt}
                onInput={(event) =>
                  updateStep(step, (draft) => ({
                    ...draft,
                    prompt: event.currentTarget.value,
                  }))
                }
              />
            </label>
            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
              <span>Expectation</span>
              <textarea
                rows={2}
                class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                value={step.expectation}
                onInput={(event) =>
                  updateStep(step, (draft) => ({
                    ...draft,
                    expectation: event.currentTarget.value,
                  }))
                }
              />
            </label>
            <div class="grid gap-2 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                <span>Success check</span>
                <textarea
                  rows={2}
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                  value={step.successCheck}
                  onInput={(event) =>
                    updateStep(step, (draft) => ({
                      ...draft,
                      successCheck: event.currentTarget.value,
                    }))
                  }
                />
              </label>
              <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                <span>Nudge</span>
                <textarea
                  rows={2}
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                  value={step.nudge}
                  onInput={(event) =>
                    updateStep(step, (draft) => ({
                      ...draft,
                      nudge: event.currentTarget.value,
                    }))
                  }
                />
              </label>
            </div>
            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
              <span>Evaluator</span>
              <select
                class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                value={step.evaluatorId}
                onChange={(event) =>
                  updateStep(step, (draft) => ({
                    ...draft,
                    evaluatorId: event.currentTarget.value as GuidedEvaluatorId,
                  }))
                }
              >
                <For each={guidedEvaluatorOptions}>{(option) => <option value={option}>{option}</option>}</For>
              </select>
            </label>
          </div>
        )}
      </For>

      <Show when={steps().length === 0}>
        <p class="text-xs text-muted">No guided steps yet.</p>
      </Show>
    </div>
  );
};

interface PracticeSegmentEditorProps {
  segment: LessonSegment & { type: 'practice' };
  onWorkspaceChange: (workspace: 'golden-beads' | 'stamp-game') => void;
  onQuestionChange: (
    segmentId: string,
    questionId: string,
    mutate: (question: PracticeQuestion) => PracticeQuestion,
  ) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (segmentId: string, questionId: string) => void;
  onMoveQuestion: (segmentId: string, questionId: string, direction: 'up' | 'down') => void;
  onPassCriteriaChange: (field: keyof typeof defaultPassCriteria, value: number) => void;
}

const PracticeSegmentEditor = (props: PracticeSegmentEditorProps) => {
  const questions = () => props.segment.questions;

  const updateQuestion = (question: PracticeQuestion, mutate: (draft: PracticeQuestion) => PracticeQuestion) => {
    props.onQuestionChange(props.segment.id, question.id, mutate);
  };

  return (
    <div class="space-y-3 rounded-md border border-[rgba(64,157,233,0.35)] bg-white p-4 text-sm shadow-sm">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-wide text-muted">Practice workspace</span>
        <select
          class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
          value={props.segment.workspace}
          onChange={(event) => props.onWorkspaceChange(event.currentTarget.value as 'golden-beads' | 'stamp-game')}
        >
          <For each={workspaceOptions}>{(option) => <option value={option.value}>{option.label}</option>}</For>
        </select>
        <Button size="compact" variant="secondary" onClick={props.onAddQuestion}>
          Add question
        </Button>
      </div>

      <div class="grid gap-2 md:grid-cols-3">
        <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
          <span>First correct</span>
          <input
            type="number"
            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            value={props.segment.passCriteria.firstCorrect}
            onInput={(event) =>
              props.onPassCriteriaChange('firstCorrect', Number(event.currentTarget.value) || 0)
            }
          />
        </label>
        <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
          <span>Total correct</span>
          <input
            type="number"
            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            value={props.segment.passCriteria.totalCorrect}
            onInput={(event) =>
              props.onPassCriteriaChange('totalCorrect', Number(event.currentTarget.value) || 0)
            }
          />
        </label>
        <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
          <span>Max misses</span>
          <input
            type="number"
            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            value={props.segment.passCriteria.maxMisses}
            onInput={(event) =>
              props.onPassCriteriaChange('maxMisses', Number(event.currentTarget.value) || 0)
            }
          />
        </label>
      </div>

      <For each={questions()}>
        {(question, index) => (
          <div class="space-y-2 rounded-md border border-[rgba(64,157,233,0.2)] bg-white p-3 shadow-sm">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-muted">{question.id}</span>
              <div class="flex items-center gap-1">
                <Button
                  size="compact"
                  variant="secondary"
                  disabled={index() === 0}
                  onClick={() => props.onMoveQuestion(props.segment.id, question.id, 'up')}
                >
                  ↑
                </Button>
                <Button
                  size="compact"
                  variant="secondary"
                  disabled={index() === questions().length - 1}
                  onClick={() => props.onMoveQuestion(props.segment.id, question.id, 'down')}
                >
                  ↓
                </Button>
                <Button
                  size="compact"
                  variant="secondary"
                  onClick={() => props.onRemoveQuestion(props.segment.id, question.id)}
                >
                  Remove
                </Button>
              </div>
            </div>

            <div class="grid gap-2 md:grid-cols-3">
              <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                <span>Multiplicand</span>
                <input
                  type="number"
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                  value={question.multiplicand}
                  onInput={(event) => {
                    const multiplicand = Number(event.currentTarget.value) || 0;
                    updateQuestion(question, (draft) => ({
                      ...draft,
                      multiplicand,
                      correctAnswer: multiplicand * draft.multiplier,
                      prompt: `Solve ${multiplicand.toLocaleString()} × ${draft.multiplier}.`,
                    }));
                    return question;
                  }}
                />
              </label>
              <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                <span>Multiplier</span>
                <input
                  type="number"
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                  value={question.multiplier}
                  onInput={(event) => {
                    const multiplier = Number(event.currentTarget.value) || 0;
                    updateQuestion(question, (draft) => ({
                      ...draft,
                      multiplier,
                      correctAnswer: draft.multiplicand * multiplier,
                      prompt: `Solve ${draft.multiplicand.toLocaleString()} × ${multiplier}.`,
                    }));
                    return question;
                  }}
                />
              </label>
              <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                <span>Difficulty</span>
                <select
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                  value={question.difficulty}
                  onChange={(event) =>
                    updateQuestion(question, (draft) => ({
                      ...draft,
                      difficulty: event.currentTarget.value as (typeof difficultyOptions)[number],
                    }))
                  }
                >
                  <For each={difficultyOptions}>{(difficulty) => <option value={difficulty}>{difficulty}</option>}</For>
                </select>
              </label>
            </div>

            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
              <span>Prompt</span>
              <textarea
                rows={2}
                class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                value={question.prompt}
                onInput={(event) =>
                  updateQuestion(question, (draft) => ({
                    ...draft,
                    prompt: event.currentTarget.value,
                  }))
                }
              />
            </label>

            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
              <span>Correct answer</span>
              <input
                type="number"
                class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                value={question.correctAnswer}
                onInput={(event) =>
                  updateQuestion(question, (draft) => ({
                    ...draft,
                    correctAnswer: Number(event.currentTarget.value) || 0,
                  }))
                }
              />
            </label>
          </div>
        )}
      </For>

      <Show when={questions().length === 0}>
        <p class="text-xs text-muted">No practice questions yet.</p>
      </Show>
    </div>
  );
};
