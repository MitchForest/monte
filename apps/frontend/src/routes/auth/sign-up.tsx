import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import type { UserRole } from '@monte/types';

import { Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../providers/AuthProvider';

type PlanCategory = 'solo' | 'family' | 'org' | 'org_highvolume';

const roleOptions: Array<{ value: UserRole; label: string; description: string }> = [
  {
    value: 'guardian',
    label: 'Guardian',
    description: 'Parents or guardians tracking progress for their learners.',
  },
  {
    value: 'guide',
    label: 'Guide',
    description: 'Teachers or tutors working with specific students inside an organization.',
  },
  {
    value: 'student',
    label: 'Student',
    description: 'Learners using Monte to practice activities assigned by their guide.',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Create and manage an organization, including billing and student rosters.',
  },
  {
    value: 'internal',
    label: 'Monte Team',
    description: 'Internal Monte team members (code required).',
  },
];

const resolvePlanKey = (category: PlanCategory, cadence: 'monthly' | 'annual') => {
  switch (category) {
    case 'solo':
      return cadence === 'monthly' ? 'solo_monthly' : 'solo_annual';
    case 'family':
      return cadence === 'monthly' ? 'family_monthly' : 'family_annual';
    case 'org':
      return cadence === 'monthly' ? 'org_monthly' : 'org_annual';
    case 'org_highvolume':
      return cadence === 'monthly' ? 'org_highvolume_monthly' : 'org_highvolume_annual';
    default:
      return 'family_monthly';
  }
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = createSignal('');
  const [name, setName] = createSignal('');
  const [role, setRole] = createSignal<UserRole>('guardian');
  const [planCategory, setPlanCategory] = createSignal<PlanCategory>('family');
  const [billingCycle, setBillingCycle] = createSignal<'monthly' | 'annual'>('monthly');
  const [internalCode, setInternalCode] = createSignal('');
  const [orgName, setOrgName] = createSignal('');
  const [orgSlug, setOrgSlug] = createSignal('');
  const [orgIdentifier, setOrgIdentifier] = createSignal('');
  const [joinCode, setJoinCode] = createSignal('');
  const [inviteToken, setInviteToken] = createSignal('');

  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  createEffect(() => {
    if (auth.isAuthenticated()) {
      void navigate({ to: '/app' });
    }
  });

  const planSummary = createMemo(() => {
    const cadence = billingCycle();
    switch (planCategory()) {
      case 'solo':
        return cadence === 'monthly'
          ? '$49 / student / month (single learner)'
          : '$490 / student / year (single learner)';
      case 'family':
        return cadence === 'monthly'
          ? '$79 / family / month (up to 4 students)'
          : '$790 / family / year (up to 4 students)';
      case 'org':
        return cadence === 'monthly'
          ? '$19 / student / month (includes first 100 students)'
          : '$190 / student / year (includes first 100 students)';
      case 'org_highvolume':
        return cadence === 'monthly'
          ? '$9 / student / month beyond 100 students'
          : '$90 / student / year beyond 100 students';
      default:
        return '';
    }
  });

  const resetRoleSpecificFields = (nextRole: UserRole) => {
    setError(null);
    setSuccess(null);

    if (nextRole === 'internal') {
      setOrgName('');
      setOrgSlug('');
      setOrgIdentifier('');
      setJoinCode('');
      setInviteToken('');
    } else if (nextRole === 'admin') {
      setInternalCode('');
      setOrgIdentifier('');
      setJoinCode('');
      setInviteToken('');
    } else {
      setInternalCode('');
    }
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const trimmedEmail = email().trim();
    const trimmedName = name().trim();
    const currentRole = role();

    if (!trimmedEmail) {
      setError('Email is required.');
      setLoading(false);
      return;
    }

    const intent = {
      email: trimmedEmail,
      name: trimmedName || undefined,
      role: currentRole,
    } as Parameters<typeof auth.signUp>[0];

    if (currentRole === 'internal') {
      const code = internalCode().trim();
      if (!code) {
        setError('Enter the internal access code provided by the Monte team.');
        setLoading(false);
        return;
      }
      intent.internalAccessCode = code;
    } else if (currentRole === 'admin') {
      const trimmedOrgName = orgName().trim();
      if (!trimmedOrgName) {
        setError('Organization name is required to create a new account.');
        setLoading(false);
        return;
      }
      intent.org = {
        name: trimmedOrgName,
        slug: orgSlug().trim() || undefined,
        planKey: resolvePlanKey(planCategory(), billingCycle()),
      };
    } else {
      const invitationId = inviteToken().trim();
      if (!invitationId) {
        setError('Provide the invitation code sent by your admin.');
        setLoading(false);
        return;
      }

      intent.join = {
        invitationId,
        organizationSlug: orgIdentifier().trim() || undefined,
        joinCode: joinCode().trim() || undefined,
      };
    }

    try {
      await auth.signUp(intent);
      setSuccess('Magic link sent! Check your email to finish setting up your account.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] p-6">
      <Card variant="soft" class="w-full max-w-xl space-y-6 p-6">
        <header class="space-y-1 text-center">
          <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">Create an account</h1>
          <p class="text-sm text-[color:var(--color-text-muted)]">
            Tell us how you plan to use Monte and we’ll send a secure magic link.
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
            <label class="block text-left text-sm font-medium text-[color:var(--color-text-muted)]">Role</label>
            <select
              class="w-full rounded-xl border border-[rgba(64,157,233,0.35)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-text)] shadow-[0_6px_18px_rgba(12,42,101,0.08)] focus-visible:border-[rgba(64,157,233,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(64,157,233,0.35)]"
              value={role()}
              onInput={(event) => {
                const nextRole = event.currentTarget.value as UserRole;
                setRole(nextRole);
                resetRoleSpecificFields(nextRole);
              }}
            >
              {roleOptions.map((option) => (
                <option value={option.value}>{option.label}</option>
              ))}
            </select>
            <p class="text-xs text-[color:var(--color-text-muted)]">
              {roleOptions.find((option) => option.value === role())?.description}
            </p>
          </div>

          <Input
            label="Name"
            type="text"
            value={name()}
            onValueChange={setName}
            autocomplete="name"
            size="md"
          />

          <Input
            label="Email"
            type="email"
            value={email()}
            onValueChange={setEmail}
            required
            autocomplete="email"
            size="md"
          />

          <Show when={role() === 'internal'}>
            <div>
              <Input
                label="Internal access code"
                type="text"
                value={internalCode()}
                onValueChange={setInternalCode}
                size="md"
                autocomplete="one-time-code"
              />
              <p class="mt-1 text-xs text-[color:var(--color-text-muted)]">
                Only Monte team members should have this code. Reach out to the curriculum team if you need the latest one.
              </p>
            </div>
          </Show>

          <Show when={role() === 'admin'}>
            <div class="space-y-4">
              <Input
                label="Organization name"
                type="text"
                value={orgName()}
                onValueChange={setOrgName}
                required
                size="md"
              />

              <Input
                label="Organization code (optional)"
                description="Short, memorable slug for your organization. Leave blank to generate one automatically."
                type="text"
                value={orgSlug()}
                onValueChange={setOrgSlug}
                size="md"
              />

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="space-y-1">
                  <label class="block text-left text-sm font-medium text-[color:var(--color-text-muted)]">
                    Plan type
                  </label>
                  <select
                    class="w-full rounded-xl border border-[rgba(64,157,233,0.35)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-text)] shadow-[0_6px_18px_rgba(12,42,101,0.08)] focus-visible:border-[rgba(64,157,233,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(64,157,233,0.35)]"
                    value={planCategory()}
                    onInput={(event) => setPlanCategory(event.currentTarget.value as PlanCategory)}
                  >
                    <option value="solo">Solo learner</option>
                    <option value="family">Family / homeschool</option>
                    <option value="org">School or small org (up to 100 students)</option>
                    <option value="org_highvolume">Large org (over 100 students)</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="block text-left text-sm font-medium text-[color:var(--color-text-muted)]">
                    Billing cadence
                  </label>
                  <select
                    class="w-full rounded-xl border border-[rgba(64,157,233,0.35)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-text)] shadow-[0_6px_18px_rgba(12,42,101,0.08)] focus-visible:border-[rgba(64,157,233,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(64,157,233,0.35)]"
                    value={billingCycle()}
                    onInput={(event) => setBillingCycle(event.currentTarget.value as 'monthly' | 'annual')}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <p class="text-xs text-[color:var(--color-text-muted)]">{planSummary()}</p>
            </div>
          </Show>

          <Show when={role() === 'guide' || role() === 'guardian' || role() === 'student'}>
            <div class="space-y-4">
              <Input
                label="Organization code"
                description="Ask your admin for the short org ID (e.g. montessori-harbor)."
                type="text"
                value={orgIdentifier()}
                onValueChange={setOrgIdentifier}
                size="md"
              />

              <Input
                label="Access code"
                description="The 6–8 character join code shared by your admin."
                type="text"
                value={joinCode()}
                onValueChange={setJoinCode}
                size="md"
              />

              <Input
                label="Invite token (optional)"
                description="Paste the invite link token if you received one by email."
                type="text"
                value={inviteToken()}
                onValueChange={setInviteToken}
                size="md"
              />
            </div>
          </Show>

          <Button type="submit" class="w-full" disabled={loading()}>
            {loading() ? 'Sending link…' : 'Email me a magic link'}
          </Button>
        </form>

        <footer class="text-center text-sm text-[color:var(--color-text-muted)]">
          Already have an account?{' '}
          <Button variant="ghost" size="compact" onClick={() => void navigate({ to: '/auth/sign-in' })}>
            Sign in
          </Button>
        </footer>
      </Card>
    </div>
  );
};

export default SignUpPage;
