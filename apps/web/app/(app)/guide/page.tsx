"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { CalendarClock, Loader2, PartyPopper, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createAttendance,
  getGuideDashboard,
  listAttendance,
  updateAttendance,
} from "@/lib/api/endpoints";

const DAILY_XP_GOAL = 120;

type ScheduleItem = GuideScheduleItem;

type AttendanceState = Record<string, boolean>;
type AttendanceRecord = {
  id: string;
  studentId: string;
  startTime: string;
  endTime: string | null;
};

function FocusCard({
  totalStudents,
  goalMet,
  averageProgress,
}: {
  totalStudents: number;
  goalMet: number;
  averageProgress: number;
}) {
  return (
    <Card className="h-full rounded-3xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <PartyPopper className="size-5 text-primary" /> XP focus
        </CardTitle>
        <CardDescription>
          Celebrate progress and spot who still needs momentum today.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Class average</p>
            <p className="text-3xl font-semibold text-foreground">
              {Math.round(averageProgress)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Rings closed</p>
            <p className="text-2xl font-semibold text-foreground">
              {goalMet}/{totalStudents}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
          Keep observing moments of focus as students close their rings. Quick
          actions live in the student table below.
        </div>
      </CardContent>
    </Card>
  );
}

function StudentXpCell({ xp }: { xp: number | null | undefined }) {
  const earned = xp ?? 0;
  const goal = DAILY_XP_GOAL;
  const percentage = Math.min(100, Math.round((earned / goal) * 100));

  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>{Math.round(earned)} XP</span>
        <span>{goal}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-muted-foreground">{percentage}% to goal</span>
    </div>
  );
}

function AttendanceToggle({
  present,
  onChange,
}: {
  present: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Button
      variant={present ? "default" : "outline"}
      size="sm"
      className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]"
      onClick={() => onChange(!present)}
      type="button"
    >
      {present ? "Present" : "Mark present"}
    </Button>
  );
}

