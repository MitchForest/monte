"use client";

import { AppPageHeader } from "@/components/app/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useActiveStudent } from "@/hooks/use-active-student";

export default function StudentAppStorePage() {
  const { student } = useActiveStudent("student-app-store");
  const firstName = student?.full_name.split(" ").at(0) ?? "Learner";

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Home", href: "/home" }, { label: "App store" }]}
        description="Discover curated Montessori-aligned learning apps."
        title={`${firstName}'s app store`}
      />

      <Card className="rounded-3xl border-dashed border-border/60 bg-card/70 p-10 text-center">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl font-semibold text-foreground">
            Coming soon
          </CardTitle>
          <CardDescription className="mx-auto max-w-lg text-sm text-muted-foreground">
            Guides are assembling a marketplace of Timeback apps and Montessori
            extensions so learners can explore new work soon.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
