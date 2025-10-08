import { For } from 'solid-js';
import type { Component } from 'solid-js';

const beadFill = '#d9b452';
const beadStroke = '#b28b34';

const circle = (cx: number, cy: number, r = 6) => (
  <circle cx={cx} cy={cy} r={r} fill={beadFill} stroke={beadStroke} stroke-width="0.8" />
);

export const GoldenBeadUnit: Component = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    {circle(9, 9, 7)}
  </svg>
);

export const GoldenBeadTen: Component = () => (
  <svg width="120" height="18" viewBox="0 0 120 18" aria-hidden="true">
    <For each={Array.from({ length: 10 })}>
      {(_, index) => circle(9 + index() * 12, 9, 6)}
    </For>
  </svg>
);

export const GoldenBeadHundred: Component = () => (
  <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden="true">
    <For each={Array.from({ length: 10 })}>
      {(_, row) => (
        <For each={Array.from({ length: 10 })}>
          {(_, column) => circle(9 + column() * 9, 9 + row() * 9, 3.5)}
        </For>
      )}
    </For>
  </svg>
);

export const GoldenBeadThousand: Component = () => (
  <div class="golden-bead-cube" aria-hidden="true">
    <div class="golden-bead-cube-face" />
    <div class="golden-bead-cube-top" />
  </div>
);
