"use client";

import type { Habit, HabitCheckinEvent } from "@monte/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createHabitCheckin, deleteHabitCheckin } from "@/lib/api/endpoints";

export type StudentHabitsPanelProps = {
  studentId: string;
  habits: Habit[];
  checkins: HabitCheckinEvent[];
};

export function StudentHabitsPanel({
  studentId,
  habits,
  checkins,
}: StudentHabitsPanelProps) {
  const queryClient = useQueryClient();
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const checkinsByHabit = useMemo(() => {
    const grouped = new Map<string, Set<string>>();
    for (const checkin of checkins) {
      if (!grouped.has(checkin.habit_id)) {
        grouped.set(checkin.habit_id, new Set());
      }
      grouped.get(checkin.habit_id)?.add(checkin.date);
    }
    return grouped;
  }, [checkins]);

  const createMutation = useMutation({
    mutationFn: createHabitCheckin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to record habit",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHabitCheckin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to update habit",
      );
    },
  });

  const handleToggle = (habitId: string, checked: boolean) => {
    if (checked) {
      deleteMutation.mutate({ habitId, date: todayKey });
    } else {
      createMutation.mutate({ habitId, date: todayKey });
    }
  };

  return (
    <Card className="rounded-3xl border-border/60 bg-background/80">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Habits today
        </CardTitle>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create a habit to track daily rhythms for this learner.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {habits.map((habit) => {
              const dates = checkinsByHabit.get(habit.id) ?? new Set<string>();
              const todayCompleted = dates.has(todayKey);

              return (
                <li
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                  key={habit.id}
                >
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {habit.name}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {habit.schedule}
                    </span>
                  </div>
                  <button
                    aria-pressed={todayCompleted}
                    className="relative size-12 rounded-full border-2 border-border/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => handleToggle(habit.id, todayCompleted)}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-1 rounded-full transition-colors"
                      style={{
                        backgroundColor: todayCompleted
                          ? "var(--color-primary)"
                          : "transparent",
                      }}
                    />
                    <span className="sr-only">
                      {todayCompleted
                        ? "Mark habit as incomplete"
                        : "Mark habit as complete"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
