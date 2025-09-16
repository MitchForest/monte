import { auth } from "./index";

type SessionPayload = Awaited<ReturnType<typeof auth.api.getSession>>;
type NonNullableSession = NonNullable<SessionPayload>;

export type AuthenticatedSession = NonNullableSession & {
  session: NonNullableSession["session"] & { orgId: string };
};

export async function getServerSession(
  request: Request
): Promise<AuthenticatedSession | null> {
  try {
    const result = await auth.api.getSession({
      headers: request.headers,
      asResponse: false,
    });

    if (!(result?.session && result?.user)) {
      return null;
    }

    return result as AuthenticatedSession;
  } catch {
    return null;
  }
}
