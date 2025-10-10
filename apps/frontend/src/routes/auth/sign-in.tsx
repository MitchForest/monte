import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import { authClient } from '../../lib/auth-client';
import { Button, Card, Input } from '../../components/ui';

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
    <div class="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] p-6">
      <Card variant="soft" class="w-full max-w-md space-y-6 p-6">
        <header class="space-y-1 text-center">
          <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">Welcome back</h1>
          <p class="text-sm text-[color:var(--color-text-muted)]">Sign in to manage curriculum content.</p>
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
          <Input
            label="Email"
            type="email"
            value={email()}
            onValueChange={setEmail}
            required
            autocomplete="email"
            size="md"
          />

          <Input
            label="Password"
            type="password"
            value={password()}
            onValueChange={setPassword}
            required
            autocomplete="current-password"
            size="md"
          />

          <Button type="submit" class="w-full" disabled={loading()}>
            {loading() ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <footer class="text-center text-sm text-[color:var(--color-text-muted)]">
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
