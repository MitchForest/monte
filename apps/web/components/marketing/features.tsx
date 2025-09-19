"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AudienceHighlight = {
  description: string;
  title: string;
};

const guideHighlights: AudienceHighlight[] = [
  {
    description:
      "Realtime mastery insights that surface strengths, gaps, and growth trends for every child.",
    title: "Student Tracking",
  },
  {
    description:
      "Plan blended work cycles with reusable templates aligned to your environments and materials.",
    title: "Lesson Planning",
  },
  {
    description:
      "Capture observations with Montessori language prompts and shareable notes in seconds.",
    title: "Observations",
  },
  {
    description:
      "Assign follow-ups, prep materials, and coordinate staff tasks from a single calm queue.",
    title: "Tasks Management",
  },
  {
    description:
      "Explore the complete Montessori curriculum with scope, sequence, and multi-age guidance.",
    title: "Full Curriculum",
  },
  {
    description:
      "Send beautiful updates and announcements that reinforce the prepared environment at home.",
    title: "Parent Communications",
  },
];

const studentHighlights: AudienceHighlight[] = [
  {
    description:
      "Adaptive presentations that honor choice and keep learners in productive flow states.",
    title: "Personalized, AI-powered learning",
  },
  {
    description:
      "Self-directed menus that complement hands-on materials and respect Montessori autonomy.",
    title: "Independent, self-guided exploration",
  },
  {
    description:
      "Motivation loops rooted in learning science that celebrate effort, mastery, and curiosity.",
    title: "Learning science-backed motivation model",
  },
  {
    description:
      "Monte learners gain roughly twice the academic growth of peers in just two focused hours a day.",
    title: "Learn 2× as fast as peers in two hours per day",
  },
];

export function MarketingFeatures() {
  const [activeTab, setActiveTab] = useState("guides");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateFromHash = () => {
      const { hash } = window.location;
      if (hash === "#students") {
        setActiveTab("students");
      } else if (hash === "#guides") {
        setActiveTab("guides");
      }
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);
    return () => {
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window === "undefined") {
      return;
    }

    const hash = value === "students" ? "#students" : "#guides";
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}${hash}`);
  };

  return (
    <section
      aria-labelledby="community-heading"
      className="mx-auto mt-24 max-w-6xl px-4 md:px-6"
      id="guides"
    >
      <div className="text-center">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.3em]">
          Community
        </p>
        <h2
          className="mt-4 text-balance font-semibold text-3xl text-foreground tracking-tight sm:text-4xl"
          id="community-heading"
        >
          Tools that honor Montessori guides and inspire students
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Monte delivers a complete curriculum, actionable analytics, and joyful
          learning experiences without replacing the prepared environment.
        </p>
      </div>
      <Tabs className="mt-12" onValueChange={handleTabChange} value={activeTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid w-full grid-cols-2 gap-2 sm:w-auto">
            <TabsTrigger value="guides">For Guides</TabsTrigger>
            <TabsTrigger value="students">For Students</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground sm:max-w-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 font-medium text-primary text-xs">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Montessori-aligned delivery
            </span>
            <p className="mt-3">
              Switch between perspectives to see how Monte supports guides and
              students without disrupting the prepared environment.
            </p>
          </div>
        </div>
        <TabsContent value="guides">
          <Card className="rounded-3xl border border-border/70 bg-background/95 shadow-md">
            <CardHeader className="space-y-3">
              <CardTitle className="font-semibold text-2xl">
                Prepared guides
              </CardTitle>
              <p className="text-base text-muted-foreground">
                A calm workspace that keeps teams coordinated, compliant, and
                centered on each child.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {guideHighlights.map((item) => (
                  <li
                    className="flex gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3"
                    key={item.title}
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 size-5 text-primary"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="students" id="students">
          <Card className="rounded-3xl border border-border/70 bg-background/95 shadow-md">
            <CardHeader className="space-y-3">
              <CardTitle className="font-semibold text-2xl">
                Inspired students
              </CardTitle>
              <p className="text-base text-muted-foreground">
                Digital work choices that respect autonomy, fund intrinsic
                motivation, and accelerate growth.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {studentHighlights.map((item) => (
                  <li
                    className="flex gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3"
                    key={item.title}
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 size-5 text-primary"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
