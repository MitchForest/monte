"use client";

import { format } from "date-fns";
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
import { useStudentXp, type XpRange } from "@/hooks/use-student-xp";

const DAILY_XP_GOAL = 120;

type StudentXpPanelProps = {
  studentId: string | null;
};

type XpEventRow = {
  id: string;
  eventTime: string | null | undefined;
  name: string | null | undefined;
  xpEarned: number | null | undefined;
  subject: string | null | undefined;
};

function computeGoal(range: XpRange, start: Date, end: Date) {
  if (range === "daily") {
    return DAILY_XP_GOAL;
  }

  const dayMs = 1000 * 60 * 60 * 24;
  const diff = Math.max(0, end.getTime() - start.getTime());
  const days = Math.max(1, Math.floor(diff / dayMs) + 1);
  return DAILY_XP_GOAL * days;
}

function formatEventDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${format(date, "MMM d, yyyy")} · ${format(date, "p")}`;
}

function buildEvents(
  summary: ReturnType<typeof useStudentXp>["data"],
): XpEventRow[] {
  if (!summary?.events) {
    return [];
  }

  return summary.events
    .map((event, index) => ({
      id: event.id ?? `${index}`,
      eventTime: event.eventTime,
      name: event.object?.name ?? event.type ?? "Activity",
      subject: event.object?.type ?? null,
      xpEarned: event.xpEarned ?? 0,
    }))
    .sort((a, b) => {
      if (!a.eventTime || !b.eventTime) {
        return 0;
      }
      return new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime();
    });
}

function XpRing({ earned, goal }: { earned: number; goal: number }) {
  const progress = goal > 0 ? Math.min(earned / goal, 1) : 0;
  const percentage = Math.round(progress * 100);
  const angle = progress * 360;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex size-36 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(var(--color-primary) ${angle}deg, var(--color-border) 0deg)`,
        }}
      >
        <div className="flex size-28 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner">
          <span className="text-xs text-muted-foreground">XP earned</span>
          <span className="text-3xl font-semibold text-foreground">
            {Math.round(earned)}
          </span>
          <span className="text-xs text-muted-foreground">
            Goal {Math.round(goal)}
          </span>
        </div>
      </div>
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {percentage}% to goal
      </span>
    </div>
  );
}

export function StudentXpPanel({ studentId }: StudentXpPanelProps) {
  const [range, setRange] = useState<XpRange>("daily");
  const xpQuery = useStudentXp(studentId, range);

  const goal = useMemo(() => {
    return computeGoal(range, xpQuery.rangeStart, xpQuery.rangeEnd);
  }, [range, xpQuery.rangeStart, xpQuery.rangeEnd]);

  const earned = xpQuery.data?.totalXp ?? 0;
  const events = useMemo(() => buildEvents(xpQuery.data), [xpQuery.data]);

  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl font-semibold text-foreground">
            XP insight
          </CardTitle>
          <div className="flex gap-2 rounded-full border border-border/60 bg-background/70 p-1">
            {(["daily", "weekly", "monthly"] as XpRange[]).map((option) => (
              <Button
                key={option}
                variant={range === option ? "default" : "ghost"}
                size="sm"
                type="button"
                onClick={() => setRange(option)}
              >
                {option === "daily"
                  ? "Daily"
                  : option === "weekly"
                    ? "Weekly"
                    : "Monthly"}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Track Timeback XP earned across learning apps.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {xpQuery.isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-36 w-36 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-6">
            <XpRing earned={earned} goal={goal} />
            <div className="flex flex-col gap-3">
              {xpQuery.rangeStart && xpQuery.rangeEnd ? (
                <p className="text-sm text-muted-foreground">
                  {`${format(xpQuery.rangeStart, "MMM d, yyyy")} — ${format(
                    xpQuery.rangeEnd,
                    "MMM d, yyyy",
                  )}`}
                </p>
              ) : null}
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
                <p className="text-muted-foreground">
                  Total events recorded: {events.length}
                </p>
                <p className="text-muted-foreground">
                  Average XP per event:{" "}
                  {events.length > 0 ? Math.round(earned / events.length) : 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {xpQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : events.length === 0 ? (
          <p className="rounded-2xl border border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
            No XP events recorded for this window yet. Encourage the learner to
            open their activities today.
          </p>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border/60">
            <Table>
              <TableHeader className="bg-background/70">
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    When
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    Activity
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.2em]">
                    Subject
                  </TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-[0.2em]">
                    XP
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={`${event.id}-${event.eventTime}`}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatEventDate(event.eventTime)}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {event.name ?? "Activity"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event.subject ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-foreground">
                      {Math.round(event.xpEarned ?? 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
