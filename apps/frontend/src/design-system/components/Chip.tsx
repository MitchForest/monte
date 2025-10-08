import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cx } from '../utils/cx';

type ChipTone = 'neutral' | 'primary' | 'green' | 'yellow' | 'red' | 'pink' | 'blue';

export interface ChipProps extends JSX.HTMLAttributes<HTMLDivElement> {
  tone?: ChipTone;
  size?: 'sm' | 'md';
  icon?: JSX.Element;
}

const toneClass: Record<ChipTone, string> = {
  neutral: 'bg-[rgba(12,42,101,0.08)] text-[color:var(--color-heading)]',
  primary: 'bg-[rgba(140,204,212,0.25)] text-[color:var(--color-heading)]',
  green: 'bg-[rgba(24,191,151,0.2)] text-[color:#0f6a53]',
  yellow: 'bg-[rgba(255,195,74,0.25)] text-[color:#8a5a00]',
  red: 'bg-[rgba(239,77,76,0.2)] text-[color:#8a1f1f]',
  pink: 'bg-[rgba(240,100,147,0.2)] text-[color:#7d2549]',
  blue: 'bg-[rgba(64,157,233,0.2)] text-[color:#0b4a8c]',
};

const sizeClass: Record<'sm' | 'md', string> = {
  sm: 'h-9 px-3 text-xs tracking-wide uppercase',
  md: 'h-11 px-4 text-sm font-semibold',
};

export const Chip: Component<ChipProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'tone', 'icon', 'size']);
  const tone = local.tone ?? 'neutral';
  const size = local.size ?? 'md';

  return (
    <div
      class={cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
        toneClass[tone],
        sizeClass[size],
        local.class,
      )}
      {...rest}
    >
      {local.icon}
      <span>{local.children}</span>
    </div>
  );
};

export default Chip;
