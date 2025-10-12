import { parseAuthMemberOrNull, parseAuthOrganizationList, parseOrganizationOverview } from '@monte/api';
import type { AuthMember, AuthOrganization, OrganizationOverview } from '@monte/types';

export type { AuthMember, AuthOrganization, OrganizationOverview as OrganizationOverviewResult } from '@monte/types';

import { authClient } from '../../lib/auth-client';

type BetterFetchResult<Payload> = {
  data?: Payload;
  error?: {
    message?: string | null;
    status?: number;
    statusText?: string;
  } | null;
};

const isBetterFetchResult = <Payload>(value: unknown): value is BetterFetchResult<Payload> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as { data?: unknown; error?: unknown };
  return 'data' in candidate || 'error' in candidate;
};

const request = async <Result>(
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
  parse: (payload: unknown) => Result,
): Promise<Result> => {
  const rawResult = await authClient.$fetch(path, {
    method,
    body,
    query,
    throw: false,
  });

  if (!isBetterFetchResult<Result>(rawResult)) {
    throw new Error(`${errorMessage}: unexpected response shape`);
  }

  const result = rawResult;

  if (result?.error) {
    throw new Error(result.error.message ?? errorMessage);
  }

  try {
    return parse(result?.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${errorMessage}: ${message}`);
  }
};

const requestVoid = async (
  path: string,
  options: {
    method: 'GET' | 'POST';
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  },
  errorMessage: string,
) => {
  await request(
    path,
    options,
    errorMessage,
    () => undefined,
  );
};

export const listOrganizations = async (): Promise<AuthOrganization[]> =>
  request('/organization/list', { method: 'GET' }, 'Unable to list organizations', parseAuthOrganizationList);

export const setActiveOrganization = async (organizationId?: string | null) => {
  await requestVoid(
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

export const getActiveMember = async (): Promise<AuthMember | null> =>
  request(
    '/organization/get-active-member',
    { method: 'GET' },
    'Unable to load active membership',
    parseAuthMemberOrNull,
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
    parseOrganizationOverview,
  );
