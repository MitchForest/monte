"use client";

import type { Habit, HabitCheckinEvent } from "@monte/shared";
import { CalendarRange, Check } from "lucide-react";
import { useMemo, useState } from "react";

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

export type HabitHistoryEntry = {
  id: string;
  name: string;
  streak: number;
  completionRate: number;
  schedule: string;
};

type StudentHabitsHistoryProps = {
  habits: Habit[];
  checkins: HabitCheckinEvent[];
};

function createCheckinMap(checkins: HabitCheckinEvent[]) {
  const map = new Map<string, Map<string, boolean>>();
  for (const entry of checkins) {
    if (!map.has(entry.habit_id)) {
      map.set(entry.habit_id, new Map());
    }
    const habitMap = map.get(entry.habit_id);
    if (habitMap) {
      habitMap.set(entry.date, entry.checked);
    }
  }
  return map;
}

function computeStreak(
  habitCheckins: Map<string, boolean>,
  windowDays: number,
): number {
  let streak = 0;
  const today = new Date();
  for (let offset = 0; offset < windowDays; offset += 1) {
    const cursor = new Date(today);
    cursor.setDate(cursor.getDate() - offset);
    const key = cursor.toISOString().slice(0, 10);
    if (habitCheckins.get(key)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function buildHistoryEntries(
  habits: Habit[],
  checkins: HabitCheckinEvent[],
  view: "weekly" | "monthly",
): HabitHistoryEntry[] {
  if (habits.length === 0) {
    return [];
  }

  const checkinsByHabit = createCheckinMap(checkins);
  const windowDays = view === "weekly" ? 7 : 30;

  return habits.map((habit) => {
    const map = checkinsByHabit.get(habit.id) ?? new Map<string, boolean>();
    const today = new Date();
    let completedDays = 0;

    for (let offset = 0; offset < windowDays; offset += 1) {
      const cursor = new Date(today);
      cursor.setDate(cursor.getDate() - offset);
      const key = cursor.toISOString().slice(0, 10);
      if (map.get(key)) {
        completedDays += 1;
      }
    }

    const completionRate = windowDays > 0 ? completedDays / windowDays : 0;
    const streak = computeStreak(map, windowDays);

    return {
      id: habit.id,
      name: habit.name,
      schedule: habit.schedule,
      completionRate,
      streak,
    } satisfies HabitHistoryEntry;
  });
}

export function StudentHabitsHistory({
  habits,
  checkins,
}: StudentHabitsHistoryProps) {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");

  const data = useMemo(
    () => buildHistoryEntries(habits, checkins, view),
    [habits, checkins, view],
  );

  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarRange className="size-5 text-primary" /> Habit history
          </CardTitle>
          <CardDescription>
            Review weekly and monthly completion patterns.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={view === "weekly" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setView("weekly")}
            type="button"
          >
            Weekly
          </Button>
          <Button
            size="sm"
            variant={view === "monthly" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setView("monthly")}
            type="button"
          >
            Monthly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Habit</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Current streak</TableHead>
              <TableHead>Completion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {entry.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.schedule}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.streak} days
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {Math.round(entry.completionRate * 100)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
