import { For, Show, createMemo } from 'solid-js';
import type { Component } from 'solid-js';

import type { SegmentTimeline } from '@monte/types';

import { Button, Card } from '../../../shared/ui';
import { useTimelineStore } from '../state/timelineContext';

interface TimelineEditorProps {
  lessonId: string;
  segmentId: string;
  timeline: SegmentTimeline;
  onApplyTimeline: (timeline: SegmentTimeline) => void;
}

export const TimelineEditor: Component<TimelineEditorProps> = (props) => {
  const timelineStore = useTimelineStore();

  const steps = createMemo(() => timelineStore.state.steps);
  const nodes = timelineStore.sceneNodes;
  const selectedIds = () => timelineStore.state.selectedNodeIds;

  return (
    <Card variant="floating" class="space-y-4 p-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-[color:var(--color-heading)]">Timeline (beta)</h4>
        <Button
          size="compact"
          onClick={() => {
            const serialized = timelineStore.serialize();
            props.onApplyTimeline(serialized);
          }}
          disabled={!timelineStore.state.isDirty}
        >
          Apply timeline
        </Button>
      </div>

      <div class="grid gap-4 lg:grid-cols-[260px,1fr]">
        <section class="space-y-2">
          <div class="flex items-center justify-between">
            <h5 class="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
              Scene Nodes
            </h5>
            <Button size="compact" variant="secondary" onClick={() => timelineStore.clearSelection()}>
              Clear
            </Button>
          </div>
          <div class="space-y-1">
            <Show
              when={nodes().length > 0}
              fallback={<p class="text-xs text-[color:var(--color-text-muted)]">No scene nodes yet.</p>}
            >
              <For each={nodes()}>
                {(node) => {
                  const isSelected = () => selectedIds().includes(node.id);
                  return (
                    <label class="flex items-center justify-between gap-2 rounded-md border border-[rgba(64,157,233,0.2)] bg-white px-3 py-2 text-sm shadow-sm">
                      <div class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected()}
                          onChange={(event) => {
                            const pointer = event as unknown as MouseEvent;
                            const additive = pointer.shiftKey || pointer.metaKey || pointer.ctrlKey;
                            const mode = event.currentTarget.checked
                              ? additive
                                ? 'add'
                                : 'replace'
                              : 'toggle';
                            timelineStore.setSelection(node.id, mode);
                          }}
                        />
                        <div class="flex flex-col">
                          <span class="font-medium text-[color:var(--color-heading)]">{node.label ?? node.id}</span>
                          <span class="text-xs text-[color:var(--color-text-muted)]">{node.materialId}</span>
                        </div>
                      </div>
                    </label>
                  );
                }}
              </For>
            </Show>
          </div>
        </section>

        <section class="space-y-3">
          <div class="flex items-center justify-between">
            <h5 class="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
              Steps
            </h5>
            <div class="flex gap-2">
              <Button size="compact" variant="secondary" onClick={() => timelineStore.addStep()}>
                Add step
              </Button>
              <Button
                size="compact"
                variant="secondary"
                onClick={() => timelineStore.captureKeyframes()}
                disabled={selectedIds().length === 0 && nodes().length === 0}
              >
                Capture keyframes
              </Button>
            </div>
          </div>

          <Show
            when={steps().length > 0}
            fallback={<p class="text-xs text-[color:var(--color-text-muted)]">No steps yet. Add one to begin.</p>}
          >
            <ol class="space-y-2">
              <For each={steps()}>
                {(step, index) => {
                  const isActive = () => index() === timelineStore.state.currentStepIndex;
                  return (
                    <li
                      class={`rounded-lg border px-3 py-2 text-sm transition hover:border-[rgba(64,157,233,0.6)] ${
                        isActive()
                          ? 'border-[rgba(64,157,233,0.6)] bg-[rgba(64,157,233,0.08)]'
                          : 'border-[rgba(64,157,233,0.2)] bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        class="flex w-full items-center justify-between gap-2 text-left"
                        onClick={() => timelineStore.setCurrentStep(index())}
                      >
                        <div class="flex flex-col">
                          <span class="font-medium text-[color:var(--color-heading)]">
                            {step.title ?? `Step ${index() + 1}`}
                          </span>
                          <span class="text-xs text-[color:var(--color-text-muted)]">
                            Actor: {step.actor} • Duration: {step.durationMs}ms
                          </span>
                        </div>
                        <Button
                          size="compact"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            timelineStore.removeStep(step.id);
                          }}
                        >
                          Remove
                        </Button>
                      </button>
                      <Show when={(step.keyframes?.length ?? 0) > 0}>
                        <div class="mt-2 flex flex-wrap gap-1 text-xs text-[color:var(--color-text-muted)]">
                          <For each={step.keyframes ?? []}>
                            {(track) => (
                              <span class="rounded bg-[rgba(64,157,233,0.12)] px-2 py-1">
                                {track.nodeId}:{' '}
                                {(track.keyframes ?? []).map((frame) => `${frame.timeMs}ms`).join(', ')}
                              </span>
                            )}
                          </For>
                        </div>
                      </Show>
                    </li>
                  );
                }}
              </For>
            </ol>
          </Show>
        </section>
      </div>
    </Card>
  );
};

export default TimelineEditor;
