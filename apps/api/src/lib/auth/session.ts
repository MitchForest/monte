import { getDb } from "@monte/database";
import { logger, MONTE_SESSION_COOKIE } from "@monte/shared";
import { oneroster } from "@monte/timeback-clients";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { loadApiEnv, resetApiEnv } from "../env";
import { getOneRosterClient } from "../timeback/clients";

const FALLBACK_ISSUER =
  "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_H5aVRMERg";

function resolveIssuer(): string {
  return loadApiEnv().COGNITO_AUTHORITY ?? FALLBACK_ISSUER;
}

function resolveJwksUrl(): string {
  const env = loadApiEnv();
  return env.COGNITO_JWKS_URI ?? `${resolveIssuer()}/.well-known/jwks.json`;
}

function resolveAudience(): string | undefined {
  return loadApiEnv().COGNITO_AUDIENCE;
}

function isDevBypassEnabled(): boolean {
  const env = loadApiEnv();
  return (
    env.DEV_AUTH_BYPASS === "true" ||
    (!env.COGNITO_CLIENT_ID && env.NODE_ENV !== "production")
  );
}

function readBearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return token.length > 0 ? token : null;
}

function readCookieValue(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawKey, ...rawValueParts] = pair.split("=");
    if (!rawKey) {
      continue;
    }
    if (rawKey.trim() !== name) {
      continue;
    }
    const rawValue = rawValueParts.join("=").trim();
    if (!rawValue) {
      return null;
    }
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
}

let jwks = createRemoteJWKSet(new URL(resolveJwksUrl()));

export function resetAuthSessionEnv(): void {
  resetApiEnv();
  jwks = createRemoteJWKSet(new URL(resolveJwksUrl()));
}

export type AuthenticatedSession = {
  session: {
    token: string;
    userId: string;
    orgId: string;
    role: "administrator" | "teacher" | "student" | "parent";
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
    email_verified: boolean;
  };
  organization?: {
    id: string;
    name: string;
    created_at: string;
  };
};

