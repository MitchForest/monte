import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cx } from '../utils/cx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'default' | 'compact';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: JSX.Element;
  iconPosition?: 'left' | 'right';
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-[color:var(--color-heading)] shadow-floating hover:brightness-[1.05] active:scale-[0.98] focus-visible:outline-[color:rgba(10,42,101,0.45)]',
  secondary:
    'bg-surface text-[color:var(--color-heading)] border border-[rgba(12,42,101,0.12)] hover:bg-[color:var(--color-background-soft)] active:scale-[0.98] focus-visible:outline-[color:rgba(64,157,233,0.6)]',
  ghost:
    'bg-transparent text-[color:var(--color-heading)] border border-transparent hover:bg-[rgba(12,42,101,0.08)] focus-visible:outline-[color:rgba(64,157,233,0.6)]',
};

const sizeClass: Record<ButtonSize, string> = {
  default: 'tap-target text-lg',
  compact: 'h-12 px-6 text-base',
};

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'icon', 'variant', 'iconPosition', 'size']);
  const variant = local.variant ?? 'primary';
  const size = local.size ?? 'default';
  const iconPosition = local.iconPosition ?? 'right';

  return (
    <button
      type="button"
      class={cx(
        'inline-flex select-none items-center justify-center gap-3 rounded-full font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:brightness-100',
        variantClass[variant],
        sizeClass[size],
        local.class,
      )}
      {...rest}
    >
      {iconPosition === 'left' && local.icon}
      <span>{local.children}</span>
      {iconPosition === 'right' && local.icon}
    </button>
  );
};

export default Button;
