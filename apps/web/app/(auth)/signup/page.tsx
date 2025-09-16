import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
};

type PageProps = {
  searchParams?: Record<string, string | string[]>;
};

function resolveRedirect(
  searchParams?: Record<string, string | string[]>
): string | undefined {
  const raw = searchParams?.redirect;
  const redirect = Array.isArray(raw) ? raw.at(0) : raw;
  if (!redirect?.startsWith("/")) {
    return;
  }
  if (redirect.startsWith("//")) {
    return;
  }
  return redirect;
}

export default function Page({ searchParams }: PageProps) {
  const redirectTo = resolveRedirect(searchParams);
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
