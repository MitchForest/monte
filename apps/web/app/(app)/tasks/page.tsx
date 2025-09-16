import { AppPageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const taskGroups = [
  {
    title: "Prepared environment",
    items: [
      "Rotate sensorial shelf",
      "Refresh toddler snack baskets",
      "Inspect bead chains",
    ],
  },
  {
    title: "Family follow-ups",
    items: [
      "Send Maya P. observation",
      "Confirm conference availability with the Lopez family",
      "Share toddler settling guide",
    ],
  },
];

export default function TasksPage() {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Home", href: "/home" }, { label: "Tasks" }]}
        description="Coordinate work seamlessly between guides, admins, and families."
        primaryAction={{ label: "Add task", href: "/tasks/new" }}
        searchPlaceholder="Search tasks or owners"
        title="Task orchestration"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {taskGroups.map((group) => (
          <Card
            className="rounded-3xl border-border/60 bg-card/90 shadow-md"
            key={group.title}
          >
            <CardHeader>
              <CardTitle className="font-semibold text-xl">
                {group.title}
              </CardTitle>
              <CardDescription>
                {group.title === "Prepared environment"
                  ? "Ready the classroom for tomorrow’s cycle."
                  : "Keep families supported and informed."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {group.items.map((item) => (
                  <li
                    className="rounded-2xl border border-border/40 bg-background/80 px-4 py-3"
                    key={item}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
