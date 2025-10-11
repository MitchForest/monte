import { Tooltip as KTooltip } from '@kobalte/core';
import type { TooltipContentProps } from '@kobalte/core/tooltip';
import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '../../lib/cn';

const contentClasses =
  'z-50 rounded-lg border border-[rgba(12,42,101,0.18)] bg-[rgba(12,42,101,0.95)] px-3 py-1.5 text-xs font-medium text-white shadow-[0_12px_24px_rgba(12,42,101,0.3)]';

interface TooltipContentPropsExtended extends TooltipContentProps {
  class?: string;
  children: JSX.Element;
}

const Content: Component<TooltipContentPropsExtended> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children']);
  return (
    <KTooltip.Content {...rest} class={cn(contentClasses, local.class)}>
      {local.children}
    </KTooltip.Content>
  );
};

export const Tooltip = {
  ...KTooltip,
  Content,
} as typeof KTooltip;

export default Tooltip;
