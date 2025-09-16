import { AppPageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const observationQueue = [
  {
    child: "Samira",
    focus: "Sensorial • Number rods",
    status: "Ready to share with family",
  },
  {
    child: "Eli",
    focus: "Practical life • Flower arranging",
    status: "Awaiting guide reflection",
  },
  {
    child: "Noor",
    focus: "Language • Moveable alphabet",
    status: "Tagged for conference",
  },
];

const templates = [
  "Toddler practical life moment",
  "Primary cosmic spark",
  "Elementary work journal",
];

export default function ObservationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Observations" },
        ]}
        description="Capture Montessori-aligned records and keep families in the loop."
        primaryAction={{
          label: "Record observation",
          href: "/observations/new",
        }}
        searchPlaceholder="Search observations"
        title="Observation studio"
      />

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card className="rounded-3xl border-border/60 bg-card/90 shadow-md">
          <CardHeader>
            <CardTitle className="font-semibold text-xl">
              Today’s queue
            </CardTitle>
            <CardDescription>
              Finish reflections and share highlights when you are ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-muted-foreground text-sm">
              {observationQueue.map((item) => (
                <li
                  className="rounded-2xl border border-border/40 bg-background/80 p-4"
                  key={item.child}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">
                      {item.child}
                      <span className="ml-2 text-muted-foreground text-xs uppercase tracking-[0.22em]">
                        {item.focus}
                      </span>
                    </p>
                    <span className="text-xs uppercase tracking-[0.22em]">
                      {item.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-card/90 shadow-md">
          <CardHeader>
            <CardTitle className="font-semibold text-xl">Templates</CardTitle>
            <CardDescription>
              Start from Montessori-aligned prompts tailored to each plane.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground text-sm">
              {templates.map((template) => (
                <li
                  className="rounded-2xl border border-border/40 bg-background/80 px-4 py-3"
                  key={template}
                >
                  <span className="font-medium text-foreground">
                    {template}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
