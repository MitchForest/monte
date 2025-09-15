export type Session = {
  userId: string;
  orgId: string;
};

function _parseCookie(_name: string): string | null {
  if (typeof document !== "undefined") {
    return null; // server only
  }
  return null;
}

export function getServerSession(): Promise<Session | null> {
  // Dev fallback: read from env vars to unblock API testing
  const userId = process.env.DEV_USER_ID;
  const orgId = process.env.DEV_ORG_ID;
  if (userId && orgId) {
    return Promise.resolve({ userId, orgId });
  }
  return Promise.resolve(null);
}
