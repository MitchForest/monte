import { TextField } from '@kobalte/core';
import type { TextFieldRootProps } from '@kobalte/core/text-field';
import { cva, type VariantProps } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { Show, splitProps } from 'solid-js';

import { cn } from '../lib/cn';

const textareaWrapper = cva('flex flex-col gap-1.5', {
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

const textareaControl = cva(
  [
    'w-full rounded-xl border border-[rgba(64,157,233,0.35)] bg-white px-3 py-2 text-sm',
    'text-[color:var(--color-text)] shadow-[0_6px_18px_rgba(12,42,101,0.08)] transition',
    'focus-within:border-[rgba(64,157,233,0.6)] focus-within:shadow-[0_14px_28px_rgba(12,42,101,0.12)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[rgba(64,157,233,0.35)]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
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

const textareaElement = cva(
  'min-h-[120px] w-full resize-y border-none bg-transparent text-inherit placeholder:text-[rgba(12,42,101,0.45)] focus:outline-none',
  {
    variants: {
      size: {
        sm: 'text-xs leading-relaxed',
        md: 'text-sm leading-relaxed',
        lg: 'text-base leading-relaxed',
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

type TextareaSize = NonNullable<VariantProps<typeof textareaControl>['size']>;

export interface TextareaProps
  extends Omit<TextFieldRootProps, 'children' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  onChange?: (next: string) => void;
  size?: TextareaSize;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  class?: string;
  textareaClass?: string;
  placeholder?: string;
  rows?: number;
  onInput?: JSX.EventHandlerUnion<HTMLTextAreaElement, InputEvent>;
  onBlur?: JSX.EventHandlerUnion<HTMLTextAreaElement, FocusEvent>;
  onFocus?: JSX.EventHandlerUnion<HTMLTextAreaElement, FocusEvent>;
}

export const Textarea: Component<TextareaProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'size',
    'label',
    'description',
    'errorMessage',
    'class',
    'textareaClass',
    'placeholder',
    'rows',
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
      class={cn(textareaWrapper({ size: local.size }), local.class)}
    >
      <Show when={local.label}>
        <TextField.Label class="text-xs font-semibold uppercase tracking-wide text-[color:rgba(12,42,101,0.65)]">
          {local.label}
        </TextField.Label>
      </Show>

      <div
        class={cn(
          textareaControl({
            size: local.size,
            validation: combinedValidation() === 'invalid' ? 'invalid' : 'default',
            state: local.disabled ? 'disabled' : 'default',
          }),
        )}
      >
        <TextField.TextArea
          placeholder={local.placeholder}
          rows={local.rows}
          class={cn(
            textareaElement({
              size: local.size,
              state: local.disabled ? 'disabled' : 'default',
            }),
            local.textareaClass,
          )}
          onInput={local.onInput}
          onBlur={local.onBlur}
          onFocus={local.onFocus}
        />
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

export default Textarea;
