import { For, Show, createSignal } from 'solid-js';
import type { Component, JSX } from 'solid-js';

import { LessonCanvas } from '../canvas';
import { useLessonCanvasContext } from '../canvas/context';
import {
  GoldenBeadHundred,
  GoldenBeadTen,
  GoldenBeadThousand,
  GoldenBeadTray,
  GoldenBeadUnit,
  YellowRibbon,
} from '../components/materials';
import { useTimelineStore } from './context';
import type { SceneNodeState } from './types';

const GoldenBeadRibbon: Component = () => <YellowRibbon length="long" />;

const materialComponentRegistry: Record<string, Component | undefined> = {
  'golden-beads-tray': GoldenBeadTray,
  'golden-beads-thousand': GoldenBeadThousand,
  'golden-beads-hundred': GoldenBeadHundred,
  'golden-beads-ten': GoldenBeadTen,
  'golden-beads-unit': GoldenBeadUnit,
  'golden-beads-ribbon': GoldenBeadRibbon,
};

const TimelineSceneNode: Component<{ node: SceneNodeState }> = (props) => {
  const timelineStore = useTimelineStore();
  const canvas = useLessonCanvasContext();
  const [isDragging, setIsDragging] = createSignal(false);
  let pointerId: number | null = null;
  let startPointer: { x: number; y: number } | null = null;
  let initialTransforms = new Map<string, SceneNodeState['transform']>();

  const handlePointerDown: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const additive = event.shiftKey || event.metaKey || event.ctrlKey;
    timelineStore.setSelection(props.node.id, additive ? 'add' : 'replace');

    pointerId = event.pointerId;
    startPointer = { x: event.clientX, y: event.clientY };
    initialTransforms = new Map(
      timelineStore.state.selectedNodeIds.map((nodeId) => [nodeId, timelineStore.getNode(nodeId)?.transform ?? props.node.transform]),
    );

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> = (event) => {
    if (!isDragging() || pointerId !== event.pointerId || !startPointer) return;
    event.preventDefault();

    const scale = canvas.viewport().scale;
    const deltaX = (event.clientX - startPointer.x) / scale;
    const deltaY = (event.clientY - startPointer.y) / scale;

    for (const nodeId of timelineStore.state.selectedNodeIds) {
      const startTransform = initialTransforms.get(nodeId) ?? props.node.transform;
      const position = startTransform.position ?? { x: 0, y: 0 };
      timelineStore.updateNodeTransform(nodeId, {
        ...startTransform,
        position: {
          x: position.x + deltaX,
          y: position.y + deltaY,
        },
      });
    }
  };

  const handlePointerUp: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> = (event) => {
    if (!isDragging() || pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
    pointerId = null;
    startPointer = null;
    initialTransforms.clear();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const transform = () => props.node.transform ?? { position: { x: 0, y: 0 } };
  const position = () => transform().position ?? { x: 0, y: 0 };
  const selected = () => timelineStore.state.selectedNodeIds.includes(props.node.id);
  const materialComponent = materialComponentRegistry[props.node.materialId];

  const resolveTransform = () => {
    const current = transform();
    const translate = `translate(${position().x}px, ${position().y}px)`;
    const rotate = current.rotation !== undefined ? ` rotate(${current.rotation}deg)` : '';
    const scale =
      current.scale !== undefined
        ? ` scale(${current.scale.x ?? 1}, ${current.scale.y ?? 1})`
        : '';
    return `${translate}${rotate}${scale}`;
  };

  const opacity = () => transform().opacity ?? 1;

  return (
    <div
      class="absolute origin-top-left rounded-md border border-transparent transition-all"
      classList={{
        'cursor-grabbing': isDragging(),
        'cursor-grab': !isDragging(),
        'ring-2 ring-[rgba(64,157,233,0.6)] shadow-lg shadow-[rgba(64,157,233,0.25)]': selected(),
        'shadow-sm shadow-[rgba(12,42,101,0.12)]': !selected(),
      }}
      style={{
        transform: resolveTransform(),
        'transform-origin': 'top left',
        opacity: opacity(),
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div class="pointer-events-none select-none">
        {(() => {
          const Content = materialComponent;
          if (Content) {
            return <Content />;
          }
          return (
            <div class="rounded-md border border-dashed border-[rgba(12,42,101,0.2)] bg-white/80 px-3 py-2 text-xs font-medium uppercase tracking-wide text-[color:var(--color-heading)]">
              {props.node.label ?? props.node.materialId}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export const TimelineCanvas: Component = () => {
  const timelineStore = useTimelineStore();

  return (
    <LessonCanvas
      class="relative h-[360px] w-full overflow-hidden rounded-xl border border-[rgba(12,42,101,0.12)] bg-[rgba(245,249,255,0.6)]"
      stageClass="relative"
      showControls
    >
      <div class="relative min-h-[320px] min-w-[480px]">
        <Show
          when={timelineStore.sceneNodes().length > 0}
          fallback={
            <div class="flex h-full items-center justify-center text-sm text-[color:var(--color-text-muted)]">
              Add manipulatives to the lesson inventory to place them on the canvas.
            </div>
          }
        >
          <For each={timelineStore.sceneNodes()}>{(node) => <TimelineSceneNode node={node} />}</For>
        </Show>
      </div>
    </LessonCanvas>
  );
};

export default TimelineCanvas;
