import { z } from 'zod';

const coerceDate = z.preprocess((value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? undefined : date;
  }
  return undefined;
}, z.date());

export const UserRoleSchema = z.enum(['user', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const AuthOrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: coerceDate,
  logo: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});
export type AuthOrganization = z.infer<typeof AuthOrganizationSchema>;

export const AuthMemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: coerceDate,
  user: z
    .object({
      email: z.string().optional(),
      name: z.string().optional(),
      image: z.string().optional().nullable(),
    })
    .partial()
    .optional(),
});
export type AuthMember = z.infer<typeof AuthMemberSchema>;

export const AuthInvitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string().email(),
  role: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected', 'canceled']),
  inviterId: z.string(),
  expiresAt: coerceDate,
  teamId: z.string().optional().nullable(),
});
export type AuthInvitation = z.infer<typeof AuthInvitationSchema>;

export const OrganizationOverviewSchema = z.object({
  organization: AuthOrganizationSchema,
  members: z.array(AuthMemberSchema),
  invitations: z.array(AuthInvitationSchema),
});
export type OrganizationOverview = z.infer<typeof OrganizationOverviewSchema>;
