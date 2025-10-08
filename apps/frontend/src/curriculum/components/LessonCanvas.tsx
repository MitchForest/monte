import type { Component, JSX } from 'solid-js';

import { Card } from '../../design-system';

interface LessonCanvasProps {
  header: JSX.Element;
  children: JSX.Element;
  footer?: JSX.Element;
}

export const LessonCanvas: Component<LessonCanvasProps> = (props) => {
  return (
    <Card variant="floating" class="flex flex-col gap-6 p-6 sm:p-8">
      <div class="text-[color:var(--color-heading)]">{props.header}</div>
      <div class="relative min-h-[360px] rounded-[var(--radius-lg)] border border-[rgba(64,157,233,0.25)] bg-[rgba(233,245,251,0.6)] p-6">
        <div class="pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] border border-[rgba(140,204,212,0.35)]" />
        <div class="relative z-10 h-full w-full">{props.children}</div>
      </div>
      {props.footer && <div class="text-subtle">{props.footer}</div>}
    </Card>
  );
};
