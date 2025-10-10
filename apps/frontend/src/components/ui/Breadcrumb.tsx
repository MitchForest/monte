import { cva } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '../../lib/cn';

const breadcrumbVariants = cva('flex items-center gap-2 text-sm text-[color:var(--color-text-muted)]');
const breadcrumbListVariants = cva('flex items-center gap-2');
const breadcrumbItemVariants = cva('inline-flex items-center gap-2');
const breadcrumbSeparatorVariants = cva('text-xs text-[color:var(--color-text-muted)]');

const breadcrumbLinkVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(64,157,233,0.45)]',
  {
    variants: {
      state: {
        default:
          'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-heading)] hover:bg-[rgba(12,42,101,0.08)]',
        current: 'cursor-default bg-[rgba(64,157,233,0.15)] text-[color:var(--color-heading)]',
      },
      interactive: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      state: 'default',
      interactive: false,
    },
  },
);

interface BreadcrumbProps {
  class?: string;
  children: JSX.Element;
}

export const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  const [local] = splitProps(props, ['class', 'children']);
  return (
    <nav aria-label="breadcrumb" class={cn(breadcrumbVariants(), local.class)}>
      {local.children}
    </nav>
  );
};

interface BreadcrumbListProps {
  class?: string;
  children: JSX.Element;
}

export const BreadcrumbList: Component<BreadcrumbListProps> = (props) => {
  const [local] = splitProps(props, ['class', 'children']);
  return (
    <ol class={cn(breadcrumbListVariants(), local.class)}>
      {local.children}
    </ol>
  );
};

interface BreadcrumbItemProps {
  class?: string;
  children: JSX.Element;
}

export const BreadcrumbItem: Component<BreadcrumbItemProps> = (props) => {
  const [local] = splitProps(props, ['class', 'children']);
  return (
    <li class={cn(breadcrumbItemVariants(), local.class)}>
      {local.children}
    </li>
  );
};

interface BreadcrumbLinkProps {
  href?: string;
  onClick?: () => void;
  current?: boolean;
  class?: string;
  ariaLabel?: string;
  children: JSX.Element;
}

export const BreadcrumbLink: Component<BreadcrumbLinkProps> = (props) => {
  const [local] = splitProps(props, ['class', 'children', 'current', 'onClick', 'href', 'ariaLabel']);
  const isInteractive = Boolean(local.onClick || local.href);
  const state = local.current ? 'current' : 'default';

  if (local.onClick) {
    return (
      <button
        type="button"
        class={cn(breadcrumbLinkVariants({ state, interactive: true }), local.class)}
        onClick={(event) => {
          event.preventDefault();
          local.onClick?.();
        }}
        aria-label={local.ariaLabel}
      >
        {local.children}
      </button>
    );
  }

  if (local.current) {
    return (
      <span class={cn(breadcrumbLinkVariants({ state: 'current' }), local.class)} aria-label={local.ariaLabel}>
        {local.children}
      </span>
    );
  }

  return (
    <a
      href={local.href}
      class={cn(breadcrumbLinkVariants({ state, interactive: isInteractive }), local.class)}
      aria-label={local.ariaLabel}
    >
      {local.children}
    </a>
  );
};

interface BreadcrumbSeparatorProps {
  class?: string;
  children?: JSX.Element;
}

export const BreadcrumbSeparator: Component<BreadcrumbSeparatorProps> = (props) => {
  const [local] = splitProps(props, ['class', 'children']);
  return (
    <li class={cn(breadcrumbSeparatorVariants(), local.class)} aria-hidden="true">
      {local.children ?? '/'}
    </li>
  );
};
