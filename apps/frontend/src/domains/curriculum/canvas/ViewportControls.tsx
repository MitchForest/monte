import type { JSX } from 'solid-js';
import { Show, createMemo } from 'solid-js';
import { Portal } from 'solid-js/web';

import { Button } from '../../../design-system';
import { useLessonCanvas } from './hooks';
import type { ViewportState } from './types';

interface LessonCanvasControlsProps extends JSX.HTMLAttributes<HTMLDivElement> {
  showResetButton?: boolean;
  zoomStep?: number;
}

const formatScale = (viewport: ViewportState) => `${Math.round(viewport.scale * 100)}%`;

export const LessonCanvasControls = (props: LessonCanvasControlsProps) => {
  const { class: className, style, zoomStep = 0.1, showResetButton = true, ...rest } = props;
  const { viewport, setViewport, resetViewport, overlay } = useLessonCanvas();

  const handleZoom = (delta: number) => {
    setViewport((previous) => ({
      ...previous,
      scale: previous.scale + delta,
    }));
  };

  const scaleLabel = createMemo(() => formatScale(viewport()));

  const computedStyle = createMemo<JSX.CSSProperties>(() => ({
    position: 'relative',
    display: 'inline-flex',
    'align-items': 'center',
    'gap': '0.5rem',
    padding: '0.25rem',
    'border-radius': '9999px',
    background: 'rgba(255, 255, 255, 0.85)',
    'box-shadow': '0 2px 8px rgba(12, 42, 101, 0.1)',
    'pointer-events': 'auto',
    ...(style as JSX.CSSProperties | undefined),
  }));

  const mountElement = createMemo(() => overlay());

  const content = () => (
    <div
      class={`lesson-canvas-controls ${className ?? ''}`.trim()}
      style={computedStyle()}
      {...rest}
    >
      <span class="lesson-canvas-controls__label" style={{ 'font-size': '0.75rem', 'font-weight': 600 }}>
        {scaleLabel()}
      </span>
      <div class="lesson-canvas-controls__actions" style={{ display: 'inline-flex', gap: '0.25rem' }}>
        <Button
          type="button"
          size="compact"
          variant="secondary"
          aria-label="Zoom out"
          title="Zoom out (Ctrl/Cmd + scroll down)"
          onClick={() => handleZoom(-zoomStep)}
        >
          –
        </Button>
        <Button
          type="button"
          size="compact"
          variant="secondary"
          aria-label="Zoom in"
          title="Zoom in (Ctrl/Cmd + scroll up)"
          onClick={() => handleZoom(zoomStep)}
        >
          +
        </Button>
        <Show when={showResetButton}>
          <Button
            type="button"
            size="compact"
            variant="ghost"
            aria-label="Reset zoom"
             title="Reset zoom"
            onClick={() => resetViewport()}
          >
            Reset
          </Button>
        </Show>
      </div>
    </div>
  );

  return (
    <Show when={mountElement()} fallback={content()}>
      {(mount) => (
        <Portal mount={mount()}>{content()}</Portal>
      )}
    </Show>
  );
};
