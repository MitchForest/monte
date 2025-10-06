import type { Component } from 'solid-js';
import { createForm } from '@tanstack/solid-form';

const Forms: Component = () => {
  const form = createForm(() => ({
    defaultValues: {
      draft: '',
    },
    onSubmit: async () => {
      /* wire up Convex mutation */
    },
  }));

  return (
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold text-neutral-100">Forms Workspace</h1>
      <p class="text-sm text-neutral-400">
        Connect form fields to `form.fieldRegistry` and route submissions into Convex.
      </p>
      <form class="space-y-3" onSubmit={form.handleSubmit()}>
        <form.Field name="draft">
          {(field) => (
            <label class="flex flex-col gap-2 text-sm">
              <span class="text-neutral-300">Draft field</span>
              <input
                class="rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-white/20 focus:outline-none"
                value={(field().state.value as string) ?? ''}
                onInput={(event) => field().setValue(event.currentTarget.value)}
              />
            </label>
          )}
        </form.Field>
        <button
          type="submit"
          class="inline-flex items-center justify-center rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900"
        >
          Submit
        </button>
      </form>
    </section>
  );
};

export default Forms;
