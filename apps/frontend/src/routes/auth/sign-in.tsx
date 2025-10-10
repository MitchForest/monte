import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import { authClient } from '../../lib/auth-client';
import { Button, Card } from '../../design-system';

const SignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email: email(),
        password: password(),
        callbackURL: '/editor',
      });

      if (result.error) {
        setError(result.error.message ?? 'Unable to sign in');
      } else {
        await authClient.getSession();
        void navigate({ to: '/editor' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex min-h-screen items-center justify-center bg-shell p-6">
      <Card variant="soft" class="w-full max-w-md space-y-6 p-6">
        <header class="space-y-1 text-center">
          <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">Welcome back</h1>
          <p class="text-sm text-muted">Sign in to manage curriculum content.</p>
        </header>

        <Show when={error()}>
          {(message) => (
            <div class="rounded-md border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm text-[rgba(239,68,68,0.9)]">
              {message()}
            </div>
          )}
        </Show>

        <form
          class="space-y-4"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <label class="block text-left text-sm font-medium text-muted">
            Email
            <input
              type="email"
              value={email()}
              onInput={(event) => setEmail(event.currentTarget.value)}
              required
              autocomplete="email"
              class="mt-1 w-full rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2"
            />
          </label>

          <label class="block text-left text-sm font-medium text-muted">
            Password
            <input
              type="password"
              value={password()}
              onInput={(event) => setPassword(event.currentTarget.value)}
              required
              autocomplete="current-password"
              class="mt-1 w-full rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2"
            />
          </label>

          <Button type="submit" class="w-full" disabled={loading()}>
            {loading() ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <footer class="text-center text-sm text-muted">
          Need an account?{' '}
          <Button variant="ghost" size="compact" onClick={() => void navigate({ to: '/auth/sign-up' })}>
            Create one
          </Button>
        </footer>
      </Card>
    </div>
  );
};

export default SignInPage;
