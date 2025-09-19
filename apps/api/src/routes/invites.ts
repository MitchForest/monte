import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db, withDbContext } from "@monte/database";
import type { WorkspaceInvite } from "@monte/shared";
import {
  ApiErrorSchema,
  WorkspaceInviteDetailResponseSchema,
  WorkspaceInvitesListResponseSchema,
} from "@monte/shared";
import { sql } from "kysely";

import { getServerSession } from "../lib/auth/session";
import { respond } from "../lib/http/respond";
import { HTTP_STATUS } from "../lib/http/status";
import { sendWorkspaceInviteEmail } from "../lib/integrations/resend";

const router = new OpenAPIHono();

const InviteRoleSchema = z.enum([
  "administrator",
  "teacher",
  "student",
  "parent",
]);

const CreateInviteBody = z.object({
  email: z.string().email().optional(),
  role: InviteRoleSchema.optional(),
  expiresInDays: z.number().int().min(1).max(90).optional(),
  maxUses: z.number().int().min(1).max(10).optional(),
});

const LookupInviteBody = z.object({
  code: z.string().min(4),
});

const RedeemInviteBody = z.object({
  code: z.string().min(4),
});

const SendInviteBody = z.object({
  email: z.string().email().optional(),
});

type InviteRole = z.infer<typeof InviteRoleSchema>;

type CreateInviteBodyInput = z.infer<typeof CreateInviteBody>;

type LookupInviteBodyInput = z.infer<typeof LookupInviteBody>;

type RedeemInviteBodyInput = z.infer<typeof RedeemInviteBody>;

type SendInviteBodyInput = z.infer<typeof SendInviteBody>;

function generateInviteCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const cryptoObj = globalThis.crypto ?? crypto;
  const array = new Uint32Array(length);
  cryptoObj.getRandomValues(array);
  for (let i = 0; i < length; i += 1) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

const listInvitesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Workspace Invites"],
  responses: {
    [HTTP_STATUS.ok]: {
      description: "List workspace invites",
      content: {
        "application/json": {
          schema: WorkspaceInvitesListResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.unauthorized]: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

router.openapi(listInvitesRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      listInvitesRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const invites = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("workspace_invites")
        .selectAll()
        .where("org_id", "=", session.session.orgId)
        .orderBy("created_at", "desc")
        .execute(),
  );

  const response = WorkspaceInvitesListResponseSchema.parse({
    data: { invites },
  });
  return respond(listInvitesRoute, c, response);
});

const createInviteRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Workspace Invites"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateInviteBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.created]: {
      description: "Invite created",
      content: {
        "application/json": {
          schema:
            WorkspaceInviteDetailResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.unauthorized]: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

router.openapi(createInviteRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      createInviteRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const body = c.req.valid("json") as CreateInviteBodyInput;
  const code = generateInviteCode();
  const expiresAt = body.expiresInDays
    ? new Date(
        Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000,
      ).toISOString()
    : null;

  const invite = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .insertInto("workspace_invites")
        .values({
          id: crypto.randomUUID(),
          org_id: session.session.orgId,
          code,
          email: body.email ?? null,
          role: body.role ?? "teacher",
          created_by: session.session.userId,
          max_uses: body.maxUses ?? 1,
          expires_at: expiresAt,
        })
        .returningAll()
        .executeTakeFirstOrThrow(),
  );

  const organization = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("organizations")
        .select(["id", "name"])
        .where("id", "=", invite.org_id)
        .executeTakeFirstOrThrow(),
  );

  const response = WorkspaceInviteDetailResponseSchema.parse({
    data: {
      invite,
      organization,
    },
  });

  return respond(createInviteRoute, c, response, HTTP_STATUS.created);
});

