import { authClient } from '../../lib/auth-client';

export type AuthOrganization = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  logo?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AuthMemberUser = {
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export type AuthMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
  user?: AuthMemberUser;
};

export type AuthInvitation = {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  inviterId: string;
  expiresAt: Date;
  teamId?: string | null;
};

export type OrganizationOverview = {
  organization: AuthOrganization;
  members: AuthMember[];
  invitations: AuthInvitation[];
};

export type OrganizationOverviewResult = OrganizationOverview;

type CreateOrganizationInput = {
  name: string;
  slug: string;
  metadata?: Record<string, unknown>;
  keepCurrentActiveOrganization?: boolean;
};

type BetterFetchResult<Payload> = {
  data?: Payload | null;
  error?: {
    message?: string | null;
  } | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const expectString = (value: unknown, field: string): string => {
  if (typeof value !== 'string') {
    throw new Error(`Expected ${field} to be a string`);
  }
  return value;
};

const expectOptionalString = (value: unknown, field: string): string | null | undefined => {
  if (value === null || typeof value === 'undefined') return value ?? null;
  if (typeof value !== 'string') {
    throw new Error(`Expected ${field} to be a string when provided`);
  }
  return value;
};

const parseDate = (value: unknown, field: string): Date => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      throw new Error(`Invalid date for ${field}`);
    }
    return date;
  }
  throw new Error(`Expected ${field} to be a date-like value`);
};

const parseOrganization = (input: unknown): AuthOrganization => {
  if (!isRecord(input)) {
    throw new Error('Invalid organization payload');
  }
  let metadata: Record<string, unknown> | null | undefined = undefined;
  if (input.metadata === null || typeof input.metadata === 'undefined') {
    metadata = input.metadata ?? null;
  } else if (isRecord(input.metadata)) {
    metadata = input.metadata;
  } else {
    throw new Error('Invalid organization metadata payload');
  }
  return {
    id: expectString(input.id, 'organization.id'),
    name: expectString(input.name, 'organization.name'),
    slug: expectString(input.slug, 'organization.slug'),
    createdAt: parseDate(input.createdAt, 'organization.createdAt'),
    logo: expectOptionalString(input.logo, 'organization.logo'),
    metadata,
  };
};

const parseMemberUser = (input: unknown): AuthMemberUser | undefined => {
  if (!isRecord(input)) return undefined;
  return {
    email: expectOptionalString(input.email, 'member.user.email'),
    name: expectOptionalString(input.name, 'member.user.name'),
    image: expectOptionalString(input.image, 'member.user.image'),
  };
};

const parseMember = (input: unknown): AuthMember => {
  if (!isRecord(input)) {
    throw new Error('Invalid member payload');
  }
  return {
    id: expectString(input.id, 'member.id'),
    organizationId: expectString(input.organizationId, 'member.organizationId'),
    userId: expectString(input.userId, 'member.userId'),
    role: expectString(input.role, 'member.role'),
    createdAt: parseDate(input.createdAt, 'member.createdAt'),
    user: parseMemberUser(input.user),
  };
};

const parseInvitation = (input: unknown): AuthInvitation => {
  if (!isRecord(input)) {
    throw new Error('Invalid invitation payload');
  }
  return {
    id: expectString(input.id, 'invitation.id'),
    organizationId: expectString(input.organizationId, 'invitation.organizationId'),
    email: expectString(input.email, 'invitation.email'),
    role: expectString(input.role, 'invitation.role'),
    status: expectString(input.status, 'invitation.status'),
    inviterId: expectString(input.inviterId, 'invitation.inviterId'),
    expiresAt: parseDate(input.expiresAt, 'invitation.expiresAt'),
    teamId: expectOptionalString(input.teamId, 'invitation.teamId'),
  };
};

const parseOrganizationOverview = (input: unknown): OrganizationOverview => {
  if (!isRecord(input)) {
    throw new Error('Invalid organization overview payload');
  }
  const organization = parseOrganization(input.organization);
  const membersSource = Array.isArray(input.members) ? input.members : [];
  const invitationsSource = Array.isArray(input.invitations) ? input.invitations : [];
  return {
    organization,
    members: membersSource.map(parseMember),
    invitations: invitationsSource.map(parseInvitation),
  };
};

const request = async <Payload, Result>(
  path: string,
  options: {
    method: 'GET' | 'POST';
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  },
  errorMessage: string,
  transform: (payload: Payload | null | undefined) => Result,
): Promise<Result> => {
  const rawResult = await authClient.$fetch<Payload>(path, {
    ...options,
    throw: false,
  });

  const result = rawResult as BetterFetchResult<Payload>;
  if (result.error) {
    throw new Error(result.error.message ?? errorMessage);
  }

  try {
    return transform(result.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${errorMessage}: ${message}`);
  }
};

export const listOrganizations = async (): Promise<AuthOrganization[]> =>
  request<unknown[], AuthOrganization[]>(
    '/organization/list',
    { method: 'GET' },
    'Unable to list organizations',
    (payload) => {
      const list = Array.isArray(payload) ? payload : [];
      return list.map(parseOrganization);
    },
  );

export const setActiveOrganization = async (
  {
    organizationId,
    organizationSlug,
  }: {
    organizationId?: string | null;
    organizationSlug?: string | null;
  } = {},
): Promise<void> => {
  const body: Record<string, unknown> = {};
  if (typeof organizationId !== 'undefined') {
    body.organizationId = organizationId ?? null;
  }
  if (typeof organizationSlug !== 'undefined') {
    body.organizationSlug = organizationSlug ?? null;
  }

  await request(
    '/organization/set-active',
    {
      method: 'POST',
      body,
    },
    'Unable to set active organization',
    () => undefined,
  );
};

export const getActiveMember = async (): Promise<AuthMember | null> =>
  request(
    '/organization/get-active-member',
    { method: 'GET' },
    'Unable to load active membership',
    (payload) => (payload ? parseMember(payload) : null),
  );

export const getOrganizationOverview = async (organizationId: string): Promise<OrganizationOverview> =>
  request(
    '/organization/get-full-organization',
    {
      method: 'GET',
      query: {
        organizationId,
        membersLimit: 200,
      },
    },
    'Unable to load organization overview',
    (payload) => parseOrganizationOverview(payload),
  );

export const createOrganization = async (input: CreateOrganizationInput): Promise<AuthOrganization> =>
  request(
    '/organization/create',
    {
      method: 'POST',
      body: {
        name: input.name,
        slug: input.slug,
        metadata: input.metadata ?? {},
        keepCurrentActiveOrganization: input.keepCurrentActiveOrganization ?? false,
      },
    },
    'Unable to create organization',
    (payload) => parseOrganization(payload),
  );
