export const ADMIN_STATEMENTS = {
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password'] as const,
  session: ['list', 'revoke', 'delete'] as const,
};

export const ADMIN_ROLE_PERMISSIONS = {
  internal: {
    user: [...ADMIN_STATEMENTS.user],
    session: [...ADMIN_STATEMENTS.session],
  },
  admin: {
    user: ['list', 'set-role', 'impersonate'] as const,
    session: ['list', 'revoke'] as const,
  },
  guide: {
    user: [] as const,
    session: [] as const,
  },
  guardian: {
    user: [] as const,
    session: [] as const,
  },
  student: {
    user: [] as const,
    session: [] as const,
  },
} as const;

export const ORGANIZATION_STATEMENTS = {
  organization: ['update', 'billing', 'set-plan', 'set-join-code', 'delete'] as const,
  member: ['create', 'update', 'delete'] as const,
  invitation: ['create', 'cancel'] as const,
};

export const ORGANIZATION_ROLE_PERMISSIONS = {
  owner: {
    organization: [...ORGANIZATION_STATEMENTS.organization],
    member: [...ORGANIZATION_STATEMENTS.member],
    invitation: [...ORGANIZATION_STATEMENTS.invitation],
  },
  admin: {
    organization: ['update', 'set-plan', 'set-join-code'] as const,
    member: [...ORGANIZATION_STATEMENTS.member],
    invitation: [...ORGANIZATION_STATEMENTS.invitation],
  },
  member: {
    organization: [] as const,
    member: [] as const,
    invitation: [] as const,
  },
  guide: {
    organization: [] as const,
    member: [] as const,
    invitation: [] as const,
  },
  guardian: {
    organization: [] as const,
    member: [] as const,
    invitation: [] as const,
  },
  student: {
    organization: [] as const,
    member: [] as const,
    invitation: [] as const,
  },
} as const;
