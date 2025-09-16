"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppPageHeader } from "@/components/app/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ColumnDef } from "../../../components/ui/kibo-table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "../../../components/ui/kibo-table";
import { apiFetch } from "@/lib/api/client";
import type {
  ClassroomWithGuides,
  HabitSchedule,
  Habit,
  StudentsTable,
} from "@monte/shared";

type Classroom = ClassroomWithGuides;
type Student = {
  id: string;
  org_id: string;
  full_name: string;
  avatar_url: string | null;
  dob: string | null;
  primary_classroom_id: string | null;
  created_at: string;
  classroom: { id: string; name: string } | null;
};

type StudentResponse = { students: Student[] };
type ClassroomResponse = { classrooms: Classroom[] };
type HabitResponse = { habits: Habit[] };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHabitLoading, setIsHabitLoading] = useState(false);
  const [isStudentDialogOpen, setStudentDialogOpen] = useState(false);
  const [isHabitDialogOpen, setHabitDialogOpen] = useState(false);

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentDob, setNewStudentDob] = useState("");
  const [newStudentClassroom, setNewStudentClassroom] = useState("");

  const [habitStudentId, setHabitStudentId] = useState("");
  const [habitName, setHabitName] = useState("");
  const [habitSchedule, setHabitSchedule] = useState<HabitSchedule>("daily");

  const refreshStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim().length > 0) {
        params.set("search", search.trim());
      }
      if (selectedClassroom) {
        params.set("classroomId", selectedClassroom);
      }
      const query = params.toString();
      const payload = await apiFetch<StudentResponse>(
        `/students${query ? `?${query}` : ""}`
      );
      setStudents(payload.students);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load students"
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedClassroom]);

  const refreshClassrooms = useCallback(async () => {
    try {
      const payload = await apiFetch<ClassroomResponse>("/classrooms");
      setClassrooms(payload.classrooms);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load classrooms"
      );
    }
  }, []);

  const refreshHabits = useCallback(async () => {
    setIsHabitLoading(true);
    try {
      const payload = await apiFetch<HabitResponse>("/habits");
      setHabits(payload.habits);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load habits"
      );
    } finally {
      setIsHabitLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshClassrooms();
  }, [refreshClassrooms]);

  useEffect(() => {
    refreshStudents();
  }, [refreshStudents]);

  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  const handleCreateStudent = async () => {
    if (newStudentName.trim().length === 0) {
      toast.error("Name is required");
      return;
    }
    try {
      await apiFetch<{ student: StudentsTable }>("/students", {
        method: "POST",
        body: JSON.stringify({
          full_name: newStudentName.trim(),
          dob: newStudentDob ? newStudentDob : undefined,
          primary_classroom_id: newStudentClassroom || null,
        }),
      });
      toast.success("Learner added");
      setStudentDialogOpen(false);
      setNewStudentName("");
      setNewStudentDob("");
      setNewStudentClassroom("");
      await refreshStudents();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to add learner"
      );
    }
  };

  const handleCreateHabit = async () => {
    if (!habitStudentId) {
      toast.error("Choose a learner for the habit");
      return;
    }
    if (habitName.trim().length === 0) {
      toast.error("Provide a habit name");
      return;
    }
    try {
      await apiFetch("/habits", {
        method: "POST",
        body: JSON.stringify({
          studentId: habitStudentId,
          name: habitName.trim(),
          schedule: habitSchedule,
        }),
      });
      toast.success("Habit created");
      setHabitDialogOpen(false);
      setHabitStudentId("");
      setHabitName("");
      setHabitSchedule("daily");
      await refreshHabits();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create habit"
      );
    }
  };

  const tableColumns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Learner",
        cell: ({ row }) => {
          const learner = row.original;
          const initials = learner.full_name
            .split(" ")
            .map((part) => part.slice(0, 1))
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-foreground text-sm">
                  {learner.full_name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {learner.classroom?.name ?? "Unassigned"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "dob",
        header: "Birthday",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.dob ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(row.original.created_at))}
          </span>
        ),
      },
    ],
    []
  );

  const habitsByStudent = useMemo(() => {
    const grouped = new Map<string, Habit[]>();
    for (const habit of habits) {
      if (!grouped.has(habit.student_id)) {
        grouped.set(habit.student_id, []);
      }
      grouped.get(habit.student_id)?.push(habit);
    }
    return grouped;
  }, [habits]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Home", href: "/home" }, { label: "Students" }]}
        description="Spot trends across cohorts and respond to learner needs quickly."
        onSearchChange={setSearch}
        primaryAction={{
          label: "Add learner",
          onClick: () => setStudentDialogOpen(true),
        }}
        searchPlaceholder="Search learners or guardians"
        title="Student directory"
      >
        <div className="flex flex-wrap items-center gap-3">
          <label
            className="flex items-center gap-2 text-muted-foreground text-sm"
            htmlFor="students-classroom-filter"
          >
            <span>Classroom</span>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="students-classroom-filter"
              onChange={(event) => setSelectedClassroom(event.target.value)}
              value={selectedClassroom}
            >
              <option value="">All</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            onClick={() => setHabitDialogOpen(true)}
            type="button"
            variant="outline"
          >
            Create habit
          </Button>
        </div>
      </AppPageHeader>

      <Card className="rounded-3xl border-border/60 bg-card/90 shadow-md">
        <CardHeader>
          <CardTitle className="font-semibold text-xl">
            Learners ({students.length})
          </CardTitle>
          <CardDescription>
            Filter and explore the children across each environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-2xl border border-border/50">
          <TableProvider columns={tableColumns} data={students}>
            <TableHeader className="bg-muted/40">
              {({ headerGroup }) => (
                <TableHeaderGroup headerGroup={headerGroup}>
                  {({ header }) => (
                    <TableHead 
                      header={header}
                      className="text-muted-foreground text-xs uppercase tracking-[0.18em]"
                    />
                  )}
                </TableHeaderGroup>
              )}
            </TableHeader>
            <TableBody>
              {({ row }) => (
                <TableRow row={row}>
                  {({ cell }) => <TableCell cell={cell} />}
                </TableRow>
              )}
            </TableBody>
          </TableProvider>
          {isLoading && (
            <p className="pt-4 text-center text-muted-foreground text-sm">
              Loading learners…
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/60 bg-card/90 shadow-md">
        <CardHeader>
          <CardTitle className="font-semibold text-xl">Habits</CardTitle>
          <CardDescription>
            Gentle rhythms you are cultivating with learners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isHabitLoading && (
            <p className="text-muted-foreground text-sm">Loading habits…</p>
          )}
          {!isHabitLoading && habits.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No habits yet. Create one to track daily routines.
            </p>
          )}
          {!isHabitLoading && habits.length > 0 && (
            <ul className="grid gap-4 md:grid-cols-2">
              {students.map((student) => {
                const studentHabits = habitsByStudent.get(student.id) ?? [];
                if (studentHabits.length === 0) {
                  return null;
                }
                return (
                  <li
                    className="rounded-2xl border border-border/50 bg-background/70 p-4"
                    key={student.id}
                  >
                    <p className="font-medium text-foreground text-sm">
                      {student.full_name}
                    </p>
                    <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
                      {studentHabits.map((habit) => (
                        <li
                          className="flex items-center justify-between rounded-xl bg-card/60 px-3 py-2"
                          key={habit.id}
                        >
                          <span>{habit.name}</span>
                          <span className="text-xs uppercase tracking-[0.2em]">
                            {habit.schedule}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setStudentDialogOpen} open={isStudentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add learner</DialogTitle>
            <DialogDescription>
              Capture the essentials to welcome a child into Monte.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label
              className="flex flex-col gap-2 text-sm"
              htmlFor="new-student-name"
            >
              <span className="font-medium text-foreground">Full name</span>
              <Input
                autoFocus
                id="new-student-name"
                onChange={(event) => setNewStudentName(event.target.value)}
                placeholder="Aiden Vega"
                value={newStudentName}
              />
            </label>
            <label
              className="flex flex-col gap-2 text-sm"
              htmlFor="new-student-dob"
            >
              <span className="font-medium text-foreground">Birthday</span>
              <Input
                id="new-student-dob"
                onChange={(event) => setNewStudentDob(event.target.value)}
                type="date"
                value={newStudentDob}
              />
            </label>
            <label
              className="flex flex-col gap-2 text-sm"
              htmlFor="new-student-classroom"
            >
              <span className="font-medium text-foreground">
                Primary classroom
              </span>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="new-student-classroom"
                onChange={(event) => setNewStudentClassroom(event.target.value)}
                value={newStudentClassroom}
              >
                <option value="">Unassigned</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setStudentDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateStudent}>Save learner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setHabitDialogOpen} open={isHabitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New habit</DialogTitle>
            <DialogDescription>
              Outline the routine you want to nurture with a learner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label
              className="flex flex-col gap-2 text-sm"
              htmlFor="habit-student"
            >
              <span className="font-medium text-foreground">Learner</span>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="habit-student"
                onChange={(event) => setHabitStudentId(event.target.value)}
                value={habitStudentId}
              >
                <option value="">Select a learner</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm" htmlFor="habit-name">
              <span className="font-medium text-foreground">Habit name</span>
              <Input
                id="habit-name"
                onChange={(event) => setHabitName(event.target.value)}
                placeholder="Morning arrival grace and courtesy"
                value={habitName}
              />
            </label>
            <label
              className="flex flex-col gap-2 text-sm"
              htmlFor="habit-schedule"
            >
              <span className="font-medium text-foreground">Schedule</span>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="habit-schedule"
                onChange={(event) =>
                  setHabitSchedule(event.target.value as HabitSchedule)
                }
                value={habitSchedule}
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
          <DialogFooter>
            <Button onClick={() => setHabitDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleCreateHabit}>Create habit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
