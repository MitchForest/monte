"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { isMockAuthMode } from "@/lib/auth/config";

const isMockMode = isMockAuthMode;

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
