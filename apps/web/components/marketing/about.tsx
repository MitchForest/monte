import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dayRhythm = [
  {
    description:
      "Guided by Monte's AI copilots, students complete a personalized sequence across math, literacy, and executive function. Guides see mastery in real time without interrupting the work cycle.",
    title: "2 Hour Learning session",
  },
  {
    description:
      "Learners rotate back into materials, practical life, and outdoor work. Monte's recommendations surface exactly which presentations to offer and which follow ups to observe.",
    title: "Montessori work cycle",
  },
  {
    description:
      "Guides capture observations with Montessori language prompts, update tasks, and send families meaningful stories that reinforce independence at home.",
    title: "Reflection and storytelling",
  },
];

const integrationMoments = [
  {
    description:
      "Monte front-loads personalized skills practice so guides can prioritize hands-on presentations and movement for the remainder of the day.",
    title: "Digital focus without drift",
  },
  {
    description:
      "Every recommendation aligns to the materials you own and the scope and sequence you follow, keeping Montessori methodology intact.",
    title: "Aligned with your shelves",
  },
  {
    description:
      "Leadership sees growth trends and family engagement with calm dashboards, while guides stay grounded in the room.",
    title: "Visibility for the whole community",
  },
];

export function MarketingAbout() {
  return (
    <section
      aria-labelledby="about-heading"
      className="mx-auto mt-24 max-w-6xl px-4 md:px-6"
      id="about"
    >
      <div className="text-center">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.3em]">
          About Monte
        </p>
        <h2
          className="mt-4 text-balance font-semibold text-3xl text-foreground tracking-tight sm:text-4xl"
          id="about-heading"
        >
          Two hours of personalized learning, a full day of Montessori harmony
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
          Monte layers a focused digital experience into the work cycle so
          students master foundational skills quickly, then dive back into
          hands-on, self-directed Montessori practice with confidence.
        </p>
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.9fr]">
        <Card className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/95 shadow-md">
          <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 px-8 py-10">
              <h3 className="font-semibold text-xl text-foreground">
                How a Monte day flows
              </h3>
              <p className="text-base text-muted-foreground">
                Monte adds a focused digital block that equips every student
                with the core skills needed to thrive. The rest of the day stays
                rooted in the prepared environment, now informed by live
                insights instead of clipboards.
              </p>
              <ol className="space-y-4">
                {dayRhythm.map((item, index) => (
                  <li className="flex gap-4" key={item.title}>
                    <span className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-primary/10 font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div className="space-y-1.5">
                      <p className="font-medium text-foreground text-base">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative hidden min-h-[340px] overflow-hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-emerald-100/30" />
              <div className="absolute inset-6 rounded-3xl border border-border/60 bg-background/70 backdrop-blur" />
              <div className="absolute left-8 top-8 space-y-6">
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm shadow-sm">
                  Morning focus block - 2 hours
                </div>
                <div className="rounded-2xl border border-border/50 bg-background px-4 py-3 text-sm shadow-sm">
                  Guides receive live lesson prompts
                </div>
                <div className="rounded-2xl border border-border/50 bg-background px-4 py-3 text-sm shadow-sm">
                  Afternoon Montessori work led by students
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card className="rounded-[1.75rem] border border-border/70 bg-card/90 shadow-md">
          <CardHeader>
            <CardTitle className="font-semibold text-xl">
              How Monte complements your work cycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted-foreground">
            {integrationMoments.map((moment) => (
              <div
                className="rounded-2xl border border-border/70 bg-background/90 px-4 py-4"
                key={moment.title}
              >
                <p className="font-medium text-foreground text-base">
                  {moment.title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {moment.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-10 rounded-[1.75rem] border border-border/70 bg-background/95 px-8 py-10 shadow-md">
        <CardHeader className="px-0">
          <CardTitle className="font-semibold text-2xl text-foreground">
            Why Montessori leaders choose Monte
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 text-sm text-muted-foreground md:grid-cols-3 md:gap-8">
          <div>
            <h3 className="font-medium text-foreground text-base">
              Authentic methodology first
            </h3>
            <p className="mt-2">
              Monte enhances, not replaces, the materials, guides, and
              independence that define authentic Montessori.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground text-base">
              Visibility without disruption
            </h3>
            <p className="mt-2">
              Guides capture observations in the moment, leadership sees growth,
              and families stay connected to the classroom story.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground text-base">
              Student-led afternoons
            </h3>
            <p className="mt-2">
              With core skills covered in two calm hours, the rest of the day
              returns to child-led exploration, practical life, and movement.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
