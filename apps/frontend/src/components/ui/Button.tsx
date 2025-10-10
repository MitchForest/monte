import { cva, type VariantProps } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '../../lib/cn';

const buttonVariants = cva(
  [
    'inline-flex select-none items-center justify-center gap-3 rounded-full font-semibold transition-transform duration-200',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 disabled:brightness-100',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-[color:var(--color-heading)] shadow-[0_18px_36px_rgba(12,43,102,0.16)] hover:brightness-[1.05] active:scale-[0.98] focus-visible:outline-[rgba(10,42,101,0.45)]',
        secondary:
          'bg-surface text-[color:var(--color-heading)] border border-[rgba(12,42,101,0.14)] shadow-[0_12px_28px_rgba(12,42,101,0.12)] hover:bg-[color:var(--color-background-soft)] active:scale-[0.98] focus-visible:outline-[rgba(64,157,233,0.6)]',
        ghost:
          'bg-transparent text-[color:var(--color-heading)] border border-transparent hover:bg-[rgba(12,42,101,0.08)] focus-visible:outline-[rgba(64,157,233,0.6)]',
      },
      size: {
        default: 'min-h-[56px] px-6 text-lg',
        compact: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: JSX.Element;
  iconPosition?: 'left' | 'right';
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'icon', 'iconPosition', 'variant', 'size']);
  const iconPosition = local.iconPosition ?? 'right';

  return (
    <button
      type="button"
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...rest}
    >
      {iconPosition === 'left' && local.icon}
      <span>{local.children}</span>
      {iconPosition === 'right' && local.icon}
    </button>
  );
};

export default Button;
