"use client";

import {
  CheckSquare,
  ClipboardCheck,
  GraduationCap,
  Home,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/client";
import type { AuthenticatedSession } from "@/lib/auth/session";

const routes = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/classrooms", label: "Classrooms", icon: GraduationCap },
  { href: "/students", label: "Students", icon: Users },
  { href: "/observations", label: "Observations", icon: ClipboardCheck },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

function getInitials(name: string): string {
  const parts = name.split(" ").filter((part) => part.length > 0);
  if (parts.length === 0) {
    return name.slice(0, 2).toUpperCase();
  }
  const first = parts.at(0)?.slice(0, 1) ?? "";
  const last = parts.at(parts.length - 1)?.slice(0, 1) ?? "";
  return `${first}${last}`.toUpperCase();
}

type AppSidebarProps = {
  initialUser: AuthenticatedSession["user"] | null;
};

export function AppSidebar({ initialUser }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sessionAtom = authClient.useSession();
  const [isSigningOut, startSignOut] = useTransition();

  const activeUser = sessionAtom.data?.user ?? initialUser;
  const displayName = activeUser
    ? activeUser.name?.trim() && activeUser.name.length > 0
      ? activeUser.name
      : activeUser.email
    : "User";
  const initials = getInitials(displayName);

  const handleSignOut = () => {
    startSignOut(async () => {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <span className="font-semibold tracking-tight">Monte</span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => {
                const Icon = route.icon;
                const isActive = pathname === route.href;
                return (
                  <SidebarMenuItem key={route.href}>
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      href={route.href}
                    >
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={route.label}
                      >
                        <Icon />
                        <span>{route.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <Avatar>
            <AvatarImage
              alt={`${displayName}'s avatar`}
              src={activeUser?.image ?? undefined}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-sm leading-5">
              {displayName}
            </span>
            <span className="truncate text-muted-foreground text-xs">
              {activeUser?.email ?? ""}
            </span>
          </div>
        </div>
        <Button
          className="mt-2 w-full"
          disabled={isSigningOut}
          onClick={handleSignOut}
          variant="secondary"
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
