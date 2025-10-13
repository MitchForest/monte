import { Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { useLocation, useNavigate } from '@tanstack/solid-router';

import { Button, Card } from '../../components/ui';
import { useAuth } from '../../providers/AuthProvider';
import { authClient } from '../../lib/auth-client';
import { setPendingInvitationId } from '../../domains/auth/pendingInvitation';

type InvitationStatus = 'processing' | 'success' | 'auth' | 'error';

const redirectDelayMs = 1600;

const AcceptInvitation = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = createSignal<InvitationStatus>('processing');
  const [message, setMessage] = createSignal<string>('Processing your invitation…');
  const [invitationId, setInvitationId] = createSignal<string>('');

  let redirectTimer: number | undefined;

  const scheduleRedirect = () => {
    if (typeof window === 'undefined') {
      return;
    }
    if (redirectTimer) {
      window.clearTimeout(redirectTimer);
    }
    redirectTimer = window.setTimeout(() => {
      void navigate({ to: '/app' });
    }, redirectDelayMs);
  };

  const handleUnauthorized = (id: string) => {
    setPendingInvitationId(id);
    setStatus('auth');
    setMessage('Sign in to accept this invitation. Once you’re authenticated we will finish the process automatically.');
  };

  const acceptInvitation = async (id: string) => {
    setStatus('processing');
    setMessage('Hang tight—we’re confirming your invitation…');
    try {
      const result = await authClient.$fetch('/organization/accept-invitation', {
        method: 'POST',
        body: {
          invitationId: id,
          keepCurrentActiveOrganization: false,
        },
        throw: false,
      });
      if (result?.error) {
        throw new Error(result.error.message ?? 'Invitation could not be accepted');
      }
      await auth.reloadOrganizations();
      setStatus('success');
      setMessage('Invitation accepted! Redirecting you to your workspace…');
      scheduleRedirect();
    } catch (error) {
      const reason = error instanceof Error ? error.message ?? '' : String(error);
      const normalized = reason.toLowerCase();
      if (normalized.includes('unauthorized') || normalized.includes('not authenticated') || normalized.includes('forbidden')) {
        handleUnauthorized(id);
        return;
      }
      setStatus('error');
      setMessage(reason || 'We could not accept your invitation. Please try again from the email link.');
    }
  };

  const searchInvitationId = createMemo(() => {
    const current = location();
    const params = new URLSearchParams(current.search ?? '');
    return params.get('invitationId') ?? '';
  });

  onMount(() => {
    const rawId = searchInvitationId().trim();
    if (!rawId) {
      setStatus('error');
      setMessage('This invitation link is missing its identifier. Request a new invite from your organization owner.');
      return;
    }
    setInvitationId(rawId);
    void acceptInvitation(rawId);
  });

  onCleanup(() => {
    if (redirectTimer && typeof window !== 'undefined') {
      window.clearTimeout(redirectTimer);
    }
  });

  return (
    <div class="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] px-4 py-12">
      <Card variant="soft" class="w-full max-w-lg space-y-6 p-6 text-center">
        <header class="space-y-2">
          <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">Join your organization</h1>
          <p class="text-sm text-[color:var(--color-text-muted)]">{message()}</p>
        </header>

        <Show when={status() === 'processing'}>
          <p class="text-sm text-[color:var(--color-text-muted)]">This should only take a moment…</p>
        </Show>

        <Show when={status() === 'success'}>
          <div class="space-y-3">
            <Button class="w-full" onClick={() => void navigate({ to: '/app' })}>
              Go to dashboard now
            </Button>
          </div>
        </Show>

        <Show when={status() === 'auth'}>
          <div class="space-y-3">
            <p class="text-sm text-[color:var(--color-text-muted)]">
              Use the email from the invitation to sign in. After you authenticate we’ll automatically accept the invite.
            </p>
            <div class="flex flex-col gap-2 sm:flex-row">
              <Button
                class="w-full"
                onClick={() =>
                  void navigate({
                    to: '/auth/sign-in',
                    search: { invitationId: invitationId() },
                  })
                }
              >
                Sign in
              </Button>
              <Button
                variant="secondary"
                class="w-full"
                onClick={() =>
                  void navigate({
                    to: '/auth/sign-up',
                    search: { invitationId: invitationId() },
                  })
                }
              >
                Create an account
              </Button>
            </div>
          </div>
        </Show>

        <Show when={status() === 'error'}>
          <div class="space-y-3">
            <Button variant="secondary" class="w-full" onClick={() => void navigate({ to: '/app' })}>
              Return to dashboard
            </Button>
          </div>
        </Show>

        <footer class="text-xs text-[color:var(--color-text-muted)]">
          Need help? Contact your organization owner so they can resend the invite.
        </footer>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
