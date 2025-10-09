import { For, Show } from 'solid-js';

import type { EditorViewModel } from '../hooks/useEditorViewModel';
import {
  PresentationActionEditor,
  GuidedStepEditor,
  PracticeSegmentEditor,
} from './lessonEditors';
import { Button, Card } from '../../../design-system';
import { curriculumMaterials } from '../../../curriculum/materials';

interface LessonWorkspaceProps {
  vm: EditorViewModel;
}

export const LessonWorkspace = ({ vm }: LessonWorkspaceProps) => {
  const {
    computed: { lessonDocument },
    options: { scenarioKindOptions, representationOptions },
    actions: {
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
    },
  } = vm;

  return (
    <section class="space-y-4">
      <Card variant="soft" class="space-y-4 p-5">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">Materials</h3>
        <div class="space-y-3">
          <For each={lessonDocument()?.lesson.materials ?? []}>
            {(material, index) => (
              <div class="grid gap-2 rounded-md border border-[rgba(64,157,233,0.2)] bg-white p-3 shadow-sm md:grid-cols-3">
                <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
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
                <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
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
                  <label class="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
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
        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">Lesson scenario seed</h3>
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

      <Card variant="soft" class="space-y-4 p-5">
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

        <Show
          when={lessonDocument()?.lesson.segments.length}
          fallback={<p class="text-xs text-muted">No segments yet. Add presentation, guided, or practice segments to begin.</p>}
        >
          <div class="space-y-4">
            <For each={lessonDocument()?.lesson.segments ?? []}>
              {(segment, index) => (
                <Card variant="outlined" class="space-y-3 p-4">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <input
                        class="w-64 rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                        value={segment.title}
                        onInput={(event) => handleSegmentTitleChange(segment.id, event.currentTarget.value)}
                      />
                      <span class="text-xs text-muted">{segment.id}</span>
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
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
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
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
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
                      <span class="text-xs font-semibold uppercase tracking-wide text-muted">Materials</span>
                      <Button size="compact" variant="secondary" onClick={() => handleAddSegmentMaterial(segment.id)}>
                        Add material
                      </Button>
                    </div>
                    <div class="space-y-2">
                      <For each={segment.materials}>
                        {(material, materialIndex) => (
                          <div class="grid gap-2 rounded-md border border-[rgba(64,157,233,0.2)] bg-white p-3 shadow-sm md:grid-cols-3">
                            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
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
                            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
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
                              <label class="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
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
                        <For each={scenarioKindOptions}>{(kind) => <option value={kind}>{kind}</option>}</For>
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
                      onAddStep={handleAddGuidedStep}
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

      <Card variant="soft" class="space-y-3 p-5">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">Document JSON (read-only)</h3>
        <pre class="max-h-[320px] overflow-auto rounded-md border border-[rgba(64,157,233,0.4)] bg-black/80 p-4 text-xs text-[#e6f7ff]">
          {JSON.stringify(lessonDocument(), null, 2)}
        </pre>
      </Card>
    </section>
  );
};
