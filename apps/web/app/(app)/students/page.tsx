"use client";

import type { ClassroomWithGuides, Habit, Student } from "@monte/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppPageHeader } from "@/components/app/page-header";
import { StudentCard } from "@/components/app/students/student-card";
import { StudentModal } from "@/components/app/students/student-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createHabit,
  createStudent,
  listClassrooms,
  listHabits,
  listStudents,
} from "@/lib/api/endpoints";

const viewModes = [
  { id: "directory", label: "Directory" },
  { id: "attendance", label: "Attendance" },
] as const;

type ViewMode = (typeof viewModes)[number]["id"];

type Classroom = ClassroomWithGuides;

type AttendanceState = Record<string, boolean>;

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [isStudentDialogOpen, setStudentDialogOpen] = useState(false);
  const [isHabitDialogOpen, setHabitDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("directory");
  const [attendance, setAttendance] = useState<AttendanceState>({});

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentDob, setNewStudentDob] = useState("");
  const [newStudentClassroom, setNewStudentClassroom] = useState("");

  const [habitStudentId, setHabitStudentId] = useState("");
  const [habitName, setHabitName] = useState("");
  const [habitSchedule, setHabitSchedule] =
    useState<Habit["schedule"]>("daily");

  const classroomsQuery = useQuery({
    queryKey: ["classrooms", { scope: "students" }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listClassrooms({}, { signal }),
  });

  const studentsQuery = useQuery({
    queryKey: ["students", { search, classroom: selectedClassroom }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listStudents(
        {
          search,
          classroomId: selectedClassroom ? selectedClassroom : undefined,
        },
        { signal },
      ),
  });

  const habitsQuery = useQuery({
    queryKey: ["habits"],
    queryFn: ({ signal }: { signal?: AbortSignal }) => listHabits({ signal }),
  });

  useEffect(() => {
    if (classroomsQuery.error instanceof Error) {
      toast.error(classroomsQuery.error.message);
    }
  }, [classroomsQuery.error]);

  useEffect(() => {
    if (studentsQuery.error instanceof Error) {
      toast.error(studentsQuery.error.message);
    }
  }, [studentsQuery.error]);

  useEffect(() => {
    if (habitsQuery.error instanceof Error) {
      toast.error(habitsQuery.error.message);
    }
  }, [habitsQuery.error]);

  const students = (studentsQuery.data ?? []) as Student[];
  const classrooms = (classroomsQuery.data ?? []) as Classroom[];
  const habits = (habitsQuery.data ?? []) as Habit[];

  const isStudentsLoading = studentsQuery.isLoading || studentsQuery.isFetching;

  const createStudentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      toast.success("Learner added");
      setStudentDialogOpen(false);
      setNewStudentName("");
      setNewStudentDob("");
      setNewStudentClassroom("");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to add learner",
      );
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      toast.success("Habit created");
      setHabitDialogOpen(false);
      setHabitStudentId("");
      setHabitName("");
      setHabitSchedule("daily");
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to create habit",
      );
    },
  });

  const handleCreateStudent = () => {
    if (newStudentName.trim().length === 0) {
      toast.error("Name is required");
      return;
    }
    createStudentMutation.mutate({
      fullName: newStudentName.trim(),
      dob: newStudentDob ? newStudentDob : undefined,
      primaryClassroomId: newStudentClassroom || null,
    });
  };

  const handleCreateHabit = () => {
    if (!habitStudentId) {
      toast.error("Choose a learner for the habit");
      return;
    }
    if (habitName.trim().length === 0) {
      toast.error("Provide a habit name");
      return;
    }
    createHabitMutation.mutate({
      studentId: habitStudentId,
      name: habitName.trim(),
      schedule: habitSchedule,
    });
  };

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

  const presentCount = useMemo(() => {
    return Object.values(attendance).filter(Boolean).length;
  }, [attendance]);

  const handleAttendanceToggle = (studentId: string, present: boolean) => {
    setAttendance((current) => ({
      ...current,
      [studentId]: present,
    }));
  };

  const handleOpenStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleCloseStudent = () => {
    setSelectedStudentId(null);
  };

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

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Total learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {students.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Across all classrooms
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Attendance today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {presentCount}
            </p>
            <p className="text-sm text-muted-foreground">Marked present</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Habits tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {habits.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Active across learners
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {viewMode === "attendance"
              ? "Attendance mode"
              : "Learner spotlight"}
          </h2>
          {isStudentsLoading ? (
            <p className="text-sm text-muted-foreground">Loading learners…</p>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => {
            const studentHabits = habitsByStudent.get(student.id) ?? [];
            const present = attendance[student.id] ?? false;
            return (
              <StudentCard
                attendanceMarked={present}
                attendanceMode={viewMode === "attendance"}
                habitsCount={studentHabits.length}
                key={student.id}
                onOpen={() => handleOpenStudent(student.id)}
                onToggleAttendance={(value) =>
                  handleAttendanceToggle(student.id, value)
                }
                student={student}
              />
            );
          })}
        </div>
        {students.length === 0 && !isStudentsLoading ? (
          <Card className="rounded-3xl border-border/60 bg-card/80 p-8 text-center text-muted-foreground">
            <p>
              No learners found. Try a different filter or add a new learner.
            </p>
          </Card>
        ) : null}
      </section>

      <StudentModal
        onClose={handleCloseStudent}
        studentId={selectedStudentId}
      />

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
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={createStudentMutation.isPending}
              onClick={handleCreateStudent}
              type="button"
            >
              {createStudentMutation.isPending ? "Saving..." : "Save learner"}
            </Button>
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
                  setHabitSchedule(event.target.value as Habit["schedule"])
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
            <Button
              onClick={() => setHabitDialogOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={createHabitMutation.isPending}
              onClick={handleCreateHabit}
              type="button"
            >
              {createHabitMutation.isPending ? "Creating..." : "Create habit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
