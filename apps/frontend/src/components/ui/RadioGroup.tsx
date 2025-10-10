import { RadioGroup as KRadioGroup } from '@kobalte/core';
import { cva } from 'class-variance-authority';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

import { cn } from '../../lib/cn';

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

  type GenericComponent = (props: Record<string, unknown>) => JSX.Element;
  const RadioGroupRoot = KRadioGroup.Root as unknown as GenericComponent;
  const RadioGroupItem = KRadioGroup.Item as unknown as GenericComponent;
  const RadioGroupItemControl = KRadioGroup.ItemControl as unknown as GenericComponent;
  const RadioGroupItemIndicator = KRadioGroup.ItemIndicator as unknown as GenericComponent;
  const RadioGroupItemLabel = KRadioGroup.ItemLabel as unknown as GenericComponent;
  const RadioGroupLabel = KRadioGroup.Label as unknown as GenericComponent;
  const RadioGroupDescription = KRadioGroup.Description as unknown as GenericComponent;
  const RadioGroupErrorMessage = KRadioGroup.ErrorMessage as unknown as GenericComponent;

  return (
    <RadioGroupRoot
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={handleChange}
      disabled={props.disabled}
      name={props.name}
      id={props.id}
      class={cn(groupWrapper(), props.class)}
    >
      <Show when={props.label}>
        <RadioGroupLabel class={groupLabel()}>{props.label}</RadioGroupLabel>
      </Show>
      <Show when={props.description}>
        {(content) => (
          <RadioGroupDescription class={groupDescription()}>
            {content()}
          </RadioGroupDescription>
        )}
      </Show>

      <div class="flex flex-col gap-2">
        <For each={props.options}>
          {(option) => (
            <RadioGroupItem
              value={option.value}
              disabled={option.disabled}
              class={itemWrapper({ state: option.disabled ? 'disabled' : 'default' })}
            >
              <KRadioGroup.ItemInput />
              <RadioGroupItemControl class={indicatorStyles()}>
                <RadioGroupItemIndicator>
                  <span class={dotStyles()} />
                </RadioGroupItemIndicator>
              </RadioGroupItemControl>
              <div class="flex flex-col">
                <RadioGroupItemLabel class={itemLabel()}>{option.label}</RadioGroupItemLabel>
                <Show when={option.description}>
                  <span class={itemDescription()}>{option.description}</span>
                </Show>
              </div>
            </RadioGroupItem>
          )}
        </For>
      </div>

      <Show when={props.errorMessage}>
        {(message) => (
          <RadioGroupErrorMessage class={groupError()}>
            {message()}
          </RadioGroupErrorMessage>
        )}
      </Show>
    </RadioGroupRoot>
  );
};

export default RadioGroup;
