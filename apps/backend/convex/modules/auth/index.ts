import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth';
import { v } from 'convex/values';

import type { DataModel } from '@monte/api/convex/_generated/dataModel.d.ts';
import { components } from '@monte/api/convex/_generated/api.js';
import { mutation, query } from '@monte/api/convex/_generated/server.js';
import type { MutationCtx, QueryCtx } from '@monte/api/convex/_generated/server.js';
import type { UserRole } from '@monte/types';

const siteUrl = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? 'http://localhost:3000';
const DEFAULT_USER_ROLE: UserRole = 'teacher';

export const authComponent = createClient<DataModel>(components.betterAuth);

type AuthUserDoc = Awaited<ReturnType<typeof authComponent.safeGetAuthUser>>;
type AuthInstance = ReturnType<typeof betterAuth>;

const asGenericCtx = (ctx: QueryCtx | MutationCtx): GenericCtx<DataModel> =>
  ctx as unknown as GenericCtx<DataModel>;

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly = false }: { optionsOnly?: boolean } = {},
): AuthInstance => {
  return betterAuth({
    baseURL: siteUrl,
    logger: {
      disabled: optionsOnly,
    },
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
    },
    plugins: [convex()],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<AuthUserDoc> => {
    return await authComponent.safeGetAuthUser(asGenericCtx(ctx));
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(asGenericCtx(ctx));
    if (!user) return null;
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q: any) => q.eq('userId', user._id))
      .first();
    return profile ?? null;
  },
});

export const getCurrentUserRole = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(asGenericCtx(ctx));
    if (!user) return null;
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q: any) => q.eq('userId', user._id))
      .first();
    return profile?.role ?? null;
  },
});

export const ensureUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(asGenericCtx(ctx));
    if (!user) {
      throw new Error('Authentication required');
    }
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q: any) => q.eq('userId', user._id))
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
    const actor = await authComponent.safeGetAuthUser(asGenericCtx(ctx));
    if (!actor) {
      throw new Error('Authentication required');
    }
    const actorProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q: any) => q.eq('userId', actor._id))
      .first();
    if (!actorProfile || actorProfile.role !== 'admin') {
      throw new Error('Not authorized');
    }

    const targetProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q: any) => q.eq('userId', args.targetUserId))
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
