import { Dialog } from '@kobalte/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '../lib/cn';

const overlayVariants = cva('fixed inset-0 z-50 bg-[rgba(15,23,42,0.45)] backdrop-blur');

const contentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] bg-surface shadow-[0_22px_48px_rgba(12,42,101,0.18)]',
  {
    variants: {
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      padding: 'md',
    },
  },
);

const headerVariants = cva('space-y-1 text-left');
const footerVariants = cva('flex items-center justify-end gap-2 pt-4');

export interface ModalProps extends VariantProps<typeof contentVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: JSX.Element;
  description?: JSX.Element;
  children: JSX.Element;
  footer?: JSX.Element;
  class?: string;
  overlayClass?: string;
}

export const Modal: Component<ModalProps> = (props) => {
  const [local] = splitProps(props, [
    'open',
    'onOpenChange',
    'title',
    'description',
    'children',
    'footer',
    'class',
    'overlayClass',
    'padding',
  ]);

  return (
    <Dialog.Root open={local.open} onOpenChange={local.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay class={cn(overlayVariants(), local.overlayClass)} />
        <Dialog.Content class={cn(contentVariants({ padding: local.padding }), local.class)}>
          <div class={headerVariants()}>
            <Dialog.Title class="text-base font-semibold text-[color:var(--color-heading)]">
              {local.title}
            </Dialog.Title>
            {local.description && (
              <Dialog.Description class="text-sm text-[color:var(--color-text-muted)]">{local.description}</Dialog.Description>
            )}
          </div>

          <div class="mt-4">{local.children}</div>

          {local.footer && <div class={footerVariants()}>{local.footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
