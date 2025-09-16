import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export type AuthenticatedSession = {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  } & { orgId?: string };
  user: {
    id: string;
    email: string;
    name: string | null | undefined;
    image: string | null | undefined;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
};

export async function getServerSession(): Promise<AuthenticatedSession | null> {
  const headerList = await headers();
  return auth.api
    .getSession({
      headers: headerList as Headers,
      asResponse: false,
    })
    .then((result) => {
      if (!(result?.session && result?.user)) {
        return null;
      }
      return result as AuthenticatedSession;
    })
    .catch(() => null);
}
