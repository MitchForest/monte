"use client";

import type { Student } from "@monte/shared";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export type StudentCardProps = {
  student: Student;
  habitsCount?: number;
  onOpen: () => void;
  attendanceMode?: boolean;
  attendanceMarked?: boolean;
  onToggleAttendance?: (present: boolean) => void;
};

export function StudentCard({
  student,
  habitsCount = 0,
  onOpen,
  attendanceMode = false,
  attendanceMarked = false,
  onToggleAttendance,
}: StudentCardProps) {
  const initials = initialsFromName(student.full_name);

  return (
    <article className="group flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-card/80 p-5 shadow-sm transition hover:border-primary/60">
      <button
        className="flex flex-1 items-start gap-4 text-left"
        onClick={() => onOpen()}
        type="button"
      >
        <Avatar className="size-12">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-foreground">
            {student.full_name}
          </span>
          <span className="text-sm text-muted-foreground">
            {student.classroom?.name ?? "Unassigned"}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {habitsCount} habit{habitsCount === 1 ? "" : "s"} tracked
          </span>
        </div>
      </button>
      <div className="mt-4 flex items-center justify-between gap-3">
        {attendanceMode ? (
          <button
            aria-pressed={attendanceMarked}
            className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onToggleAttendance?.(!attendanceMarked)}
            type="button"
          >
            {attendanceMarked ? "Present" : "Mark present"}
          </button>
        ) : (
          <Button onClick={() => onOpen()} type="button" variant="outline">
            Open quick view
          </Button>
        )}
        <Button asChild className="shrink-0" variant="ghost">
          <Link href={`/students/${student.id}`}>View profile</Link>
        </Button>
      </div>
    </article>
  );
}
