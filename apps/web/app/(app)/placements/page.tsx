"use client";

import { AppPageHeader } from "@/components/app/page-header";
import { StudentPlacementsPanel } from "@/components/app/students/student-placements-panel";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveStudent } from "@/hooks/use-active-student";

export default function StudentPlacementsPage() {
  const { activeStudentId, student, isLoading, isError } =
    useActiveStudent("student-placements");

  const timebackStudentId = student?.oneroster_user_id ?? student?.id ?? null;
  const firstName = student?.full_name.split(" ").at(0) ?? "Learner";

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Placements" },
        ]}
        description="Monitor PowerPath mastery levels and upcoming placement tests."
        title={`${firstName}'s placements`}
      />

      {isLoading ? (
        <Skeleton className="h-[28rem] w-full rounded-3xl" />
      ) : isError ? (
        <Card className="rounded-3xl border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Unable to load placement data
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Try refreshing. If the issue persists, reach out to your guide or
              administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !activeStudentId || !student ? (
        <Card className="rounded-3xl border-border/60 bg-card/80 p-10 text-center">
          <CardTitle className="text-xl font-semibold text-foreground">
            No learners available
          </CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Once a learner is assigned to you, placement readiness details will
            show up here.
          </CardDescription>
        </Card>
      ) : !timebackStudentId ? (
        <Card className="rounded-3xl border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Placements not connected yet
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              This learner does not have an active Timeback roster link. Ask
              your administrator to complete the OneRoster connection.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <StudentPlacementsPanel studentId={timebackStudentId} />
      )}
    </div>
  );
}
