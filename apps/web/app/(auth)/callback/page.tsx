"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

const isMockMode =
  process.env.NEXT_PUBLIC_AUTH_MOCK === "true" ||
  (!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID &&
    process.env.NODE_ENV !== "production");

export default function CallbackPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isMockMode) {
      router.replace("/home");
      return;
    }

    if (!auth.isLoading && auth.isAuthenticated) {
      const storedRedirect = (
        auth.user?.state as { redirectTo?: string } | undefined
      )?.redirectTo;
      router.replace(storedRedirect ?? "/home");
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, router]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Completing sign-in…</h1>
        <p className="text-muted-foreground">
          Please wait while we finish connecting to Timeback.
        </p>
      </div>
    </div>
  );
}
