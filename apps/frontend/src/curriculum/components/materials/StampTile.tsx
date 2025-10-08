import type { Component } from 'solid-js';

interface StampTileProps {
  value: number;
}

const stampColors: Record<number, string> = {
  1: '#15803d',
  10: '#1d4ed8',
  100: '#b91c1c',
};

export const StampTile: Component<StampTileProps> = (props) => {
  const normalized = props.value === 10 ? 10 : props.value === 100 ? 100 : 1;
  return (
    <div
      class="stamp-tile"
      style={{ background: stampColors[normalized] }}
      aria-hidden="true"
    >
      {normalized}
    </div>
  );
};
