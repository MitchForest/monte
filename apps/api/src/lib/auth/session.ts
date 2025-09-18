import { getDb } from "@monte/database";
import { oneroster } from "@monte/timeback-clients";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { getOneRosterClient } from "../timeback/clients";

const DEFAULT_ISSUER =
  process.env.COGNITO_AUTHORITY ??
  "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_H5aVRMERg";
const DEFAULT_JWKS =
  process.env.COGNITO_JWKS_URI ?? `${DEFAULT_ISSUER}/.well-known/jwks.json`;
const DEFAULT_SCOPE_AUDIENCE = process.env.COGNITO_AUDIENCE;

const isBypassEnabled =
  process.env.DEV_AUTH_BYPASS === "true" ||
  (!process.env.COGNITO_CLIENT_ID && process.env.NODE_ENV !== "production");

const jwks = createRemoteJWKSet(new URL(DEFAULT_JWKS));

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
  const email = process.env.DEV_USER_EMAIL ?? "guide@example.com";
  const name = process.env.DEV_USER_NAME ?? "Guide User";
  const orgName = process.env.DEV_ORG_NAME ?? "Development School";
  const orgIdFromEnv =
    process.env.DEV_ORGANIZATION_ID?.trim() ??
    process.env.DEFAULT_ORGANIZATION_ID?.trim() ??
    null;
  const orgRosterId = process.env.DEV_ONEROSTER_ORG_ID?.trim() ?? null;
  const rosterUserId =
    process.env.DEV_ONEROSTER_USER_ID?.trim() ??
    process.env.DEV_ONEROSTER_ID?.trim() ??
    undefined;
  const rawRole = process.env.DEV_USER_ROLE?.trim()?.toLowerCase();
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
      process.stderr.write(
        `Failed to fetch OneRoster org ${orgSourcedId}: ${message}\n`,
      );
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
    process.stderr.write(
      `Failed to synchronise OneRoster memberships: ${message}\n`,
    );
    return [];
  }
}

export async function getServerSession(
  request: Request,
): Promise<AuthenticatedSession | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return isBypassEnabled ? ensureDevUser() : null;
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return isBypassEnabled ? ensureDevUser() : null;
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: DEFAULT_ISSUER,
      audience: DEFAULT_SCOPE_AUDIENCE,
    });

    const email = String(payload.email ?? "").toLowerCase();
    const name = payload.name ? String(payload.name) : undefined;
    const onerosterUserId =
      (payload["custom:oneroster_user_id"] as string | undefined) ??
      (payload.sub ? String(payload.sub) : undefined);

    if (!email) {
      process.stderr.write("OIDC token missing email claim\n");
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
        rosterOrgIds[0] ?? process.env.DEFAULT_ORGANIZATION_ID ?? null;

      if (fallbackOrgId) {
        await db
          .insertInto("org_memberships")
          .values({
            id: crypto.randomUUID(),
            org_id: fallbackOrgId,
            user_id: user.id,
            role: "teacher",
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
        .select(["id as org_id"])
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
    process.stderr.write(`Failed to verify access token: ${message}\n`);
    return isBypassEnabled ? ensureDevUser() : null;
  }
}
