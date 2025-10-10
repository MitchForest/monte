import { For } from 'solid-js';
import type { Component } from 'solid-js';

// Montessori color coding for place values
const digitColors = {
  thousand: '#16a34a', // green
  hundred: '#dc2626',  // red
  ten: '#2563eb',      // blue
  unit: '#16a34a',     // green
};

type CardSize = 'xs' | 'sm' | 'md' | 'lg';

// Fixed digit width for perfect alignment when stacking
const digitWidth: Record<CardSize, number> = {
  lg: 40,    // 2.5rem
  md: 32,    // 2rem
  sm: 24,    // 1.5rem
  xs: 19,    // 1.2rem
};

const fontSize: Record<CardSize, string> = {
  lg: '2rem',
  md: '1.5rem',
  sm: '1rem',
  xs: '0.85rem',
};

const cardPadding: Record<CardSize, number> = {
  lg: 10,    // 0.625rem
  md: 8,     // 0.5rem
  sm: 6,     // 0.375rem
  xs: 5,     // 0.3rem
};

interface NumberCardProps {
  value: number;
  size?: CardSize;
  label?: string;
}

// Parse value into actual digits with place values
const parseValue = (value: number) => {
  const clamped = Math.max(0, Math.min(9999, Math.floor(value)));
  const str = clamped.toString();
  const len = str.length;
  
  const result: Array<{ digit: string; place: string; color: string }> = [];
  
  for (let i = 0; i < len; i++) {
    const digit = str[i];
    const placeIndex = len - i - 1; // 0 = units, 1 = tens, 2 = hundreds, 3 = thousands
    
    let place = 'unit';
    let color = digitColors.unit;
    
    if (placeIndex === 3) {
      place = 'thousand';
      color = digitColors.thousand;
    } else if (placeIndex === 2) {
      place = 'hundred';
      color = digitColors.hundred;
    } else if (placeIndex === 1) {
      place = 'ten';
      color = digitColors.ten;
    }
    
    result.push({ digit, place, color });
  }
  
  return result;
};

export const NumberCard: Component<NumberCardProps> = (props) => {
  const size = props.size ?? 'md';
  const digitData = parseValue(props.value);
  const numDigits = digitData.length;
  const padding = cardPadding[size];
  const width = digitWidth[size];
  
  // Total card width = (num digits × digit width) + (2 × horizontal padding) + border
  const totalWidth = numDigits * width + padding * 2 + 4; // 4px for 2px border on each side
  
  return (
    <div
      class="number-card-montessori"
      style={{
        width: `${totalWidth}px`,
        'font-size': fontSize[size],
        padding: `${padding}px`,
      }}
      aria-label={props.label ?? `${props.value}`}
    >
      <For each={digitData}>
        {(data) => (
          <span
            class="number-card-digit-montessori"
            style={{
              width: `${width}px`,
              color: data.color,
            }}
          >
            {data.digit}
          </span>
        )}
      </For>
    </div>
  );
};
