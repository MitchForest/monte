import type { Accessor } from 'solid-js';
import { createEffect, createMemo } from 'solid-js';

import { useLessonCanvasContext } from './context';
import type { ViewportState } from './types';

export const useLessonCanvas = () => useLessonCanvasContext();

export const useViewport = (): Accessor<ViewportState> => {
  const { viewport } = useLessonCanvasContext();
  return createMemo(() => viewport(), undefined, { equals: false });
};

export interface ViewportObserverOptions {
  throttleMs?: number;
  minScaleDelta?: number;
  minOffsetDelta?: number;
}

export const useViewportObserver = (
  handler: (viewport: ViewportState) => void,
  options?: ViewportObserverOptions,
) => {
  const { viewport } = useLessonCanvasContext();
  const minScaleDelta = options?.minScaleDelta ?? 0.01;
  const minOffsetDelta = options?.minOffsetDelta ?? 2;
  const throttleMs = options?.throttleMs ?? 160;

  let lastViewport: ViewportState = {
    scale: viewport().scale,
    offset: { ...viewport().offset },
  };
  let lastTimestamp = 0;

  createEffect(() => {
    const current = viewport();
    const now = Date.now();
    const scaleDiff = Math.abs(current.scale - lastViewport.scale);
    const offsetDiff = Math.hypot(
      current.offset.x - lastViewport.offset.x,
      current.offset.y - lastViewport.offset.y,
    );

    if (scaleDiff < minScaleDelta && offsetDiff < minOffsetDelta) {
      return;
    }

    if (now - lastTimestamp < throttleMs) {
      return;
    }

    lastViewport = {
      scale: current.scale,
      offset: { ...current.offset },
    };
    lastTimestamp = now;
    handler(lastViewport);
  });
};
