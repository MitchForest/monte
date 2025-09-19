"use client";

type SyncOptions = {
  signal?: AbortSignal;
};

export async function syncSessionCookie(
  token: string | null,
  options: SyncOptions = {},
): Promise<void> {
  const method = token ? "POST" : "DELETE";
  const init: RequestInit = {
    method,
    signal: options.signal,
  };

  if (token) {
    init.headers = {
      "content-type": "application/json",
    };
    init.body = JSON.stringify({ token });
  }

  try {
    await fetch("/api/auth/session", init);
  } catch (error) {
    // Swallow network errors so auth flows don't break the UI
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to synchronise session cookie", error);
    }
  }
}
