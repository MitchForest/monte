"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import type { ChangeEvent, ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type BreadcrumbEntry = {
  label: string;
  href?: string;
};

type AppPageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbEntry[];
  className?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  onSearchChange?: (value: string) => void;
  children?: ReactNode;
};

export function AppPageHeader({
  title,
  description,
  breadcrumbs,
  className,
  primaryAction,
  searchPlaceholder = "Search",
  searchAriaLabel = "Search",
  onSearchChange,
  children,
}: AppPageHeaderProps) {
  const hasBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 0);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(event.currentTarget.value);
    }
  };

  return (
    <div className={cn("sticky top-0 z-10 flex flex-col gap-6 bg-background border-b border-border/40 -mx-4 -mt-4 px-4 pt-4 pb-4 mb-6 md:-mx-8 md:-mt-8 md:px-8 md:pt-8 md:pb-6 md:mb-8", className)}>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-4 w-4" />
        {hasBreadcrumbs ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs?.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <BreadcrumbItem key={`${crumb.label}-${index}`}>
                    {crumb.href && !isLast ? (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                    {isLast ? null : <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-balance font-semibold text-3xl text-foreground tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search
              aria-hidden="true"
              className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
            />
            <Input
              aria-label={searchAriaLabel}
              className="pl-9"
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              type="search"
            />
          </div>
          {primaryAction ? (
            primaryAction.href ? (
              <Button asChild className="shrink-0">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            ) : (
              <Button
                className="shrink-0"
                onClick={primaryAction.onClick}
                type="button"
              >
                {primaryAction.label}
              </Button>
            )
          ) : null}
        </div>
      </div>

      {children}
    </div>
  );
}
