import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const stats = [
  { label: "Family joy score", value: "97%" },
  { label: "Observations logged weekly", value: "2.3×" },
  { label: "Hours saved per guide", value: "4.5" },
];

export function MarketingHero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pt-10 sm:pt-16">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-border/70 bg-gradient-to-br from-card via-card/80 to-muted/60 px-6 py-16 text-center shadow-2xl sm:px-10 md:py-20">
        <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 font-medium text-primary text-sm">
          <Sparkles className="size-4" />
          Built with Montessori guides
        </span>
        <h1 className="mt-6 text-balance font-semibold text-4xl text-foreground tracking-tight sm:text-5xl md:text-6xl">
          Calm, coordinated classrooms without the busywork
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Monte brings together observations, tasking, and family communication
          so every guide can focus on the child. Designed for schools that value
          warmth, trust, and flow.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">
              Start free trial
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/demo">Book a walkthrough</Link>
          </Button>
        </div>
        <dl className="mt-12 grid gap-4 text-left sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              className="rounded-3xl border border-border/80 bg-background/70 p-6 shadow-sm backdrop-blur"
              key={stat.label}
            >
              <dt className="text-muted-foreground text-sm">{stat.label}</dt>
              <dd className="mt-2 font-semibold text-3xl tracking-tight">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-[2rem] border border-border/60 bg-background/70 p-4 shadow-xl backdrop-blur">
          <div className="-z-10 absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-accent/20" />
          <Image
            alt="Preview of the Monte classroom workspace"
            className="w-full rounded-[1.5rem] border border-border/70 shadow-lg"
            height={640}
            priority
            src="/window.svg"
            width={1280}
          />
        </div>
      </div>
    </section>
  );
}
