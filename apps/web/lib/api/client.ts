const isServer = typeof window === "undefined";
const devApiBase = "http://localhost:8787";

function resolveApiBase() {
  if (isServer) {
    if (process.env.NODE_ENV === "production") {
      const apiUrl = process.env.RAILWAY_API_URL;
      if (!apiUrl) {
        throw new Error("RAILWAY_API_URL must be configured on the server");
      }
      return apiUrl;
    }
    return devApiBase;
  }
  return "/api";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = resolveApiBase();
  const normalized = path.startsWith("/api/") ? path.slice(4) : path;
  const relativePath = normalized.startsWith("/") ? normalized : `/${normalized}`;
  const target = `${base}${relativePath}`;

  const response = await fetch(target, {
    cache: "no-store",
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    credentials: isServer ? "omit" : "include",
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = (await response.json()) as { error?: unknown };
      if (typeof data?.error === "string") {
        message = data.error;
      }
    } catch {
      // ignore JSON parsing errors
    }
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
