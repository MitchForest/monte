"use client";

import { AppPageHeader } from "@/components/app/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useActiveStudent } from "@/hooks/use-active-student";

export default function StudentCheckChartsPage() {
  const { student } = useActiveStudent("student-check-charts");
  const firstName = student?.full_name.split(" ").at(0) ?? "Learner";

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Check charts" },
        ]}
        description="Visual progress charts for Montessori subjects are on the way."
        title={`${firstName}'s check charts`}
      />

      <Card className="rounded-3xl border-dashed border-border/60 bg-card/70 p-10 text-center">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl font-semibold text-foreground">
            Coming soon
          </CardTitle>
          <CardDescription className="mx-auto max-w-lg text-sm text-muted-foreground">
            We are building interactive charts that map XP, habits, and lesson
            mastery across each Montessori area. Stay tuned!
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
