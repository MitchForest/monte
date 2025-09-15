"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { MarketingLogo } from "./logo";

const navigation = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "#testimonials", label: "Stories" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-transparent border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <MarketingLogo className="rounded-full px-2 py-1" />

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/login"
          >
            Sign in
          </Link>
          <Button asChild size="lg">
            <Link href="/signup">Start free trial</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              aria-label="Toggle navigation"
              className="md:hidden"
              size="icon"
              type="button"
              variant="ghost"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="border-border/60 border-b pb-4">
              <SheetTitle>
                <MarketingLogo />
              </SheetTitle>
            </SheetHeader>
            <nav
              aria-label="Mobile"
              className="flex flex-col gap-4 px-4 pt-6 text-lg"
            >
              {navigation.map((item) => (
                <Link
                  className="rounded-lg px-2 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <SheetFooter className="px-4 pt-4 pb-6">
              <div className="flex flex-col gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">Start free trial</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
