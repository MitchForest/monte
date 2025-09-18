"use client";

import { format } from "date-fns";
import { CheckCircle, Circle, Clock3, Plus } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type StudentLessonItem = {
  id: string;
  title: string;
  status: "scheduled" | "completed" | "needed";
  guide?: string | null;
  scheduledFor?: string | null;
  type?: "provided" | "custom";
  assignedGuideMissing?: boolean;
};

type ViewFilter = "provided" | "needed" | "scheduled" | "all";

type StudentLessonsTableProps = {
  lessons?: StudentLessonItem[] | null;
  onCreateLesson?: () => void;
};

const statusIconMap: Record<StudentLessonItem["status"], ReactNode> = {
  completed: <CheckCircle className="size-4 text-primary" />,
  scheduled: <Clock3 className="size-4 text-muted-foreground" />,
  needed: <Circle className="size-4 text-muted-foreground" />,
};

const defaultLessons: StudentLessonItem[] = [
  {
    id: "mock-1",
    title: "Intro to bead cabinet",
    status: "scheduled",
    guide: "Guide Rivera",
    scheduledFor: new Date().toISOString(),
    type: "provided",
  },
  {
    id: "mock-2",
    title: "Grace & courtesy role play",
    status: "needed",
    guide: null,
    scheduledFor: null,
    type: "custom",
    assignedGuideMissing: true,
  },
  {
    id: "mock-3",
    title: "Decimal board follow-up",
    status: "completed",
    guide: "Guide Patel",
    scheduledFor: new Date().toISOString(),
    type: "provided",
  },
];

export function StudentLessonsTable({
  lessons,
  onCreateLesson,
}: StudentLessonsTableProps) {
  const [filter, setFilter] = useState<ViewFilter>("all");

  const source = lessons && lessons.length > 0 ? lessons : defaultLessons;

  const filteredLessons = useMemo(() => {
    if (filter === "all") {
      return source;
    }

    switch (filter) {
      case "provided":
        return source.filter((entry) => entry.type === "provided");
      case "needed":
        return source.filter(
          (entry) => entry.status === "needed" || entry.assignedGuideMissing,
        );
      case "scheduled":
        return source.filter((entry) => entry.status === "scheduled");
      default:
        return source;
    }
  }, [filter, source]);

  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">
            Lessons
          </CardTitle>
          <CardDescription>
            Track provided, needed, and scheduled lessons at a glance.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "all", label: "All" },
              { id: "provided", label: "Provided" },
              { id: "needed", label: "Needed" },
              { id: "scheduled", label: "Scheduled" },
            ] satisfies { id: ViewFilter; label: string }[]
          ).map((entry) => (
            <Button
              key={entry.id}
              variant={filter === entry.id ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setFilter(entry.id)}
              type="button"
            >
              {entry.label}
            </Button>
          ))}
          <Button
            size="sm"
            className="rounded-full"
            type="button"
            onClick={onCreateLesson}
          >
            <Plus className="mr-1 size-4" /> New lesson
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLessons.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
            No lessons yet. Add a Montessori presentation or schedule a
            follow-up.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Guide</TableHead>
                <TableHead>Scheduled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {lesson.title}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {lesson.type === "custom" ? "Custom" : "Provided"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {statusIconMap[lesson.status]}
                      <span className="capitalize">{lesson.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {lesson.guide ?? "Unassigned"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {lesson.scheduledFor
                        ? format(new Date(lesson.scheduledFor), "MMM d, p")
                        : "Not scheduled"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
