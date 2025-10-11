import { authClient } from '../../lib/auth-client';

type BetterFetchResult<T> = {
  data?: T;
  error?: {
    message?: string | null;
    status?: number;
    statusText?: string;
  } | null;
};

const request = async <T>(
  path: string,
  {
    method,
    body,
    query,
  }: {
    method: 'GET' | 'POST';
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  },
  errorMessage: string,
): Promise<T> => {
  const result = (await authClient.$fetch(path, {
    method,
    body,
    query,
    throw: false,
  })) as BetterFetchResult<T>;

  if (result?.error) {
    throw new Error(result.error.message ?? errorMessage);
  }

  return result?.data as T;
};

const optionalDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(value as string);
  return Number.isNaN(date.valueOf()) ? undefined : date;
};

const requiredDate = (value: unknown): Date => optionalDate(value) ?? new Date(0);

const normalizeRole = (role: unknown): string => {
  if (Array.isArray(role)) {
    return role.map(normalizeRole).join(',');
  }
  if (typeof role === 'string') {
    return role;
  }
  return '';
};

const randomFromAlphabet = (alphabet: string, length: number) => {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * alphabet.length);
    result += alphabet[index] ?? '';
  }
  return result;
};

export type AuthOrganization = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  joinCode?: string;
  planKey?: string;
  billingCycle?: string;
  seatLimit?: number | null;
  seatsInUse?: number;
  pricingTier?: string;
  metadata?: Record<string, unknown> | null;
};

export type AuthMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  status?: string;
  createdAt: Date;
  user: {
    email?: string;
    name?: string;
    image?: string;
  };
  relationships?: Record<string, unknown> | null;
};

export type AuthInvitation = {
  id: string;
  organizationId: string;
  email: string;
  role: string | string[];
  status: string;
  createdAt: Date;
  expiresAt?: Date;
  inviter?: {
    userId: string;
    name?: string;
    email?: string;
  };
};

export type OrganizationOverviewResult = {
  organization: AuthOrganization;
  members: AuthMember[];
  invitations: AuthInvitation[];
};

const mapOrganization = (input: any): AuthOrganization => ({
  id: input?.id,
  name: input?.name,
  slug: input?.slug,
  createdAt: requiredDate(input?.createdAt),
  joinCode: input?.joinCode ?? input?.data?.joinCode ?? undefined,
  planKey: input?.planKey ?? input?.data?.planKey ?? undefined,
  billingCycle: input?.billingCycle ?? input?.data?.billingCycle ?? undefined,
  seatLimit:
    typeof input?.seatLimit === 'number'
      ? input.seatLimit
      : typeof input?.data?.seatLimit === 'number'
        ? (input.data.seatLimit as number)
        : null,
  seatsInUse:
    typeof input?.seatsInUse === 'number'
      ? input.seatsInUse
      : typeof input?.data?.seatsInUse === 'number'
        ? (input.data.seatsInUse as number)
        : 0,
  pricingTier: input?.pricingTier ?? input?.data?.pricingTier ?? undefined,
  metadata: (input?.metadata as Record<string, unknown> | null | undefined) ?? null,
});

const mapMember = (input: any): AuthMember => ({
  id: input?.id,
  organizationId: input?.organizationId,
  userId: input?.userId,
  role: normalizeRole(input?.role),
  status: input?.status ?? 'active',
  createdAt: requiredDate(input?.createdAt),
  user: {
    email: input?.user?.email ?? undefined,
    name: input?.user?.name ?? undefined,
    image: input?.user?.image ?? undefined,
  },
  relationships: (input?.relationships as Record<string, unknown> | null | undefined) ?? null,
});

const mapInvitation = (input: any): AuthInvitation => ({
  id: input?.id,
  organizationId: input?.organizationId,
  email: input?.email,
  role: input?.role,
  status: input?.status,
  createdAt: requiredDate(input?.createdAt),
  expiresAt: optionalDate(input?.expiresAt),
  inviter: input?.inviter
    ? {
        userId: input.inviter.userId ?? input.inviter.id,
        name: input.inviter.user?.name ?? undefined,
        email: input.inviter.user?.email ?? undefined,
      }
    : undefined,
});

