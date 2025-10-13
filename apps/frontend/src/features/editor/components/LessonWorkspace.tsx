import { For, Show, createEffect } from 'solid-js';

import {
  useEditorActions,
  useEditorComputed,
  useEditorOptions,
  useEditorSelection,
} from '../state/useEditorViewModel';
import {
  PresentationActionEditor,
  GuidedStepEditor,
  PracticeSegmentEditor,
} from './lessonEditors';
import { Button, Card } from '../../../shared/ui';
import { curriculumMaterials } from '../../../shared/curriculum/materials';
import { ensureSegmentTimeline } from '../../lesson-player';
import type { LessonSegment, PresentationSegmentType } from '../types';
import type { SegmentTimeline } from '@monte/types';
import { InventoryPanel } from './InventoryPanel';
import { LessonInventoryProvider } from '../../../shared/curriculum/inventory/context';
import { SegmentPreview } from './SegmentPreview';
import { TimelineProvider } from '../state/timelineContext';
import { createTimelineStore } from '../state/timelineStore';
import TimelineEditor from './TimelineEditor';
import TimelineCanvas from './TimelineCanvas';
import { mapInventoryNodes } from '../utils/timeline';

const EMPTY_TIMELINE: SegmentTimeline = { version: 1, steps: [] };

export const LessonWorkspace = () => {
  const { lessonDocument, materialInventory, selectedSegment } = useEditorComputed();
  const { scenarioKindOptions, representationOptions } = useEditorOptions();
  const timelineStore = createTimelineStore();
  const {
    handleLessonMaterialChange,
    handleAddLessonMaterial,
    handleRemoveLessonMaterial,
    handleDocumentScenarioUpdate,
    handleAddSegment,
    handleRemoveSegment,
    handleMoveSegment,
    handleSegmentTitleChange,
    handleSegmentRepresentationChange,
    handleSegmentSkillsChange,
    handleSegmentScenarioUpdate,
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
    registerInventorySnapshot,
    selectSegment,
    handleSegmentTimelineUpdate,
  } = useEditorActions();
  const { selectedSegmentId } = useEditorSelection();
  createEffect(() => {
    const doc = lessonDocument();
    const segment = selectedSegment();
    if (!doc || !segment) return;
    timelineStore.load({
      lessonId: doc.lesson.id,
      segmentId: segment.id,
      nodes: mapInventoryNodes({ document: doc, segment }),
      timeline: ensureSegmentTimeline(segment).timeline ?? EMPTY_TIMELINE,
    });
  });

  return (
    <section class="space-y-4">
      <Card variant="soft" class="space-y-4 p-5">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Materials</h3>
        <div class="space-y-3">
          <For each={lessonDocument()?.lesson.materials ?? []}>
            {(material, index) => (
              <div class="grid gap-2 rounded-md border border-[rgba(64,157,233,0.2)] bg-white p-3 shadow-sm md:grid-cols-3">
                <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  <span>Material</span>
                  <select
                    class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={material.materialId}
                    onChange={(event) =>
                      handleLessonMaterialChange(index(), 'materialId', event.currentTarget.value)
                    }
                  >
                    <For each={curriculumMaterials}>
                      {(entry) => <option value={entry.id}>{entry.name}</option>}
                    </For>
                  </select>
                </label>
                <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  <span>Purpose</span>
                  <input
                    class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={material.purpose}
                    onInput={(event) =>
                      handleLessonMaterialChange(index(), 'purpose', event.currentTarget.value)
                    }
                  />
                </label>
                <div class="flex items-center justify-between gap-2">
                  <label class="flex items-center gap-2 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    <input
                      type="checkbox"
                      checked={material.optional ?? false}
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
      </Card>

      <Card variant="soft" class="space-y-3 p-5">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Lesson scenario seed</h3>
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
            <For each={scenarioKindOptions}>{(kind) => <option value={kind}>{kind}</option>}</For>
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
      </Card>

      {lessonDocument() && selectedSegment() && (() => {
        const doc = lessonDocument();
        const segment = selectedSegment();
        if (!doc || !segment) return null;
        const timeline = ensureSegmentTimeline(segment).timeline ?? EMPTY_TIMELINE;
        return (
          <TimelineProvider store={timelineStore}>
            <TimelineCanvas />
            <TimelineEditor
              lessonId={doc.lesson.id}
              segmentId={segment.id}
              timeline={timeline}
              onApplyTimeline={(nextTimeline) => handleSegmentTimelineUpdate(segment.id, nextTimeline)}
            />
          </TimelineProvider>
        );
      })()}

      <Card variant="soft" class="space-y-4 p-5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Segments</h3>
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

        <Show
          when={lessonDocument()?.lesson.segments.length}
          fallback={<p class="text-xs text-[color:var(--color-text-muted)]">No segments yet. Add presentation, guided, or practice segments to begin.</p>}
        >
          <div class="space-y-4">
            <For each={lessonDocument()?.lesson.segments ?? []}>
              {(segment, index) => (
                <Card
                  variant="floating"
                  class={`space-y-3 p-4 transition-colors ${selectedSegmentId() === segment.id ? 'border-[rgba(64,157,233,0.6)] bg-[rgba(64,157,233,0.08)] shadow-[0_8px_24px_rgba(64,157,233,0.12)]' : ''}`}
                >
                  <div
                    class="flex items-center justify-between gap-2"
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedSegmentId() === segment.id}
                    onClick={() => selectSegment(segment.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectSegment(segment.id);
                      }
                    }}
                  >
                    <div class="flex items-center gap-2">
                      <input
                        class="w-64 rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                        value={segment.title}
                        onInput={(event) => handleSegmentTitleChange(segment.id, event.currentTarget.value)}
                      />
                      <span class="text-xs text-[color:var(--color-text-muted)]">{segment.id}</span>
                    </div>
                    <div class="flex items-center gap-1">
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
                        disabled={index() === (lessonDocument()?.lesson.segments.length ?? 0) - 1}
                        onClick={() => handleMoveSegment(segment.id, 1)}
                      >
                        ↓
                      </Button>
                      <Button size="compact" variant="secondary" onClick={() => handleRemoveSegment(segment.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div class="grid gap-2 md:grid-cols-2">
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                      <span>Representation</span>
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
                    </label>
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                      <span>Skills (comma separated)</span>
                      <input
                        class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                        value={(segment.skills ?? []).join(', ')}
                        onInput={(event) => handleSegmentSkillsChange(segment.id, event.currentTarget.value)}
                      />
                    </label>
                  </div>

                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Materials</span>
                      <Button size="compact" variant="secondary" onClick={() => handleAddSegmentMaterial(segment.id)}>
                        Add material
                      </Button>
                    </div>
                    <div class="space-y-2">
                      <For each={segment.materials}>
                        {(material, materialIndex) => (
                          <div class="grid gap-2 rounded-md border border-[rgba(64,157,233,0.2)] bg-white p-3 shadow-sm md:grid-cols-3">
                            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                              <span>Material</span>
                              <input
                                class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                                value={material.materialId}
                                onInput={(event) =>
                                  handleSegmentMaterialChange(
                                    segment.id,
                                    materialIndex(),
                                    'materialId',
                                    event.currentTarget.value,
                                  )
                                }
                              />
                            </label>
                            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                              <span>Purpose</span>
                              <input
                                class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
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
                            </label>
                            <div class="flex items-center justify-between gap-2">
                              <label class="flex items-center gap-2 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                                <input
                                  type="checkbox"
                                  checked={material.optional ?? false}
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
                    </div>
                  </div>

                  <div class="grid gap-2 md:grid-cols-2">
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
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
                        <For each={scenarioKindOptions}>{(kind) => <option value={kind}>{kind}</option>}</For>
                      </select>
                    </label>
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
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

                  <div class="grid gap-2 md:grid-cols-2">
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                      <span>Material bank</span>
                      <select
                        class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                        value={segment.materialBankId ?? ''}
                        onChange={(event) =>
                          handleSegmentMaterialBankChange(
                            segment.id,
                            event.currentTarget.value || undefined,
                          )
                        }
                      >
                        <option value="">None (manual)</option>
                        <For
                          each={materialInventory().banks.filter(
                            (bank) =>
                              bank.scope === 'lesson' ||
                              (bank.scope === 'segment' && bank.segmentId === segment.id),
                          )}
                        >
                          {(bank) => (
                            <option value={bank.id}>
                              {bank.label} {bank.scope === 'segment' ? `(segment)` : ''}
                            </option>
                          )}
                        </For>
                      </select>
                    </label>
                    <Show
                      when={segment.materialBankId && !materialInventory().banks.some((bank) => bank.id === segment.materialBankId)}
                    >
                      <p class="rounded-md border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-xs text-[rgba(239,68,68,0.9)]">
                        Linked bank missing from inventory.
                      </p>
                    </Show>
                  </div>

                  <Show when={segment.type === 'presentation'}>
                    <PresentationActionEditor
                      segment={segment as PresentationSegmentType}
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
                      onWorkspaceChange={(workspace) => handleGuidedWorkspaceChange(segment.id, workspace)}
                      onStepChange={handleGuidedStepChange}
                      onRemoveStep={handleRemoveGuidedStep}
                      onAddStep={(workspace) => handleAddGuidedStep(segment.id, workspace)}
                      onMoveStep={handleMoveGuidedStep}
                    />
                  </Show>

                  <Show when={segment.type === 'practice'}>
                    <PracticeSegmentEditor
                      segment={segment as LessonSegment & { type: 'practice' }}
                      onWorkspaceChange={(workspace) => handlePracticeWorkspaceChange(segment.id, workspace)}
                      onQuestionChange={handlePracticeQuestionChange}
                      onRemoveQuestion={handleRemovePracticeQuestion}
                      onAddQuestion={handleAddPracticeQuestion}
                      onMoveQuestion={handleMovePracticeQuestion}
                      onPassCriteriaChange={(field, value) => handlePassCriteriaChange(segment.id, field, value)}
                    />
                  </Show>
                </Card>
              )}
            </For>
          </div>
        </Show>
      </Card>

      <Show when={lessonDocument() && selectedSegment()}>
        {(activeSegment) => (
          <LessonInventoryProvider
            inventory={lessonDocument()?.lesson.materialInventory}
          >
            <SegmentPreview
              lesson={lessonDocument()!.lesson}
              segment={activeSegment()}
              scenario={lessonDocument()?.meta?.scenario}
              onInventorySnapshot={registerInventorySnapshot}
            />
          </LessonInventoryProvider>
        )}
      </Show>

      <InventoryPanel />

      <Card variant="soft" class="space-y-3 p-5">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">Document JSON (read-only)</h3>
        <pre class="max-h-[320px] overflow-auto rounded-md border border-[rgba(64,157,233,0.4)] bg-black/80 p-4 text-xs text-[#e6f7ff]">
          {JSON.stringify(lessonDocument(), null, 2)}
        </pre>
      </Card>
    </section>
  );
};
