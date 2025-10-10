import { cva } from 'class-variance-authority';
import { For } from 'solid-js';
import type { Component } from 'solid-js';

import { cn } from '../../lib/cn';

const dotsContainer = cva('flex items-center gap-2');
const dotVariants = cva('flex h-4 w-4 items-center justify-center rounded-full transition-all duration-200 md:h-5 md:w-5', {
  variants: {
    state: {
      default: 'bg-[rgba(12,42,101,0.08)]',
      current: 'bg-[color:var(--color-primary)] shadow-[0_10px_22px_rgba(12,42,101,0.18)]',
      complete: 'bg-[color:var(--color-accent-green)]',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

export interface ProgressDotsProps {
  total: number;
  completed: number;
  currentIndex?: number;
}

export const ProgressDots: Component<ProgressDotsProps> = (props) => {
  const safeTotal = Math.max(props.total, 1);

  return (
    <div class={dotsContainer()}>
      <For each={Array.from({ length: safeTotal })}>
        {(_, index) => {
          const isCompleted = index() < props.completed;
          const isCurrent = props.currentIndex === index();

          return (
            <span
              class={cn(
                dotVariants({
                  state: isCompleted ? 'complete' : isCurrent ? 'current' : 'default',
                }),
              )}
            />
          );
        }}
      </For>
    </div>
  );
};

export default ProgressDots;
