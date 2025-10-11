import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex, crossDomain } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import { v } from 'convex/values';

import type { DataModel } from '@monte/api/convex/_generated/dataModel.d.ts';
import { components } from '@monte/api/convex/_generated/api.js';
import { mutation, query } from '@monte/api/convex/_generated/server.js';
import type { MutationCtx, QueryCtx } from '@monte/api/convex/_generated/server.js';
import type { UserRole } from '@monte/types';

const convexSiteUrl = process.env.CONVEX_SITE_URL!;
const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';
const DEFAULT_USER_ROLE: UserRole = 'teacher';

export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: true,
});

type AuthUserDoc = Awaited<ReturnType<typeof authComponent.getAuthUser>>;
type AuthInstance = ReturnType<typeof betterAuth>;

const asGenericCtx = (ctx: QueryCtx | MutationCtx): GenericCtx<DataModel> =>
  ctx as GenericCtx<DataModel>;

const getDb = (ctx: GenericCtx<DataModel>): QueryCtx['db'] =>
  (ctx as unknown as { db: QueryCtx['db'] }).db;

const resolveResendApiKey = () =>
  process.env.MAGIC_LINK_RESEND_API_KEY ??
  process.env.RESEND_API_KEY ??
  process.env.RESEND_KEY ??
  null;

const defaultFromAddress = 'Monte <no-reply@monte.app>';

const getFromAddress = () => process.env.MAGIC_LINK_FROM_EMAIL ?? defaultFromAddress;

const escapeHtml = (raw: string) =>
  raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderTextBody = (url: string) => {
  return [
    'Sign in to Monte',
    '',
    'Click the secure link below to continue:',
    url,
    '',
    'If you did not request this email, you can safely ignore it.',
  ].join('\n');
};

const renderHtmlBody = (url: string) => {
  const escapedUrl = escapeHtml(url);
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sign in to Monte</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        background-color: #f8fafc;
        color: #0f172a;
        padding: 24px;
      }
      .container {
        max-width: 480px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
      }
      .cta {
        display: inline-block;
        margin-top: 24px;
        padding: 16px 24px;
        border-radius: 999px;
        background: #2563eb;
        color: #ffffff !important;
        font-weight: 600;
        text-decoration: none;
      }
      .link {
        margin-top: 24px;
        word-break: break-all;
        color: #2563eb;
      }
      p {
        margin: 0 0 16px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 style="margin-top: 0;">Sign in to Monte</h1>
      <p>Click the button below to finish signing in.</p>
      <p style="text-align: center;">
        <a class="cta" href="${escapedUrl}">Open your secure link</a>
      </p>
      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p class="link">${escapedUrl}</p>
      <p style="font-size: 12px; color: #64748b;">
        If you didn’t request this email, you can safely ignore it.
      </p>
    </div>
  </body>
</html>
`.trim();
};

const sendMagicLinkEmail = async ({
  email,
  url,
  token,
}: {
  email: string;
  url: string;
  token: string;
}) => {
  const resendApiKey = resolveResendApiKey();

  const sendViaResend = async () => {
    if (!resendApiKey) {
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: email,
        subject: 'Your Monte sign-in link',
        html: renderHtmlBody(url),
        text: renderTextBody(url),
      }),
    });

    if (response.ok) {
      return true;
    }

    const detail = await response.text().catch(() => 'Unknown error');
    throw new Error(`Resend magic link email failed: ${response.status} ${detail}`);
  };

  try {
    const delivered = await sendViaResend();
    if (delivered) {
      console.info('[magic-link] Email sent via Resend', { email });
      return;
    }
  } catch (error) {
    console.error('[magic-link] Resend delivery failed', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }

  console.info('[magic-link] Magic link ready', { email, url, token });
};

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly = false }: { optionsOnly?: boolean } = {},
): AuthInstance => {
  return betterAuth({
    baseURL: convexSiteUrl,
    logger: {
      disabled: optionsOnly,
    },
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    trustedOrigins: [siteUrl, 'http://localhost:3000'].filter(Boolean) as string[],
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url, token }) => {
          await sendMagicLinkEmail({ email, url, token });
        },
      }),
      crossDomain({
        siteUrl,
      }),
      convex(),
    ],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<AuthUserDoc> => {
    return await authComponent.getAuthUser(asGenericCtx(ctx));
  },
});

export const requireAuth = async (ctx: GenericCtx<DataModel>) => {
  const authUser = await authComponent.getAuthUser(ctx);
  if (!authUser) {
    throw new Error('Authentication required');
  }
  return authUser;
};

export const requireRole = async (
  ctx: GenericCtx<DataModel>,
  allowedRoles: Array<UserRole>,
) => {
  const authUser = await requireAuth(ctx);
  const db = getDb(ctx);
  const profile = await db
    .query('userProfiles')
    .withIndex('by_user_id', (q) => q.eq('userId', authUser._id))
    .first();

  if (!profile) {
    throw new Error('User profile not found');
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new Error('Access denied');
  }

  return { authUser, profile };
};

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(asGenericCtx(ctx));
    if (!user) return null;
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first();
    return profile ?? null;
  },
});

export const getCurrentUserRole = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(asGenericCtx(ctx));
    if (!user) return null;
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first();
    return profile?.role ?? null;
  },
});

export const ensureUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(asGenericCtx(ctx));
    if (!user) {
      throw new Error('Authentication required');
    }
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .first();
    if (existing) {
      return existing.role;
    }
    const timestamp = Date.now();
    await ctx.db.insert('userProfiles', {
      userId: user._id,
      role: DEFAULT_USER_ROLE,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return DEFAULT_USER_ROLE;
  },
});

export const updateUserRole = mutation({
  args: {
    targetUserId: v.string(),
    role: v.union(
      v.literal('admin'),
      v.literal('curriculum_writer'),
      v.literal('teacher'),
      v.literal('student'),
    ),
  },
  handler: async (ctx, args) => {
    const actor = await authComponent.getAuthUser(asGenericCtx(ctx));
    if (!actor) {
      throw new Error('Authentication required');
    }
    const actorProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', actor._id))
      .first();
    if (!actorProfile || actorProfile.role !== 'admin') {
      throw new Error('Not authorized');
    }

    const targetProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', args.targetUserId))
      .first();

    const timestamp = Date.now();
    if (targetProfile) {
      await ctx.db.patch(targetProfile._id, {
        role: args.role as UserRole,
        updatedAt: timestamp,
      });
    } else {
      await ctx.db.insert('userProfiles', {
        userId: args.targetUserId,
        role: args.role as UserRole,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  },
});
