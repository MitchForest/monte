import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { admin, magicLink, organization } from 'better-auth/plugins';
import Stripe from 'stripe';
import { stripe as stripePlugin } from '@better-auth/stripe';

import { components } from '@monte/api/convex/_generated/api.js';
import type { DataModel } from './_generated/dataModel.js';
import authSchema from './betterAuth/schema.js';

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
}: {
  email: string;
  url: string;
}) => {
  console.info('[better-auth] magic link ready', { email, url });
};

const sendInvitationEmail = async ({
  email,
  id,
}: {
  email: string;
  id: string;
}) => {
  console.info('[better-auth] organization invitation ready', { email, invitationId: id });
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
    plugins: [
      magicLink({
        sendMagicLink,
      }),
      admin(),
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
