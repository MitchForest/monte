import { For, Match, Show, Switch, createMemo, createResource, createSignal } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import { Button, Card } from '../components/ui';
import { useAuth } from '../providers/AuthProvider';
import {
  getOrganizationOverview,
  impersonateUser,
  inviteMember,
  listOrganizations,
  regenerateJoinCode,
  removeMember,
  revokeInvitation,
  setActiveOrganization,
  stopImpersonation,
  updateMemberRole,
} from '../domains/auth/organizationClient';
import type { UserRole } from '@monte/types';
import type { AuthOrganization, OrganizationOverviewResult } from '../domains/auth/organizationClient';
import { toast } from 'solid-sonner';

const EmptyState = () => {
  const auth = useAuth();
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

const InternalView = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [orgList, { refetch: refetchOrgList }] = createResource<AuthOrganization[], string | undefined>(
    () => (auth.isAuthenticated() ? auth.user()?.id : undefined),
    async () => await listOrganizations(),
  );

  const organizations = createMemo<AuthOrganization[]>(() => orgList() ?? []);

  const handleSelectOrganization = async (organizationId?: string | null) => {
    try {
      await setActiveOrganization(organizationId ?? null);
      await auth.reloadOrganizations();
      await refetchOrgList();
      toast.success(organizationId ? 'Active organization updated' : 'Cleared active organization');
    } catch (error) {
      console.error('Unable to set active organization', error);
      toast.error('Failed to update active organization');
    }
  };

  return (
    <Card variant="soft" class="w-full max-w-4xl space-y-6 p-6">
      <header class="space-y-1">
        <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">Monte team workspace</h1>
        <p class="text-sm text-[color:var(--color-text-muted)]">
          Access the lesson editor, inspect organizations, or impersonate members to troubleshoot issues.
        </p>
      </header>

      <div class="flex flex-wrap gap-3">
        <Button onClick={() => void navigate({ to: '/editor' })}>Open lesson editor</Button>
        <Button variant="secondary" onClick={() => void handleSelectOrganization(undefined)}>
          Clear active organization
        </Button>
      </div>

      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
            Organizations
          </h2>
          <Button variant="ghost" size="compact" onClick={() => void refetchOrgList()}>
            Refresh
          </Button>
        </div>
        <Switch>
          <Match when={orgList.loading}>
            <p class="text-sm text-[color:var(--color-text-muted)]">Loading organizations…</p>
          </Match>
          <Match when={orgList.error}>
            <p class="text-sm text-[color:rgba(239,68,68,0.9)]">
              Unable to load organizations. Try refreshing or check your connection.
            </p>
          </Match>
          <Match when={!orgList.loading && !orgList.error}>
            <Show
              when={organizations().length > 0}
              fallback={<p class="text-sm text-[color:var(--color-text-muted)]">No organizations available yet.</p>}
            >
              <ul class="divide-y divide-[rgba(12,42,101,0.1)] overflow-hidden rounded-xl border border-[rgba(12,42,101,0.1)] bg-white">
                <For each={organizations()}>
                  {(organization) => {
                    const isActive = auth.activeOrganization()?.id === organization.id;
                    return (
                      <li class="flex flex-col gap-3 p-4 text-left text-sm text-[color:var(--color-text)]">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p class="font-semibold text-[color:var(--color-heading)]">{organization.name}</p>
                            <p class="text-xs text-[color:var(--color-text-muted)]">
                              Code: <span class="font-mono">{organization.slug}</span>
                            </p>
                          </div>
                          <div class="text-right text-xs text-[color:var(--color-text-muted)]">
                            <p>
                              Join code{' '}
                              <span class="font-mono text-sm text-[color:var(--color-heading)]">
                                {organization.joinCode ?? '—'}
                              </span>
                            </p>
                            <p>
                              Plan: {organization.planKey ?? 'family_monthly'} · {organization.billingCycle ?? 'monthly'}
                            </p>
                          </div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <Button
                            variant={isActive ? 'primary' : 'secondary'}
                            size="compact"
                            onClick={() => void handleSelectOrganization(organization.id)}
                          >
                            {isActive ? 'Active organization' : 'Make active'}
                          </Button>
                        </div>
                      </li>
                    );
                  }}
                </For>
              </ul>
            </Show>
          </Match>
        </Switch>
      </section>
    </Card>
  );
};

