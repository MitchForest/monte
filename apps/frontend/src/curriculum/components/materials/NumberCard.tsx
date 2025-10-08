import { For } from 'solid-js';
import type { Component } from 'solid-js';

const placeConfig = [
  { key: 'thousand', color: '#2f855a' },
  { key: 'hundred', color: '#b91c1c' },
  { key: 'ten', color: '#2563eb' },
  { key: 'unit', color: '#2f855a' },
] as const;

type PlaceKey = (typeof placeConfig)[number]['key'];

type CardSize = 'xs' | 'sm' | 'md';

const sizeStyles: Record<CardSize, { fontSize: string; padding: string; gap: string }> = {
  md: { fontSize: '1.8rem', padding: '0.6rem 0.8rem', gap: '0.45rem' },
  sm: { fontSize: '1.2rem', padding: '0.4rem 0.6rem', gap: '0.35rem' },
  xs: { fontSize: '1rem', padding: '0.3rem 0.5rem', gap: '0.25rem' },
};

interface NumberCardProps {
  value: number;
  size?: CardSize;
  emphasisZeroes?: boolean;
  label?: string;
}

const toDigits = (value: number) => {
  const clamped = Math.max(0, Math.min(9999, Math.floor(value)));
  const padded = clamped.toString().padStart(4, '0');
  return padded.split('').map((digit) => Number(digit));
};

const digitOpacity = (digit: number) => (digit === 0 ? 0.35 : 1);

export const NumberCard: Component<NumberCardProps> = (props) => {
  const digits = toDigits(props.value);
  const size = props.size ?? 'md';
  const style = sizeStyles[size];

  const cardStyle = {
    'font-size': style.fontSize,
    padding: style.padding,
    gap: style.gap,
  } as const;

  const hasThousands = digits[0] > 0;
  const visibleConfig = placeConfig.filter((_, index) => {
    if (index === 0) return hasThousands;
    return true;
  });

  return (
    <div
      class="number-card"
      style={{
        'font-size': cardStyle['font-size'],
        padding: cardStyle.padding,
        gap: cardStyle.gap,
      }}
      aria-label={props.label ?? `${props.value}`}
    >
      <For each={visibleConfig}>
        {(config, index) => {
          const digitIndex = index() + (hasThousands ? 0 : 1);
          const digit = digits[digitIndex];
          return (
            <span
              class="number-card-digit"
              style={{
                background: config.color,
                opacity: digitOpacity(digit).toString(),
              }}
            >
              {digit}
            </span>
          );
        }}
      </For>
    </div>
  );
};
