import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);
const AUTH_ROUTES = new Set(["/login", "/signup"]);

async function getSession(request: NextRequest): Promise<boolean> {
  try {
    const response = await fetch(
      new URL("/api/auth/get-session", request.url),
      {
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      return false;
    }
    const payload = await response.json().catch(() => null);
    return Boolean(payload?.session && payload?.user);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  if (pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;
  if (normalizedPath === "/") {
    const hasSession = await getSession(request);
    if (hasSession) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.has(normalizedPath);
  const isAuthRoute = AUTH_ROUTES.has(normalizedPath);
  const shouldCheckSession = isAuthRoute || !isPublicRoute;

  if (!shouldCheckSession) {
    return NextResponse.next();
  }

  const hasSession = await getSession(request);

  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthRoute) {
    const homeUrl = new URL("/home", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
