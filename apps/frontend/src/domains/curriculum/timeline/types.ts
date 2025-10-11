import type { SegmentStep, SegmentTimeline, TimelineTransform } from '@monte/types';

export interface SceneNodeState {
  id: string;
  materialId: string;
  label?: string;
  transform: TimelineTransform;
  metadata?: Record<string, unknown>;
}

export type SceneNodeSnapshot = SceneNodeState;

export interface TimelineLoadInput {
  lessonId: string;
  segmentId: string;
  nodes: SceneNodeState[];
  timeline: SegmentTimeline;
}

export interface TimelineStoreState {
  lessonId?: string;
  segmentId?: string;
  sceneNodes: Record<string, SceneNodeState>;
  selectedNodeIds: string[];
  steps: SegmentStep[];
  currentStepIndex: number;
  isDirty: boolean;
}

export type TimelineSelectionMode = 'replace' | 'toggle' | 'add';
