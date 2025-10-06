import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import { Link, Outlet } from '@tanstack/solid-router';
import { RouterDevtools } from '@tanstack/router-devtools';

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/forms', label: 'Forms' },
  { href: '/table', label: 'Tables' },
];

const App: Component = () => {
  return (
    <div class="flex min-h-screen flex-col">
      <header class="border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <div class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p class="text-base font-semibold text-neutral-100">Monte</p>
          <nav class="flex items-center gap-2 text-sm">
            <For each={navItems}>
              {(item) => (
                <Link
                  href={item.href}
                  activeOptions={{ exact: item.href === '/' }}
                  activeProps={{ class: 'rounded-full bg-neutral-100/10 px-3 py-1 text-white' }}
                  inactiveProps={{ class: 'rounded-full px-3 py-1 text-neutral-400 hover:text-white' }}
                >
                  {item.label}
                </Link>
              )}
            </For>
          </nav>
        </div>
      </header>
      <main class="flex-1">
        <div class="mx-auto w-full max-w-5xl px-6 py-10">
          <Outlet />
        </div>
      </main>
      <Show when={import.meta.env.DEV}>
        <RouterDevtools position="bottom-right" />
      </Show>
    </div>
  );
};

export default App;
