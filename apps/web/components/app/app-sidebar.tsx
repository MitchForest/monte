"use client";

import {
  CheckSquare,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  Home,
  Library,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { UserSettingsModal } from "@/components/app/user-settings-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { setAccessToken } from "@/lib/auth/token-store";
import { useAuthSafe } from "@/lib/auth/use-auth";
import { cn } from "@/lib/utils";

const routes = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/guide", label: "Guide", icon: User },
  { href: "/guide/my-class", label: "My class", icon: Users },
  { href: "/guide/digital-album", label: "Digital album", icon: Library },
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

const isMockMode =
  process.env.NEXT_PUBLIC_AUTH_MOCK === "true" ||
  (!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID &&
    process.env.NODE_ENV !== "production");

const mockUser = {
  email: process.env.NEXT_PUBLIC_DEV_USER_EMAIL ?? "guide@example.com",
  name: process.env.NEXT_PUBLIC_DEV_USER_NAME ?? "Guide User",
  image: null as string | null,
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuthSafe();
  const [isSigningOut, startSignOut] = useTransition();
  const { theme, setTheme } = useTheme();
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);

  const activeProfile = isMockMode
    ? mockUser
    : ((auth.user?.profile as {
        email?: string;
        name?: string;
        picture?: string;
        sub?: string;
      }) ?? null);

  const displayName =
    activeProfile?.name && activeProfile.name.trim().length > 0
      ? activeProfile.name
      : (activeProfile?.email ?? "User");
  const initials = getInitials(displayName);

  const avatarSrc = activeProfile
    ? "picture" in activeProfile && activeProfile.picture
      ? activeProfile.picture
      : "image" in activeProfile && activeProfile.image
        ? (activeProfile.image ?? undefined)
        : activeProfile.email
          ? `https://api.dicebear.com/7.x/micah/svg?seed=${activeProfile.email}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
          : undefined
    : undefined;

  const sidebarUser = activeProfile
    ? {
        id:
          "sub" in activeProfile && activeProfile.sub
            ? activeProfile.sub
            : (activeProfile.email ?? mockUser.email),
        email: activeProfile.email ?? mockUser.email,
        name: activeProfile.name ?? null,
        image:
          ("picture" in activeProfile && activeProfile.picture
            ? activeProfile.picture
            : "image" in activeProfile
              ? (activeProfile.image ?? null)
              : null) ?? null,
      }
    : null;

  const handleSignOut = () => {
    startSignOut(async () => {
      if (isMockMode) {
        setAccessToken(null);
        router.replace("/login");
        router.refresh();
        return;
      }

      try {
        const logoutUri =
          process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI ??
          (typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : undefined);

        await auth.signoutRedirect({
          post_logout_redirect_uri: logoutUri,
        });
        setAccessToken(null);
      } catch (_error) {
        toast.error("Unable to sign out.");
      }
    });
  };

  return (
    <Sidebar className="border-none" collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span
            className={cn(
              "font-brand text-3xl font-bold transition-all duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:scale-0",
            )}
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
                <AvatarImage alt={`${displayName}'s avatar`} src={avatarSrc} />
                <AvatarFallback className="bg-background text-primary font-semibold">
                  {initials}
                </AvatarFallback>
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
        user={sidebarUser}
      />
    </Sidebar>
  );
}
