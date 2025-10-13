import { Switch as KSwitch } from '@kobalte/core';
import type { SwitchRootProps } from '@kobalte/core/switch';
import { cva, type VariantProps } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { Show, splitProps } from 'solid-js';

import { cn } from '../lib/cn';

const switchWrapper = cva('flex items-center gap-3');
const labelText = cva('text-sm font-medium text-[color:var(--color-text)]');
const descriptionText = cva('text-xs text-[color:rgba(12,42,101,0.65)]');
const errorText = cva('text-xs text-[color:rgba(239,68,68,0.86)]');

const controlStyles = cva(
  [
    'relative inline-flex h-7 w-12 items-center rounded-full border border-[rgba(64,157,233,0.25)] bg-[rgba(233,245,251,0.8)]',
    'transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(64,157,233,0.45)]',
    'data-[checked]:border-[rgba(64,157,233,0.65)] data-[checked]:bg-[rgba(64,157,233,0.35)]',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  ].join(' '),
);

const thumbStyles = cva(
  'absolute left-1 h-5 w-5 rounded-full bg-white shadow-[0_6px_18px_rgba(12,42,101,0.16)] transition data-[checked]:translate-x-5',
);

export interface SwitchProps
  extends Omit<SwitchRootProps, 'children'>,
    VariantProps<typeof switchWrapper> {
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  class?: string;
}

export const Switch: Component<SwitchProps> = (props) => {
  const [local, rootProps] = splitProps(props, ['label', 'description', 'errorMessage', 'class']);
  const validationState = () => (local.errorMessage ? 'invalid' : rootProps.validationState);

  return (
    <KSwitch.Root
      {...rootProps}
      validationState={validationState()}
      class={cn(switchWrapper(), local.class)}
    >
      <KSwitch.Input />
      <KSwitch.Control class={controlStyles()}>
        <KSwitch.Thumb class={thumbStyles()} />
      </KSwitch.Control>
      <div class="flex flex-col gap-1">
        <Show when={local.label}>
          <KSwitch.Label class={labelText()}>{local.label}</KSwitch.Label>
        </Show>
        <Show when={local.description}>
          {(content) => (
            <KSwitch.Description class={descriptionText()}>
              {content()}
            </KSwitch.Description>
          )}
        </Show>
        <Show when={local.errorMessage}>
          {(message) => (
            <KSwitch.ErrorMessage class={errorText()}>
              {message()}
            </KSwitch.ErrorMessage>
          )}
        </Show>
      </div>
    </KSwitch.Root>
  );
};

export default Switch;
