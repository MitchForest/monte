import { Show, createMemo, type Component } from 'solid-js';
import { Outlet, useNavigate, useRouterState } from '@tanstack/solid-router';

import { ProgressProvider } from './domains/curriculum/state/progress';
import { PageSection, ProfileAvatar, Button } from './design-system';
import { useAuth } from './providers/AuthProvider';

const App: Component = () => {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const auth = useAuth();

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

  // Hide header when in lesson view (K-3 needs minimal distractions)
  const isLessonView = createMemo(() => {
    const path = routerState().location.pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.length >= 4 && segments[0] === 'units' && segments[2] === 'lessons';
  });

  return (
    <ProgressProvider>
      <div classList={{ 'bg-shell': true, 'text-[color:var(--color-text)]': true, 'min-h-screen': !isLessonView(), 'h-screen': isLessonView(), 'overflow-hidden': isLessonView() }}>
        <Show when={!isLessonView()}>
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

              <div class="absolute right-0 flex min-w-[160px] items-center justify-end gap-3">
                <Show
                  when={!auth.loading()}
                  fallback={<span class="text-xs text-muted">Loading…</span>}
                >
                  <Show
                    when={auth.isAuthenticated()}
                    fallback={
                      <Button variant="secondary" size="compact" onClick={() => void navigate({ to: '/auth/sign-in' })}>
                        Sign in
                      </Button>
                    }
                  >
                    <div class="flex items-center gap-2">
                      <ProfileAvatar seed={auth.user()?.email ?? 'user'} size={40} />
                      <div class="text-left">
                        <p class="text-sm font-medium text-[color:var(--color-heading)]">
                          {auth.user()?.name ?? auth.user()?.email ?? 'Member'}
                        </p>
                        <Button variant="ghost" size="compact" onClick={() => void auth.signOut()}>
                          Sign out
                        </Button>
                      </div>
                    </div>
                  </Show>
                </Show>
              </div>
            </PageSection>
          </header>
        </Show>
        <main classList={{ 'flex-1': true, 'pb-12': !isLessonView() }}>
          <Outlet />
        </main>
      </div>
    </ProgressProvider>
  );
};

export default App;
