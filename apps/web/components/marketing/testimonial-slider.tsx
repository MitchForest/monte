"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Testimonial = {
  name: string;
  quote: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Elena Morris",
    quote:
      "Monte's 2 Hour Learning model has transformed our upper elementary program. Students are thriving, and guides finally have the visibility they deserve.",
    role: "Head of School, Cascade Montessori Collective",
  },
  {
    name: "Jordan Lee",
    quote:
      "Our guides went from juggling spreadsheets to coaching children. Monte keeps everyone aligned without sacrificing the warmth families expect from Montessori.",
    role: "Executive Director, Riverlight Montessori",
  },
  {
    name: "Priya Desai",
    quote:
      "The analytics are gentle yet powerful. We can intervene early, celebrate mastery, and tell a compelling story to our board and families.",
    role: "Academic Lead, Montview Learning Community",
  },
];

export function TestimonialSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = testimonials.length;
  const currentTestimonial = testimonials[activeIndex];

  const goTo = (delta: number) => {
    setActiveIndex((previous) => {
      const next = (previous + delta + total) % total;
      return next;
    });
  };

  const handleSelect = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <Card className="flex h-full flex-col rounded-3xl border border-border/70 bg-muted/40 shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="font-semibold text-xl">
              Voices from Montessori leaders
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Hear how Monte supports authentic practice while accelerating
              student growth.
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button
              aria-label="Show previous testimonial"
              onClick={() => goTo(-1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              aria-label="Show next testimonial"
              onClick={() => goTo(1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <figure>
          <blockquote
            aria-live="polite"
            className="text-lg italic leading-relaxed text-foreground"
          >
            "{currentTestimonial.quote}"
          </blockquote>
          <figcaption className="mt-6 text-sm">
            <p className="font-medium text-foreground">
              {currentTestimonial.name}
            </p>
            <p className="text-muted-foreground">{currentTestimonial.role}</p>
          </figcaption>
        </figure>
        <p className="mt-6 text-muted-foreground text-sm">
          Schools with more than 100 students receive tailored onboarding and
          bulk pricing.{" "}
          <Link
            className="underline decoration-dotted underline-offset-4"
            href="/contact"
          >
            Contact us
          </Link>{" "}
          to design your rollout.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 sm:hidden">
            <Button
              aria-label="Show previous testimonial"
              onClick={() => goTo(-1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              aria-label="Show next testimonial"
              onClick={() => goTo(1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                aria-label={`Show testimonial ${index + 1} of ${total}`}
                aria-pressed={index === activeIndex}
                className={`size-2.5 rounded-full transition-colors ${index === activeIndex ? "bg-primary" : "bg-border"}`}
                key={testimonial.name}
                onClick={() => handleSelect(index)}
                type="button"
              >
                <span className="sr-only">{testimonial.name}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
