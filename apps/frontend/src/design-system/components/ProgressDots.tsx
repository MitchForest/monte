import type { Component } from 'solid-js';
import { For } from 'solid-js';

export interface ProgressDotsProps {
  total: number;
  completed: number;
  currentIndex?: number;
}

export const ProgressDots: Component<ProgressDotsProps> = (props) => {
  const safeTotal = Math.max(props.total, 1);

  return (
    <div class="flex items-center gap-2">
      <For each={Array.from({ length: safeTotal })}>
        {(_, index) => {
          const isCompleted = index() < props.completed;
          const isCurrent = props.currentIndex === index();

          return (
            <span
              class={`flex h-4 w-4 items-center justify-center rounded-full transition-all duration-200 md:h-5 md:w-5 ${
                isCompleted
                  ? 'bg-[color:var(--color-accent-green)]'
                  : isCurrent
                  ? 'bg-[color:var(--color-primary)] shadow-ambient'
                  : 'bg-[rgba(12,42,101,0.08)]'
              }`}
            />
          );
        }}
      </For>
    </div>
  );
};

export default ProgressDots;
