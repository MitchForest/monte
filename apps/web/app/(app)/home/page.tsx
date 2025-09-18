"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Clock, Compass, GraduationCap } from "lucide-react";
import { useMemo } from "react";

import { AppPageHeader } from "@/components/app/page-header";
import { StudentHabitsPanel } from "@/components/app/students/student-habits-panel";
import { StudentXpPanel } from "@/components/app/students/student-xp-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useImpersonation } from "@/hooks/use-impersonation";
import { useStudentsLookup } from "@/hooks/use-students-lookup";
import { getStudent, getStudentDashboard } from "@/lib/api/endpoints";

const DAILY_XP_GOAL = 120;

function normalizeActivityLink(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }
  if (value.startsWith("http")) {
    return value;
  }
  return null;
}

type TodayActivity = {
  id: string;
  name: string;
  subject: string;
  xpEarned: number;
  goal: number;
  occurredAt: string | null;
  launchUrl: string | null;
};

function buildActivityCards(
  summary: Awaited<ReturnType<typeof getStudentDashboard>>["xp"] | undefined,
): TodayActivity[] {
  if (!summary?.events) {
    return [];
  }

  return summary.events
    .map((event, index) => {
      const name =
        event.activityTitle ?? event.app ?? event.course?.name ?? "Activity";
      const subject = event.subject ?? event.course?.name ?? "Learning";
      const id = event.id ?? `${index}`;
      const xp = Math.max(0, event.xpEarned ?? 0);
      const url = normalizeActivityLink(event.resourceUri);

      return {
        id,
        name,
        subject,
        xpEarned: xp,
        goal: DAILY_XP_GOAL,
        occurredAt: event.occurredAt ?? null,
        launchUrl: url,
      } satisfies TodayActivity;
    })
    .sort((a, b) => {
      if (!a.occurredAt || !b.occurredAt) {
        return 0;
      }
      return (
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );
    });
}

export default function StudentHomePage() {
  const { selection } = useImpersonation();
  const { students, isLoading: studentsLoading } =
    useStudentsLookup("student-home");

  const impersonatedStudentId =
    selection.kind === "student"
      ? selection.studentId
      : selection.kind === "parent"
        ? selection.studentId
        : null;

  const activeStudentId = impersonatedStudentId ?? students.at(0)?.id ?? null;
  const studentDetailQuery = useQuery({
    queryKey: ["student-home-detail", activeStudentId],
    enabled: Boolean(activeStudentId),
    queryFn: () => {
      if (!activeStudentId) {
        return Promise.resolve(null);
      }
      return getStudent(activeStudentId);
    },
  });

  const student = studentDetailQuery.data?.student ?? null;
  const habits = studentDetailQuery.data?.habits ?? [];
  const habitCheckins = studentDetailQuery.data?.habitCheckins ?? [];
  const summaries = studentDetailQuery.data?.summaries ?? [];
  const timebackStudentId = student?.oneroster_user_id ?? student?.id ?? null;
  const dashboardQuery = useQuery({
    queryKey: ["student-dashboard", activeStudentId],
    enabled: Boolean(activeStudentId),
    queryFn: ({ signal }: { signal?: AbortSignal }) => {
      if (!activeStudentId) {
        return Promise.resolve(null);
      }
      return getStudentDashboard(
        activeStudentId,
        { range: "daily" },
        { signal },
      );
    },
  });

  const dashboard = dashboardQuery.data;
  const todayActivities = useMemo(
    () => buildActivityCards(dashboard?.xp).slice(0, 6),
    [dashboard?.xp],
  );

  const isLoading =
    studentsLoading || studentDetailQuery.isLoading || dashboardQuery.isLoading;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Home" }, { label: "Today" }]}
        description="Focus on your prepared environment and close the rings for the day."
        title={
          student
            ? `Welcome back, ${student.full_name.split(" ").at(0) ?? "Guide"}`
            : "Welcome to Monte"
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      ) : activeStudentId && student ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
            <StudentHabitsPanel
              checkins={dashboard?.habitCheckins ?? habitCheckins}
              habits={dashboard?.habits ?? habits}
              studentId={student.id}
            />
            <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Today’s activities
                  </CardTitle>
                  <CardDescription>
                    Earn XP by opening your Timeback learning apps.
                  </CardDescription>
                </div>
                <Button
                  disabled={dashboardQuery.isFetching}
                  onClick={() => dashboardQuery.refetch()}
                  type="button"
                  variant="outline"
                >
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {dashboardQuery.isFetching && !dashboard ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  </div>
                ) : todayActivities.length === 0 ? (
                  <div className="rounded-3xl border border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
                    No activity yet. Open a learning app to start earning XP.
                  </div>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {todayActivities.map((activity) => (
                      <Card
                        className="rounded-3xl border-border/60 bg-background/70 p-0"
                        key={activity.id}
                      >
                        <CardContent className="flex flex-col gap-4 p-5">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {activity.subject}
                            </p>
                            <p className="text-base font-semibold text-foreground">
                              {activity.name}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                              {activity.occurredAt
                                ? new Date(
                                    activity.occurredAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Today"}
                            </span>
                            <span className="font-semibold text-foreground">
                              {Math.round(activity.xpEarned)} XP /{" "}
                              {activity.goal}
                            </span>
                          </div>
                          {activity.launchUrl ? (
                            <Button asChild size="sm" variant="secondary">
                              <a
                                href={activity.launchUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                Open activity
                                <ArrowUpRight className="ml-1 size-3.5" />
                              </a>
                            </Button>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <StudentXpPanel studentId={timebackStudentId} />
            <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Recent updates
                </CardTitle>
                <CardDescription>
                  A quick glance at the latest stories captured for your family.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summaries.length === 0 ? (
                  <div className="rounded-3xl border border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
                    No updates yet. Your guide will share stories here soon.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs uppercase tracking-[0.2em]">
                          Title
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-[0.2em]">
                          Scope
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-[0.2em]">
                          Created
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaries.slice(0, 4).map((summary) => (
                        <TableRow key={summary.id}>
                          <TableCell className="text-sm font-medium text-foreground">
                            {summary.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {summary.scope}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(summary.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-3xl border-dashed border-border/60 bg-card/60 p-6">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                  <Clock className="size-5" />
                  Check charts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm text-muted-foreground">
                Visual progress charts for lessons are coming soon.
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-dashed border-border/60 bg-card/60 p-6">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                  <GraduationCap className="size-5" />
                  Placements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm text-muted-foreground">
                Placement diagnostics will appear here once enabled.
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-dashed border-border/60 bg-card/60 p-6">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                  <Compass className="size-5" />
                  App store
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm text-muted-foreground">
                Discover new Montessori-aligned learning apps soon.
              </CardContent>
            </Card>
          </section>
        </>
      ) : (
        <Card className="rounded-3xl border-border/60 bg-card/80 p-10 text-center">
          <CardTitle className="text-xl font-semibold text-foreground">
            No learners found
          </CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Once a student is assigned to you, their daily plan and Timeback
            activities will appear here.
          </CardDescription>
        </Card>
      )}
    </div>
  );
}
