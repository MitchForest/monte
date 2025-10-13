import type { MutationCtx, QueryCtx } from '@monte/api/convex/_generated/server.js';

import { authComponent, createAuth } from '../auth.js';

type OrganizationRole = 'owner' | 'admin' | 'member';

const isOrganizationRole = (value: unknown): value is OrganizationRole =>
  value === 'owner' || value === 'admin' || value === 'member';

export const requireMembershipRole = async <Ctx extends QueryCtx | MutationCtx>(
  ctx: Ctx,
  allowedRoles: OrganizationRole[],
) => {
  const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
  const response = await auth.api.getActiveMember({ headers });
  const membershipCandidate =
    response && typeof response === 'object' && 'role' in (response as Record<string, unknown>)
      ? (response as Record<string, unknown>)
      : (response as { data?: unknown })?.data ?? null;
  const membership = (membershipCandidate ?? null) as
    | (Record<string, unknown> & { role?: unknown })
    | null;
  const normalizedRole = isOrganizationRole(membership?.role) ? (membership.role as OrganizationRole) : null;
  const normalizedMembership =
    membership && typeof membership === 'object' ? (membership as Record<string, unknown>) : null;

  if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
    throw new Error('Insufficient organization permissions');
  }

  return {
    membership: normalizedMembership,
    role: normalizedRole,
  } as const;
};
