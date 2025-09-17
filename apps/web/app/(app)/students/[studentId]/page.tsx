"use client";

import type {
  Habit,
  HabitCheckinEvent,
  Observation,
  Student,
  StudentParent,
  StudentSummary,
  StudentSummaryRecipient,
} from "@monte/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppPageHeader } from "@/components/app/page-header";
import { StudentHabitsPanel } from "@/components/app/students/student-habits-panel";
import { StudentModal } from "@/components/app/students/student-modal";
import { StudentSummaryPanel } from "@/components/app/students/student-summary-panel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getStudent,
  listActions,
  listObservations,
  listStudentSummaries,
} from "@/lib/api/endpoints";

const MAX_ITEMS = 6;

type StudentDetailPageProps = {
  params: Promise<{ studentId: string }>;
};

type StudentDetailData = {
  student: Student;
  parents?: StudentParent[];
  habits?: Habit[];
  summaries?: StudentSummary[];
  habitCheckins?: HabitCheckinEvent[];
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const { studentId } = await params;
  return <StudentDetailPageInner studentId={studentId} />;
}

function StudentDetailPageInner({ studentId }: { studentId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isQuickViewOpen, setQuickViewOpen] = useState(false);

  const studentQuery = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => getStudent(studentId),
  });

  const observationsQuery = useQuery({
    queryKey: ["observations", { scope: "student", studentId }],
    queryFn: () => listObservations({ studentId }),
  });

  const summariesQuery = useQuery({
    queryKey: ["student-summaries", { studentId }],
    queryFn: () => listStudentSummaries({ studentId }),
  });

  const lessonsQuery = useQuery({
    queryKey: ["lessons", { studentId }],
    queryFn: async () => {
      const actions = await listActions({ type: "lesson" });
      return actions.filter((action) => action.student_id === studentId);
    },
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", { studentId }],
    queryFn: async () => {
      const actions = await listActions({ type: "task" });
      return actions.filter((action) => action.student_id === studentId);
    },
  });

  const studentData = studentQuery.data ?? null;
  const detail: StudentDetailData | null = studentData;
  const student = detail?.student ?? null;
  const parents = detail?.parents ?? [];
  const habits = detail?.habits ?? [];
  const habitCheckins = detail?.habitCheckins ?? [];
  const summaries = summariesQuery.data ?? [];
  const observations = observationsQuery.data ?? [];
  const lessons = lessonsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  const latestSummaries = useMemo(
    () => summaries.slice(0, MAX_ITEMS),
    [summaries],
  );

  const latestObservations = useMemo(
    () => observations.slice(0, MAX_ITEMS),
    [observations],
  );

  const lessonsInRange = useMemo(() => lessons.slice(0, MAX_ITEMS), [lessons]);

  const tasksInRange = useMemo(() => tasks.slice(0, MAX_ITEMS), [tasks]);

  const handleSummaryCreated = (payload: {
    summary: StudentSummary;
    recipients: StudentSummaryRecipient[];
  }) => {
    queryClient.setQueryData<StudentSummary[]>(
      ["student-summaries", { studentId }],
      (current) => [payload.summary, ...(current ?? [])],
    );
    queryClient.setQueryData<StudentDetailData | null>(
      ["student", studentId],
      (current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          summaries: [payload.summary, ...(current.summaries ?? [])],
        };
      },
    );
  };

  if (studentQuery.isLoading || !student) {
    return (
      <div className="flex flex-1 flex-col gap-8">
        <AppPageHeader
          breadcrumbs={[
            { label: "Students", href: "/students" },
            { label: "Loading" },
          ]}
          title="Loading learner"
        />
        <div className="space-y-4 px-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  const studentInitials = initials(student.full_name);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[
          { label: "Students", href: "/students" },
          { label: student.full_name },
        ]}
        description="A holistic view of this learner's rhythms, lessons, and stories."
        title={student.full_name}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => router.back()} type="button" variant="outline">
            Back
          </Button>
          <Button
            onClick={() => setQuickViewOpen(true)}
            type="button"
            variant="ghost"
          >
            Open quick view
          </Button>
        </div>
      </AppPageHeader>

      <section className="grid gap-6 px-6 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4">
            <Avatar className="size-14">
              <AvatarFallback>{studentInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-semibold text-foreground">
                {student.full_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {student.classroom?.name ?? "Unassigned"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span>
                  Joined {new Date(student.created_at).toLocaleDateString()}
                </span>
                {student.dob ? (
                  <span>Born {new Date(student.dob).toLocaleDateString()}</span>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Guardians
            </h2>
            {parents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add parent contacts to send summaries and stay connected.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {parents.map((parent) => (
                  <li
                    className="rounded-2xl border border-border/60 bg-background/70 p-4"
                    key={parent.id}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {parent.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {parent.email ?? "No email provided"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {parent.phone ?? "No phone on file"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <StudentSummaryPanel
          onSummaryCreated={handleSummaryCreated}
          parents={parents}
          studentId={student.id}
          summaries={latestSummaries}
        />
      </section>

      <section className="px-6">
        <StudentHabitsPanel
          checkins={habitCheckins}
          habits={habits}
          studentId={student.id}
        />
      </section>

      <section className="grid gap-6 px-6 md:grid-cols-2">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Recent lessons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessonsInRange.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Lessons assigned to this learner will appear here.
              </p>
            ) : (
              <ul className="space-y-3 text-sm text-muted-foreground">
                {lessonsInRange.map((lesson) => (
                  <li
                    className="rounded-2xl border border-border/60 bg-background/70 p-3"
                    key={lesson.id}
                  >
                    <p className="font-medium text-foreground">
                      {lesson.title}
                    </p>
                    <p>{lesson.description ?? "No additional notes"}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {lesson.status} •{" "}
                      {new Date(lesson.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Tasks in focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksInRange.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tasks assigned to this learner will appear here.
              </p>
            ) : (
              <ul className="space-y-3 text-sm text-muted-foreground">
                {tasksInRange.map((task) => (
                  <li
                    className="rounded-2xl border border-border/60 bg-background/70 p-3"
                    key={task.id}
                  >
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p>{task.description ?? "No additional notes"}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {task.status} •{" "}
                      {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="px-6">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Recent observations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestObservations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Observations captured for this learner will appear here.
              </p>
            ) : (
              <ul className="space-y-4">
                {latestObservations.map((observation: Observation) => (
                  <li
                    className="rounded-2xl border border-border/60 bg-background/70 p-4"
                    key={observation.id}
                  >
                    <p className="text-sm leading-relaxed text-foreground">
                      {observation.content}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {new Date(observation.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <StudentModal
        onClose={() => setQuickViewOpen(false)}
        studentId={isQuickViewOpen ? student.id : null}
      />
    </div>
  );
}
