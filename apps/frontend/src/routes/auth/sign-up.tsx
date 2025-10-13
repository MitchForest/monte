import { Show, createEffect, createSignal } from 'solid-js';
import { useLocation, useNavigate } from '@tanstack/solid-router';

import { Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../providers/AuthProvider';
import { setPendingInvitationId } from '../../domains/auth/pendingInvitation';

const SignUpPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const location = useLocation();

  const [email, setEmail] = createSignal('');
  const [name, setName] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  createEffect(() => {
    const params = new URLSearchParams(location().search ?? '');
    const invitationId = params.get('invitationId');
    if (typeof invitationId === 'string' && invitationId.trim().length > 0) {
      setPendingInvitationId(invitationId.trim());
    }
    if (auth.isAuthenticated()) {
      void navigate({ to: '/app' });
    }
  });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email().trim();
    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }

    setLoading(true);
    try {
      await auth.signUp(trimmedEmail, name().trim() || undefined);
      setSuccess('Magic link sent! Check your email to finish setting up your account.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] p-6">
      <Card variant="soft" class="w-full max-w-md space-y-6 p-6">
        <header class="space-y-1 text-center">
          <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">Create an account</h1>
          <p class="text-sm text-[color:var(--color-text-muted)]">
            Enter your email and we’ll send a secure magic link.
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
          <div class="space-y-2">
            <label class="block text-left text-sm font-medium text-[color:var(--color-text-muted)]">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email()}
              disabled={loading()}
              onInput={(event) => setEmail(event.currentTarget.value)}
              required
            />
          </div>

          <div class="space-y-2">
            <label class="block text-left text-sm font-medium text-[color:var(--color-text-muted)]">
              Name <span class="font-normal text-[color:var(--color-text-muted)]">(optional)</span>
            </label>
            <Input
              type="text"
              name="name"
              placeholder="Your name"
              value={name()}
              disabled={loading()}
              onInput={(event) => setName(event.currentTarget.value)}
            />
          </div>

          <Button type="submit" class="w-full" disabled={loading()}>
            {loading() ? 'Sending magic link…' : 'Send magic link'}
          </Button>
        </form>

        <p class="text-center text-sm text-[color:var(--color-text-muted)]">
          Already have an account?{' '}
          <button
            class="font-medium text-[color:var(--color-primary)] underline-offset-4 hover:underline"
            type="button"
            onClick={() => void navigate({ to: '/auth/sign-in' })}
          >
            Sign in
          </button>
        </p>
      </Card>
    </div>
  );
};

export default SignUpPage;
