import { cva } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '../../lib/cn';

const pageSectionVariants = cva('mx-auto w-full max-w-6xl px-6', {
  variants: {
    bleed: {
      true: 'py-0',
      false: 'py-6 md:py-8',
    },
  },
  defaultVariants: {
    bleed: false,
  },
});

export interface PageSectionProps extends JSX.HTMLAttributes<HTMLElement> {
  bleed?: boolean;
}

export const PageSection: Component<PageSectionProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'bleed']);
  return (
    <section class={cn(pageSectionVariants({ bleed: local.bleed ? true : false }), local.class)} {...rest}>
      {local.children}
    </section>
  );
};

export default PageSection;
