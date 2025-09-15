import { Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Tier = {
  name: string;
  price: string;
  description: string;
  cta: { label: string; href: string };
  features: string[];
  popular?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Essential",
    price: "$129",
    description:
      "Designed for smaller schools establishing their first centralized workflow.",
    cta: { label: "Start Essential", href: "/signup" },
    features: [
      "Unlimited observations",
      "Family journal and messaging",
      "Two classroom spaces",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$229",
    description:
      "Advanced analytics and automations for established Montessori environments.",
    cta: { label: "Choose Growth", href: "/signup" },
    features: [
      "All Essential features",
      "Progress insights and trends",
      "Task orchestration",
      "Priority community support",
    ],
    popular: true,
  },
  {
    name: "Network",
    price: "Let’s chat",
    description:
      "Tailored training and integrations for multi-campus Montessori communities.",
    cta: { label: "Talk to us", href: "/demo" },
    features: [
      "Dedicated success partner",
      "Custom reporting",
      "SIS & HRIS integrations",
      "Onsite implementation",
    ],
  },
];

export function MarketingPricing() {
  return (
    <section
      aria-labelledby="pricing"
      className="mx-auto mt-24 max-w-6xl px-4 md:px-6"
      id="pricing"
    >
      <div className="text-center">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.3em]">
          Pricing
        </p>
        <h2 className="mt-4 text-balance font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
          Fair, transparent plans that scale with your school
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Every plan includes easy onboarding, Montessori-aligned templates, and
          warm support from people who know classrooms.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            aria-label={`${tier.name} pricing tier`}
            className={`relative h-full rounded-3xl border border-border/70 bg-background/95 shadow-md ${tier.popular ? "outline outline-2 outline-primary/50" : ""}`}
            key={tier.name}
          >
            {tier.popular ? (
              <span className="absolute top-6 right-6 rounded-full bg-primary/15 px-3 py-1 font-medium text-primary text-xs">
                Most loved
              </span>
            ) : null}
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-baseline justify-between font-semibold text-2xl">
                <span>{tier.name}</span>
                <span className="text-lg text-muted-foreground">
                  {tier.price}
                </span>
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {tier.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {tier.features.map((feature) => (
                  <li className="flex items-start gap-3" key={feature}>
                    <Check className="mt-0.5 size-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                size="lg"
                variant={tier.popular ? "default" : "outline"}
              >
                <Link href={tier.cta.href}>{tier.cta.label}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
