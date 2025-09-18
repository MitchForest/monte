"use client";

import type {
  Habit,
  HabitCheckinEvent,
  Student,
  StudentParent,
  StudentSummary,
  StudentSummaryRecipient,
} from "@monte/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudent } from "@/lib/api/endpoints";

import { StudentHabitsPanel } from "./student-habits-panel";
import { StudentQuickActions } from "./student-quick-actions";
import { StudentQuickCommunications } from "./student-quick-communications";
import { StudentSummaryPanel } from "./student-summary-panel";
import { StudentXpPanel } from "./student-xp-panel";

export type StudentModalProps = {
  studentId: string | null;
  onClose: () => void;
};

type StudentDetailData = {
  student: Student;
  parents?: StudentParent[];
  habits?: Habit[];
  summaries?: StudentSummary[];
  habitCheckins?: HabitCheckinEvent[];
};

function buildInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function StudentModal({ studentId, onClose }: StudentModalProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => {
      if (!studentId) {
        return Promise.resolve(null);
      }
      return getStudent(studentId);
    },
    enabled: Boolean(studentId),
  });

  const detail = data ?? null;

  const student = detail?.student ?? null;
  const parents = detail?.parents ?? [];
  const habits = detail?.habits ?? [];
  const summaries = detail?.summaries ?? [];
  const habitCheckins = detail?.habitCheckins ?? [];

  const initials = useMemo(
    () => (student ? buildInitials(student.full_name) : ""),
    [student],
  );

  const handleSummaryCreated = (payload: {
    summary: StudentSummary;
    recipients: StudentSummaryRecipient[];
  }) => {
    if (!studentId) {
      return;
    }
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

  return (
    <Dialog
      onOpenChange={(open) => (!open ? onClose() : null)}
      open={Boolean(studentId)}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-4xl overflow-hidden rounded-3xl p-0">
        <DialogHeader className="border-b border-border/40 px-6 py-4">
          <DialogTitle className="flex items-center gap-4">
            {student ? (
              <>
                <Avatar className="size-12">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-foreground">
                    {student.full_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {student.classroom?.name ?? "Unassigned"}
                  </span>
                </div>
              </>
            ) : (
              <Skeleton className="h-12 w-12 rounded-full" />
            )}
          </DialogTitle>
          {student ? (
            <Button onClick={onClose} type="button" variant="ghost">
              Close
            </Button>
          ) : null}
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="grid gap-6 bg-background px-6 py-6 md:grid-cols-[1.1fr_0.9fr]">
            {isLoading || !student ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full rounded-3xl" />
                <Skeleton className="h-64 w-full rounded-3xl" />
              </div>
            ) : (
              <div className="space-y-6">
                <StudentXpPanel
                  studentId={student.oneroster_user_id ?? student.id}
                />
                <StudentQuickActions studentId={student.id} />
                <StudentHabitsPanel
                  checkins={habitCheckins}
                  habits={habits}
                  studentId={student.id}
                />
              </div>
            )}
            {isLoading || !student ? (
              <Skeleton className="h-96 w-full rounded-3xl" />
            ) : (
              <div className="space-y-4">
                <StudentSummaryPanel
                  onSummaryCreated={handleSummaryCreated}
                  parents={parents}
                  studentId={student.id}
                  summaries={summaries}
                />
                <StudentQuickCommunications />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
