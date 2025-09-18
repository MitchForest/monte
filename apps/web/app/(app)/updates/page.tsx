"use client";

import type { StudentSummary } from "@monte/shared";
import { useQuery } from "@tanstack/react-query";

import { AppPageHeader } from "@/components/app/page-header";
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
import { useActiveStudent } from "@/hooks/use-active-student";
import { listStudentSummaries } from "@/lib/api/endpoints";

export default function UpdatesPage() {
  const { activeStudentId, student, isLoading, isError } =
    useActiveStudent("student-updates");

  const summariesQuery = useQuery<StudentSummary[]>({
    queryKey: ["student-updates", { studentId: activeStudentId }],
    enabled: Boolean(activeStudentId),
    queryFn: ({ signal }) =>
      listStudentSummaries(
        { studentId: activeStudentId ?? undefined },
        { signal },
      ),
  });

  const firstName = student?.full_name.split(" ").at(0) ?? "Learner";
  const summaries = summariesQuery.data ?? [];

  const showLoadingState =
    isLoading || (summariesQuery.isLoading && !summariesQuery.isFetched);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Home", href: "/home" }, { label: "Updates" }]}
        description="Daily and weekly stories captured by your guide."
        title={`${firstName}'s updates`}
      />

      {showLoadingState ? (
        <Card className="rounded-3xl border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Loading updates
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Gathering the latest notes from your guide…
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          </CardContent>
        </Card>
      ) : isError || summariesQuery.isError ? (
        <Card className="rounded-3xl border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Unable to load updates
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Refresh and try again. If the problem continues, contact your
              guide.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !activeStudentId || !student ? (
        <Card className="rounded-3xl border-border/60 bg-card/80 p-10 text-center">
          <CardTitle className="text-xl font-semibold text-foreground">
            No learners available
          </CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            When a learner is connected to your account, their daily stories
            will appear here.
          </CardDescription>
        </Card>
      ) : summaries.length === 0 ? (
        <Card className="rounded-3xl border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              No updates yet
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Guides will share written or audio updates from the classroom as
              the day unfolds.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Latest updates
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {`Stories shared by your guide for ${firstName}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden rounded-3xl border border-border/60">
            <Table>
              <TableHeader className="bg-background/70">
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    Title
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    Scope
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    Shared on
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((summary) => (
                  <TableRow key={summary.id}>
                    <TableCell className="text-sm font-medium text-foreground">
                      {summary.title ?? "Update"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {summary.scope ?? "custom"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {summary.created_at
                        ? new Date(summary.created_at).toLocaleString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
