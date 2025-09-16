import { betterAuth } from "better-auth";
import { db, withDbContext } from "@monte/database";

function resolveBaseURL(): string {
  const explicit =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL;
  if (explicit) {
    return explicit;
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return "http://localhost:3000";
}

function buildOrganizationName(
  name: string | null,
  email: string | null
): string {
  const trimmed = name?.trim();
  if (trimmed && trimmed.length > 0) {
    return `${trimmed} Montessori`;
  }
  const localPart = email?.split("@")[0];
  if (localPart && localPart.length > 0) {
    return `${localPart} Montessori`;
  }
  return "Monte Montessori";
}

type GlobalAuth = {
  __monteBetterAuth?: ReturnType<typeof betterAuth>;
};

const globalAuth = globalThis as GlobalAuth;

const initializedAuth =
  globalAuth.__monteBetterAuth ??
  betterAuth({
    appName: "Monte",
    baseURL: resolveBaseURL(),
    basePath: "/api/auth",
    database: {
      db,
      type: "postgres",
      casing: "snake",
    },
    plugins: [],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    user: {
      modelName: "users",
      fields: {
        email: "email",
        name: "name",
        image: "image_url",
        createdAt: "created_at",
        updatedAt: "updated_at",
        emailVerified: "email_verified",
      },
    },
    session: {
      modelName: "auth_sessions",
      fields: {
        userId: "user_id",
        token: "token",
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
      },
    },
    account: {
      modelName: "auth_accounts",
      fields: {
        accountId: "account_id",
        providerId: "provider_id",
        userId: "user_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        scope: "scope",
        password: "password",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    verification: {
      modelName: "auth_verifications",
      fields: {
        identifier: "identifier",
        value: "value",
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
      hooks: {
        after: [
          {
            matcher: (context: { method: string }) =>
              context.method === "signUp.email",
            handler: async ({
              user,
            }: {
              user: { id: string; name?: string | null; email: string };
            }) => {
              const orgId = crypto.randomUUID();
              const organizationName = buildOrganizationName(
                user.name ?? null,
                user.email
              );
              
              await withDbContext({ userId: user.id, orgId }, async (trx) => {
                await trx
                  .insertInto("organizations")
                  .values({
                    id: orgId,
                    name: organizationName,
                    created_at: new Date().toISOString(),
                  })
                  .execute();

                await trx
                  .insertInto("org_memberships")
                  .values({
                    id: crypto.randomUUID(),
                    org_id: orgId,
                    user_id: user.id,
                    role: "super_admin",
                    created_at: new Date().toISOString(),
                  })
                  .execute();
              });
            },
          },
          {
            matcher: (context: { method: string }) =>
              context.method === "signIn.email",
            handler: async ({
              user,
              session,
            }: {
              user: { id: string; name?: string | null; email: string | null };
              session: { token: string };
            }) => {
              const membership = await withDbContext(
                { userId: user.id },
                async (trx) =>
                  trx
                    .selectFrom("org_memberships")
                    .select("org_id")
                    .where("user_id", "=", user.id)
                    .orderBy("created_at", "asc")
                    .executeTakeFirst()
              );

              if (membership?.org_id) {
                // Store orgId in the session table
                await db
                  .updateTable("auth_sessions")
                  .set({ org_id: membership.org_id })
                  .where("token", "=", session.token)
                  .execute();
                return;
              }

              // Create organization if doesn't exist
              const orgId = crypto.randomUUID();
              const organizationName = buildOrganizationName(
                user.name ?? null,
                user.email ?? null
              );

              await withDbContext({ userId: user.id, orgId }, async (trx) => {
                await trx
                  .insertInto("organizations")
                  .values({
                    id: orgId,
                    name: organizationName,
                    created_at: new Date().toISOString(),
                  })
                  .execute();

                await trx
                  .insertInto("org_memberships")
                  .values({
                    id: crypto.randomUUID(),
                    org_id: orgId,
                    user_id: user.id,
                    role: "super_admin",
                    created_at: new Date().toISOString(),
                  })
                  .execute();
              });

              // Store orgId in the session table
              await db
                .updateTable("auth_sessions")
                .set({ org_id: orgId })
                .where("token", "=", session.token)
                .execute();
            },
          },
        ],
      },
    },
  });

globalAuth.__monteBetterAuth = initializedAuth;

export const auth = initializedAuth;
