import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

type PageSearchParams = Record<string, string | string[]>;

function resolveRedirect(searchParams?: PageSearchParams): string | undefined {
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

type PageProps = {
  searchParams: Promise<PageSearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const redirectTo = resolveRedirect(resolvedParams);
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
