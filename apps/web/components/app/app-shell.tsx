"use client";

import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

import { AppSidebar } from "@/components/app/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";

const isMockMode =
  process.env.NEXT_PUBLIC_AUTH_MOCK === "true" ||
  (!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID &&
    process.env.NODE_ENV !== "production");

type AppShellProps = PropsWithChildren;

export function AppShell({ children }: AppShellProps) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isMockMode) {
      return;
    }
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator) {
      router.replace("/login");
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, router]);

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarRail />
      <SidebarInset className="bg-primary">
        <div className="flex h-screen flex-col p-2 md:p-3">
          <div className="flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-background text-foreground">
            <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
