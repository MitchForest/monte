import { z } from 'zod';

import {
  AuthInvitation,
  AuthInvitationSchema,
  AuthMember,
  AuthMemberSchema,
  AuthOrganization,
  AuthOrganizationSchema,
  OrganizationOverview,
  OrganizationOverviewSchema,
} from '@monte/types';

const AuthOrganizationListSchema = z.array(AuthOrganizationSchema);
const AuthMemberNullableSchema = z.union([AuthMemberSchema, z.null()]);
const AuthInvitationListSchema = z.array(AuthInvitationSchema);

export const parseAuthOrganization = (input: unknown): AuthOrganization =>
  AuthOrganizationSchema.parse(input);

export const parseAuthOrganizationList = (input: unknown): AuthOrganization[] =>
  AuthOrganizationListSchema.parse(input);

export const parseAuthMember = (input: unknown): AuthMember =>
  AuthMemberSchema.parse(input);

export const parseAuthMemberOrNull = (input: unknown): AuthMember | null =>
  AuthMemberNullableSchema.parse(input);

export const parseAuthInvitationList = (input: unknown): AuthInvitation[] =>
  AuthInvitationListSchema.parse(input);

export const parseOrganizationOverview = (input: unknown): OrganizationOverview =>
  OrganizationOverviewSchema.parse(input);
