import { cva, type VariantProps } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '../lib/cn';

const chipVariants = cva('inline-flex items-center justify-center gap-2 rounded-full font-semibold', {
  variants: {
    tone: {
      neutral: 'bg-[rgba(12,42,101,0.08)] text-[color:var(--color-heading)]',
      primary: 'bg-[rgba(140,204,212,0.25)] text-[color:var(--color-heading)]',
      green: 'bg-[rgba(24,191,151,0.2)] text-[color:#0f6a53]',
      yellow: 'bg-[rgba(255,195,74,0.25)] text-[color:#8a5a00]',
      red: 'bg-[rgba(239,77,76,0.2)] text-[color:#8a1f1f]',
      pink: 'bg-[rgba(240,100,147,0.2)] text-[color:#7d2549]',
      blue: 'bg-[rgba(64,157,233,0.2)] text-[color:#0b4a8c]',
    },
    size: {
      sm: 'h-9 px-3 text-xs tracking-wide uppercase',
      md: 'h-11 px-4 text-sm font-semibold',
    },
  },
  defaultVariants: {
    tone: 'neutral',
    size: 'md',
  },
});

export interface ChipProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  icon?: JSX.Element;
}

export const Chip: Component<ChipProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'tone', 'icon', 'size']);

  return (
    <div class={cn(chipVariants({ tone: local.tone, size: local.size }), local.class)} {...rest}>
      {local.icon}
      <span>{local.children}</span>
    </div>
  );
};

export default Chip;
