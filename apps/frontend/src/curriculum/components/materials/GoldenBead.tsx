import { For } from 'solid-js';
import type { Component } from 'solid-js';

const beadFill = '#d9b452';
const beadStroke = '#b28b34';

const circle = (cx: number, cy: number, r = 6) => (
  <circle cx={cx} cy={cy} r={r} fill={beadFill} stroke={beadStroke} stroke-width="0.8" />
);

export const GoldenBeadUnit: Component = () => (
  <svg width="10" height="10" viewBox="1 1 16 16" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    {circle(9, 9, 7)}
  </svg>
);

export const GoldenBeadTen: Component = () => (
  <svg width="60" height="10" viewBox="2 1 116 16" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <For each={Array.from({ length: 10 })}>
      {(_, index) => circle(9 + index() * 12, 9, 6)}
    </For>
  </svg>
);

export const GoldenBeadHundred: Component = () => (
  <svg width="48" height="48" viewBox="2 2 86 86" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
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
  <svg width="50" height="60" viewBox="-2 55 75 92" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    {/* Stack of 10 hundred-squares, slightly offset to show depth */}
    <For each={Array.from({ length: 10 })}>
      {(_, layer) => {
        const offsetX = layer() * 0.8;
        const offsetY = layer() * -1.5;
        return (
          <g transform={`translate(${offsetX}, ${72 + offsetY})`}>
            <For each={Array.from({ length: 10 })}>
              {(_, row) => (
                <For each={Array.from({ length: 10 })}>
                  {(_, column) => circle(6.8 + column() * 6.8, 6.8 + row() * 6.8, 2.6)}
                </For>
              )}
            </For>
          </g>
        );
      }}
    </For>
  </svg>
);
