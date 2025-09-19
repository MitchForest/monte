"use client";

import type { Action, Student } from "@monte/shared";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, isSameMonth, isSameWeek } from "date-fns";
import { useMemo, useState } from "react";
import {
  type GuideScheduleItem,
  ScheduleTimeline,
} from "@/components/app/guide/schedule-timeline";
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

const rangeOptions = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All" },
] as const;

const viewModes = [
  { id: "timeline", label: "Timeline" },
  { id: "table", label: "Table" },
] as const;

type RangeId = (typeof rangeOptions)[number]["id"];
type ViewModeId = (typeof viewModes)[number]["id"];

function withinRange(action: Action, range: RangeId): boolean {
  if (!action.due_date || range === "all") {
    return true;
  }
  const due = new Date(action.due_date);
  switch (range) {
    case "today":
      return isSameDay(due, new Date());
    case "week":
      return isSameWeek(due, new Date(), { weekStartsOn: 1 });
    case "month":
      return isSameMonth(due, new Date());
    default:
      return true;
  }
}

function describeType(action: Action): string {
  if (action.type === "lesson") {
    return "Presenting";
  }
  if (action.description?.toLowerCase().includes("observe")) {
    return "Observing";
  }
  if (action.description?.toLowerCase().includes("admin")) {
    return "Admin";
  }
  return "Planning";
}

function formatWhen(action: Action): string {
  if (!action.due_date) {
    return "Flex";
  }
  const due = new Date(action.due_date);
  if (isSameDay(due, new Date())) {
    return `Today · ${format(due, "p")}`;
  }
  if (isSameWeek(due, new Date(), { weekStartsOn: 1 })) {
    return `${format(due, "EEE")}, ${format(due, "p")}`;
  }
  return format(due, "MMM d · p");
}

export default function SchedulePage() {
  const [range, setRange] = useState<RangeId>("today");
  const [viewMode, setViewMode] = useState<ViewModeId>("timeline");
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const actionsQuery = useQuery({
    queryKey: ["schedule", { scope: "guide" }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listActions({}, { signal }),
  });

  const studentsQuery = useQuery({
    queryKey: ["students", { scope: "schedule" }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listStudents({}, { signal }),
  });

  const actions = actionsQuery.data ?? [];
  const students = studentsQuery.data ?? [];

  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    for (const student of students) {
      map.set(student.id, student);
    }
    return map;
  }, [students]);

  const filteredActions = useMemo(() => {
    const results: Action[] = [];
    for (const action of actions) {
      if (withinRange(action, range)) {
        results.push(action);
      }
    }
    results.sort((a, b) => {
      const dueA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const dueB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return dueA - dueB;
    });
    return results;
  }, [actions, range]);

  const timelineItems = useMemo<GuideScheduleItem[]>(() => {
    const items: GuideScheduleItem[] = [];
    for (const action of filteredActions) {
      items.push({
        id: action.id,
        title: action.title,
        type: action.type,
        studentId: action.student_id ?? null,
        dueTime: action.due_date ?? null,
      });
    }
    return items;
  }, [filteredActions]);

  const metrics = useMemo(() => {
    let lessons = 0;
    let tasksCount = 0;
    for (const action of filteredActions) {
      if (action.type === "lesson") {
        lessons += 1;
      } else {
        tasksCount += 1;
      }
    }
    return { lessons, tasks: tasksCount };
  }, [filteredActions]);

  const activeAction = useMemo(() => {
    if (!selectedActionId) {
      return null;
    }
    return actions.find((action) => action.id === selectedActionId) ?? null;
  }, [actions, selectedActionId]);

  const resolveStudentName = (id: string | null | undefined) => {
    if (!id) {
      return null;
    }
    return studentMap.get(id)?.full_name ?? null;
  };

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Guide" }, { label: "Schedule" }]}
        description="Balance presenting, observing, and planning with an intentional rhythm."
        primaryAction={{ label: "Schedule lesson", href: "/lessons/new" }}
        title="Schedule"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 rounded-full border border-border/60 bg-card/70 p-1">
            {rangeOptions.map((option) => (
              <Button
                key={option.id}
                onClick={() => setRange(option.id)}
                type="button"
                variant={range === option.id ? "default" : "ghost"}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 rounded-full border border-border/60 bg-card/70 p-1">
            {viewModes.map((mode) => (
              <Button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                type="button"
                variant={viewMode === mode.id ? "default" : "ghost"}
              >
                {mode.label}
              </Button>
            ))}
          </div>
        </div>
      </AppPageHeader>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Lessons
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {metrics.lessons}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Tasks
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {metrics.tasks}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Total items
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {filteredActions.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Saved view
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Filtered by {range === "all" ? "entire plan" : range}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {viewMode === "timeline" ? (
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Timeline
            </CardTitle>
            <CardDescription>
              A calm vertical rhythm for today’s flow. Tap an item for details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleTimeline
              isLoading={actionsQuery.isLoading}
              items={timelineItems}
              resolveStudentName={resolveStudentName}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Schedule table
              </CardTitle>
              <CardDescription>
                Sortable list of lessons, observations, and planning blocks.
              </CardDescription>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredActions.length} of {actions.length}
            </p>
          </CardHeader>
          <CardContent className="overflow-hidden rounded-[1.4rem] border border-border/60">
            <ScrollArea className="max-h-[520px]">
              <Table>
                <TableHeader className="bg-background/70">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionsQuery.isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        Loading schedule…
                      </TableCell>
                    </TableRow>
                  ) : filteredActions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No scheduled items yet. Add a lesson or planning block.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActions.map((action) => {
                      const student = action.student_id
                        ? studentMap.get(action.student_id)
                        : null;
                      return (
                        <TableRow key={action.id}>
                          <TableCell className="align-top text-sm font-medium text-foreground">
                            {action.title}
                          </TableCell>
                          <TableCell className="align-top text-sm text-muted-foreground">
                            {student ? student.full_name : "—"}
                          </TableCell>
                          <TableCell className="align-top text-sm text-muted-foreground">
                            {formatWhen(action)}
                          </TableCell>
                          <TableCell className="align-top text-sm text-muted-foreground">
                            <span className="rounded-full bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                              {describeType(action)}
                            </span>
                          </TableCell>
                          <TableCell className="align-top text-right">
                            <Button
                              onClick={() => setSelectedActionId(action.id)}
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
      )}

      <Dialog
        onOpenChange={(open) => (!open ? setSelectedActionId(null) : null)}
        open={Boolean(activeAction)}
      >
        <DialogContent className="max-w-2xl rounded-3xl">
          {activeAction ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {activeAction.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {formatWhen(activeAction)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>{activeAction.description ?? "No additional notes"}</p>
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-4">
                  <p className="font-medium text-foreground">Activity type</p>
                  <p>{describeType(activeAction)}</p>
                </div>
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-4">
                  <p className="font-medium text-foreground">Student</p>
                  <p>
                    {activeAction.student_id
                      ? (studentMap.get(activeAction.student_id)?.full_name ??
                        "Unknown learner")
                      : "Unassigned"}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setSelectedActionId(null)}
                    type="button"
                  >
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
