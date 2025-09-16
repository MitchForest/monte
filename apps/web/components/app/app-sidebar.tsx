"use client";

import {
  CheckSquare,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  Home,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserSettingsModal } from "@/components/app/user-settings-modal";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "@/lib/auth/errors";
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
  const { theme, setTheme } = useTheme();
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);

  const activeUser = sessionAtom.data?.user ?? initialUser;
  const displayName = activeUser
    ? activeUser.name?.trim() && activeUser.name.length > 0
      ? activeUser.name
      : activeUser.email
    : "User";
  const initials = getInitials(displayName);

  const handleSignOut = () => {
    startSignOut(async () => {
      try {
        await authClient.signOut();
        router.replace("/login");
        router.refresh();
      } catch (err) {
        const message = getAuthErrorMessage(err, "Unable to sign out.");
        toast.error(message);
      }
    });
  };

  return (
    <Sidebar className="border-none" collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span 
            className="text-3xl font-bold transition-all duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:scale-0" 
            style={{ fontFamily: "'DynaPuff', system-ui" }}
          >
            Monte
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
              type="button"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  alt={`${displayName}'s avatar`}
                  src={activeUser?.image || `https://api.dicebear.com/7.x/micah/svg?seed=${activeUser?.email || 'default'}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`}
                />
                <AvatarFallback className="bg-background text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col text-left">
                <span className="truncate font-medium text-sm leading-5">
                  {displayName}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setUserSettingsOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>User Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              disabled={isSigningOut}
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      
      <UserSettingsModal 
        onOpenChange={setUserSettingsOpen}
        open={userSettingsOpen} 
        user={activeUser}
      />
    </Sidebar>
  );
}