const AdminView = () => {
  const auth = useAuth();

  const activeOrg = auth.activeOrganization;
  const activeOrgId = createMemo<string | undefined>(() => activeOrg()?.id ?? undefined);

  type MembershipEntry = OrganizationOverviewResult['members'][number];
  type InviteEntry = OrganizationOverviewResult['invitations'][number];

  const [overview, { refetch }] = createResource<
    OrganizationOverviewResult | undefined,
    string | undefined
  >(() => activeOrgId(), async (orgId) => {
    if (!orgId) return undefined;
    return await getOrganizationOverview(orgId);
  });

  const [inviteEmail, setInviteEmail] = createSignal('');
  const [inviteRole, setInviteRole] = createSignal<'guide' | 'guardian' | 'student'>('student');
  const [actionPending, setActionPending] = createSignal(false);

  const handleStartImpersonation = async (targetUserId: string) => {
    setActionPending(true);
    try {
      await impersonateUser(targetUserId);
      await auth.reloadOrganizations();
      toast.success('Impersonation started');
    } catch (error) {
      console.error('Unable to start impersonation', error);
      toast.error('Failed to impersonate user');
    } finally {
      setActionPending(false);
    }
  };

  const handleStopImpersonationAsActor = async () => {
    setActionPending(true);
    try {
      await stopImpersonation();
      await auth.reloadOrganizations();
      toast.success('Impersonation ended');
    } catch (error) {
      console.error('Unable to stop impersonation', error);
      toast.error('Failed to stop impersonation');
    } finally {
      setActionPending(false);
    }
  };

  const handleRegenerateJoinCode = async () => {
    const orgId = activeOrgId();
    if (!orgId) return;
    setActionPending(true);
    try {
      const joinCode = await regenerateJoinCode(orgId);
      await Promise.all([refetch(), auth.reloadOrganizations()]);
      toast.success(`Join code updated: ${joinCode}`);
    } catch (error) {
      console.error('Unable to regenerate join code', error);
      toast.error('Failed to regenerate join code');
    } finally {
      setActionPending(false);
    }
  };

  const handleCreateInvite = async () => {
    const orgId = activeOrgId();
    if (!orgId) return;
    const email = inviteEmail().trim();
    if (!email) {
      toast.error('Enter an email address to invite.');
      return;
    }

    setActionPending(true);
    try {
      await inviteMember(orgId, email, inviteRole());
      setInviteEmail('');
      toast.success('Invite sent');
      await refetch();
    } catch (error) {
      console.error('Unable to create invite', error);
      toast.error('Failed to send invite');
    } finally {
      setActionPending(false);
    }
  };

  const handleUpdateRole = async (orgId: string, memberId: string, role: string) => {
    setActionPending(true);
    try {
      await updateMemberRole(orgId, memberId, role);
      toast.success('Role updated');
      await Promise.all([refetch(), auth.reloadOrganizations()]);
    } catch (error) {
      console.error('Unable to update membership role', error);
      toast.error('Failed to update role');
    } finally {
      setActionPending(false);
    }
  };

  const handleRemoveMember = async (orgId: string, memberId: string) => {
    setActionPending(true);
    try {
      await removeMember(orgId, memberId);
      toast.success('Member removed');
      await Promise.all([refetch(), auth.reloadOrganizations()]);
    } catch (error) {
      console.error('Unable to remove member', error);
      toast.error('Failed to remove member');
    } finally {
      setActionPending(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setActionPending(true);
    try {
      await revokeInvitation(inviteId);
      toast.success('Invite revoked');
      await refetch();
    } catch (error) {
      console.error('Unable to revoke invite', error);
      toast.error('Failed to revoke invite');
    } finally {
      setActionPending(false);
    }
  };

  return (
    <Card variant="soft" class="w-full max-w-3xl space-y-6 p-6 text-left">
      <header class="space-y-1">
        <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">Organization overview</h1>
        <p class="text-sm text-[color:var(--color-text-muted)]">
          Invite guides and students, share your join code, and manage billing.
        </p>
      </header>

      <Show
        when={activeOrg()}
        fallback={
          <p class="text-sm text-[color:var(--color-text-muted)]">
            We couldn’t find an active organization. Finish signup through the link we emailed or contact support.
          </p>
        }
      >
        {(org) => (
          <section class="space-y-4">
            <div>
              <h2 class="text-lg font-semibold text-[color:var(--color-heading)]">{org().name}</h2>
              <p class="text-sm text-[color:var(--color-text-muted)]">Organization code: <span class="font-mono text-base text-[color:var(--color-heading)]">{org().slug}</span></p>
              <div class="flex flex-wrap items-center gap-3 text-sm text-[color:var(--color-text-muted)]">
                <span>
                  Join code:{' '}
                  <span class="font-mono text-base text-[color:var(--color-heading)]">{org().joinCode}</span>
                </span>
                <Button
                  size="compact"
                  variant="secondary"
                  disabled={actionPending()}
                  onClick={() => void handleRegenerateJoinCode()}
                >
                  Regenerate
                </Button>
              </div>
            </div>

            <div class="rounded-xl border border-[rgba(12,42,101,0.1)] bg-white p-4 text-sm text-[color:var(--color-text-muted)]">
              <p class="font-medium text-[color:var(--color-heading)]">Pricing snapshot</p>
              <p>
                Plan: {org().planKey} · {org().billingCycle}. Active students: {org().seatsInUse ?? 0}
              </p>
              <p class="mt-2">
                Billing automation is coming soon. For now, we’ll coordinate payment directly once your org is
                ready.
              </p>
            </div>

            <Switch>
              <Match when={overview.loading}>
                <p class="text-sm text-[color:var(--color-text-muted)]">Loading organization details…</p>
              </Match>
              <Match when={overview.error}>
                <p class="text-sm text-[color:rgba(239,68,68,0.9)]">
                  Unable to load organization details right now. Try refreshing.
                </p>
              </Match>
              <Match when={overview()}>
                {(detailsAccessor) => {
                  const data = detailsAccessor();
                  if (!data) return null;
                  return (
                    <div class="space-y-5">
                    <section class="space-y-3">
                      <h3 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                        Invite members
                      </h3>
                      <div class="rounded-xl border border-[rgba(12,42,101,0.1)] bg-white p-4 text-sm">
                        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
                          <div class="flex-1">
                            <label class="block text-xs font-semibold uppercase text-[color:var(--color-text-muted)]">
                              Email
                            </label>
                            <input
                              class="mt-1 w-full rounded-lg border border-[rgba(12,42,101,0.15)] px-3 py-2 text-sm text-[color:var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[rgba(64,157,233,0.35)]"
                              type="email"
                              value={inviteEmail()}
                              onInput={(event) => setInviteEmail(event.currentTarget.value)}
                              placeholder="person@example.com"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-semibold uppercase text-[color:var(--color-text-muted)]">
                              Role
                            </label>
                            <select
                              class="mt-1 w-full rounded-lg border border-[rgba(12,42,101,0.15)] px-3 py-2 text-sm text-[color:var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[rgba(64,157,233,0.35)]"
                              value={inviteRole()}
                              onInput={(event) =>
                                setInviteRole(event.currentTarget.value as 'guide' | 'guardian' | 'student')
                              }
                            >
                              <option value="student">Student</option>
                              <option value="guide">Guide</option>
                              <option value="guardian">Guardian</option>
                            </select>
                          </div>
                          <Button disabled={actionPending()} onClick={() => void handleCreateInvite()}>
                            Send invite
                          </Button>
                        </div>
                      </div>
                    </section>

                    <section class="space-y-3">
                      <h3 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                        Pending invites
                      </h3>
                      <Show
                        when={data.invitations.length > 0}
                        fallback={<p class="text-sm text-[color:var(--color-text-muted)]">No pending invites.</p>}
                      >
                        <ul class="divide-y divide-[rgba(12,42,101,0.1)] overflow-hidden rounded-xl border border-[rgba(12,42,101,0.1)] bg-white">
                          <For each={data.invitations}>
                            {(invite: InviteEntry) => {
                              const inviteId = invite.id;
                              return (
                                <li class="flex flex-col gap-2 p-4 text-sm text-[color:var(--color-text)] sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p class="font-medium text-[color:var(--color-heading)]">{invite.email}</p>
                                    <p class="text-xs text-[color:var(--color-text-muted)]">
                                      Role: {invite.role} · Status: {invite.status} · Expires{' '}
                                      {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : '—'}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="compact"
                                  disabled={invite.status !== 'pending' || actionPending()}
                                  onClick={() => void handleRevokeInvite(inviteId)}
                                >
                                  Revoke
                                </Button>
                              </li>
                              );
                            }}
                          </For>
                        </ul>
                      </Show>
                    </section>

                    <section class="space-y-3">
                      <h3 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                        Members
                      </h3>
                      <Show
                        when={data.members.length > 0}
                        fallback={<p class="text-sm text-[color:var(--color-text-muted)]">No members found.</p>}
                      >
                        <ul class="divide-y divide-[rgba(12,42,101,0.1)] overflow-hidden rounded-xl border border-[rgba(12,42,101,0.1)] bg-white">
                          <For each={data.members}>
                            {(member: MembershipEntry) => {
                              const orgId = data.organization.id;
                              const memberId = member.id;
                              const roleValue = Array.isArray(member.role) ? member.role.join(',') : member.role;
                              const normalizedRole = roleValue.split(',')[0]?.trim() ?? 'member';
                              const isOwner = normalizedRole === 'owner';
                              const isCurrentUser = member.userId === auth.user()?.id;
                              const canChangeRole = !isOwner && !isCurrentUser;
                              const canRemove = !isOwner && !isCurrentUser;
                              const displayName = member.user?.name ?? member.userId;
                              const statusLabel = member.status ?? 'active';
                              const createdLabel = member.createdAt
                                ? new Date(member.createdAt).toLocaleDateString()
                                : '';
                              return (
                                <li class="flex flex-col gap-2 p-4 text-sm text-[color:var(--color-text)]">
                                  <div class="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p class="font-semibold text-[color:var(--color-heading)]">
                                        {displayName}
                                      </p>
                                      <p class="text-xs text-[color:var(--color-text-muted)]">
                                        User ID: <span class="font-mono">{member.userId}</span>
                                      </p>
                                    </div>
                                    <div class="flex flex-wrap items-center gap-2">
                                      <label class="text-xs uppercase text-[color:var(--color-text-muted)]">Role</label>
                                      <select
                                        class="rounded-lg border border-[rgba(12,42,101,0.15)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[rgba(64,157,233,0.35)]"
                                        value={normalizedRole}
                                        disabled={!canChangeRole || actionPending()}
                                        onInput={(event) => {
                                          const nextRole = event.currentTarget.value;
                                          void handleUpdateRole(orgId, memberId, nextRole);
                                        }}
                                      >
                                        <option value="owner">Owner</option>
                                        <option value="admin">Admin</option>
                                        <option value="guide">Guide</option>
                                        <option value="guardian">Guardian</option>
                                        <option value="student">Student</option>
                                        <option value="member">Member</option>
                                      </select>
                                      <Button
                                        variant="ghost"
                                        size="compact"
                                        disabled={!canRemove || actionPending()}
                                        onClick={() => void handleRemoveMember(orgId, memberId)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                  <p class="text-xs text-[color:var(--color-text-muted)]">
                                    Status: {statusLabel} · Added {createdLabel}
                                  </p>
                                </li>
                              );
                            }}
                          </For>
                        </ul>
                      </Show>
                    </section>

                    <Show when={auth.role() === 'internal'}>
                      <section class="space-y-3">
                        <h3 class="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                          Internal tools
                        </h3>
                        <div class="rounded-xl border border-[rgba(12,42,101,0.1)] bg-white p-4 text-sm text-[color:var(--color-text-muted)]">
                          <p class="mb-2 font-medium text-[color:var(--color-heading)]">Impersonation</p>
                          <p class="mb-4 text-xs">
                            Select a member above to impersonate them. You’ll see what they see until you stop.
                          </p>
                          <div class="flex flex-wrap gap-2">
                            <For each={data.members}>
                              {(member: MembershipEntry) => (
                                <Button
                                  variant="secondary"
                                  size="compact"
                                  disabled={actionPending() || member.userId === auth.user()?.id}
                                  onClick={() => void handleStartImpersonation(member.userId)}
                                >
                                  Impersonate {member.user?.name ?? member.userId}
                                </Button>
                              )}
                            </For>
                            <Button
                              variant="ghost"
                              size="compact"
                              disabled={actionPending()}
                              onClick={() => void stopImpersonation()}
                            >
                              Stop all impersonations
                            </Button>
                          </div>
                        </div>
                      </section>
                    </Show>
                  </div>
                );
              }}
              </Match>
            </Switch>
          </section>
        )}
      </Show>
    </Card>
  );
};

const MemberView = (props: { role: 'guide' | 'guardian' | 'student' }) => {
  const auth = useAuth();
  const activeOrg = createMemo(() => auth.activeOrganization());

  const heading = createMemo(() => {
    switch (props.role) {
      case 'guide':
        return 'Guide workspace';
      case 'guardian':
        return 'Guardian dashboard';
      case 'student':
        return 'Student practice area';
      default:
        return 'Workspace';
    }
  });

  const bodyCopy = createMemo(() => {
    switch (props.role) {
      case 'guide':
        return 'Your admin will add lessons and assignments soon. You’ll see students appear here as they join.';
      case 'guardian':
        return 'Track progress for each learner once they receive activities from their guide.';
      case 'student':
        return 'When your guide assigns lessons, they will show up here. For now, explore the activities shared with you.';
      default:
        return '';
    }
  });

  return (
    <Card variant="soft" class="w-full max-w-2xl space-y-4 p-6 text-left">
      <header class="space-y-1">
        <h1 class="text-2xl font-semibold text-[color:var(--color-heading)]">{heading()}</h1>
        <p class="text-sm text-[color:var(--color-text-muted)]">{bodyCopy()}</p>
      </header>

      <Show when={activeOrg()}>
        {(org) => (
          <div class="rounded-xl border border-[rgba(12,42,101,0.1)] bg-white p-4 text-sm text-[color:var(--color-text-muted)]">
            <p class="font-medium text-[color:var(--color-heading)]">Organization</p>
            <p>{org().name}</p>
            <p class="text-xs">Code: <span class="font-mono">{org().slug}</span></p>
          </div>
        )}
      </Show>

      <p class="text-xs text-[color:var(--color-text-muted)]">
        Need help? Ask your admin for an invite link or updated access code.
      </p>
    </Card>
  );
};

const AppPortalPage = () => {
  const auth = useAuth();

  const impersonatedBy = createMemo(() => auth.impersonatedBy());

  if (!auth.isAuthenticated()) {
    return (
      <div class="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] p-6">
        <EmptyState />
      </div>
    );
  }

  if (auth.loading()) {
    return (
      <div class="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] p-6 text-sm text-[color:var(--color-text-muted)]">
        Loading your workspace…
      </div>
    );
  }

  return (
    <div class="flex min-h-screen items-start justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] p-6">
      <Show when={impersonatedBy()}>
        <div class="fixed left-1/2 top-4 z-50 w-[min(90vw,420px)] -translate-x-1/2 rounded-xl border border-[rgba(12,42,101,0.15)] bg-white p-4 shadow-[0_18px_36px_rgba(12,42,101,0.14)]">
          <p class="text-sm font-semibold text-[color:var(--color-heading)]">You are currently being impersonated.</p>
          <p class="mt-1 text-xs text-[color:var(--color-text-muted)]">
            Someone from the Monte team is viewing the app as you. If something looks off, click below to end the
            session.
          </p>
          <Button
            variant="secondary"
            size="compact"
            class="mt-3"
            onClick={() => {
              void (async () => {
                try {
                  await stopImpersonation();
                  await auth.refresh();
                  await auth.reloadOrganizations();
                  toast.success('Impersonation ended');
                } catch (error) {
                  console.error('Unable to stop impersonation', error);
                  toast.error('Failed to end impersonation');
                }
              })();
            }}
          >
            End impersonation
          </Button>
        </div>
      </Show>

      <Switch>
        <Match when={auth.role() === 'internal'}>
          <InternalView />
        </Match>
        <Match when={auth.role() === 'admin'}>
          <AdminView />
        </Match>
        <Match when={auth.role() === 'guide'}>
          <MemberView role="guide" />
        </Match>
        <Match when={auth.role() === 'guardian'}>
          <MemberView role="guardian" />
        </Match>
        <Match when={auth.role() === 'student'}>
          <MemberView role="student" />
        </Match>
        <Match when>
          <Card variant="soft" class="w-full max-w-md space-y-4 p-6 text-center text-sm text-[color:var(--color-text-muted)]">
            Something went wrong loading your account. Try signing out and back in.
          </Card>
        </Match>
      </Switch>
    </div>
  );
};

export default AppPortalPage;
