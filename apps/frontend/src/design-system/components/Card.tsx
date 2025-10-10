import { cva, type VariantProps } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '../../lib/cn';

const cardVariants = cva(
  'rounded-[var(--radius-lg)] border border-[rgba(12,42,101,0.08)] text-[color:var(--color-text)] shadow-ambient transition-shadow duration-200',
  {
    variants: {
      variant: {
        soft: 'surface-card',
        floating: 'surface-floating',
        flat: 'bg-transparent',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'soft',
      padding: 'md',
    },
  },
);

export interface CardProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card: Component<CardProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'variant', 'padding']);

  return (
    <div class={cn(cardVariants({ variant: local.variant, padding: local.padding }), local.class)} {...rest}>
      {local.children}
    </div>
  );
};

export default Card;
