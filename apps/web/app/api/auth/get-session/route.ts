import { MONTE_SESSION_COOKIE } from "@monte/shared/auth";
import { type NextRequest, NextResponse } from "next/server";

import { getServerApiBaseUrl } from "@/lib/env";

export async function GET(request: NextRequest) {
  const apiBaseUrl = getServerApiBaseUrl();

  try {
    const sessionToken =
      request.cookies.get(MONTE_SESSION_COOKIE)?.value ?? null;
    const headers: HeadersInit = {};
    if (sessionToken) {
      headers.authorization = `Bearer ${sessionToken}`;
    }

    const response = await fetch(`${apiBaseUrl}/current-user`, {
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      return NextResponse.json(
        { session: null, user: null },
        { status: response.status },
      );
    }

    const payload = (await response.json()) as unknown;
    if (
      !payload ||
      typeof payload !== "object" ||
      !("data" in payload) ||
      typeof (payload as Record<string, unknown>).data !== "object"
    ) {
      return NextResponse.json({ session: null, user: null }, { status: 200 });
    }

    return NextResponse.json({
      session: (payload as { data: unknown }).data,
      user: (payload as { data: { user?: unknown } }).data.user ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { session: null, user: null, error: message },
      { status: 500 },
    );
  }
}