export default function GuideHomePage() {
  const queryClient = useQueryClient();
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [showOnlyPresent, setShowOnlyPresent] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const dashboardQuery = useQuery({
    queryKey: ["guide-dashboard"],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      getGuideDashboard({ signal }),
  });

  const dashboard = dashboardQuery.data;

  const attendanceQuery = useQuery({
    queryKey: ["attendance", todayKey],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listAttendance({ date: todayKey }, { signal }),
  });

  const attendanceCreateMutation = useMutation({
    mutationFn: createAttendance,
    onSuccess: (record) => {
      setAttendanceRecords((current) => [
        ...current,
        {
          id: record.id,
          studentId: record.student_id,
          startTime: record.start_time,
          endTime: record.end_time,
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ["guide-dashboard"] });
    },
  });

  const attendanceUpdateMutation = useMutation({
    mutationFn: updateAttendance,
    onSuccess: (record) => {
      setAttendanceRecords((current) =>
        current.map((entry) =>
          entry.id === record.id
            ? {
                id: record.id,
                studentId: record.student_id,
                startTime: record.start_time,
                endTime: record.end_time,
              }
            : entry,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["guide-dashboard"] });
    },
  });

  useEffect(() => {
    if (!attendanceQuery.data) {
      return;
    }
    setAttendanceRecords(
      attendanceQuery.data.map((record) => ({
        id: record.id,
        studentId: record.student_id,
        startTime: record.start_time,
        endTime: record.end_time,
      })),
    );
    setAttendance(() => {
      const next: AttendanceState = {};
      for (const record of attendanceQuery.data) {
        if (!record.end_time) {
          next[record.student_id] = true;
        }
      }
      return next;
    });
  }, [attendanceQuery.data]);

  const scheduleItems = useMemo(() => {
    if (!dashboard?.schedule) {
      return [] as ScheduleItem[];
    }
    return dashboard.schedule.map((action) => ({
      id: action.id,
      title: action.title,
      type: action.type,
      studentId: action.student_id ?? null,
      dueTime: action.due_date ?? null,
    }));
  }, [dashboard?.schedule]);

  const studentEntries = useMemo(
    () => dashboard?.students ?? [],
    [dashboard?.students],
  );

  const xpStats = useMemo(() => {
    if (studentEntries.length === 0) {
      return {
        totalStudents: 0,
        goalMet: 0,
        averageProgress: 0,
      };
    }

    let goalMet = 0;
    let totalProgress = 0;
    let counted = 0;

    for (const entry of studentEntries) {
      const earned = entry.xpToday ?? 0;
      const progress = Math.min(
        100,
        Math.round((earned / DAILY_XP_GOAL) * 100),
      );
      totalProgress += progress;
      counted += 1;
      if (earned >= DAILY_XP_GOAL) {
        goalMet += 1;
      }
    }

    return {
      totalStudents: counted,
      goalMet,
      averageProgress: counted > 0 ? totalProgress / counted : 0,
    };
  }, [studentEntries]);

  const insights = useMemo(() => {
    const needsObservation = studentEntries.filter((entry) => {
      if (!entry.lastObservationAt) {
        return true;
      }
      return !isSameDay(new Date(entry.lastObservationAt), new Date());
    }).length;

    const needsSummary = studentEntries.filter((entry) => {
      if (!entry.lastSummaryAt) {
        return true;
      }
      return !isSameDay(new Date(entry.lastSummaryAt), new Date());
    }).length;

    const totalHabitsTracked = studentEntries.reduce(
      (accumulator, entry) => accumulator + entry.habitsCount,
      0,
    );

    return {
      needsObservation,
      needsSummary,
      totalHabitsTracked,
    };
  }, [studentEntries]);

  const studentsById = useMemo(() => {
    const map = new Map<string, (typeof studentEntries)[number]["student"]>();
    for (const entry of studentEntries) {
      map.set(entry.student.id, entry.student);
    }
    return map;
  }, [studentEntries]);

  const resolveStudentName = (id: string | null | undefined) => {
    if (!id) {
      return null;
    }
    return studentsById.get(id)?.full_name ?? null;
  };

  const filteredEntries = useMemo(() => {
    if (!showOnlyPresent) {
      return studentEntries;
    }
    return studentEntries.filter((entry) => attendance[entry.student.id]);
  }, [studentEntries, showOnlyPresent, attendance]);

  const presentCount = useMemo(
    () => Object.values(attendance).filter(Boolean).length,
    [attendance],
  );

  const existingAttendance = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const record of attendanceRecords) {
      if (!record.endTime) {
        map.set(record.studentId, record);
      }
    }
    return map;
  }, [attendanceRecords]);

  const handleAttendanceChange = (studentId: string, next: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: next,
    }));

    const record = existingAttendance.get(studentId);

    if (next && !record) {
      attendanceCreateMutation.mutate(
        { studentId },
        {
          onError: () => {
            setAttendance((prev) => ({
              ...prev,
              [studentId]: false,
            }));
          },
        },
      );
    } else if (!next && record) {
      attendanceUpdateMutation.mutate(
        { id: record.id, endTime: new Date().toISOString() },
        {
          onError: () => {
            setAttendance((prev) => ({
              ...prev,
              [studentId]: true,
            }));
          },
        },
      );
    }
  };

  const isLoading = dashboardQuery.isLoading || attendanceQuery.isLoading;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Guide" }, { label: "Home" }]}
        description="See today’s priorities, attendance, and XP momentum across your class."
        title="Guide dashboard"
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <CalendarClock className="size-5 text-primary" /> Today’s
                schedule
              </CardTitle>
              <CardDescription>
                Lessons and tasks due today across your roster.
              </CardDescription>
            </div>
            <Button
              disabled={dashboardQuery.isFetching}
              size="sm"
              variant="secondary"
              className="rounded-full"
            >
              {scheduleItems.length} items
            </Button>
          </CardHeader>
          <CardContent>
            <ScheduleTimeline
              isLoading={isLoading}
              items={scheduleItems}
              resolveStudentName={resolveStudentName}
            />
          </CardContent>
        </Card>
        <FocusCard
          averageProgress={xpStats.averageProgress}
          goalMet={xpStats.goalMet}
          totalStudents={xpStats.totalStudents}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Observations pending
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-semibold text-foreground">
                {insights.needsObservation}
              </span>{" "}
              learners still need a note today.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Parent updates to send
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-semibold text-foreground">
                {insights.needsSummary}
              </span>{" "}
              families ready for a summary.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Habits tracked
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-semibold text-foreground">
                {insights.totalHabitsTracked}
              </span>{" "}
              check-ins captured today.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Users className="size-5 text-primary" /> Students in attendance
            </CardTitle>
            <CardDescription>
              Track attendance, monitor XP progress, and note who still needs a
              story.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filter</span>
            <Button
              variant={showOnlyPresent ? "default" : "outline"}
              size="sm"
              className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]"
              onClick={() => setShowOnlyPresent((value) => !value)}
              type="button"
            >
              {showOnlyPresent ? "Present only" : "All students"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
              No students to display. Adjust the attendance filter or add
              students to your roster.
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {presentCount} of {studentEntries.length} students marked
                present
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>XP (daily)</TableHead>
                    <TableHead>Habits</TableHead>
                    <TableHead>Last observation</TableHead>
                    <TableHead>Parent update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => {
                    const present = attendance[entry.student.id] ?? false;
                    const lastObservation = entry.lastObservationAt
                      ? new Date(entry.lastObservationAt)
                      : null;
                    const lastSummary = entry.lastSummaryAt
                      ? new Date(entry.lastSummaryAt)
                      : null;

                    return (
                      <TableRow key={entry.student.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {entry.student.full_name}
                            </span>
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {entry.student.classroom?.name ?? "Unassigned"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <AttendanceToggle
                            present={present}
                            onChange={(next) =>
                              handleAttendanceChange(entry.student.id, next)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <StudentXpCell xp={entry.xpToday} />
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                            {entry.habitsCount} tracked
                          </span>
                        </TableCell>
                        <TableCell>
                          {lastObservation ? (
                            <span className="text-xs text-muted-foreground">
                              {format(lastObservation, "MMM d")}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              None yet
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lastSummary ? (
                            <span className="text-xs text-muted-foreground">
                              {format(lastSummary, "MMM d")}
                            </span>
                          ) : (
                            <Button disabled size="sm" variant="outline">
                              Draft
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
