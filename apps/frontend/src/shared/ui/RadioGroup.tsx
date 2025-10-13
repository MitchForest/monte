import { RadioGroup as KRadioGroup } from '@kobalte/core';
import { cva } from 'class-variance-authority';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

import { cn } from '../lib/cn';

const groupWrapper = cva('flex flex-col gap-2');
const groupLabel = cva('text-xs font-semibold uppercase tracking-wide text-[color:rgba(12,42,101,0.65)]');
const groupDescription = cva('text-xs text-[color:rgba(12,42,101,0.65)]');
const groupError = cva('text-xs text-[color:rgba(239,68,68,0.86)]');

const itemWrapper = cva(
  [
    'flex items-center gap-3 rounded-xl border border-[rgba(64,157,233,0.25)] bg-white px-3 py-2 transition',
    'shadow-[0_4px_12px_rgba(12,42,101,0.08)] hover:border-[rgba(64,157,233,0.45)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[rgba(64,157,233,0.35)]',
    'data-[checked]:border-[rgba(64,157,233,0.8)] data-[checked]:shadow-[0_12px_24px_rgba(12,42,101,0.16)]',
  ].join(' '),
  {
    variants: {
      state: {
        default: '',
        disabled: 'cursor-not-allowed opacity-50',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

const indicatorStyles = cva(
  'flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(64,157,233,0.45)] bg-white data-[checked]:border-[rgba(64,157,233,0.8)]',
);

const dotStyles = cva('h-2.5 w-2.5 rounded-full bg-[rgba(64,157,233,0.85)]');
const itemLabel = cva('text-sm font-medium text-[color:var(--color-text)]');
const itemDescription = cva('text-xs text-[color:rgba(12,42,101,0.65)]');

export interface RadioOption<T extends string = string> {
  value: T;
  label: JSX.Element | string;
  description?: JSX.Element | string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string = string> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  options: RadioOption<T>[];
  class?: string;
}

export const RadioGroup = <T extends string = string>(props: RadioGroupProps<T>) => {
  const handleChange = (next: string) => {
    props.onChange?.(next as T);
  };

  return (
    <KRadioGroup.Root
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={handleChange}
      disabled={props.disabled}
      name={props.name}
      id={props.id}
      class={cn(groupWrapper(), props.class)}
    >
      <Show when={props.label}>
        <KRadioGroup.Label class={groupLabel()}>{props.label}</KRadioGroup.Label>
      </Show>
      <Show when={props.description}>
        {(content) => (
          <KRadioGroup.Description class={groupDescription()}>
            {content()}
          </KRadioGroup.Description>
        )}
      </Show>

      <div class="flex flex-col gap-2">
        <For each={props.options}>
          {(option) => (
            <KRadioGroup.Item
              value={option.value}
              disabled={option.disabled}
              class={itemWrapper({ state: option.disabled ? 'disabled' : 'default' })}
            >
              <KRadioGroup.ItemInput />
              <KRadioGroup.ItemControl class={indicatorStyles()}>
                <KRadioGroup.ItemIndicator>
                  <span class={dotStyles()} />
                </KRadioGroup.ItemIndicator>
              </KRadioGroup.ItemControl>
              <div class="flex flex-col">
                <KRadioGroup.ItemLabel class={itemLabel()}>{option.label}</KRadioGroup.ItemLabel>
                <Show when={option.description}>
                  <span class={itemDescription()}>{option.description}</span>
                </Show>
              </div>
            </KRadioGroup.Item>
          )}
        </For>
      </div>

      <Show when={props.errorMessage}>
        {(message) => (
          <KRadioGroup.ErrorMessage class={groupError()}>
            {message()}
          </KRadioGroup.ErrorMessage>
        )}
      </Show>
    </KRadioGroup.Root>
  );
};

export default RadioGroup;
