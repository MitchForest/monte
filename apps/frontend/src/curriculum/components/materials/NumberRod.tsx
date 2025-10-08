import type { Component } from 'solid-js';

interface NumberRodProps {
  length: number; // 1-10
  class?: string;
}

export const NumberRod: Component<NumberRodProps> = (props) => {
  const segments = Array.from({ length: props.length }, (_, index) => index);
  const segmentSize = 24;

  return (
    <svg
      width={segmentSize * props.length}
      height={segmentSize}
      viewBox={`0 0 ${segmentSize * props.length} ${segmentSize}`}
      class={`rounded-sm shadow-inner shadow-black/40 ${props.class ?? ''}`}
    >
      {segments.map((segment) => {
        const isEven = segment % 2 === 0;
        return (
          <rect
            x={segment * segmentSize}
            y={0}
            width={segmentSize}
            height={segmentSize}
            fill={isEven ? '#ef4444' : '#1d4ed8'}
          />
        );
      })}
    </svg>
  );
};
