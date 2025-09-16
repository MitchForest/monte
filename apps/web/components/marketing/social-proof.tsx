import { Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const partners = [
  "Sunfield Montessori",
  "Bright Fern Schools",
  "Cedar Grove Collective",
  "Montessori of the Sound",
];

export function MarketingSocialProof() {
  return (
    <section
      aria-labelledby="testimonials"
      className="mx-auto mt-24 max-w-6xl px-4 md:px-6"
      id="testimonials"
    >
      <div className="rounded-[2rem] border border-border/80 bg-card px-6 py-12 shadow-xl sm:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.3em]">
              Trusted across Montessori communities
            </p>
            <h2 className="text-balance font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
              Guides reclaim their time, families feel the warmth
            </h2>
            <p className="text-lg text-muted-foreground">
              Monte orchestrates the full rhythm of your classroom—from
              observations and record keeping to family storytelling—without
              sacrificing the human touch.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-medium text-muted-foreground text-sm">
              {partners.map((partner) => (
                <span
                  className="rounded-full border border-border/50 bg-background/60 px-4 py-2"
                  key={partner}
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
          <Card className="max-w-md rounded-[1.75rem] border-border/70 bg-background/90 shadow-lg">
            <CardHeader className="gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback>MP</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="font-semibold text-base">
                    Maya Patel
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Head of School, Sunfield Montessori
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1 text-primary">
                {["first", "second", "third", "fourth", "fifth"].map((item) => (
                  <Star className="size-4 fill-current" key={item} />
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-base text-muted-foreground leading-relaxed">
              <p>
                “Monte has been transformative. Our guides document more, our
                families feel in the loop, and I finally have visibility into
                every classroom without chasing spreadsheets.”
              </p>
            </CardContent>
            <CardFooter className="text-muted-foreground text-sm">
              <span>Montessori network partner since 2022</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
