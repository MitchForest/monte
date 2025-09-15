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
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const routes = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/classrooms", label: "Classrooms", icon: GraduationCap },
  { href: "/students", label: "Students", icon: Users },
  { href: "/observations", label: "Observations", icon: ClipboardCheck },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

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
              {routes.map((r) => {
                const Icon = r.icon;
                const isActive = pathname === r.href;
                return (
                  <SidebarMenuItem key={r.href}>
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      href={r.href}
                    >
                      <SidebarMenuButton isActive={isActive} tooltip={r.label}>
                        <Icon />
                        <span>{r.label}</span>
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
            <AvatarImage alt="User avatar" src={"/avatar.png"} />
            <AvatarFallback>SS</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-sm leading-5">
              Sofia Safier
            </span>
            <span className="truncate text-muted-foreground text-xs">
              sofia@example.com
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
