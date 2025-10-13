import { Checkbox as KCheckbox } from '@kobalte/core';
import type { CheckboxRootProps } from '@kobalte/core/checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { Show, splitProps } from 'solid-js';

import { cn } from '../lib/cn';

const checkboxWrapper = cva('flex items-start gap-3', {
  variants: {
    alignment: {
      start: 'items-start',
      center: 'items-center',
    },
  },
  defaultVariants: {
    alignment: 'start',
  },
});

const checkboxControl = cva(
  [
    'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[rgba(64,157,233,0.35)] bg-white',
    'transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(64,157,233,0.45)]',
    'data-[checked]:border-[rgba(64,157,233,0.75)] data-[checked]:bg-[rgba(233,245,251,0.9)]',
    'data-[checked]:shadow-[0_0_0_2px_rgba(64,157,233,0.25)]',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  ].join(' '),
);

const checkboxIndicator = cva('text-[color:var(--color-heading)] text-base font-semibold');

const labelText = cva('text-sm font-medium text-[color:var(--color-text)]');
const descriptionText = cva('text-xs text-[color:rgba(12,42,101,0.65)]');
const errorText = cva('text-xs text-[color:rgba(239,68,68,0.86)]');

export interface CheckboxProps
  extends Omit<CheckboxRootProps, 'children'>,
    VariantProps<typeof checkboxWrapper> {
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  class?: string;
  controlClass?: string;
}

export const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, rootProps] = splitProps(props, [
    'label',
    'description',
    'errorMessage',
    'class',
    'controlClass',
    'alignment',
  ]);

  const validationState = () => (local.errorMessage ? 'invalid' : rootProps.validationState);

  return (
    <KCheckbox.Root
      {...rootProps}
      validationState={validationState()}
      class={cn(checkboxWrapper({ alignment: local.alignment }), local.class)}
    >
      <KCheckbox.Input />
      <KCheckbox.Control class={cn(checkboxControl(), local.controlClass)}>
        <KCheckbox.Indicator class={checkboxIndicator()}>✓</KCheckbox.Indicator>
      </KCheckbox.Control>

      <div class="flex flex-1 flex-col gap-1">
        <Show when={local.label}>
          <KCheckbox.Label class={labelText()}>{local.label}</KCheckbox.Label>
        </Show>
        <Show when={local.description}>
          {(content) => (
            <KCheckbox.Description class={descriptionText()}>
              {content()}
            </KCheckbox.Description>
          )}
        </Show>
        <Show when={local.errorMessage}>
          {(message) => (
            <KCheckbox.ErrorMessage class={errorText()}>
              {message()}
            </KCheckbox.ErrorMessage>
          )}
        </Show>
      </div>
    </KCheckbox.Root>
  );
};

export default Checkbox;
