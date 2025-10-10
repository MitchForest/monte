import { Select as KSelect } from '@kobalte/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { JSX } from 'solid-js';
import { For, Show, splitProps } from 'solid-js';

import { cn } from '../../lib/cn';

const selectWrapper = cva('flex flex-col gap-1.5', {
  variants: {
    size: {
      sm: 'gap-1',
      md: 'gap-1.5',
      lg: 'gap-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const triggerStyles = cva(
  [
    'flex w-full items-center justify-between gap-3 rounded-xl border border-[rgba(64,157,233,0.35)] bg-white px-3 py-2 text-left',
    'text-sm font-medium text-[color:var(--color-text)] shadow-[0_6px_18px_rgba(12,42,101,0.08)] transition',
    'focus-visible:border-[rgba(64,157,233,0.6)] focus-visible:shadow-[0_14px_28px_rgba(12,42,101,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(64,157,233,0.35)]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'py-1.5 text-xs',
        md: 'py-2 text-sm',
        lg: 'py-3 text-base',
      },
      validation: {
        default: '',
        invalid: 'border-[rgba(239,68,68,0.5)] focus-visible:outline-[rgba(239,68,68,0.45)]',
      },
      state: {
        default: '',
        disabled: 'cursor-not-allowed opacity-60',
      },
    },
    defaultVariants: {
      size: 'md',
      validation: 'default',
      state: 'default',
    },
  },
);

const contentStyles = cva(
  'z-50 mt-2 min-w-[200px] rounded-xl border border-[rgba(64,157,233,0.2)] bg-white p-1.5 shadow-[0_18px_36px_rgba(12,42,101,0.18)]',
);

const listboxStyles = cva('max-h-72 overflow-y-auto rounded-lg');

const itemClasses =
  'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[rgba(233,245,251,0.65)] focus-visible:outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[selected]:bg-[rgba(233,245,251,0.85)] data-[selected]:text-[color:var(--color-heading)] data-[selected]:shadow-[inset_0_0_0_1px_rgba(64,157,233,0.4)]';

const indicatorStyles = cva('text-[color:var(--color-accent-green)]');

const messageText = cva('text-xs leading-tight', {
  variants: {
    tone: {
      muted: 'text-[color:rgba(12,42,101,0.65)]',
      error: 'text-[color:rgba(239,68,68,0.86)]',
    },
  },
  defaultVariants: {
    tone: 'muted',
  },
});

type SelectSize = NonNullable<VariantProps<typeof selectWrapper>['size']>;

export interface SelectOption<T extends string = string> {
  value: T;
  label: JSX.Element | string;
  description?: JSX.Element | string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string> {
  value?: T | null;
  defaultValue?: T;
  onValueChange?: (value: T | null) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  size?: SelectSize;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  placeholder?: JSX.Element | string;
  options?: SelectOption<T>[];
  class?: string;
  triggerClass?: string;
  contentClass?: string;
  listboxClass?: string;
  itemClass?: string;
  leadingIcon?: JSX.Element;
  trailingIcon?: JSX.Element;
}

export const Select = <T extends string = string>(props: SelectProps<T>) => {
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'disabled',
    'required',
    'name',
    'id',
    'size',
    'label',
    'description',
    'errorMessage',
    'placeholder',
    'options',
    'class',
    'triggerClass',
    'contentClass',
    'listboxClass',
    'itemClass',
    'leadingIcon',
    'trailingIcon',
  ]);

  type GenericComponent = (props: Record<string, unknown>) => JSX.Element;
  const SelectRoot = KSelect.Root as unknown as GenericComponent;
  const SelectLabel = KSelect.Label as unknown as GenericComponent;
  const SelectDescription = KSelect.Description as unknown as GenericComponent;
  const SelectErrorMessage = KSelect.ErrorMessage as unknown as GenericComponent;
  const SelectTrigger = KSelect.Trigger as unknown as GenericComponent;
  const SelectValue = KSelect.Value as unknown as GenericComponent;
  const SelectPortal = KSelect.Portal as unknown as GenericComponent;
  const SelectContent = KSelect.Content as unknown as GenericComponent;
  const SelectListbox = KSelect.Listbox as unknown as GenericComponent;
  const SelectItem = KSelect.Item as unknown as GenericComponent;
  const SelectItemLabel = KSelect.ItemLabel as unknown as GenericComponent;
  const SelectItemIndicator = KSelect.ItemIndicator as unknown as GenericComponent;

  const validationState = () => (local.errorMessage ? 'invalid' : undefined);
  const placeholderContent =
    typeof local.placeholder === 'string' ? <span>{local.placeholder}</span> : local.placeholder;

  const handleChange = (next: T | null) => {
    local.onValueChange?.(next);
  };

  return (
    <SelectRoot
      value={local.value ?? null}
      defaultValue={local.defaultValue}
      onChange={handleChange}
      disabled={local.disabled}
      required={local.required}
      name={local.name}
      id={local.id}
      placeholder={placeholderContent}
      validationState={validationState()}
      class={cn(selectWrapper({ size: local.size }), local.class)}
    >
      <Show when={local.label}>
        <SelectLabel class="text-xs font-semibold uppercase tracking-wide text-[color:rgba(12,42,101,0.65)]">
          {local.label}
        </SelectLabel>
      </Show>

      <SelectTrigger
        class={cn(
          triggerStyles({
            size: local.size,
            validation: validationState() === 'invalid' ? 'invalid' : 'default',
            state: local.disabled ? 'disabled' : 'default',
          }),
          local.triggerClass,
        )}
      >
        <div class="flex w-full items-center gap-2">
          <Show when={local.leadingIcon}>{local.leadingIcon}</Show>
          <SelectValue class="flex-1 truncate text-left" />
        </div>
        <Show when={local.trailingIcon} fallback={<span aria-hidden>▾</span>}>
          {local.trailingIcon}
        </Show>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent class={cn(contentStyles(), local.contentClass)}>
          <SelectListbox class={cn(listboxStyles(), local.listboxClass)}>
            <Show when={local.options?.length}>
              <For each={local.options}>
                {(option) => (
                  <SelectItem
                    value={option.value}
                    disabled={option.disabled}
                    class={cn(itemClasses, local.itemClass)}
                  >
                    <div class="flex flex-col">
                      <SelectItemLabel>{option.label}</SelectItemLabel>
                      <Show when={option.description}>
                        <span class="text-xs font-normal text-[color:rgba(12,42,101,0.55)]">
                          {option.description}
                        </span>
                      </Show>
                    </div>
                    <SelectItemIndicator class={indicatorStyles()}>✓</SelectItemIndicator>
                  </SelectItem>
                )}
              </For>
            </Show>
            <Show when={!local.options || local.options.length === 0}>
              <div class="px-3 py-2 text-sm text-[color:rgba(12,42,101,0.55)]">No options available</div>
            </Show>
          </SelectListbox>
        </SelectContent>
      </SelectPortal>

      <Show when={local.description}>
        {(content) => (
          <SelectDescription class={messageText({ tone: 'muted' })}>
            {content()}
          </SelectDescription>
        )}
      </Show>

      <Show when={local.errorMessage}>
        {(message) => (
          <SelectErrorMessage class={messageText({ tone: 'error' })}>
            {message()}
          </SelectErrorMessage>
        )}
      </Show>
    </SelectRoot>
  );
};

export default Select;
