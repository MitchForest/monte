import { TextField } from '@kobalte/core';
import type { TextFieldRootProps } from '@kobalte/core/text-field';
import { cva, type VariantProps } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { Show, splitProps } from 'solid-js';

import { cn } from '../../lib/cn';

const inputWrapper = cva('flex flex-col gap-1.5', {
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

const inputControl = cva(
  [
    'flex w-full items-center gap-2 rounded-xl border border-[rgba(64,157,233,0.35)] bg-white px-3',
    'text-sm font-medium text-[color:var(--color-text)] shadow-[0_6px_18px_rgba(12,42,101,0.08)] transition',
    'focus-within:border-[rgba(64,157,233,0.6)] focus-within:shadow-[0_14px_28px_rgba(12,42,101,0.12)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[rgba(64,157,233,0.35)]',
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
        invalid: 'border-[rgba(239,68,68,0.5)] focus-within:outline-[rgba(239,68,68,0.45)]',
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

const inputText = cva(
  'w-full border-none bg-transparent px-0 py-0 text-inherit placeholder:text-[rgba(12,42,101,0.45)] focus:outline-none',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      state: {
        default: '',
        disabled: 'cursor-not-allowed opacity-70',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  },
);

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

type InputSize = NonNullable<VariantProps<typeof inputControl>['size']>;

export interface InputProps
  extends Omit<TextFieldRootProps, 'children' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  onChange?: (next: string) => void;
  size?: InputSize;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  leading?: JSX.Element;
  trailing?: JSX.Element;
  class?: string;
  inputClass?: string;
  inputRef?: (element: HTMLInputElement) => void;
  type?: string;
  placeholder?: string;
  inputMode?: JSX.HTMLAttributes<HTMLInputElement>['inputmode'];
  pattern?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  minLength?: number;
  maxLength?: number;
  name?: string;
  autocomplete?: string;
  onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
  onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
}

export const Input: Component<InputProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'class',
    'size',
    'label',
    'description',
    'errorMessage',
    'leading',
    'trailing',
    'inputClass',
    'inputRef',
    'type',
    'placeholder',
    'inputMode',
    'pattern',
    'min',
    'max',
    'step',
    'minLength',
    'maxLength',
    'name',
    'autocomplete',
    'onInput',
    'onBlur',
    'onFocus',
    'disabled',
    'required',
    'readOnly',
    'validationState',
    'value',
    'defaultValue',
    'onValueChange',
    'onChange',
  ]);

  const combinedValidation = () =>
    local.errorMessage ? 'invalid' : local.validationState;

  const handleChange = (next: string) => {
    local.onValueChange?.(next);
    local.onChange?.(next);
  };

  return (
    <TextField.Root
      {...rest}
      value={local.value}
      defaultValue={local.defaultValue}
      disabled={local.disabled}
      required={local.required}
      readOnly={local.readOnly}
      validationState={combinedValidation()}
      onChange={handleChange}
      class={cn(inputWrapper({ size: local.size }), local.class)}
    >
      <Show when={local.label}>
        <TextField.Label class="text-xs font-semibold uppercase tracking-wide text-[color:rgba(12,42,101,0.65)]">
          {local.label}
        </TextField.Label>
      </Show>

      <div
        class={cn(
          inputControl({
            size: local.size,
            validation: combinedValidation() === 'invalid' ? 'invalid' : 'default',
            state: local.disabled ? 'disabled' : 'default',
          }),
        )}
      >
        <Show when={local.leading}>{local.leading}</Show>
        <TextField.Input
          ref={local.inputRef}
          type={local.type}
          placeholder={local.placeholder}
          name={local.name}
          autocomplete={local.autocomplete}
          inputmode={local.inputMode}
          pattern={local.pattern}
          min={local.min as number | undefined}
          max={local.max as number | undefined}
          step={local.step as number | undefined}
          minLength={local.minLength}
          maxLength={local.maxLength}
          class={cn(
            inputText({
              size: local.size,
              state: local.disabled ? 'disabled' : 'default',
            }),
            local.inputClass,
          )}
          onInput={local.onInput}
          onBlur={local.onBlur}
          onFocus={local.onFocus}
        />
        <Show when={local.trailing}>{local.trailing}</Show>
      </div>

      <Show when={local.description}>
        {(content) => (
          <TextField.Description class={messageText({ tone: 'muted' })}>
            {content()}
          </TextField.Description>
        )}
      </Show>

      <Show when={local.errorMessage}>
        {(message) => (
          <TextField.ErrorMessage class={messageText({ tone: 'error' })}>
            {message()}
          </TextField.ErrorMessage>
        )}
      </Show>
    </TextField.Root>
  );
};

export default Input;
