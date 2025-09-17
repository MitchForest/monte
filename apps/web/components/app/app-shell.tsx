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
