import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';

import type { Setter } from 'solid-js';
import type { Id } from '@monte/types';
import { EditorStoresStaticProvider } from '../../hooks/useEditorViewModel';
import type { EditorViewModel } from '../../hooks/useEditorViewModel';
import { EditorHeader } from '../EditorHeader';

const createViewModel = (
  overrides: Partial<EditorViewModel> = {},
  editorOverrides: Partial<EditorViewModel['editor']> = {},
): EditorViewModel => {
  const editor: EditorViewModel['editor'] = {
    canUndo: () => false,
    canRedo: () => false,
    undo: vi.fn(),
    redo: vi.fn(),
    applyUpdate: vi.fn(),
    loadDocument: vi.fn(),
    state: { dirty: false } as EditorViewModel['editor']['state'],
    beginSaving: vi.fn(),
    markSaved: vi.fn(),
    resetToInitial: vi.fn(),
    select: vi.fn(),
    setError: vi.fn(),
    applyInventoryUpdate: vi.fn(),
    ...editorOverrides,
  };

  const vm: EditorViewModel = {
    editor,
    options: {} as EditorViewModel['options'],
    selection: {
      selectedUnitId: () => undefined,
      setSelectedUnitId: vi.fn() as unknown as Setter<Id<'units'> | undefined>,
      selectedTopicId: () => undefined,
      setSelectedTopicId: vi.fn() as unknown as Setter<Id<'topics'> | undefined>,
      selectedLessonId: () => undefined,
      setSelectedLessonId: vi.fn() as unknown as Setter<Id<'lessons'> | undefined>,
      selectedSegmentId: () => undefined,
      setSelectedSegmentId: vi.fn(),
    },
    resources: {
      curriculumTree: () => undefined,
      setCurriculumTree: vi.fn(),
      refetchTree: vi.fn(),
      lessonRecord: () => undefined,
      refetchLessonRecord: vi.fn(),
    },
    forms: {} as EditorViewModel['forms'],
    computed: {} as EditorViewModel['computed'],
    metaTab: {
      active: () => 'unit',
      setActive: vi.fn(),
    },
    confirm: {
      state: () => null,
      resolve: vi.fn(),
      request: vi.fn().mockResolvedValue(true),
    },
    actions: {
      handleSave: vi.fn().mockResolvedValue(undefined),
      handlePublish: vi.fn().mockResolvedValue(undefined),
      handleReset: vi.fn().mockResolvedValue(undefined),
      handleSelectLesson: vi.fn().mockResolvedValue(undefined),
      submitCreateUnit: vi.fn(),
      startCreateUnit: vi.fn(),
      cancelCreateUnit: vi.fn(),
      handleUnitFormSubmit: vi.fn(),
      handleDeleteUnit: vi.fn(),
      handleMoveUnit: vi.fn(),
      submitCreateTopic: vi.fn(),
      startCreateTopic: vi.fn(),
      cancelCreateTopic: vi.fn(),
      handleTopicFormSubmit: vi.fn(),
      handleDeleteTopic: vi.fn(),
      handleMoveTopic: vi.fn(),
      submitCreateLesson: vi.fn(),
      startCreateLesson: vi.fn(),
      cancelCreateLesson: vi.fn(),
      handleDeleteLesson: vi.fn(),
      handleMoveLessonOrder: vi.fn(),
      handleLessonFieldChange: vi.fn(),
      handleLessonDurationChange: vi.fn(),
      handleLessonPrimaryMaterialChange: vi.fn(),
      handleLessonSkillChange: vi.fn(),
      handleLessonMaterialChange: vi.fn(),
      handleAddLessonMaterial: vi.fn(),
      handleRemoveLessonMaterial: vi.fn(),
      handleLessonMetaChange: vi.fn(),
      handleDocumentScenarioUpdate: vi.fn(),
      handleSegmentScenarioUpdate: vi.fn(),
      handleSegmentTitleChange: vi.fn(),
      handleAddSegment: vi.fn(),
      handleRemoveSegment: vi.fn(),
      handleMoveSegment: vi.fn(),
      handleSegmentSkillsChange: vi.fn(),
      handleSegmentRepresentationChange: vi.fn(),
      handleSegmentMaterialChange: vi.fn(),
      handleAddSegmentMaterial: vi.fn(),
      handleRemoveSegmentMaterial: vi.fn(),
      handleActionTypeChange: vi.fn(),
      handleMoveAction: vi.fn(),
      handleRemoveAction: vi.fn(),
      handleAddAction: vi.fn(),
      handleUpdateAction: vi.fn(),
      handleGuidedStepChange: vi.fn(),
      handleRemoveGuidedStep: vi.fn(),
      handleAddGuidedStep: vi.fn(),
      handleMoveGuidedStep: vi.fn(),
      handlePracticeQuestionChange: vi.fn(),
      handleRemovePracticeQuestion: vi.fn(),
      handleAddPracticeQuestion: vi.fn(),
      handleMovePracticeQuestion: vi.fn(),
      handlePassCriteriaChange: vi.fn(),
      handleGuidedWorkspaceChange: vi.fn(),
      handlePracticeWorkspaceChange: vi.fn(),
      handleSegmentMaterialBankChange: vi.fn(),
      handleSegmentTimelineUpdate: vi.fn(),
      handleAddTokenType: vi.fn(),
      handleUpdateTokenType: vi.fn(),
      handleRemoveTokenType: vi.fn(),
      handleAddMaterialBank: vi.fn(),
      handleUpdateMaterialBank: vi.fn(),
      handleRemoveMaterialBank: vi.fn(),
      registerInventorySnapshot: vi.fn(),
      selectSegment: vi.fn(),
      ...overrides.actions,
    },
    ...overrides,
  };

  return vm;
};

describe('EditorHeader', () => {
  it('disables undo/redo without history', () => {
    const vm = createViewModel();
    render(() => (
      <EditorStoresStaticProvider value={vm}>
        <EditorHeader />
      </EditorStoresStaticProvider>
    ));

    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /redo/i })).toBeDisabled();
  });

  it('calls undo when history exists', () => {
    const undo = vi.fn();
    const vm = createViewModel({}, { canUndo: () => true, undo });

    render(() => (
      <EditorStoresStaticProvider value={vm}>
        <EditorHeader />
      </EditorStoresStaticProvider>
    ));
    screen.getByRole('button', { name: /undo/i }).click();
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it('disables publish/save when no lesson is selected', () => {
    const vm = createViewModel({
      selection: {
        selectedUnitId: () => undefined,
        setSelectedUnitId: vi.fn() as unknown as Setter<Id<'units'> | undefined>,
        selectedTopicId: () => undefined,
        setSelectedTopicId: vi.fn() as unknown as Setter<Id<'topics'> | undefined>,
        selectedLessonId: () => undefined,
        setSelectedLessonId: vi.fn() as unknown as Setter<Id<'lessons'> | undefined>,
        selectedSegmentId: () => undefined,
        setSelectedSegmentId: vi.fn(),
      },
    });

    render(() => (
      <EditorStoresStaticProvider value={vm}>
        <EditorHeader />
      </EditorStoresStaticProvider>
    ));
    expect(screen.getByRole('button', { name: /publish/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
  });
});
