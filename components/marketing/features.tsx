import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  ClipboardList,
  MessageSquareHeart,
  NotepadText,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Feature = {
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Observation studio",
    description:
      "Capture Montessori observations in seconds with prompts that mirror AMI language and pedagogy.",
    detail:
      "Guides collaborate in real time and auto-share highlights with families.",
    icon: NotepadText,
  },
  {
    title: "Prepared daily rhythm",
    description:
      "Plan work cycles, practical life rotations, and environments with reusable templates.",
    detail: "Alerts keep the team aligned without interruptive pings.",
    icon: CalendarClock,
  },
  {
    title: "Family storytelling",
    description:
      "Send beautiful photo journals and announcements that reinforce Montessori practice at home.",
    detail: "Every update respects privacy preferences and translations.",
    icon: MessageSquareHeart,
  },
  {
    title: "Whole-child analytics",
    description:
      "See progress by plane of development, materials, and executive function skills.",
    detail:
      "Spot trends early with gentle insights instead of dashboards built for factories.",
    icon: Sparkles,
  },
  {
    title: "Task orchestration",
    description:
      "Delegate follow-ups, prepare materials, and document meetings in one calm queue.",
    detail:
      "Integrates with the observations you already record—no duplicate entry.",
    icon: ClipboardList,
  },
  {
    title: "Community care",
    description:
      "Manage admissions, sibling notes, and staff onboarding with sensitive access controls.",
    detail: "SAML, two-factor, and audit trails keep admins confident.",
    icon: UsersRound,
  },
];

export function MarketingFeatures() {
  return (
    <section
      aria-labelledby="features"
      className="mx-auto mt-24 max-w-6xl px-4 md:px-6"
      id="features"
    >
      <div className="text-center">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.3em]">
          Product
        </p>
        <h2 className="mt-4 text-balance font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
          Everything your Montessori team needs in one gentle workspace
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Monte respects the cadence of Montessori classrooms with thoughtful
          workflows and calming interfaces your team will actually enjoy using.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              className="h-full rounded-3xl border border-border/70 bg-background/95 shadow-md"
              key={feature.title}
            >
              <CardHeader className="gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-full border border-border/80 bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="font-semibold text-xl">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {feature.detail}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