const lookupInviteRoute = createRoute({
  method: "post",
  path: "/lookup",
  tags: ["Workspace Invites"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LookupInviteBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Invite lookup",
      content: {
        "application/json": {
          schema:
            WorkspaceInviteDetailResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.notFound]: {
      description: "Invite not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

router.openapi(lookupInviteRoute, async (c) => {
  const body = c.req.valid("json") as LookupInviteBodyInput;
  try {
    const invite = await db
      .selectFrom(
        sql<WorkspaceInvite>`app.lookup_invite(${body.code})`.as("inv"),
      )
      .selectAll()
      .executeTakeFirstOrThrow();

    const organization = await withDbContext({ orgId: invite.org_id }, (trx) =>
      trx
        .selectFrom("organizations")
        .select(["id", "name"])
        .where("id", "=", invite.org_id)
        .executeTakeFirstOrThrow(),
    );

    const response = WorkspaceInviteDetailResponseSchema.parse({
      data: {
        invite,
        organization,
      },
    });

    return respond(lookupInviteRoute, c, response);
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Invite not found";
    return respond(
      lookupInviteRoute,
      c,
      { error: message },
      HTTP_STATUS.notFound,
    );
  }
});

const redeemInviteRoute = createRoute({
  method: "post",
  path: "/redeem",
  tags: ["Workspace Invites"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RedeemInviteBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Invite redeemed",
      content: {
        "application/json": {
          schema:
            WorkspaceInviteDetailResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.badRequest]: {
      description: "Invalid invite",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.unauthorized]: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

router.openapi(redeemInviteRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      redeemInviteRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const body = c.req.valid("json") as RedeemInviteBodyInput;

  try {
    const result = await db
      .selectFrom(
        sql<{
          org_id: string;
          role: InviteRole;
        }>`app.redeem_invite(${body.code}, ${session.session.userId})`.as(
          "redeem",
        ),
      )
      .selectAll()
      .executeTakeFirstOrThrow();

    const orgId = result.org_id as string;
    const role = result.role as InviteRole;

    await withDbContext(
      { userId: session.session.userId, orgId },
      async (trx) => {
        await trx
          .insertInto("org_memberships")
          .values({
            id: crypto.randomUUID(),
            org_id: orgId,
            user_id: session.session.userId,
            role,
            created_at: new Date().toISOString(),
            oneroster_user_id: session.session.userId,
            oneroster_org_id: orgId,
          })
          .onConflict((oc) =>
            oc
              .columns(["org_id", "user_id"])
              .doUpdateSet((eb) => ({ role: eb.ref("excluded.role") })),
          )
          .execute();
      },
    );

    const inviteAfter = await withDbContext(
      { userId: session.session.userId, orgId },
      (trx) =>
        trx
          .selectFrom("workspace_invites")
          .selectAll()
          .where("code", "=", body.code)
          .executeTakeFirstOrThrow(),
    );

    const organization = await withDbContext(
      { userId: session.session.userId, orgId },
      (trx) =>
        trx
          .selectFrom("organizations")
          .select(["id", "name"])
          .where("id", "=", orgId)
          .executeTakeFirstOrThrow(),
    );

    const response = WorkspaceInviteDetailResponseSchema.parse({
      data: {
        invite: inviteAfter,
        organization,
      },
    });

    return respond(redeemInviteRoute, c, response);
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Invite is no longer valid";
    return respond(
      redeemInviteRoute,
      c,
      { error: message },
      HTTP_STATUS.badRequest,
    );
  }
});

const sendInviteRoute = createRoute({
  method: "post",
  path: "/:id/send",
  tags: ["Workspace Invites"],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: SendInviteBody,
        },
      },
    },
  },
  responses: {
    [HTTP_STATUS.ok]: {
      description: "Invite email sent",
      content: {
        "application/json": {
          schema:
            WorkspaceInviteDetailResponseSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.badRequest]: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
    [HTTP_STATUS.unauthorized]: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema as unknown as z.ZodTypeAny,
        },
      },
    },
  },
});

router.openapi(sendInviteRoute, async (c) => {
  const session = await getServerSession(c.req.raw);
  if (!session) {
    return respond(
      sendInviteRoute,
      c,
      { error: "Unauthorized" },
      HTTP_STATUS.unauthorized,
    );
  }

  const params = c.req.valid("param");
  const body = c.req.valid("json") as SendInviteBodyInput;

  const invite = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("workspace_invites")
        .selectAll()
        .where("id", "=", params.id)
        .where("org_id", "=", session.session.orgId)
        .executeTakeFirst(),
  );

  if (!invite) {
    return respond(
      sendInviteRoute,
      c,
      { error: "Invite not found" },
      HTTP_STATUS.badRequest,
    );
  }

  const email = body.email ?? invite.email;
  if (!email) {
    return respond(
      sendInviteRoute,
      c,
      { error: "An email address is required to send an invite" },
      HTTP_STATUS.badRequest,
    );
  }

  const organization = await withDbContext(
    { userId: session.session.userId, orgId: session.session.orgId },
    (trx) =>
      trx
        .selectFrom("organizations")
        .select(["id", "name"])
        .where("id", "=", invite.org_id)
        .executeTakeFirstOrThrow(),
  );

  await sendWorkspaceInviteEmail({
    to: email,
    code: invite.code,
    organizationName: organization.name,
  });

  const response = WorkspaceInviteDetailResponseSchema.parse({
    data: {
      invite,
      organization,
    },
  });

  return respond(sendInviteRoute, c, response);
});

export { router as invitesRouter };
