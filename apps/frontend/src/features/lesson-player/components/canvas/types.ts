import type { JSX } from 'solid-js';

export interface Vector2D {
  x: number;
  y: number;
}

export interface ViewportState {
  scale: number;
  offset: Vector2D;
}

export type ViewportUpdate =
  | Partial<ViewportState>
  | ((previous: ViewportState) => ViewportState);

export interface LessonCanvasContextValue {
  viewport: () => ViewportState;
  setViewport: (update: ViewportUpdate) => void;
  resetViewport: () => void;
  overlay: () => HTMLDivElement | undefined;
  setOverlayContent: (content: JSX.Element | undefined) => void;
}

export interface LessonCanvasProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element;
  initialViewport?: ViewportState;
  minScale?: number;
  maxScale?: number;
  onViewportChange?: (viewport: ViewportState) => void;
  stageClass?: string;
  stageStyle?: JSX.CSSProperties;
  enablePan?: boolean;
  zoomOnWheel?: boolean;
  zoomStep?: number;
  showControls?: boolean;
  renderOverlay?: JSX.Element;
}
