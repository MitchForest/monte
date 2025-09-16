"use client";

import type { PropsWithChildren } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { AuthenticatedSession } from "@/lib/auth/session";

type AppShellProps = PropsWithChildren<{
  session: AuthenticatedSession;
}>;

export function AppShell({ session, children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar initialUser={session.user} />
      <SidebarRail />
      <SidebarInset className="bg-sidebar">
        <div className="flex min-h-svh flex-1 flex-col p-4 transition-colors md:p-8">
          <div className="flex h-full flex-col rounded-[2.5rem] border border-border/60 bg-card/95 text-card-foreground shadow-2xl">
            <div className="flex flex-1 flex-col rounded-[2.35rem] bg-card/80 p-4 md:p-8">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
