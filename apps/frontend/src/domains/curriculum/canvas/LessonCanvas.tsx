import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
} from 'solid-js';
import type { JSX } from 'solid-js';

import './LessonCanvas.css';
import { LessonCanvasContext } from './context';
import { LessonCanvasControls } from './ViewportControls';
import type { LessonCanvasProps, ViewportState, ViewportUpdate } from './types';

const DEFAULT_VIEWPORT: ViewportState = {
  scale: 1,
  offset: { x: 0, y: 0 },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const resolveViewportUpdate = (
  update: ViewportUpdate,
  previous: ViewportState,
): ViewportState => {
  if (typeof update === 'function') {
    return update(previous);
  }
  const offset =
    update.offset !== undefined
      ? { x: update.offset.x ?? previous.offset.x, y: update.offset.y ?? previous.offset.y }
      : previous.offset;

  return {
    scale: update.scale ?? previous.scale,
    offset,
  };
};

export const LessonCanvas = (props: LessonCanvasProps) => {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'style',
    'stageClass',
    'stageStyle',
    'initialViewport',
    'minScale',
    'maxScale',
    'onViewportChange',
    'enablePan',
    'zoomOnWheel',
    'zoomStep',
    'onWheel',
    'showControls',
    'renderOverlay',
  ]);

  const minScale = local.minScale ?? 0.5;
  const maxScale = local.maxScale ?? 2;
  const initialViewport = local.initialViewport ?? DEFAULT_VIEWPORT;
  const enablePan = local.enablePan ?? true;
  const zoomOnWheel = local.zoomOnWheel ?? true;
  const zoomStep = local.zoomStep ?? 0.1;
  const showControls = local.showControls ?? true;

  const [viewport, setViewportSignal] = createSignal<ViewportState>(initialViewport, {
    equals: false,
  });
  const [overlayElement, setOverlayElement] = createSignal<HTMLDivElement>();
  const [overlayContent, setOverlayContent] = createSignal<JSX.Element | undefined>(local.renderOverlay);
  const [isSpacePressed, setIsSpacePressed] = createSignal(false);
  const [isPanning, setIsPanning] = createSignal(false);
  let stageElement: HTMLDivElement | undefined;
  let lastPointerPosition: { x: number; y: number } | undefined;

  const setViewport = (update: ViewportUpdate) => {
    setViewportSignal((previous) => {
      const resolved = resolveViewportUpdate(update, previous);
      const scale = clamp(resolved.scale, minScale, maxScale);
      return {
        scale,
        offset: resolved.offset,
      };
    });
  };

  const resetViewport = () => setViewportSignal(initialViewport);

  createEffect(() => {
    local.onViewportChange?.(viewport());
  });

  createEffect(() => {
    setOverlayContent(local.renderOverlay);
  });

  const stageStyle = createMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    'flex-direction': 'column',
    gap: '1rem',
    'transform-origin': '0 0',
    transform: `translate(${viewport().offset.x}px, ${viewport().offset.y}px) scale(${viewport().scale})`,
    cursor: enablePan ? (isPanning() || isSpacePressed() ? 'grabbing' : 'grab') : undefined,
    'touch-action': enablePan ? 'none' : undefined,
    ...local.stageStyle,
  }) as JSX.CSSProperties, undefined, { equals: false });

  const containerStyle = createMemo(() => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...(local.style as JSX.CSSProperties | undefined),
  }) as JSX.CSSProperties, undefined, { equals: false });

  const overlayStyle: JSX.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    'pointer-events': 'none',
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (!enablePan) return;
    const pointerType = event.pointerType;
    const isTouchLike = pointerType === 'touch' || pointerType === 'pen';
    const shouldPan =
      isTouchLike ||
      event.button === 1 ||
      (event.button === 0 && (isSpacePressed() || event.altKey));
    if (!shouldPan) return;

    event.preventDefault();
    if (stageElement) {
      stageElement.setPointerCapture(event.pointerId);
    }
    lastPointerPosition = { x: event.clientX, y: event.clientY };
    setIsPanning(true);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isPanning() || !lastPointerPosition) return;
    event.preventDefault();
    const deltaX = event.clientX - lastPointerPosition.x;
    const deltaY = event.clientY - lastPointerPosition.y;
    lastPointerPosition = { x: event.clientX, y: event.clientY };
    setViewport((previous) => ({
      ...previous,
      offset: {
        x: previous.offset.x + deltaX,
        y: previous.offset.y + deltaY,
      },
    }));
  };

  const endPan = (event: PointerEvent) => {
    if (!isPanning()) return;
    event.preventDefault();
    if (stageElement?.hasPointerCapture(event.pointerId)) {
      stageElement.releasePointerCapture(event.pointerId);
    }
    setIsPanning(false);
    lastPointerPosition = undefined;
  };

  const handlePointerUp = (event: PointerEvent) => {
    endPan(event);
  };

  const handlePointerCancel = (event: PointerEvent) => {
    endPan(event);
  };

  const handlePointerLeave = (event: PointerEvent) => {
    if (!stageElement?.hasPointerCapture(event.pointerId)) {
      endPan(event);
    }
  };

  const invokeWheelHandler = (event: WheelEvent & { currentTarget: HTMLDivElement; target: Element }) => {
    const handler = local.onWheel;
    if (!handler) return;
    if (typeof handler === 'function') {
      (handler as (ev: WheelEvent & { currentTarget: HTMLDivElement; target: Element }) => void)(event);
    } else if ('handleEvent' in handler && typeof handler.handleEvent === 'function') {
      (handler as { handleEvent: (ev: WheelEvent & { currentTarget: HTMLDivElement; target: Element }) => void }).handleEvent(event);
    }
  };

  const handleWheel: JSX.EventHandlerUnion<HTMLDivElement, WheelEvent> = (event) => {
    if (zoomOnWheel && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      setViewport((previous) => ({
        ...previous,
        scale: previous.scale + direction * zoomStep,
      }));
    }
    invokeWheelHandler(event as WheelEvent & { currentTarget: HTMLDivElement; target: Element });
  };

  onMount(() => {
    const listenerOptions: AddEventListenerOptions = { capture: true };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (!isSpacePressed()) {
        event.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    const handleWindowBlur = () => {
      setIsSpacePressed(false);
      setIsPanning(false);
      lastPointerPosition = undefined;
    };

    window.addEventListener('keydown', handleKeyDown, listenerOptions);
    window.addEventListener('keyup', handleKeyUp, listenerOptions);
    window.addEventListener('blur', handleWindowBlur);

    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown, listenerOptions);
      window.removeEventListener('keyup', handleKeyUp, listenerOptions);
      window.removeEventListener('blur', handleWindowBlur);
    });
  });

  const contextValue = {
    viewport,
    setViewport,
    resetViewport,
    overlay: overlayElement,
    setOverlayContent,
  };

  onCleanup(() => {
    setOverlayElement(undefined);
  });

  return (
    <LessonCanvasContext.Provider value={contextValue}>
      <div
        class={`lesson-canvas ${local.class ?? ''}`.trim()}
        data-lesson-canvas
        style={containerStyle()}
        onWheel={handleWheel}
        {...rest}
      >
        <div
          class={`lesson-canvas__stage ${local.stageClass ?? ''}`.trim()}
          style={stageStyle()}
          ref={(element) => {
            stageElement = element ?? undefined;
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerLeave}
        >
          {local.children}
        </div>
        <div
          class="lesson-canvas__overlay"
          ref={(element) => {
            setOverlayElement(element ?? undefined);
          }}
          style={overlayStyle}
        >
          <div class="lesson-canvas__overlay-content">
            <Show when={overlayContent()}>
              {(content) => <div class="lesson-canvas__custom-overlay">{content()}</div>}
            </Show>
            <div class="lesson-canvas__overlay-spacer" />
            <div class="lesson-canvas__gesture-hint">Pan: Space/Alt + drag • Zoom: Ctrl/⌘ + wheel</div>
          </div>
        </div>

        <Show when={showControls}>
          <div class="lesson-canvas__controls-layer">
            <LessonCanvasControls />
          </div>
        </Show>
      </div>
    </LessonCanvasContext.Provider>
  );
};

export type { LessonCanvasProps } from './types';
