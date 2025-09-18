"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoginForm } from "@/components/auth/login-form";

const isMockMode =
  process.env.NEXT_PUBLIC_AUTH_MOCK === "true" ||
  (!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID &&
    process.env.NODE_ENV !== "production");

const DEFAULT_REDIRECT = "/home";

type SignupFormProps = {
  redirectTo?: string;
};

export function SignupForm({ redirectTo }: SignupFormProps) {
  const router = useRouter();

  useEffect(() => {
    if (isMockMode) {
      router.replace(redirectTo ?? DEFAULT_REDIRECT);
    }
  }, [redirectTo, router]);

  return <LoginForm redirectTo={redirectTo} />;
}
