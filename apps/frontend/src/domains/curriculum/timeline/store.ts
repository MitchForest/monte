import { createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';

import type {
  SegmentStep,
  SegmentTimeline,
  TimelineTransform,
  TimelineTrack,
} from '@monte/types';

import type { SceneNodeState, TimelineLoadInput, TimelineSelectionMode, TimelineStoreState } from './types';

const createTransform = (transform?: TimelineTransform): TimelineTransform => ({
  position: transform?.position ?? { x: 0, y: 0 },
  rotation: transform?.rotation ?? 0,
  scale: transform?.scale ?? { x: 1, y: 1 },
  opacity: transform?.opacity ?? 1,
});

const normalizeTrack = (track: TimelineTrack): TimelineTrack => ({
  nodeId: track.nodeId,
  keyframes: (track.keyframes ?? []).map((keyframe) => ({
    ...keyframe,
    transform: createTransform(keyframe.transform),
    easing: keyframe.easing,
    metadata: keyframe.metadata,
  })),
  metadata: track.metadata,
});

const normalizeStep = (step: SegmentStep): SegmentStep => ({
  ...step,
  keyframes: (step.keyframes ?? []).map(normalizeTrack),
  interactions: step.interactions ?? [],
});

const normalizeSteps = (steps: SegmentStep[]): SegmentStep[] => steps.map(normalizeStep);

export const createTimelineStore = () => {
  const [state, setState] = createStore<TimelineStoreState>({
    lessonId: undefined,
    segmentId: undefined,
    sceneNodes: {},
    selectedNodeIds: [],
    steps: [],
    currentStepIndex: 0,
    isDirty: false,
  });

  const load = (input: TimelineLoadInput) => {
    const { lessonId, segmentId, nodes, timeline } = input;
    const nodeEntries = nodes.map<SceneNodeState>((node) => ({
      ...node,
      transform: createTransform(node.transform),
    }));

    const sceneNodes = Object.fromEntries(nodeEntries.map((node) => [node.id, node]));

    setState({
      lessonId,
      segmentId,
      sceneNodes,
      selectedNodeIds: [],
      steps: normalizeSteps(timeline.steps ?? []),
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
    const base: SegmentStep = normalizeStep({
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
        draft.steps[index] = normalizeStep(update(draft.steps[index]));
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
          transform: createTransform(transform),
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
        const tracks = step.keyframes ?? [];
        const byNode = new Map<string, TimelineTrack>(tracks.map((track) => [track.nodeId, normalizeTrack(track)]));
        for (const nodeId of selected) {
          const node = draft.sceneNodes[nodeId];
          if (!node) continue;
          const track = byNode.get(nodeId) ?? { nodeId, keyframes: [] };
          track.keyframes = [
            ...track.keyframes.filter((frame) => frame.timeMs !== timeMs),
            {
              timeMs,
              transform: createTransform(node.transform),
            },
          ];
          byNode.set(nodeId, track);
        }
        step.keyframes = Array.from(byNode.values()).map(normalizeTrack);
        draft.isDirty = true;
      }),
    );
  };

  const serialize = (): SegmentTimeline => ({
    version: 1,
    steps: state.steps.map((step) => ({
      ...step,
      keyframes: (step.keyframes ?? []).map(normalizeTrack),
      interactions: step.interactions ?? [],
    })),
    metadata: undefined,
    label: undefined,
  });

  const selectedNodes = createMemo(() => state.selectedNodeIds.map((id) => state.sceneNodes[id]).filter(Boolean));

  return {
    state,
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
