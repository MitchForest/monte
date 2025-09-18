"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useStudentNextPlacement,
  useStudentPlacementCourses,
  useStudentPlacementLevel,
  useStudentPlacementTests,
} from "@/hooks/use-student-placements";

const SUBJECT_LABELS: Record<string, string> = {
  Math: "Math",
  Reading: "Reading",
  Language: "Language",
  Science: "Science",
  Vocabulary: "Vocabulary",
};

type StudentPlacementsPanelProps = {
  studentId: string | null;
};

export function StudentPlacementsPanel({
  studentId,
}: StudentPlacementsPanelProps) {
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  const coursesQuery = useStudentPlacementCourses(
    { studentId, subject: subjectFilter },
    { enabled: Boolean(studentId) },
  );
  const currentLevelQuery = useStudentPlacementLevel(
    { studentId, subject: subjectFilter },
    { enabled: Boolean(studentId) },
  );
  const nextPlacementQuery = useStudentNextPlacement(
    { studentId, subject: subjectFilter },
    { enabled: Boolean(studentId) },
  );
  const placementTestsQuery = useStudentPlacementTests(
    { studentId, subject: subjectFilter },
    { enabled: Boolean(studentId) },
  );

  const courses = coursesQuery.data ?? [];
  const currentLevel = currentLevelQuery.data ?? null;
  const nextPlacement = nextPlacementQuery.data ?? null;
  const placementTests = placementTestsQuery.data ?? [];

  const subjects = useMemo(() => {
    const values = new Set<string>();
    for (const course of courses) {
      if (course.subject) {
        values.add(course.subject);
      }
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const isLoading =
    coursesQuery.isLoading ||
    currentLevelQuery.isLoading ||
    nextPlacementQuery.isLoading ||
    placementTestsQuery.isLoading;

  const toSubjectLabel = (value: string | null | undefined) => {
    if (!value) {
      return "All subjects";
    }
    return SUBJECT_LABELS[value] ?? value;
  };

  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold text-foreground">
            PowerPath placements
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track grade mastery, upcoming placement tests, and XP progress by
            subject.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={subjectFilter === null ? "default" : "outline"}
            onClick={() => setSubjectFilter(null)}
          >
            All subjects
          </Button>
          {subjects.map((subject) => (
            <Button
              key={subject}
              type="button"
              size="sm"
              variant={subjectFilter === subject ? "default" : "outline"}
              onClick={() => setSubjectFilter(subject)}
            >
              {toSubjectLabel(subject)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full rounded-3xl" />
          </div>
        ) : courses.length === 0 ? (
          <p className="rounded-2xl border border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
            No placement data yet. Once this learner starts PowerPath
            placements, their progress will appear here.
          </p>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border/60">
            <Table>
              <TableHeader className="bg-background/70">
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    Course
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    Subject
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    Lessons completed
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    XP earned
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    Test-out lesson
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={`${course.courseId ?? course.courseTitle}`}>
                    <TableCell className="text-sm text-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {course.courseTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {course.courseCode ?? course.courseId ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {toSubjectLabel(course.subject)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {course.completedLessons} / {course.totalLessons}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {Math.round(course.totalXpEarned)} XP
                      {course.totalXpAvailable && course.totalXpAvailable > 0
                        ? ` of ${Math.round(course.totalXpAvailable)} XP`
                        : ""}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {course.masteredViaTestOut ? "Completed" : "Not yet"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Current mastery level
            </p>
            {currentLevelQuery.isLoading ? (
              <Skeleton className="mt-3 h-5 w-24" />
            ) : currentLevel ? (
              <div className="mt-3 space-y-1">
                <p className="text-base font-semibold text-foreground">
                  {currentLevel.gradeLevel ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentLevel.onboarded
                    ? "Placement onboarding complete"
                    : "Awaiting onboarding"}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                No placement level recorded yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Next placement test
            </p>
            {nextPlacementQuery.isLoading ? (
              <Skeleton className="mt-3 h-5 w-32" />
            ) : nextPlacement ? (
              <div className="mt-3 space-y-1">
                <p className="text-base font-semibold text-foreground">
                  {nextPlacement.lessonTitle ?? "Scheduled soon"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nextPlacement.gradeLevel
                    ? `Targets grade ${nextPlacement.gradeLevel}`
                    : nextPlacement.exhausted
                      ? "All placement tests complete"
                      : "Grade level pending"}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                All placement tests are complete for this subject.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/70 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Recent placement test attempts
          </p>
          {placementTestsQuery.isLoading ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
          ) : placementTests.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {placementTests.slice(0, 5).map((test, index) => (
                <li
                  key={`${test.title}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {test.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {test.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {test.score !== null
                      ? `${Math.round(test.score)} pts`
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              No placement tests recorded yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
