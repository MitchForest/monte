import type { Component } from 'solid-js';

interface CardsAndCountersProps {
  values: number[];
}

export const CardsAndCounters: Component<CardsAndCountersProps> = (props) => {
  return (
    <div class="flex gap-3">
      {props.values.map((value) => (
        <div class="flex flex-col items-center gap-2">
          <div class="flex h-12 w-8 items-center justify-center rounded-lg border border-[rgba(64,157,233,0.25)] bg-[rgba(233,245,251,0.75)] text-sm font-semibold text-[color:var(--color-heading)] shadow-ambient">
            {value}
          </div>
          <div class="grid grid-cols-2 gap-1">
            {Array.from({ length: value }, (_, _index) => (
              <span class="h-3 w-3 rounded-full bg-[color:var(--color-accent-pink)]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
