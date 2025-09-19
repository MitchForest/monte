import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const stats = [
  {
    description: "Students place nationally on standardized assessments",
    value: "Top 1-2%",
  },
  {
    description: "Average academic growth rate compared to traditional schools",
    value: "6.5×",
  },
  {
    description: "Parent satisfaction score (Net Promoter Score)",
    value: "92%",
  },
];

export function MarketingHero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pt-10 sm:pt-16">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-border/70 bg-gradient-to-br from-card via-card/80 to-muted/60 px-6 py-16 text-center shadow-2xl sm:px-10 md:py-20">
        <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 font-medium text-primary text-sm">
          <Sparkles className="size-4" aria-hidden="true" />
          STAR ESA Approved Provider
        </span>
        <h1 className="mt-6 text-balance font-semibold text-4xl text-foreground tracking-tight sm:text-5xl md:text-6xl">
          The Platform for Modern Montessori
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Monte is the technology platform that brings AI-powered 2 Hour
          Learning into the Montessori classroom.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/demo">Book Demo</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
        <dl className="mt-12 grid gap-4 text-left sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              className="rounded-3xl border border-border/80 bg-background/70 p-6 shadow-sm backdrop-blur"
              key={stat.value}
            >
              <dt className="text-muted-foreground text-sm">
                {stat.description}
              </dt>
              <dd className="mt-2 font-semibold text-3xl tracking-tight">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
