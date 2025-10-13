import type { Component } from 'solid-js';

const beadColors = ['#ffffff', '#ff0000', '#00a651', '#ffdd00', '#0066cc', '#ff69b4', '#964B00', '#800080', '#ff7f00'];

interface ColoredBeadStairProps {
  highlight?: number;
}

export const ColoredBeadStair: Component<ColoredBeadStairProps> = (props) => {
  return (
    <div class="flex flex-col items-start gap-1">
      {Array.from({ length: 9 }, (_, index) => {
        const value = index + 1;
        const color = beadColors[index] ?? '#ffffff';
        return (
          <div class="flex items-center gap-1">
            <span class="text-xs text-[color:var(--color-text-subtle)]">{value}</span>
            <div class="flex gap-1">
              {Array.from({ length: value }).map((_, beadIndex) => (
                <span
                  class="h-3 w-3 rounded-full"
                  style={{
                    background: color,
                    opacity: props.highlight && props.highlight !== value ? 0.3 : 1,
                    border: beadIndex === value - 1 ? '1px solid rgba(0,0,0,0.2)' : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
