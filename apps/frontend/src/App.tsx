import { Show, createMemo, type Component } from 'solid-js';
import { Outlet, useNavigate, useRouterState } from '@tanstack/solid-router';

import { ProgressProvider } from './curriculum/state/progress';
import { PageSection, ProfileAvatar, Button } from './design-system';

const App: Component = () => {
  const navigate = useNavigate();
  const routerState = useRouterState();

  const backTarget = createMemo<{ show: boolean; path: string }>(() => {
    const path = routerState().location.pathname;
    if (path === '/') {
      return { show: false, path: '/' };
    }

    const segments = path.split('/').filter(Boolean);
    if (segments[0] !== 'units') {
      return { show: true, path: '/' };
    }

    if (segments.length >= 4 && segments[2] === 'lessons') {
      return { show: true, path: `/units/${segments[1]}` };
    }

    return { show: true, path: '/' };
  });

  return (
    <ProgressProvider>
      <div class="min-h-screen bg-shell text-[color:var(--color-text)]">
        <header class="sticky top-0 z-30 bg-[rgba(244,250,252,0.85)] backdrop-blur-md">
          <PageSection bleed class="relative flex h-20 items-center justify-center">
            <Show when={backTarget().show}>
              <Button
                variant="ghost"
                size="compact"
                iconPosition="left"
                icon={<span aria-hidden>&lt;</span>}
                class="absolute left-0"
                onClick={() => void navigate({ to: backTarget().path })}
              >
                Back
              </Button>
            </Show>

            <span class="text-5xl font-bold tracking-tight text-[color:var(--color-heading)]">Bemo</span>

            <div class="absolute right-0 flex items-center gap-3">
              <ProfileAvatar seed="Taylor" size={56} />
            </div>
          </PageSection>
        </header>
        <main class="flex-1 pb-12">
          <Outlet />
        </main>
      </div>
    </ProgressProvider>
  );
};

export default App;