export async function ensureDevUser(): Promise<AuthenticatedSession> {
  const env = loadApiEnv();
  const email = env.DEV_USER_EMAIL ?? "guide@example.com";
  const name = env.DEV_USER_NAME ?? "Guide User";
  const orgName = env.DEV_ORG_NAME ?? "Development School";
  const orgIdFromEnv =
    env.DEV_ORGANIZATION_ID?.trim() ??
    env.DEFAULT_ORGANIZATION_ID?.trim() ??
    null;
  const orgRosterId = env.DEV_ONEROSTER_ORG_ID?.trim() ?? null;
  const rosterUserId =
    env.DEV_ONEROSTER_USER_ID?.trim() ??
    env.DEV_ONEROSTER_ID?.trim() ??
    undefined;
  const rawRole = env.DEV_USER_ROLE?.trim()?.toLowerCase();
  const role: "administrator" | "teacher" | "student" | "parent" =
    rawRole === "teacher" || rawRole === "student" || rawRole === "parent"
      ? rawRole
      : "administrator";

  const db = getDb();

  const user = await findOrCreateUserByEmail(email, name, rosterUserId);

  const organization = await (async () => {
    if (orgIdFromEnv) {
      const existingById = await db
        .selectFrom("organizations")
        .selectAll()
        .where("id", "=", orgIdFromEnv)
        .executeTakeFirst();
      if (existingById) {
        if (orgRosterId && existingById.oneroster_sourced_id !== orgRosterId) {
          await db
            .updateTable("organizations")
            .set({ oneroster_sourced_id: orgRosterId })
            .where("id", "=", orgIdFromEnv)
            .execute();
          return {
            ...existingById,
            oneroster_sourced_id: orgRosterId,
          };
        }
        return existingById;
      }

      await db
        .insertInto("organizations")
        .values({
          id: orgIdFromEnv,
          name: orgName,
          oneroster_sourced_id: orgRosterId ?? orgIdFromEnv,
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

      const inserted = await db
        .selectFrom("organizations")
        .selectAll()
        .where("id", "=", orgIdFromEnv)
        .executeTakeFirstOrThrow();

      if (orgRosterId && inserted.oneroster_sourced_id !== orgRosterId) {
        await db
          .updateTable("organizations")
          .set({ oneroster_sourced_id: orgRosterId })
          .where("id", "=", orgIdFromEnv)
          .execute();
        return {
          ...inserted,
          oneroster_sourced_id: orgRosterId,
        };
      }

      return inserted;
    }

    const existingByName = await db
      .selectFrom("organizations")
      .selectAll()
      .where("name", "=", orgName)
      .executeTakeFirst();

    if (existingByName) {
      return existingByName;
    }

    const generatedOrgId = orgIdFromEnv ?? crypto.randomUUID();

    await db
      .insertInto("organizations")
      .values({
        id: generatedOrgId,
        name: orgName,
        oneroster_sourced_id: orgRosterId ?? generatedOrgId,
      })
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();

    return db
      .selectFrom("organizations")
      .selectAll()
      .where("id", "=", generatedOrgId)
      .executeTakeFirstOrThrow();
  })();

  await db
    .insertInto("org_memberships")
    .values({
      id: crypto.randomUUID(),
      org_id: organization.id,
      user_id: user.id,
      role,
      oneroster_user_id: user.oneroster_user_id ?? user.id,
      oneroster_org_id: organization.oneroster_sourced_id ?? organization.id,
    })
    .onConflict((oc) =>
      oc.constraint("org_memberships_org_id_user_id_key").doUpdateSet({ role }),
    )
    .execute();

  const normalizedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    image_url: user.image_url ?? null,
    created_at:
      user.created_at instanceof Date
        ? user.created_at.toISOString()
        : (user.created_at ?? new Date().toISOString()),
    updated_at:
      user.updated_at instanceof Date
        ? user.updated_at.toISOString()
        : (user.updated_at ?? new Date().toISOString()),
    email_verified: user.email_verified ?? false,
  };

  const normalizedOrganization = {
    id: organization.id,
    name: organization.name,
    created_at:
      organization.created_at instanceof Date
        ? organization.created_at.toISOString()
        : (organization.created_at ?? new Date().toISOString()),
  };

  return {
    session: {
      token: "dev-token",
      userId: user.id,
      orgId: organization.id,
      role,
    },
    user: normalizedUser,
    organization: normalizedOrganization,
  };
}

async function findOrCreateUserByEmail(
  email: string,
  name?: string,
  onerosterUserId?: string,
) {
  const db = getDb();
  let user = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user) {
    user = await db
      .insertInto("users")
      .values({
        id: crypto.randomUUID(),
        email,
        name,
        image_url: null,
        oneroster_user_id: onerosterUserId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return user;
  }

  if (onerosterUserId && user.oneroster_user_id !== onerosterUserId) {
    await db
      .updateTable("users")
      .set({
        oneroster_user_id: onerosterUserId,
        name: name ?? user.name,
      })
      .where("id", "=", user.id)
      .execute();
    user = {
      ...user,
      oneroster_user_id: onerosterUserId,
      name: name ?? user.name,
    };
  }

  return user;
}

async function ensureOrganizationFromOneRoster(orgSourcedId: string) {
  const db = getDb();
  const existing = await db
    .selectFrom("organizations")
    .select(["id"])
    .where("oneroster_sourced_id", "=", orgSourcedId)
    .executeTakeFirst();

  if (existing) {
    return existing.id;
  }

  const client = getOneRosterClient();
  let name = `Organization ${orgSourcedId}`;

  if (client) {
    try {
      const orgResponse = await oneroster.callOneRosterOperation(
        client,
        "getOrg",
        {
          path: { sourcedId: orgSourcedId },
        },
      );
      name = orgResponse.org.name ?? name;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OneRoster org fetch failed";
      logger.error("Failed to fetch OneRoster org", {
        orgSourcedId,
        message,
      });
    }
  }

  const inserted = await db
    .insertInto("organizations")
    .values({
      id: crypto.randomUUID(),
      name,
      oneroster_sourced_id: orgSourcedId,
    })
    .onConflict((oc) =>
      oc
        .column("oneroster_sourced_id")
        .doUpdateSet({ name: (eb) => eb.ref("excluded.name") }),
    )
    .returning(["id"])
    .executeTakeFirstOrThrow();

  return inserted.id;
}

function mapOneRosterRole(
  role?: string | null,
): "administrator" | "teacher" | "student" | "parent" {
  switch ((role ?? "").toLowerCase()) {
    case "administrator":
    case "admin":
      return "administrator";
    case "student":
      return "student";
    case "parent":
    case "guardian":
      return "parent";
    default:
      return "teacher";
  }
}

async function syncOneRosterMemberships(
  userId: string,
  onerosterUserId: string,
) {
  const client = getOneRosterClient();
  if (!client) {
    return [] as string[];
  }

  const db = getDb();

  try {
    const userResponse = await oneroster.callOneRosterOperation(
      client,
      "getUser",
      {
        path: { sourcedId: onerosterUserId },
      },
    );

    const roles = userResponse.user.roles ?? [];
    const resolvedOrgIds: string[] = [];

    for (const role of roles) {
      const orgSourcedId = role.org?.sourcedId;
      if (!orgSourcedId) {
        continue;
      }

      const orgId = await ensureOrganizationFromOneRoster(orgSourcedId);
      resolvedOrgIds.push(orgId);

      await db
        .insertInto("org_memberships")
        .values({
          id: crypto.randomUUID(),
          org_id: orgId,
          user_id: userId,
          role: mapOneRosterRole(role.role),
          oneroster_user_id: onerosterUserId,
          oneroster_org_id: orgSourcedId,
        })
        .onConflict((oc) =>
          oc.columns(["org_id", "user_id"]).doUpdateSet((eb) => ({
            role: eb.ref("excluded.role"),
            oneroster_user_id: eb.ref("excluded.oneroster_user_id"),
            oneroster_org_id: eb.ref("excluded.oneroster_org_id"),
          })),
        )
        .execute();
    }

    return resolvedOrgIds;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "OneRoster membership synchronisation failed";
    logger.error("Failed to synchronise OneRoster memberships", { message });
    return [];
  }
}

export async function getServerSession(
  request: Request,
): Promise<AuthenticatedSession | null> {
  const env = loadApiEnv();
  const headerToken = readBearerToken(request.headers.get("authorization"));
  const cookieToken = readCookieValue(request, MONTE_SESSION_COOKIE);
  const token = headerToken ?? cookieToken;
  if (!token) {
    return isDevBypassEnabled() ? ensureDevUser() : null;
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: resolveIssuer(),
      audience: resolveAudience(),
    });

    const email = String(payload.email ?? "").toLowerCase();
    const name = payload.name ? String(payload.name) : undefined;
    const onerosterUserId =
      (payload["custom:oneroster_user_id"] as string | undefined) ??
      (payload.sub ? String(payload.sub) : undefined);

    if (!email) {
      logger.error("OIDC token missing email claim");
      return null;
    }

    const user = await findOrCreateUserByEmail(email, name, onerosterUserId);

    const db = getDb();
    let membership = await db
      .selectFrom("org_memberships")
      .select(["org_id", "role"])
      .where("user_id", "=", user.id)
      .orderBy("created_at", "asc")
      .executeTakeFirst();

    let rosterOrgIds: string[] = [];
    let membershipRole = membership?.role as
      | "administrator"
      | "teacher"
      | "student"
      | "parent"
      | undefined;
    if (onerosterUserId) {
      rosterOrgIds = await syncOneRosterMemberships(user.id, onerosterUserId);
      if (!membership && rosterOrgIds.length > 0) {
        membership = { org_id: rosterOrgIds[0], role: "teacher" };
        membershipRole = membership.role;
      }
    }

    if (!membership) {
      const fallbackOrgId =
        rosterOrgIds[0] ?? env.DEFAULT_ORGANIZATION_ID ?? null;

      if (fallbackOrgId) {
        const fallbackOrgRecord = await db
          .selectFrom("organizations")
          .select(["id", "oneroster_sourced_id"])
          .where("id", "=", fallbackOrgId)
          .executeTakeFirst();
        const fallbackOnerosterId =
          fallbackOrgRecord?.oneroster_sourced_id ?? fallbackOrgId;

        await db
          .insertInto("org_memberships")
          .values({
            id: crypto.randomUUID(),
            org_id: fallbackOrgId,
            user_id: user.id,
            role: "teacher",
            oneroster_user_id: user.oneroster_user_id ?? user.id,
            oneroster_org_id: fallbackOnerosterId,
          })
          .onConflict((oc) => oc.doNothing())
          .execute();
        membership = { org_id: fallbackOrgId, role: "teacher" };
        membershipRole = "teacher";
      }
    }

    if (!membership) {
      const fallbackOrg = await db
        .selectFrom("organizations")
        .select(["id as org_id", "oneroster_sourced_id"])
        .orderBy("created_at", "asc")
        .executeTakeFirst();

      if (fallbackOrg) {
        await db
          .insertInto("org_memberships")
          .values({
            id: crypto.randomUUID(),
            org_id: fallbackOrg.org_id,
            user_id: user.id,
            role: "teacher",
            oneroster_user_id: user.oneroster_user_id ?? user.id,
            oneroster_org_id:
              fallbackOrg.oneroster_sourced_id ?? fallbackOrg.org_id,
          })
          .onConflict((oc) =>
            oc.constraint("org_memberships_org_id_user_id_key").doNothing(),
          )
          .execute();
        membership = { org_id: fallbackOrg.org_id, role: "teacher" };
        membershipRole = "teacher";
      }
    }

    if (!membership) {
      throw new Error("User has no organisation membership");
    }

    if (!membershipRole) {
      membershipRole =
        (membership.role as
          | "administrator"
          | "teacher"
          | "student"
          | "parent"
          | undefined) || "teacher";
    }

    return {
      session: {
        token,
        userId: user.id,
        orgId: membership.org_id,
        role: membershipRole,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image_url: user.image_url ?? null,
        created_at:
          user.created_at instanceof Date
            ? user.created_at.toISOString()
            : (user.created_at ?? new Date().toISOString()),
        updated_at:
          user.updated_at instanceof Date
            ? user.updated_at.toISOString()
            : (user.updated_at ?? new Date().toISOString()),
        email_verified: user.email_verified ?? false,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown token verification error";
    logger.error("Failed to verify access token", { message });
    return isDevBypassEnabled() ? ensureDevUser() : null;
  }
}
