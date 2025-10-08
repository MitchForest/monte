import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cx } from '../utils/cx';

type CardVariant = 'soft' | 'floating' | 'flat';

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClass: Record<CardVariant, string> = {
  soft: 'surface-card',
  floating: 'surface-floating',
  flat: 'bg-transparent',
};

const paddingClass: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: Component<CardProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'variant', 'padding']);
  const variant = local.variant ?? 'soft';
  const padding = local.padding ?? 'md';

  return (
    <div
      class={cx(
        'rounded-[var(--radius-lg)] border border-[rgba(12,42,101,0.08)] text-[color:var(--color-text)] shadow-ambient transition-shadow duration-200',
        variantClass[variant],
        paddingClass[padding],
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export default Card;
