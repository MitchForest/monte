import { db } from "@monte/database";
import { auth } from "./index";

type SessionPayload = Awaited<ReturnType<typeof auth.api.getSession>>;
type NonNullableSession = NonNullable<SessionPayload>;

export type AuthenticatedSession = NonNullableSession & {
  session: NonNullableSession["session"] & { orgId: string };
};

export async function getServerSession(
  request: Request,
): Promise<AuthenticatedSession | null> {
  try {
    const result = await auth.api.getSession({
      headers: request.headers,
      asResponse: false,
    });

    if (!(result?.session && result?.user)) {
      return null;
    }

    const sessionDetails = result.session as NonNullableSession["session"] & {
      orgId?: string | null;
    };

    if (!sessionDetails.orgId) {
      const membership = await db
        .selectFrom("org_memberships")
        .select("org_id")
        .where("user_id", "=", sessionDetails.userId)
        .orderBy("created_at", "asc")
        .executeTakeFirst();

      if (!membership?.org_id) {
        return null;
      }

      await db
        .updateTable("auth_sessions")
        .set({ org_id: membership.org_id })
        .where("token", "=", sessionDetails.token)
        .execute();

      return {
        ...result,
        session: { ...sessionDetails, orgId: membership.org_id },
      } as AuthenticatedSession;
    }

    return {
      ...result,
      session: { ...sessionDetails, orgId: sessionDetails.orgId },
    } as AuthenticatedSession;
  } catch {
    return null;
  }
}
