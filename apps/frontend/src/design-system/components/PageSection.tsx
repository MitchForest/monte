import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cx } from '../utils/cx';

export interface PageSectionProps extends JSX.HTMLAttributes<HTMLElement> {
  bleed?: boolean;
}

export const PageSection: Component<PageSectionProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'bleed']);
  return (
    <section
      class={cx('mx-auto w-full max-w-6xl px-6', local.bleed ? '' : 'py-6 md:py-8', local.class)}
      {...rest}
    >
      {local.children}
    </section>
  );
};

export default PageSection;
