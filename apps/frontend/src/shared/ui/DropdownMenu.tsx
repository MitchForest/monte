import { DropdownMenu as KDropdownMenu } from '@kobalte/core';
import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuSeparatorProps,
} from '@kobalte/core/dropdown-menu';
import type { JSX } from 'solid-js';

import { cn } from '../lib/cn';

const contentClasses =
  'z-50 min-w-[200px] rounded-xl border border-[rgba(64,157,233,0.2)] bg-white p-2 shadow-[0_22px_42px_rgba(12,42,101,0.18)]';
const itemClasses =
  'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[color:var(--color-text)] transition hover:bg-[rgba(233,245,251,0.65)] focus-visible:outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50';
const separatorClasses = 'my-1 h-px bg-[rgba(64,157,233,0.18)]';

const Content = (props: DropdownMenuContentProps & { class?: string; children?: JSX.Element }) => {
  const { class: className, children, ...rest } = props;
  return (
    <KDropdownMenu.Content {...rest} class={cn(contentClasses, className)}>
      {children}
    </KDropdownMenu.Content>
  );
};

const Item = (props: DropdownMenuItemProps & { class?: string; children?: JSX.Element }) => {
  const { class: className, children, ...rest } = props;
  return (
    <KDropdownMenu.Item {...rest} class={cn(itemClasses, className)}>
      {children}
    </KDropdownMenu.Item>
  );
};

const Separator = (props: DropdownMenuSeparatorProps & { class?: string }) => {
  const { class: className, ...rest } = props;
  return <KDropdownMenu.Separator {...rest} class={cn(separatorClasses, className)} />;
};

export const DropdownMenu = {
  ...KDropdownMenu,
  Content,
  Item,
  Separator,
} as typeof KDropdownMenu;

export default DropdownMenu;
