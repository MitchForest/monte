import { createEffect, createSignal, Show } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import { Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../providers/AuthProvider';

const SignInPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = createSignal('');
  const [name, setName] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  createEffect(() => {
    if (auth.isAuthenticated()) {
      void navigate({ to: '/editor' });
    }
  });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await auth.signIn(email().trim(), name().trim() || undefined);
      setSuccess('Magic link sent! Check your email to continue.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] p-6">
      <Card variant="soft" class="w-full max-w-md space-y-6 p-6">
        <header class="space-y-1 text-center">
          <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">Welcome back</h1>
          <p class="text-sm text-[color:var(--color-text-muted)]">
            Enter your email and we’ll send you a secure magic link.
          </p>
        </header>

        <Show when={error()}>
          {(message) => (
            <div class="rounded-md border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm text-[rgba(239,68,68,0.9)]">
              {message()}
            </div>
          )}
        </Show>

        <Show when={success()}>
          {(message) => (
            <div class="rounded-md border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.12)] px-3 py-2 text-sm text-[rgba(22,163,74,0.9)]">
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
            label="Name (optional)"
            type="text"
            value={name()}
            onValueChange={setName}
            autocomplete="name"
            size="md"
          />

          <Button type="submit" class="w-full" disabled={loading()}>
            {loading() ? 'Sending link…' : 'Email me a magic link'}
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
