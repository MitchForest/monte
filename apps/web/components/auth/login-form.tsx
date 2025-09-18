"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthSafe } from "@/lib/auth/use-auth";

const isMockMode =
  process.env.NEXT_PUBLIC_AUTH_MOCK === "true" ||
  (!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID &&
    process.env.NODE_ENV !== "production");

const DEFAULT_REDIRECT = "/home";

type LoginFormProps = {
  redirectTo?: string;
  className?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const auth = useAuthSafe();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const destination = redirectTo ?? DEFAULT_REDIRECT;
    if (isMockMode) {
      router.replace(destination);
      return;
    }

    if (auth.isAuthenticated) {
      const storedRedirect = (
        auth.user?.state as { redirectTo?: string } | undefined
      )?.redirectTo;
      router.replace(storedRedirect ?? destination);
      return;
    }

    if (!auth.isLoading && !auth.activeNavigator && !auth.isAuthenticated) {
      auth
        .signinRedirect({
          state: { redirectTo: destination },
        })
        .catch(() => {
          setError("Unable to start sign-in. Please try again later.");
        });
    }
  }, [auth, redirectTo, router]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Signing you in…</h1>
        <p className="text-muted-foreground">
          {error ?? "You'll be redirected to the Timeback sign-in page."}
        </p>
      </div>
    </div>
  );
}
