import type { Component } from 'solid-js';
import { NumberRod, SandpaperNumeral, SpindleBox, CardsAndCounters, ColoredBeadStair, AdditionStripBoard } from './materials';

interface MaterialPreviewProps {
  materialId: string;
}

export const MaterialPreview: Component<MaterialPreviewProps> = (props) => {
  switch (props.materialId) {
    case 'number-rods':
      return (
        <div class="space-y-2">
          <NumberRod length={5} />
          <NumberRod length={3} />
        </div>
      );
    case 'sandpaper-numerals':
      return (
        <div class="flex gap-2">
          <SandpaperNumeral value={1} />
          <SandpaperNumeral value={2} />
          <SandpaperNumeral value={3} />
        </div>
      );
    case 'spindle-box':
      return <SpindleBox counts={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} />;
    case 'cards-and-counters':
      return <CardsAndCounters values={[3, 4, 5]} />;
    case 'colored-bead-stair':
      return <ColoredBeadStair />;
    case 'addition-strip-board':
      return <AdditionStripBoard strips={{ red: 4, blue: 3 }} />;
    case 'addition-charts':
      return (
        <div class="surface-neutral rounded-[var(--radius-md)] p-4 text-[11px] leading-snug text-subtle">
          <p>1 + 1 = 2</p>
          <p>2 + 1 = 3</p>
          <p>3 + 1 = 4</p>
          <p>3 + 2 = 5</p>
          <p>4 + 3 = 7</p>
        </div>
      );
    default:
      return (
        <div class="dash-connector rounded-[var(--radius-md)] p-4 text-sm text-subtle">
          Material preview coming soon
        </div>
      );
  }
};
