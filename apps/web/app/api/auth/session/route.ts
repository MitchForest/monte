import { MONTE_SESSION_COOKIE } from "@monte/shared/auth";
import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60; // Cognito access tokens are typically 1 hour

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = 4 - (normalized.length % 4 || 4);
  const padded =
    padding === 4 ? normalized : `${normalized}${"=".repeat(padding)}`;
  return Buffer.from(padded, "base64").toString("utf8");
}

function resolveMaxAgeSeconds(token: string): number {
  const [, payload] = token.split(".");
  if (!payload) {
    return DEFAULT_MAX_AGE_SECONDS;
  }

  try {
    const json = decodeBase64Url(payload);
    const parsed = JSON.parse(json) as { exp?: number };
    if (typeof parsed.exp !== "number") {
      return DEFAULT_MAX_AGE_SECONDS;
    }
    const expiresInSeconds = Math.floor(parsed.exp - Date.now() / 1000);
    if (!Number.isFinite(expiresInSeconds)) {
      return DEFAULT_MAX_AGE_SECONDS;
    }
    return Math.max(0, expiresInSeconds);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Failed to parse access token payload: ${message}\n`);
    return DEFAULT_MAX_AGE_SECONDS;
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    token?: unknown;
  } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const maxAge = resolveMaxAgeSeconds(token);
  if (maxAge <= 0) {
    return NextResponse.json({ error: "token is expired" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: MONTE_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return response;
}

export function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: MONTE_SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
