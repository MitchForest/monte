import { toast } from 'solid-sonner';

import {
  createLesson,
  createTopic,
  createUnit,
  deleteLesson,
  deleteTopic,
  deleteUnit,
  publishLesson,
  reorderLessons,
  reorderTopics,
  reorderUnits,
  saveLessonDraft,
  updateTopic,
  updateUnit,
  type CurriculumTree,
} from '@monte/api';
import type {
  GuidedEvaluatorId,
  GuidedStep,
  LessonDocument,
  LessonMaterialInventory,
  MaterialBankDefinition,
  PracticeQuestion,
  PresentationAction,
  SegmentTimeline,
  TokenTypeDefinition,
} from '@monte/types';
import type { Id } from '@monte/types';

import {
  createPresentationAction,
  createSegment,
  defaultGuidedStep,
  defaultPassCriteria,
  defaultPracticeQuestion,
  ensurePresentationScript,
  sanitizeScenario,
} from '@monte/lesson-service';
import type {
  LessonMetaFormState,
  LessonScenario,
  LessonSegment,
} from './types';
import { ensureSegmentTimeline } from '../utils/timeline';
import type { ActionTypeValue } from '../../../routes/editor/constants';
import type { EditorState, InventorySnapshotRegistration } from './editorState';

type UnitNode = CurriculumTree[number];
type TopicNode = UnitNode['topics'][number];
type LessonNode = TopicNode['lessons'][number];

