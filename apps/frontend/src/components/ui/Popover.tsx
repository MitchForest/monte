import { Popover as KPopover } from '@kobalte/core';
import type { PopoverContentProps } from '@kobalte/core/popover';
import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '../../lib/cn';

const contentBaseClasses =
  'z-50 rounded-xl border border-[rgba(64,157,233,0.2)] bg-white p-4 shadow-[0_22px_42px_rgba(12,42,101,0.18)] focus-visible:outline-none';

export interface PopoverContentPropsExtended extends PopoverContentProps {
  class?: string;
  children: JSX.Element;
}

const Content: Component<PopoverContentPropsExtended> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children']);
  return (
    <KPopover.Content {...rest} class={cn(contentBaseClasses, local.class)}>
      {local.children}
    </KPopover.Content>
  );
};

export const Popover = Object.assign(KPopover, {
  Content,
});

export default Popover;
