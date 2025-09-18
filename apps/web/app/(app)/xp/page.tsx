"use client";

import { AppPageHeader } from "@/components/app/page-header";
import { StudentXpPanel } from "@/components/app/students/student-xp-panel";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveStudent } from "@/hooks/use-active-student";

export default function StudentXpPage() {
  const { activeStudentId, student, isLoading, isError } =
    useActiveStudent("student-xp");

  const timebackStudentId = student?.oneroster_user_id ?? student?.id ?? null;
  const firstName = student?.full_name.split(" ").at(0) ?? "Learner";

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Home", href: "/home" }, { label: "XP" }]}
        description="Review Timeback progress rings and event history."
        title={`${firstName}'s XP`}
      />

      {isLoading ? (
        <Skeleton className="h-[28rem] w-full rounded-3xl" />
      ) : isError ? (
        <Card className="rounded-3xl border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Unable to load XP data
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Please refresh the page or contact your guide if this keeps
              happening.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !activeStudentId || !student ? (
        <Card className="rounded-3xl border-border/60 bg-card/80 p-10 text-center">
          <CardTitle className="text-xl font-semibold text-foreground">
            No learners available
          </CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Once a learner is assigned to you, their XP insights will appear
            here.
          </CardDescription>
        </Card>
      ) : !timebackStudentId ? (
        <Card className="rounded-3xl border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              XP data not connected
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              We could not find a Timeback connection for this learner. Reach
              out to your administrator to complete the OneRoster setup.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <StudentXpPanel studentId={timebackStudentId} />
      )}
    </div>
  );
}
