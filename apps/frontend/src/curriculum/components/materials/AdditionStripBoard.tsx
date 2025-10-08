import type { Component } from 'solid-js';

interface AdditionStripBoardProps {
  strips?: { red: number; blue: number };
}

export const AdditionStripBoard: Component<AdditionStripBoardProps> = (props) => {
  const width = 220;
  const height = 80;
  const cellWidth = width / 18;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      class="rounded-[var(--radius-md)] border border-[rgba(64,157,233,0.18)] bg-[rgba(233,245,251,0.75)]"
    >
      <rect x={0} y={0} width={width} height={height} fill="#111827" />
      {Array.from({ length: 18 }, (_, index) => (
        <g>
          <rect
            x={index * cellWidth}
            y={0}
            width={cellWidth}
            height={height / 2}
            fill={index % 2 === 0 ? '#1f2937' : '#111827'}
            stroke="#1f2937"
            stroke-width="0.5"
          />
          <text
            x={index * cellWidth + cellWidth / 2}
            y={height / 2 + 12}
            fill="#9ca3af"
            font-size="10"
            text-anchor="middle"
          >
            {index + 1}
          </text>
        </g>
      ))}
      {props.strips && (
        <>
          <rect
            x={0}
            y={8}
            width={props.strips.red * cellWidth}
            height={12}
            fill="#ef4444"
            rx={2}
          />
          <rect
            x={props.strips.red * cellWidth}
            y={24}
            width={props.strips.blue * cellWidth}
            height={12}
            fill="#3b82f6"
            rx={2}
          />
        </>
      )}
    </svg>
  );
};
