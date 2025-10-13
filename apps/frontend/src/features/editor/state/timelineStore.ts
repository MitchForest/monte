import { createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';

import type { SegmentStep, SegmentTimeline, TimelineTrack, TimelineTransform } from '@monte/types';

import {
  normalizeTimeline,
  normalizeTimelineStep,
  normalizeTimelineTransform,
} from '@monte/lesson-service';

import type { SceneNodeState, TimelineLoadInput, TimelineSelectionMode, TimelineStoreState } from '../types/timeline';

export const createTimelineStore = () => {
  const [state, setState] = createStore<TimelineStoreState>({
    lessonId: undefined,
    segmentId: undefined,
    sceneNodes: {},
    selectedNodeIds: [],
    steps: [],
    timelineVersion: 1,
    timelineLabel: undefined,
    timelineMetadata: undefined,
    currentStepIndex: 0,
    isDirty: false,
  });

  const load = (input: TimelineLoadInput) => {
    const { lessonId, segmentId, nodes, timeline } = input;
    const normalizedTimeline = normalizeTimeline(timeline);
    const nodeEntries = nodes.map<SceneNodeState>((node) => ({
      ...node,
      transform: normalizeTimelineTransform(node.transform),
    }));

    const sceneNodes = Object.fromEntries(nodeEntries.map((node) => [node.id, node]));

    setState({
      lessonId,
      segmentId,
      sceneNodes,
      selectedNodeIds: [],
      steps: normalizedTimeline.steps,
      timelineVersion: normalizedTimeline.version ?? 1,
      timelineLabel: normalizedTimeline.label,
      timelineMetadata: normalizedTimeline.metadata,
      currentStepIndex: 0,
      isDirty: false,
    });
  };

  const ensureLoaded = () => {
    if (!state.lessonId || !state.segmentId) {
      throw new Error('Timeline store not initialized. Call load() before mutating state.');
    }
  };

  const setCurrentStep = (index: number) => {
    ensureLoaded();
    const clamped = Math.max(0, Math.min(index, state.steps.length - 1));
    setState('currentStepIndex', clamped);
  };

  const addStep = (step?: Partial<SegmentStep>) => {
    ensureLoaded();
    const base: SegmentStep = normalizeTimelineStep({
      id: step?.id ?? `step-${Date.now()}`,
      title: step?.title,
      caption: step?.caption,
      actor: step?.actor ?? 'guide',
      durationMs: step?.durationMs ?? 4000,
      keyframes: step?.keyframes ?? [],
      interactions: step?.interactions ?? [],
      metadata: step?.metadata,
    });
    setState(
      produce((draft) => {
        draft.steps.push(base);
        draft.currentStepIndex = draft.steps.length - 1;
        draft.isDirty = true;
      }),
    );
  };

  const removeStep = (stepId: string) => {
    ensureLoaded();
    const index = state.steps.findIndex((step) => step.id === stepId);
    if (index === -1) return;
    setState(
      produce((draft) => {
        draft.steps.splice(index, 1);
        draft.currentStepIndex = Math.max(0, Math.min(draft.currentStepIndex, draft.steps.length - 1));
        draft.isDirty = true;
      }),
    );
  };

  const updateStep = (stepId: string, update: (step: SegmentStep) => SegmentStep) => {
    ensureLoaded();
    const index = state.steps.findIndex((step) => step.id === stepId);
    if (index === -1) return;
    setState(
      produce((draft) => {
        draft.steps[index] = normalizeTimelineStep(update(draft.steps[index]));
        draft.isDirty = true;
      }),
    );
  };

  const setSelection = (nodeId: string, mode: TimelineSelectionMode = 'replace') => {
    ensureLoaded();
    setState(
      produce((draft) => {
        const alreadySelected = draft.selectedNodeIds.includes(nodeId);
        if (mode === 'replace') {
          draft.selectedNodeIds = [nodeId];
          return;
        }
        if (mode === 'toggle') {
          draft.selectedNodeIds = alreadySelected
            ? draft.selectedNodeIds.filter((id) => id !== nodeId)
            : [...draft.selectedNodeIds, nodeId];
          return;
        }
        if (!alreadySelected) {
          draft.selectedNodeIds = [...draft.selectedNodeIds, nodeId];
        }
      }),
    );
  };

  const clearSelection = () => {
    setState('selectedNodeIds', []);
  };

  const updateNodeTransform = (nodeId: string, transform: TimelineTransform) => {
    ensureLoaded();
    if (!state.sceneNodes[nodeId]) return;
    setState(
      produce((draft) => {
        draft.sceneNodes[nodeId] = {
          ...draft.sceneNodes[nodeId],
          transform: normalizeTimelineTransform(transform),
        };
        draft.isDirty = true;
      }),
    );
  };

  const captureKeyframes = (timeMs = 0) => {
    ensureLoaded();
    const stepIndex = state.currentStepIndex;
    if (!state.steps[stepIndex]) return;
    const selected = state.selectedNodeIds.length > 0 ? state.selectedNodeIds : Object.keys(state.sceneNodes);
    setState(
      produce((draft) => {
        const step = draft.steps[stepIndex];
        if (!step) return;
        const existingTracks = step.keyframes ?? [];
        const byNode = new Map<string, TimelineTrack>(
          existingTracks.map((track) => [
            track.nodeId,
            {
              nodeId: track.nodeId,
              metadata: track.metadata,
              keyframes: track.keyframes.map((frame) => ({
                ...frame,
                transform: normalizeTimelineTransform(frame.transform),
              })),
            },
          ]),
        );
        for (const nodeId of selected) {
          const node = draft.sceneNodes[nodeId];
          if (!node) continue;
          const track = byNode.get(nodeId) ?? { nodeId, keyframes: [], metadata: undefined };
          const filtered = track.keyframes.filter((frame) => frame.timeMs !== timeMs);
          const updated = [
            ...filtered,
            {
              timeMs,
              transform: normalizeTimelineTransform(node.transform),
            },
          ];
          byNode.set(nodeId, {
            nodeId,
            metadata: track.metadata,
            keyframes: updated.map((frame) => ({
              ...frame,
              transform: normalizeTimelineTransform(frame.transform),
            })),
          });
        }
        const normalized = normalizeTimelineStep({
          ...step,
          keyframes: Array.from(byNode.values()),
        });
        step.keyframes = normalized.keyframes;
        step.interactions = normalized.interactions;
        draft.isDirty = true;
      }),
    );
  };

  const serialize = (): SegmentTimeline =>
    normalizeTimeline({
      version: state.timelineVersion,
      label: state.timelineLabel,
      metadata: state.timelineMetadata,
      steps: state.steps,
    });

  const selectedNodes = createMemo(() => state.selectedNodeIds.map((id) => state.sceneNodes[id]).filter(Boolean));

  const sceneNodeList = createMemo(() => Object.values(state.sceneNodes));

  return {
    state,
    sceneNodes: sceneNodeList,
    getNode: (nodeId: string) => state.sceneNodes[nodeId],
    load,
    setCurrentStep,
    addStep,
    removeStep,
    updateStep,
    setSelection,
    clearSelection,
    updateNodeTransform,
    captureKeyframes,
    serialize,
    selectedNodes,
  } as const;
};

export type TimelineStore = ReturnType<typeof createTimelineStore>;