const moveItem = <T,>(items: readonly T[], from: number, to: number): T[] => {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
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

export interface EditorActions {
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
  handleSegmentTimelineUpdate: (segmentId: string, timeline: SegmentTimeline) => void;
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
  registerInventorySnapshot: (options?: InventorySnapshotRegistration) => void;
  selectSegment: (segmentId: string | undefined) => void;
}

export const createEditorActions = (state: EditorState): EditorActions => {
  const {
    defaultMaterialId,
    editor,
    inventory,
    selection,
    forms,
    resources,
    confirm,
    document,
  } = state;

  const {
    unit: { form: unitForm, setForm: setUnitForm, error: unitFormError, setError: setUnitFormError },
    topic: { form: topicForm, setForm: setTopicForm, error: topicFormError, setError: setTopicFormError },
    lessonMeta: { form: lessonMetaForm, setForm: setLessonMetaForm },
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
    helpers: { resetCreateUnitForm, resetCreateTopicForm, resetCreateLessonForm },
  } = forms;

  const {
    selectedUnitId,
    setSelectedUnitId,
    selectedTopicId,
    setSelectedTopicId,
    selectedLessonId,
    setSelectedLessonId,
    units,
    topics,
    lessons,
    selectSegment,
  } = selection;

  const { lessonDocument } = document;

  const {
    curriculumTree,
    updateCurriculumTree,
    refetchTree,
    refreshLessonAndTree,
  } = resources;

  const {
    controller: confirmController,
    ensureLessonNavigationAllowed,
    confirmReset,
  } = confirm;
  const confirmDialog = confirmController;

  const resolveErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    if (typeof error === 'string' && error.trim().length > 0) {
      return error;
    }
    return fallback;
  };

  const reportActionError = (message: string, error: unknown) => {
    console.error(message, error);
    window.alert(message);
  };

  const applyInventorySnapshotOrAbort = (): boolean => {
    try {
      inventory.applyInventorySnapshot();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      editor.setError(message);
      toast.error('Inventory mismatch', { description: message });
      return false;
    }
  };

  const handleSave = async () => {
    const lessonId = selectedLessonId();
    if (!lessonId) return;
    if (!applyInventorySnapshotOrAbort()) return;

    const documentValue = editor.state.document;
    if (!documentValue) return;

    const validationErrors = validateLessonDocument(documentValue);
    if (validationErrors.length > 0) {
      editor.setError(`Cannot save yet:\n${validationErrors.join('\n')}`);
      return;
    }

    try {
      editor.beginSaving();
      await saveLessonDraft(lessonId, documentValue);
      editor.markSaved();
      await refreshLessonAndTree();
      toast.success('Draft saved');
    } catch (error) {
      const message = resolveErrorMessage(error, 'Unable to save draft');
      editor.setError(message);
      toast.error('Unable to save draft', { description: message });
    }
  };

  const handlePublish = async () => {
    const lessonId = selectedLessonId();
    if (!lessonId) return;
    if (!applyInventorySnapshotOrAbort()) return;

    const documentValue = editor.state.document;
    if (!documentValue) return;

    const validationErrors = validateLessonDocument(documentValue);
    if (validationErrors.length > 0) {
      editor.setError(`Cannot publish yet:\n${validationErrors.join('\n')}`);
      return;
    }

    let draftSaved = false;

    try {
      editor.beginSaving();
      await saveLessonDraft(lessonId, documentValue);
      draftSaved = true;
      await publishLesson(lessonId);
      editor.markSaved();
      await refreshLessonAndTree();
      toast.success('Lesson published');
    } catch (error) {
      const message = resolveErrorMessage(error, 'Unable to publish lesson');
      if (draftSaved) {
        editor.markSaved();
        await refreshLessonAndTree();
      }
      editor.setError(message);
      const description = draftSaved ? `${message}\nLatest draft saved successfully.` : message;
      toast.error('Unable to publish lesson', { description });
    }
  };

  const handleReset = async () => {
    if (!(await confirmReset())) return;
    editor.resetToInitial();
    toast.info('Changes discarded');
  };

  const handleSelectLesson = async (lessonId: Id<'lessons'>) => {
    const currentLessonId = selectedLessonId();
    const canNavigate = await ensureLessonNavigationAllowed(lessonId, currentLessonId);
    if (!canNavigate) return;
    setSelectedLessonId(lessonId);
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
    const unit = selection.currentUnit();
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
    const confirmDelete = await confirmDialog.request({
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
    const topic = selection.currentTopic();
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
    const confirmDelete = await confirmDialog.request({
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
    const confirmDelete = await confirmDialog.request({
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

  const handleLessonMetaChange = (field: keyof LessonMetaFormState, value: string) => {
    setLessonMetaForm(field, value);
    editor.applyUpdate((draft) => {
      const currentMeta = draft.meta ?? {};
      draft.meta =
        field === 'author'
          ? { ...currentMeta, author: value }
          : { ...currentMeta, notes: value };
    });
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

  const handleSegmentTimelineUpdate = (segmentId: string, timeline: SegmentTimeline) => {
    editor.applyUpdate((draft) => {
      draft.lesson.segments = draft.lesson.segments.map((segment) => {
        if (segment.id !== segmentId) return segment;
        const normalized = ensureSegmentTimeline({ ...segment, timeline }).timeline;
        return {
          ...segment,
          timeline: normalized,
        };
      });
    });
  };

  const handleAddTokenType = () => {
    inventory.handleAddTokenType();
  };

  const handleUpdateTokenType = (
    tokenId: string,
    mutate: (token: TokenTypeDefinition) => TokenTypeDefinition,
  ) => {
    inventory.handleUpdateTokenType(tokenId, mutate);
  };

  const handleRemoveTokenType = (tokenId: string) => {
    inventory.handleRemoveTokenType(tokenId);
  };

  const handleAddMaterialBank = (scope?: 'lesson' | 'segment', segmentId?: string) => {
    inventory.handleAddMaterialBank(scope, segmentId);
  };

  const handleUpdateMaterialBank = (
    bankId: string,
    mutate: (bank: MaterialBankDefinition) => MaterialBankDefinition,
  ) => {
    inventory.handleUpdateMaterialBank(bankId, mutate);
  };

  const handleRemoveMaterialBank = (bankId: string) => {
    inventory.handleRemoveMaterialBank(bankId);
  };

  return {
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
    handleSegmentTimelineUpdate,
    handleAddTokenType,
    handleUpdateTokenType,
    handleRemoveTokenType,
    handleAddMaterialBank,
    handleUpdateMaterialBank,
    handleRemoveMaterialBank,
    registerInventorySnapshot: inventory.registerInventorySnapshot,
    selectSegment,
  };
};
