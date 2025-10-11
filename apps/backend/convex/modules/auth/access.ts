import { createAccessControl } from 'better-auth/plugins/access';
import { AuthAccess } from '@monte/types';

export const adminAccessControl = createAccessControl(AuthAccess.ADMIN_STATEMENTS);
export const organizationAccessControl = createAccessControl(AuthAccess.ORGANIZATION_STATEMENTS);

export const adminRoles = {
  internal: adminAccessControl.newRole({
    user: Array.from(AuthAccess.ADMIN_ROLE_PERMISSIONS.internal.user),
    session: Array.from(AuthAccess.ADMIN_ROLE_PERMISSIONS.internal.session),
  }),
  admin: adminAccessControl.newRole({
    user: Array.from(AuthAccess.ADMIN_ROLE_PERMISSIONS.admin.user),
    session: Array.from(AuthAccess.ADMIN_ROLE_PERMISSIONS.admin.session),
  }),
  guide: adminAccessControl.newRole({
    user: [],
    session: [],
  }),
  guardian: adminAccessControl.newRole({
    user: [],
    session: [],
  }),
  student: adminAccessControl.newRole({
    user: [],
    session: [],
  }),
};

export const organizationRoles = {
  owner: organizationAccessControl.newRole({
    organization: Array.from(AuthAccess.ORGANIZATION_ROLE_PERMISSIONS.owner.organization),
    member: Array.from(AuthAccess.ORGANIZATION_ROLE_PERMISSIONS.owner.member),
    invitation: Array.from(AuthAccess.ORGANIZATION_ROLE_PERMISSIONS.owner.invitation),
  }),
  admin: organizationAccessControl.newRole({
    organization: Array.from(AuthAccess.ORGANIZATION_ROLE_PERMISSIONS.admin.organization),
    member: Array.from(AuthAccess.ORGANIZATION_ROLE_PERMISSIONS.admin.member),
    invitation: Array.from(AuthAccess.ORGANIZATION_ROLE_PERMISSIONS.admin.invitation),
  }),
  member: organizationAccessControl.newRole({
    organization: [],
    member: [],
    invitation: [],
  }),
  guide: organizationAccessControl.newRole({
    organization: [],
    member: [],
    invitation: [],
  }),
  guardian: organizationAccessControl.newRole({
    organization: [],
    member: [],
    invitation: [],
  }),
  student: organizationAccessControl.newRole({
    organization: [],
    member: [],
    invitation: [],
  }),
};
