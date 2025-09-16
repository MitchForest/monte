import { AppPageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    label: "Active classrooms",
    value: "6",
    hint: "Across primary and toddler",
  },
  {
    label: "Family response rate",
    value: "94%",
    hint: "Last 7 days",
  },
  {
    label: "Observations logged",
    value: "128",
    hint: "This work cycle",
  },
];

const highlights = [
  {
    title: "Grace & courtesy walk",
    detail: "Primary West • Shared with families 2 hours ago",
  },
  {
    title: "New practical life shelf ready",
    detail: "Toddler Bridge • Checklist completed",
  },
  {
    title: "Prospective family visit",
    detail: "Admissions • Tomorrow at 9:00 AM",
  },
];

const familyMetrics = [
  { label: "Story views", value: "312" },
  { label: "Positive replies", value: "87" },
  { label: "Awaiting responses", value: "9" },
];

export default function AppHomePage() {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Home", href: "/home" }, { label: "Overview" }]}
        description="Monitor how your Montessori environments are progressing today."
        primaryAction={{ label: "Log observation", href: "/observations/new" }}
        searchPlaceholder="Search students, families, or notes"
        title="Monte overview"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card
            className="rounded-3xl border-border/60 bg-card/90 shadow-md"
            key={stat.label}
          >
            <CardHeader className="space-y-3">
              <CardDescription className="text-muted-foreground text-sm">
                {stat.label}
              </CardDescription>
              <CardTitle className="font-semibold text-3xl tracking-tight">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              {stat.hint}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card className="rounded-3xl border-border/60 bg-card/90 shadow-md">
          <CardHeader>
            <CardTitle className="font-semibold text-xl">
              Today’s focus
            </CardTitle>
            <CardDescription>
              Key reminders curated from observations, tasks, and admissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-muted-foreground text-sm">
              {highlights.map((item) => (
                <li
                  className="rounded-2xl border border-border/40 bg-background/80 p-4"
                  key={item.title}
                >
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em]">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-card/90 shadow-md">
          <CardHeader>
            <CardTitle className="font-semibold text-xl">
              Family heartbeat
            </CardTitle>
            <CardDescription>
              A snapshot of how families are engaging with your stories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-muted-foreground text-sm">
              {familyMetrics.map((metric) => (
                <div
                  className="flex items-baseline justify-between rounded-2xl border border-border/40 bg-background/70 p-4"
                  key={metric.label}
                >
                  <span className="font-medium text-foreground">
                    {metric.label}
                  </span>
                  <span className="font-semibold text-foreground text-lg">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
