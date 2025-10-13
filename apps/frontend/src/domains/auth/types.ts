/**
 * User-facing role returned by the Better Auth admin plugin.
 * Defaults align with {@link https://better-auth.com/docs/plugins/admin}.
 */
export type UserRole = 'admin' | 'user';

/**
 * Organization membership role from the Better Auth organization plugin.
 */
export type OrganizationRole = 'owner' | 'admin' | 'member';

export const isUserRole = (value: unknown): value is UserRole =>
  value === 'admin' || value === 'user';

export const isOrganizationRole = (value: unknown): value is OrganizationRole =>
  value === 'owner' || value === 'admin' || value === 'member';
