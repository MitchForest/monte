import { For, Show } from 'solid-js';

import {
  actionTypeOptions,
  beadPlaceOptions,
  difficultyOptions,
  exchangeFromOptions,
  exchangeToOptions,
  guidedEvaluatorOptions,
  positionOptions,
  workspaceOptions,
} from '../constants';
import { clone, defaultPassCriteria } from '../utils';
import type {
  GuidedStepWithEvaluator,
  LessonSegment,
  PresentationSegmentType,
} from '../types';
import type {
  GuidedEvaluatorId,
  PracticeQuestion,
  PresentationAction,
} from '@monte/types';
import { Button } from '../../../design-system';

export interface PresentationActionEditorProps {
  segment: PresentationSegmentType;
  onActionTypeChange: (segmentId: string, actionId: string, type: (typeof actionTypeOptions)[number]['value']) => void;
  onMoveAction: (segmentId: string, actionId: string, direction: 'up' | 'down') => void;
  onRemoveAction: (segmentId: string, actionId: string) => void;
  onAddAction: (segmentId: string, type: (typeof actionTypeOptions)[number]['value']) => void;
  onUpdateAction: (
    segmentId: string,
    actionId: string,
    mutate: (action: PresentationAction) => PresentationAction,
  ) => void;
}

export const PresentationActionEditor = (props: PresentationActionEditorProps) => {
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
        <div class="flex items-center gap-2">
          <h4 class="text-sm font-semibold">{props.segment.title}</h4>
          <span class="text-xs text-muted">{props.segment.id}</span>
        </div>
        <div class="flex items-center gap-1">
          <Button
            size="compact"
            variant="secondary"
            disabled={props.segment.script?.actions.length === 0}
            onClick={() => props.onAddAction(props.segment.id, 'narrate')}
          >
            Quick narrate
          </Button>
        </div>
      </div>

      <div class="space-y-3 rounded-md border border-[rgba(64,157,233,0.2)] bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <h5 class="text-xs font-semibold uppercase tracking-wide text-muted">Actions</h5>
          <select
            class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
            onChange={(event) =>
              props.onAddAction(
                props.segment.id,
                event.currentTarget.value as (typeof actionTypeOptions)[number]['value'],
              )
            }
          >
            <option value="">Add action…</option>
            <For each={actionTypeOptions}>{(option) => <option value={option.value}>{option.label}</option>}</For>
          </select>
        </div>

        <Show when={actions().length > 0} fallback={<p class="text-xs text-muted">No actions added yet.</p>}>
          <div class="space-y-3">
            <For each={actions()}>
              {(action, index) => (
                <div class="rounded-md border border-[rgba(64,157,233,0.2)] bg-white p-3 shadow-sm">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <select
                        class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-2 py-1 text-xs shadow-sm"
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
                      <span class="text-xs text-muted">#{action.id}</span>
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

                  <div class="mt-3 space-y-3 text-sm">{renderActionFields(action)}</div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};

export interface GuidedStepEditorProps {
  segment: LessonSegment & { type: 'guided' };
  onWorkspaceChange: (workspace: 'golden-beads' | 'stamp-game') => void;
  onStepChange: (
    segmentId: string,
    stepId: string,
    mutate: (
      step: GuidedStepWithEvaluator,
    ) => GuidedStepWithEvaluator,
  ) => void;
  onRemoveStep: (segmentId: string, stepId: string) => void;
  onAddStep: (workspace: 'golden-beads' | 'stamp-game') => void;
  onMoveStep: (segmentId: string, stepId: string, direction: 'up' | 'down') => void;
}

export const GuidedStepEditor = (props: GuidedStepEditorProps) => {
  const steps = () => props.segment.steps;

  const updateStep = (
    step: GuidedStepWithEvaluator,
    mutate: (draft: GuidedStepWithEvaluator) => GuidedStepWithEvaluator,
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

            <div class="grid gap-2 md:grid-cols-2">
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
            </div>

            <div class="grid gap-2 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                <span>Success Check</span>
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
              <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted md:col-span-2">
                <span>Explanation</span>
                <textarea
                  rows={2}
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                  value={step.explanation ?? ''}
                  onInput={(event) =>
                    updateStep(step, (draft) => ({
                      ...draft,
                      explanation: event.currentTarget.value,
                    }))
                  }
                />
              </label>
              <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                <span>Duration (ms)</span>
                <input
                  type="number"
                  class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
                  value={step.durationMs ?? 0}
                  onInput={(event) =>
                    updateStep(step, (draft) => ({
                      ...draft,
                      durationMs: Number(event.currentTarget.value) || undefined,
                    }))
                  }
                />
              </label>
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
                  <For each={guidedEvaluatorOptions}>
                    {(id) => (
                      <option value={id}>
                        {id}
                      </option>
                    )}
                  </For>
                </select>
              </label>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

export interface PracticeSegmentEditorProps {
  segment: LessonSegment & { type: 'practice' };
  onWorkspaceChange: (workspace: 'golden-beads' | 'stamp-game') => void;
  onQuestionChange: (
    segmentId: string,
    questionId: string,
    mutate: (question: PracticeQuestion) => PracticeQuestion,
  ) => void;
  onRemoveQuestion: (segmentId: string, questionId: string) => void;
  onAddQuestion: (segmentId: string) => void;
  onMoveQuestion: (segmentId: string, questionId: string, direction: 'up' | 'down') => void;
  onPassCriteriaChange: (field: keyof typeof defaultPassCriteria, value: number) => void;
}

export const PracticeSegmentEditor = (props: PracticeSegmentEditorProps) => {
  const questions = () => props.segment.questions;

  const updateQuestion = (question: PracticeQuestion, mutate: (draft: PracticeQuestion) => PracticeQuestion) => {
    props.onQuestionChange(props.segment.id, question.id, mutate);
  };

  return (
    <div class="space-y-4 rounded-md border border-[rgba(64,157,233,0.2)] bg-white p-4 shadow-sm text-sm">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-wide text-muted">Practice workspace</span>
        <select
          class="rounded-md border border-[rgba(64,157,233,0.4)] bg-white px-3 py-2 text-sm shadow-sm"
          value={props.segment.workspace}
          onChange={(event) => props.onWorkspaceChange(event.currentTarget.value as 'golden-beads' | 'stamp-game')}
        >
          <For each={workspaceOptions}>{(option) => <option value={option.value}>{option.label}</option>}</For>
        </select>
        <Button size="compact" variant="secondary" onClick={() => props.onAddQuestion(props.segment.id)}>
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
                  <For each={difficultyOptions}>
                    {(option) => (
                      <option value={option}>
                        {option}
                      </option>
                    )}
                  </For>
                </select>
              </label>
            </div>

            <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
              <span>Prompt</span>
              <input
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
    </div>
  );
};
