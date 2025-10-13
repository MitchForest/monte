export type UserRole = 'owner' | 'admin' | 'member';
export type OrganizationRole = UserRole;

export const isUserRole = (value: unknown): value is UserRole =>
  value === 'owner' || value === 'admin' || value === 'member';

export const isOrganizationRole = (value: unknown): value is OrganizationRole =>
  isUserRole(value);

export const formatUserRole = (role: UserRole | null | undefined): string | null => {
  if (!role) return null;
  if (role === 'owner') return 'Owner';
  if (role === 'admin') return 'Admin';
  return 'Member';
};
