import { createMemo, createSignal, type Accessor } from 'solid-js';

export interface ConfirmRequestOptions {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ConfirmState {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

export interface ConfirmController {
  state: Accessor<ConfirmState | null>;
  resolve: (result: boolean) => void;
  request: (options: ConfirmRequestOptions) => Promise<boolean>;
}

interface ConfirmInternal extends ConfirmState {
  resolve: (confirmed: boolean) => void;
}

export const createConfirmController = (): ConfirmController => {
  const [confirmRequest, setConfirmRequest] = createSignal<ConfirmInternal | null>(null);

  const request = (options: ConfirmRequestOptions) =>
    new Promise<boolean>((resolve) => {
      setConfirmRequest({
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        resolve,
      });
    });

  const resolve = (result: boolean) => {
    const current = confirmRequest();
    if (!current) return;
    current.resolve(result);
    setConfirmRequest(null);
  };

  const state = createMemo<ConfirmState | null>(() => {
    const current = confirmRequest();
    if (!current) return null;
    const { resolve: _resolve, ...rest } = current;
    void _resolve;
    return rest;
  });

  return {
    state,
    resolve,
    request,
  };
};
