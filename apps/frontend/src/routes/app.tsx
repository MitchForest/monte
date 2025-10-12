import { For, Match, Show, Switch, createMemo, createResource } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import { Button, Card } from '../components/ui';
import { useAuth } from '../providers/AuthProvider';
import { getOrganizationOverview, type OrganizationOverviewResult } from '../domains/auth/organizationClient';
import { toast } from 'solid-sonner';

const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <Card variant="soft" class="w-full max-w-md space-y-4 p-6 text-center">
      <p class="text-sm text-[color:var(--color-text-muted)]">
        You need to sign in to access Monte. We’ll email you a magic link.
      </p>
      <Button onClick={() => void navigate({ to: '/auth/sign-in' })}>Sign in</Button>
      <Button variant="ghost" onClick={() => void navigate({ to: '/auth/sign-up' })}>
        Create an account
      </Button>
    </Card>
  );
};

const OrganizationList = () => {
  const auth = useAuth();

  const organizations = createMemo(() => auth.organizations());
  const activeId = createMemo(() => auth.activeOrganization()?.id ?? null);

  const handleSelect = async (organizationId?: string | null) => {
    try {
      await auth.setActiveOrganization(organizationId ?? null);
      await auth.reloadOrganizations();
      toast.success(organizationId ? 'Active organization updated' : 'Cleared active organization');
    } catch (error) {
      console.error('Unable to update active organization', error);
      toast.error('Failed to update active organization');
    }
  };

  return (
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
          Organizations
        </h2>
        <Button variant="ghost" size="compact" onClick={() => void auth.reloadOrganizations()}>
          Refresh
        </Button>
      </div>

      <Show
        when={organizations().length > 0}
        fallback={<p class="text-sm text-[color:var(--color-text-muted)]">No organizations yet.</p>}
      >
        <ul class="divide-y divide-[rgba(12,42,101,0.1)] overflow-hidden rounded-xl border border-[rgba(12,42,101,0.1)] bg-white">
          <For each={organizations()}>
            {(organization) => {
              const isActive = activeId() === organization.id;
              return (
                <li class="flex flex-wrap items-start justify-between gap-3 p-4 text-left text-sm text-[color:var(--color-text)]">
                  <div>
                    <p class="font-semibold text-[color:var(--color-heading)]">{organization.name}</p>
                    <p class="text-xs text-[color:var(--color-text-muted)]">
                      Slug: <span class="font-mono">{organization.slug}</span>
                    </p>
                  </div>
                  <Button
                    variant={isActive ? 'primary' : 'secondary'}
                    size="compact"
                    onClick={() => void handleSelect(isActive ? undefined : organization.id)}
                  >
                    {isActive ? 'Active organization' : 'Make active'}
                  </Button>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
    </section>
  );
};

const OrganizationDetails = () => {
  const auth = useAuth();
  const activeOrg = createMemo(() => auth.activeOrganization());

  const [overview] = createResource<OrganizationOverviewResult | undefined, string | undefined>(
    () => activeOrg()?.id,
    async (organizationId) => {
      if (!organizationId) return undefined;
      return await getOrganizationOverview(organizationId);
    },
  );

  const overviewError = () => {
    const candidate: unknown = overview.error;
    if (typeof candidate === 'function') {
      const accessor: () => unknown = candidate;
      const value: unknown = accessor();
      return value instanceof Error ? value : undefined;
    }
    return undefined;
  };

  return (
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
          Active organization
        </h2>
        <Show when={activeOrg()}>
          {(org) => (
            <p class="text-xs text-[color:var(--color-text-muted)]">
              Viewing data for <span class="font-semibold text-[color:var(--color-heading)]">{org().name}</span>
            </p>
          )}
        </Show>
      </div>

      <Switch>
        <Match when={!activeOrg()}>
          <Card variant="soft" class="p-4 text-sm text-[color:var(--color-text-muted)]">
            Select an organization to view members and invitations.
          </Card>
        </Match>
        <Match when={overview.loading}>
          <Card variant="soft" class="p-4 text-sm text-[color:var(--color-text-muted)]">
            Loading organization details…
          </Card>
        </Match>
        <Match when={overviewError()}>
          <Card variant="soft" class="p-4 text-sm text-[color:rgba(239,68,68,0.9)]">
            Unable to load organization details. Try refreshing.
          </Card>
        </Match>
        <Match when={overview()}>
          {(details) => (
            <div class="space-y-4">
              <Card variant="soft" class="space-y-2 p-4">
                <h3 class="text-sm font-semibold text-[color:var(--color-heading)]">Members</h3>
                <Show
                  when={details().members.length > 0}
                  fallback={<p class="text-sm text-[color:var(--color-text-muted)]">No members yet.</p>}
                >
                  <ul class="space-y-2 text-sm text-[color:var(--color-text)]">
                    <For each={details().members}>
                      {(member) => (
                        <li class="flex flex-col rounded-lg border border-[rgba(12,42,101,0.1)] bg-white px-3 py-2">
                          <span class="font-medium text-[color:var(--color-heading)]">
                            {member.user?.name ?? member.user?.email ?? member.userId}
                          </span>
                          <p class="text-xs text-[color:var(--color-text-muted)]">
                            Role: {member.role} · User ID: {member.userId}
                          </p>
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
              </Card>

              <Card variant="soft" class="space-y-2 p-4">
                <h3 class="text-sm font-semibold text-[color:var(--color-heading)]">Invitations</h3>
                <Show
                  when={details().invitations.length > 0}
                  fallback={<p class="text-sm text-[color:var(--color-text-muted)]">No pending invitations.</p>}
                >
                  <ul class="space-y-2 text-sm text-[color:var(--color-text)]">
                    <For each={details().invitations}>
                      {(invite) => (
                        <li class="flex flex-col rounded-lg border border-[rgba(12,42,101,0.1)] bg-white px-3 py-2">
                          <span class="font-medium text-[color:var(--color-heading)]">{invite.email}</span>
                          <p class="text-xs text-[color:var(--color-text-muted)]">
                            Role: {invite.role} · Status: {invite.status}
                          </p>
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
              </Card>
            </div>
          )}
        </Match>
      </Switch>
    </section>
  );
};

const Dashboard = () => {
  const auth = useAuth();

  return (
    <Card variant="soft" class="w-full max-w-4xl space-y-6 p-6">
      <header class="space-y-1">
        <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">Welcome to Monte</h1>
        <p class="text-sm text-[color:var(--color-text-muted)]">
          Manage your organizations and view members from the Better Auth baseline setup.
        </p>
      </header>

      <section class="space-y-1 text-sm text-[color:var(--color-text-muted)]">
        <p>
          Signed in as{' '}
          <span class="font-medium text-[color:var(--color-heading)]">
            {auth.user()?.email ?? auth.user()?.id ?? 'Unknown user'}
          </span>
          {auth.role() ? ` · Role: ${auth.role()}` : ''}
        </p>
      </section>

      <OrganizationList />
      <OrganizationDetails />
    </Card>
  );
};

const AppRoute = () => {
  const auth = useAuth();

  return (
    <div class="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] p-6">
      <Show when={!auth.loading()} fallback={<Card variant="soft" class="p-6 text-sm text-[color:var(--color-text-muted)]">Loading session…</Card>}>
        <Switch>
          <Match when={!auth.isAuthenticated()}>
            <EmptyState />
          </Match>
          <Match when={auth.isAuthenticated()}>
            <Dashboard />
          </Match>
        </Switch>
      </Show>
    </div>
  );
};

export default AppRoute;
