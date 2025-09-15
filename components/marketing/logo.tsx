import Link from "next/link";

import { cn } from "@/lib/utils";

type MarketingLogoProps = {
  className?: string;
};

export function MarketingLogo({ className }: MarketingLogoProps) {
  return (
    <Link
      aria-label="Return to Monte home"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold text-sm",
        className
      )}
      href="/"
    >
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary shadow-sm">
        <span className="font-semibold text-base">M</span>
      </span>
      <span className="text-foreground tracking-tight">Monte</span>
    </Link>
  );
}
