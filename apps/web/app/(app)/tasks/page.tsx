"use client";

import type { Action, Student } from "@monte/shared";
import { useQuery } from "@tanstack/react-query";
import { format, isBefore, isSameWeek, isToday, startOfDay } from "date-fns";
import { useMemo, useState } from "react";

import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listActions, listStudents } from "@/lib/api/endpoints";

const statusFilterOptions = [
  { id: "all", label: "All" },
  { id: "pending", label: "Open" },
  { id: "completed", label: "Completed" },
] as const;

type StatusFilter = (typeof statusFilterOptions)[number]["id"];

function normalizeStatus(status: string): string {
  if (status === "completed") {
    return "Completed";
  }
  if (status === "in_progress") {
    return "In progress";
  }
  return "Not started";
}

function groupDueDate(action: Action): "overdue" | "today" | "week" | "later" {
  if (!action.due_date) {
    return "later";
  }
  const due = new Date(action.due_date);
  if (isBefore(due, startOfDay(new Date()))) {
    return "overdue";
  }
  if (isToday(due)) {
    return "today";
  }
  if (isSameWeek(due, new Date(), { weekStartsOn: 1 })) {
    return "week";
  }
  return "later";
}

function formatDueDate(action: Action): string {
  if (!action.due_date) {
    return "Anytime";
  }
  const due = new Date(action.due_date);
  if (isToday(due)) {
    return `Today · ${format(due, "p")}`;
  }
  if (isSameWeek(due, new Date(), { weekStartsOn: 1 })) {
    return `${format(due, "EEE")} · ${format(due, "p")}`;
  }
  return format(due, "MMM d · p");
}

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks", { scope: "guide" }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listActions({ type: "task" }, { signal }),
  });

  const studentsQuery = useQuery({
    queryKey: ["students", { scope: "tasks" }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listStudents({}, { signal }),
  });

  const tasks = tasksQuery.data ?? [];
  const students = studentsQuery.data ?? [];

  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    for (const student of students) {
      map.set(student.id, student);
    }
    return map;
  }, [students]);

  const filteredTasks = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    const results: Action[] = [];

    for (const task of tasks) {
      if (statusFilter !== "all") {
        if (statusFilter === "completed" && task.status !== "completed") {
          continue;
        }
        if (statusFilter === "pending" && task.status === "completed") {
          continue;
        }
      }

      if (lowered.length > 0) {
        const studentName = task.student_id
          ? (studentMap.get(task.student_id)?.full_name ?? "")
          : "";
        const matchesTitle = task.title.toLowerCase().includes(lowered);
        const matchesStudent = studentName.toLowerCase().includes(lowered);
        if (!matchesTitle && !matchesStudent) {
          continue;
        }
      }

      results.push(task);
    }

    results.sort((a, b) => {
      const aDue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bDue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return aDue - bDue;
    });

    return results;
  }, [tasks, search, statusFilter, studentMap]);

  const metrics = useMemo(() => {
    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;
    for (const task of tasks) {
      if (task.status === "completed") {
        continue;
      }
      const bucket = groupDueDate(task);
      if (bucket === "overdue") {
        overdue += 1;
      } else if (bucket === "today") {
        dueToday += 1;
      } else if (bucket === "week") {
        upcoming += 1;
      }
    }
    return { overdue, dueToday, upcoming };
  }, [tasks]);

  const activeTask = useMemo(() => {
    if (!selectedTaskId) {
      return null;
    }
    return tasks.find((task) => task.id === selectedTaskId) ?? null;
  }, [selectedTaskId, tasks]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Guide" }, { label: "Tasks" }]}
        description="Coordinate classroom prep, follow-ups, and admin work without the clutter."
        onSearchChange={setSearch}
        primaryAction={{ label: "Add task", href: "/tasks/new" }}
        searchPlaceholder="Search tasks or learners"
        title="Task board"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 rounded-full border border-border/60 bg-card/70 p-1">
            {statusFilterOptions.map((option) => (
              <Button
                key={option.id}
                onClick={() => setStatusFilter(option.id)}
                type="button"
                variant={statusFilter === option.id ? "default" : "ghost"}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </AppPageHeader>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Overdue
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-destructive">
              {metrics.overdue}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Due today
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {metrics.dueToday}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Upcoming this week
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {metrics.upcoming}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              Tasks
            </CardTitle>
            <CardDescription>
              Grouped by due date so you can see what needs attention first.
            </CardDescription>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredTasks.length} of {tasks.length}
          </p>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-[1.4rem] border border-border/60">
          <ScrollArea className="max-h-[520px]">
            <Table>
              <TableHeader className="bg-background/70">
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasksQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Loading tasks…
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No tasks match these filters yet. Add a task or adjust the
                      view.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => {
                    const student = task.student_id
                      ? studentMap.get(task.student_id)
                      : null;
                    const bucket = groupDueDate(task);
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="align-top text-sm font-medium text-foreground">
                          <div className="flex flex-col gap-1">
                            <span>{task.title}</span>
                            {task.description ? (
                              <span className="text-xs text-muted-foreground">
                                {task.description}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          {student ? student.full_name : "—"}
                        </TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          <span
                            className={
                              bucket === "overdue"
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }
                          >
                            {formatDueDate(task)}
                          </span>
                        </TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          <span className="rounded-full bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                            {normalizeStatus(task.status)}
                          </span>
                        </TableCell>
                        <TableCell className="align-top text-right">
                          <Button
                            onClick={() => setSelectedTaskId(task.id)}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            Open
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog
        onOpenChange={(open) => (!open ? setSelectedTaskId(null) : null)}
        open={Boolean(activeTask)}
      >
        <DialogContent className="max-w-2xl rounded-3xl">
          {activeTask ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {activeTask.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {activeTask.due_date
                    ? `Due ${format(new Date(activeTask.due_date), "MMM d · p")}`
                    : "No due date"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>{activeTask.description ?? "No additional notes"}</p>
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-4">
                  <p className="font-medium text-foreground">Linked learner</p>
                  <p>
                    {activeTask.student_id
                      ? (studentMap.get(activeTask.student_id)?.full_name ??
                        "Unknown learner")
                      : "Unassigned"}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setSelectedTaskId(null)} type="button">
                    Close
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
