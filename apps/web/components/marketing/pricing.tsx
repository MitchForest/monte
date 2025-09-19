import Link from "next/link";
import { TestimonialSlider } from "@/components/marketing/testimonial-slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const inclusions = [
  "AI-Powered 2 Hour Learning",
  "Full Montessori Curriculum",
  "Classroom Management Tools",
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
          One simple plan for schools of every size
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Transparent pricing that covers the entire experience, from curriculum
          and AI copilots to family communication and support.
        </p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="rounded-3xl border border-border/70 bg-background/95 shadow-md">
          <CardHeader className="space-y-4">
            <CardTitle className="font-semibold text-2xl">
              Monte Platform License
            </CardTitle>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-foreground">
                $5,000
              </span>
              <span className="text-muted-foreground text-sm">
                per student per year
              </span>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              Every classroom receives onboarding, ongoing success coaching, and
              access to the full library of Montessori-aligned lessons.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground text-sm">
              {inclusions.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/demo">Book Demo</Link>
            </Button>
            <span className="text-muted-foreground text-xs">
              *Excludes physical materials and classroom hardware.
            </span>
          </CardFooter>
        </Card>
        <TestimonialSlider />
      </div>
    </section>
  );
}
