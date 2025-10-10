import type { Component } from 'solid-js';

interface SandpaperNumeralProps {
  value: number;
}

export const SandpaperNumeral: Component<SandpaperNumeralProps> = (props) => {
  return (
    <div class="flex h-20 w-16 items-center justify-center rounded-lg bg-emerald-900/60 shadow-inner shadow-black/40">
      <span class="text-3xl font-semibold text-emerald-200">{props.value}</span>
    </div>
  );
};
