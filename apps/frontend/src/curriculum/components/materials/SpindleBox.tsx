import type { Component } from 'solid-js';

interface SpindleBoxProps {
  counts: number[]; // expected to align with labels 0-9
}

export const SpindleBox: Component<SpindleBoxProps> = (props) => {
  return (
    <div class="flex gap-1 rounded-xl bg-amber-900/70 p-2 shadow-inner shadow-black/50">
      {props.counts.map((count, index) => (
        <div class="flex min-w-[48px] flex-col items-center gap-1 rounded-lg bg-amber-800/80 px-2 py-2">
          <span class="text-xs font-semibold text-amber-100">{index}</span>
          <div class="flex flex-col items-center gap-0.5">
            {Array.from({ length: count }, (_, _bar) => (
              <span class="h-6 w-1 rounded-full bg-amber-200" />
            ))}
            {count === 0 && <span class="text-[10px] text-amber-200/80">empty</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
