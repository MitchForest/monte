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

// Base unit width for proportional sizing
const baseUnitWidth: Record<CardSize, string> = {
  lg: '4rem',
  md: '3rem',
  sm: '2rem',
  xs: '1.5rem',
};

const fontSize: Record<CardSize, string> = {
  lg: '2.5rem',
  md: '1.8rem',
  sm: '1.2rem',
  xs: '1rem',
};

interface NumberCardProps {
  value: number;
  size?: CardSize;
  label?: string;
}

// Parse value into displayable digits with place values
const parseValue = (value: number) => {
  const clamped = Math.max(0, Math.min(9999, Math.floor(value)));
  const str = clamped.toString();
  
  // Build array of {digit, place, color}
  const result: Array<{ digit: number; place: string; color: string }> = [];
  const len = str.length;
  
  for (let i = 0; i < len; i++) {
    const digit = parseInt(str[i]);
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
  
  return (
    <div
      class="number-card-montessori"
      style={{
        width: `calc(${baseUnitWidth[size]} * ${numDigits})`,
        'font-size': fontSize[size],
      }}
      aria-label={props.label ?? `${props.value}`}
    >
      <For each={digitData}>
        {(data) => (
          <span
            class="number-card-digit-montessori"
            style={{
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