export const listOrganizations = async (): Promise<AuthOrganization[]> => {
  const data = await request<any[]>('/organization/list', { method: 'GET' }, 'Unable to list organizations');
  return Array.isArray(data) ? data.map(mapOrganization) : [];
};

export const setActiveOrganization = async (organizationId?: string | null) => {
  await request<unknown>(
    '/organization/set-active',
    {
      method: 'POST',
      body: {
        organizationId: organizationId ?? null,
      },
    },
    'Unable to set active organization',
  );
};

export const getActiveMember = async (): Promise<AuthMember | null> => {
  const data = await request<any | null>(
    '/organization/get-active-member',
    { method: 'GET' },
    'Unable to load active membership',
  );
  return data ? mapMember(data) : null;
};

export const getOrganizationOverview = async (organizationId: string): Promise<OrganizationOverviewResult> => {
  const data = await request<any>(
    '/organization/get-full-organization',
    {
      method: 'GET',
      query: {
        organizationId,
        membersLimit: 500,
      },
    },
    'Unable to load organization overview',
  );

  return {
    organization: mapOrganization(data),
    members: Array.isArray(data?.members) ? data.members.map(mapMember) : [],
    invitations: Array.isArray(data?.invitations) ? data.invitations.map(mapInvitation) : [],
  };
};

export const inviteMember = async (organizationId: string, email: string, role: string) => {
  await request<unknown>(
    '/organization/invite-member',
    {
      method: 'POST',
      body: {
        organizationId,
        email,
        role,
      },
    },
    'Unable to create invitation',
  );
};

export const revokeInvitation = async (invitationId: string) => {
  await request<unknown>(
    '/organization/cancel-invitation',
    {
      method: 'POST',
      body: {
        invitationId,
      },
    },
    'Unable to revoke invitation',
  );
};

export const updateMemberRole = async (organizationId: string, memberId: string, role: string | string[]) => {
  await request<unknown>(
    '/organization/update-member-role',
    {
      method: 'POST',
      body: {
        organizationId,
        memberId,
        role,
      },
    },
    'Unable to update member role',
  );
};

export const removeMember = async (organizationId: string, memberId: string) => {
  await request<unknown>(
    '/organization/remove-member',
    {
      method: 'POST',
      body: {
        organizationId,
        memberIdOrEmail: memberId,
      },
    },
    'Unable to remove member',
  );
};

export const createOrganization = async (input: {
  name: string;
  slug?: string;
  planKey?: string;
  billingCycle?: string;
}) => {
  const data = await request<any>(
    '/organization/create',
    {
      method: 'POST',
      body: {
        name: input.name,
        slug: input.slug,
        metadata: {},
        keepCurrentActiveOrganization: false,
        data: {
          planKey: input.planKey,
          billingCycle: input.billingCycle,
        },
      },
    },
    'Unable to create organization',
  );
  return mapOrganization(data);
};

export const acceptInvitation = async (invitationId: string): Promise<AuthMember | null> => {
  const data = await request<any>(
    '/organization/accept-invitation',
    {
      method: 'POST',
      body: {
        invitationId,
      },
    },
    'Unable to accept invitation',
  );
  return data ? mapMember(data) : null;
};

export const regenerateJoinCode = async (organizationId: string) => {
  const joinCode = randomFromAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);
  await request<unknown>(
    '/organization/update',
    {
      method: 'POST',
      body: {
        organizationId,
        data: {
          joinCode,
        },
      },
    },
    'Unable to regenerate join code',
  );
  return joinCode;
};

export const impersonateUser = async (userId: string) => {
  await request<unknown>(
    '/admin/impersonate-user',
    {
      method: 'POST',
      body: {
        userId,
      },
    },
    'Unable to start impersonation',
  );
};

export const stopImpersonation = async () => {
  await request<unknown>(
    '/admin/stop-impersonating',
    {
      method: 'POST',
      body: {},
    },
    'Unable to stop impersonation',
  );
};
