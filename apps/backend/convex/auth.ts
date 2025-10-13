import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { admin, jwt, magicLink, oneTimeToken, organization } from 'better-auth/plugins';
import Stripe from 'stripe';
import { stripe as stripePlugin } from '@better-auth/stripe';

import { components } from '@monte/api/convex/_generated/api.js';
import type { DataModel } from './_generated/dataModel.js';
import authSchema from './betterAuth/schema.js';
import {
  sendMagicLinkEmail,
  sendOrganizationInvitationEmail,
} from './magicLinkEmail.js';

const convexSiteUrl =
  process.env.CONVEX_SITE_URL ?? process.env.SITE_URL ?? 'http://localhost:3000';

const getStripeSecrets = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder_for_schema';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_placeholder_for_schema';
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('[better-auth][stripe] Using placeholder Stripe secrets; update before enabling billing.');
  }
  return { secretKey, webhookSecret };
};

const createStripeClient = (secretKey: string) =>
  new Stripe(secretKey);

const sendMagicLink = async ({
  email,
  url,
  token,
}: {
  email: string;
  url: string;
  token: string;
}) => {
  await sendMagicLinkEmail({ email, url, token });
};

const sendInvitationEmail = async ({
  email,
  id,
  role,
  organization: org,
  inviter,
}: {
  email: string;
  id: string;
  role: string;
  organization: { name: string };
  invitation: unknown;
  inviter: {
    user?: {
      name?: string | null;
      email?: string | null;
    };
  };
}) => {
  const baseUrl = process.env.SITE_URL ?? convexSiteUrl;
  const invitationUrl = new URL('/auth/invitations/accept', baseUrl);
  invitationUrl.searchParams.set('invitationId', id);

  await sendOrganizationInvitationEmail({
    email,
    invitationUrl: invitationUrl.toString(),
    organizationName: org.name,
    role,
    inviterName: inviter.user?.name ?? null,
    inviterEmail: inviter.user?.email ?? null,
  });
};

export const authComponent = createClient<DataModel, typeof authSchema>(components.betterAuth, {
  local: {
    schema: authSchema,
  },
});

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly = false }: { optionsOnly?: boolean } = {},
) => {
  const { secretKey, webhookSecret } = getStripeSecrets();
  const stripeClient = createStripeClient(secretKey);

  return betterAuth({
    baseURL: convexSiteUrl,
    logger: {
      disabled: optionsOnly,
    },
    database: authComponent.adapter(ctx),
    hooks: {
      before: createAuthMiddleware(async (hookCtx) => {
        if (hookCtx.path === '/organization/create' && hookCtx.body) {
          const metadataInput = hookCtx.body.metadata;
          const metadata =
            metadataInput && typeof metadataInput === 'object'
              ? { ...(metadataInput as Record<string, unknown>) }
              : {};
          const rawCategory =
            typeof metadata.category === 'string'
              ? metadata.category
              : typeof hookCtx.body.category === 'string'
                ? hookCtx.body.category
                : undefined;
          const normalizedCategory =
            rawCategory === 'school' || rawCategory === 'household' ? rawCategory : 'household';
          metadata.category = normalizedCategory;
          hookCtx.body = {
            ...hookCtx.body,
            metadata,
          };
        }

        if (hookCtx.path === '/organization/invite-member' && hookCtx.body) {
          const rawRole = typeof hookCtx.body.role === 'string' ? hookCtx.body.role.toLowerCase() : '';
          const normalizedRole =
            rawRole === 'owner' || rawRole === 'admin' ? rawRole : 'member';
          hookCtx.body = {
            ...hookCtx.body,
            role: normalizedRole,
          };
        }
      }),
    },
    plugins: [
      magicLink({
        sendMagicLink,
      }),
      admin(),
      jwt(),
      oneTimeToken(),
      organization({
        sendInvitationEmail,
      }),
      stripePlugin({
        stripeClient,
        stripeWebhookSecret: webhookSecret,
      }) as unknown as BetterAuthPlugin,
      convex(),
    ],
  });
};

export const auth = createAuth({} as GenericCtx<DataModel>, { optionsOnly: true });

export default auth;
