"use client";

import { Flame, Sparkles, Users } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const mockStudents = [
  {
    id: "student-1",
    name: "Maya Alvarez",
    classroom: "Primary West",
    xpToday: 78,
    goal: 120,
    attendance: true,
    habitsCompleted: 3,
  },
  {
    id: "student-2",
    name: "Aiden Vega",
    classroom: "Primary West",
    xpToday: 115,
    goal: 120,
    attendance: true,
    habitsCompleted: 4,
  },
  {
    id: "student-3",
    name: "Sofia Nguyen",
    classroom: "Primary East",
    xpToday: 42,
    goal: 120,
    attendance: false,
    habitsCompleted: 1,
  },
];

const quickActions = [
  { id: "observation", label: "Log observation" },
  { id: "lesson", label: "Schedule lesson" },
  { id: "task", label: "Assign task" },
  { id: "habit", label: "Update habit" },
];

export default function GuideMyClassPage() {
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      mockStudents.map((student) => [student.id, student.attendance]),
    ),
  );
  const [activeAction, setActiveAction] = useState("observation");

  const presentCount = useMemo(
    () => Object.values(attendance).filter(Boolean).length,
    [attendance],
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Guide" }, { label: "My class" }]}
        description="Take attendance, capture quick actions, and monitor XP momentum for every child."
        title="My class"
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="size-5 text-primary" /> Attendance
            </CardTitle>
            <CardDescription>
              Record who is present before the work cycle begins.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {mockStudents.map((student) => {
              const isPresent = attendance[student.id];
              return (
                <button
                  key={student.id}
                  type="button"
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    isPresent
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/60 bg-background/80 text-muted-foreground"
                  }`}
                  onClick={() =>
                    setAttendance((prev) => ({
                      ...prev,
                      [student.id]: !prev[student.id],
                    }))
                  }
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{student.name}</span>
                    <span className="text-xs uppercase tracking-[0.2em]">
                      {student.classroom}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em]">
                    {isPresent ? "Present" : "Mark"}
                  </span>
                </button>
              );
            })}
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
              {presentCount} of {mockStudents.length} students are marked
              present.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="size-5 text-primary" /> Quick input
            </CardTitle>
            <CardDescription>
              Log what you notice without leaving the main floor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  size="sm"
                  variant={activeAction === action.id ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setActiveAction(action.id)}
                  type="button"
                >
                  {action.label}
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="Write a quick note…"
              className="min-h-[120px]"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" type="button">
                Save
              </Button>
              <Button size="sm" variant="ghost" type="button">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Flame className="size-5 text-primary" /> XP goals
            </CardTitle>
            <CardDescription>
              Who has closed their XP rings today?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockStudents.map((student) => {
              const percentage = Math.min(
                100,
                Math.round((student.xpToday / student.goal) * 100),
              );
              return (
                <div key={student.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{student.name}</span>
                    <span className="text-muted-foreground">{percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <Button size="sm" variant="outline" type="button">
              View XP dashboard
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Students overview
          </CardTitle>
          <CardDescription>
            Attendance, habits, and XP progress in one glance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>XP today</TableHead>
                <TableHead>Habits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student) => {
                const present = attendance[student.id];
                const percentage = Math.min(
                  100,
                  Math.round((student.xpToday / student.goal) * 100),
                );
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {student.name}
                        </span>
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {student.classroom}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant={present ? "default" : "outline"}
                        className="rounded-full"
                        onClick={() =>
                          setAttendance((prev) => ({
                            ...prev,
                            [student.id]: !prev[student.id],
                          }))
                        }
                      >
                        {present ? "Present" : "Mark"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.xpToday} XP / {student.goal} ({percentage}%)
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.habitsCompleted} completed
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
