"use client";

import type {
  Habit,
  HabitCheckinEvent,
  Observation,
  Student,
  StudentLesson,
  StudentParent,
  StudentSummary,
  StudentSummaryRecipient,
} from "@monte/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppPageHeader } from "@/components/app/page-header";
import { StudentCommunicationsPanel } from "@/components/app/students/student-communications-panel";
import { StudentHabitsHistory } from "@/components/app/students/student-habits-history";
import { StudentHabitsPanel } from "@/components/app/students/student-habits-panel";
import type { StudentLessonItem } from "@/components/app/students/student-lessons-table";
import { StudentLessonsTable } from "@/components/app/students/student-lessons-table";
import { StudentModal } from "@/components/app/students/student-modal";
import { StudentObservationsPanel } from "@/components/app/students/student-observations-panel";
import { StudentSummaryPanel } from "@/components/app/students/student-summary-panel";
import { StudentXpPanel } from "@/components/app/students/student-xp-panel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createStudentParent,
  getStudent,
  listObservations,
  listStudentLessons,
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

  const studentQuery = useQuery<StudentDetailData>({
    queryKey: ["student", studentId],
    queryFn: () => getStudent(studentId),
  });

  const observationsQuery = useQuery<Observation[]>({
    queryKey: ["observations", { scope: "student", studentId }],
    queryFn: () => listObservations({ studentId }),
  });

  const summariesQuery = useQuery<StudentSummary[]>({
    queryKey: ["student-summaries", { studentId }],
    queryFn: () => listStudentSummaries({ studentId }),
  });

  const lessonsQuery = useQuery<StudentLesson[]>({
    queryKey: ["student-lessons", { studentId }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listStudentLessons({ studentId }, { signal }),
  });

  const student = studentQuery.data?.student ?? null;
  const parents = studentQuery.data?.parents ?? [];
  const habits = studentQuery.data?.habits ?? [];
  const habitCheckins = studentQuery.data?.habitCheckins ?? [];
  const summaries = summariesQuery.data ?? [];
  const observations = observationsQuery.data ?? [];
  const lessons = lessonsQuery.data ?? [];
  const [newParentName, setNewParentName] = useState("");
  const [newParentEmail, setNewParentEmail] = useState("");
  const [newParentRelation, setNewParentRelation] = useState("");
  const createParentMutation = useMutation({
    mutationFn: (input: {
      name: string;
      email?: string | null;
      relation?: string | null;
    }) =>
      createStudentParent(studentId, {
        name: input.name,
        email: input.email ?? null,
        relation: input.relation ?? null,
      }),
    onSuccess: () => {
      toast.success("Guardian added");
      setNewParentName("");
      setNewParentEmail("");
      setNewParentRelation("");
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to add guardian",
      );
    },
  });
  const lessonItems = useMemo<StudentLessonItem[] | null>(() => {
    if (!lessons || lessons.length === 0) {
      return null;
    }
    return lessons.map((lesson) => {
      const status: StudentLessonItem["status"] =
        lesson.status === "completed"
          ? "completed"
          : lesson.status === "scheduled"
            ? "scheduled"
            : "needed";

      return {
        id: lesson.id,
        title: lesson.custom_title ?? lesson.notes ?? "Lesson",
        status,
        guide: lesson.assigned_by_user_id,
        scheduledFor: lesson.scheduled_for,
        type: lesson.course_lesson_id ? "provided" : "custom",
      } satisfies StudentLessonItem;
    });
  }, [lessons]);

  const handleCreateParent = () => {
    if (newParentName.trim().length === 0) {
      toast.error("Guardian name is required");
      return;
    }

    if (
      newParentEmail.trim().length > 0 &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newParentEmail.trim())
    ) {
      toast.error("Enter a valid email address");
      return;
    }

    createParentMutation.mutate({
      name: newParentName.trim(),
      email:
        newParentEmail.trim().length > 0 ? newParentEmail.trim() : undefined,
      relation:
        newParentRelation.trim().length > 0
          ? newParentRelation.trim()
          : undefined,
    });
  };

  const observationItems = useMemo(() => {
    if (!observations || observations.length === 0) {
      return null;
    }
    return observations.map((entry) => ({
      id: entry.id,
      createdAt: entry.created_at,
      author: entry.created_by ?? null,
      summary: entry.content,
    }));
  }, [observations]);

  const latestSummaries = useMemo(
    () => summaries.slice(0, MAX_ITEMS),
    [summaries],
  );

  const handleSummaryCreated = (payload: {
    summary: StudentSummary;
    recipients: StudentSummaryRecipient[];
  }) => {
    queryClient.setQueryData<StudentSummary[]>(
      ["student-summaries", { studentId }],
      (current) => [payload.summary, ...(current ?? [])],
    );
    queryClient.setQueryData<StudentDetailData | undefined>(
      ["student", studentId],
      (current) =>
        current
          ? {
              ...current,
              summaries: [payload.summary, ...(current.summaries ?? [])],
            }
          : current,
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
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Add guardian
              </h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setNewParentName(event.target.value)
                  }
                  placeholder="Guardian name"
                  value={newParentName}
                />
                <Input
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setNewParentEmail(event.target.value)
                  }
                  placeholder="Email (optional)"
                  type="email"
                  value={newParentEmail}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setNewParentRelation(event.target.value)
                  }
                  placeholder="Relationship"
                  value={newParentRelation}
                />
                <Button
                  disabled={createParentMutation.isPending}
                  onClick={handleCreateParent}
                  type="button"
                >
                  {createParentMutation.isPending ? "Saving…" : "Add guardian"}
                </Button>
              </div>
            </div>
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
        <StudentXpPanel studentId={student.oneroster_user_id ?? student.id} />
      </section>

      <section className="grid gap-6 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <StudentHabitsPanel
          checkins={habitCheckins}
          habits={habits}
          studentId={student.id}
        />
        <StudentHabitsHistory habits={habits} checkins={habitCheckins} />
      </section>

      <section className="grid gap-6 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <StudentLessonsTable lessons={lessonItems ?? undefined} />
        <StudentCommunicationsPanel />
      </section>

      <section className="px-6">
        <StudentObservationsPanel
          observations={observationItems ?? undefined}
        />
      </section>

      <StudentModal
        onClose={() => setQuickViewOpen(false)}
        studentId={isQuickViewOpen ? student.id : null}
      />
    </div>
  );
}
