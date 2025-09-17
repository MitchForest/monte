"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAction, createObservation } from "@/lib/api/endpoints";

import { VoiceInputButton } from "./voice-input-button";

const modes = [
  { id: "observation", label: "Observation" },
  { id: "task", label: "Task" },
  { id: "lesson", label: "Lesson" },
] as const;

type Mode = (typeof modes)[number]["id"];

export type StudentQuickActionsProps = {
  studentId: string;
};

export function StudentQuickActions({ studentId }: StudentQuickActionsProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("observation");
  const [observationNote, setObservationNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonNotes, setLessonNotes] = useState("");

  const createObservationMutation = useMutation({
    mutationFn: createObservation,
    onSuccess: () => {
      toast.success("Observation logged");
      setObservationNote("");
      queryClient.invalidateQueries({ queryKey: ["observations"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to log observation",
      );
    },
  });

  const createActionMutation = useMutation({
    mutationFn: createAction,
    onSuccess: () => {
      toast.success(mode === "task" ? "Task created" : "Lesson scheduled");
      if (mode === "task") {
        setTaskTitle("");
        setTaskNotes("");
      } else {
        setLessonTitle("");
        setLessonNotes("");
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to create action",
      );
    },
  });

  const observationDisabled = observationNote.trim().length === 0;
  const taskDisabled = taskTitle.trim().length === 0;
  const lessonDisabled = lessonTitle.trim().length === 0;

  const isSubmitting = useMemo(
    () => createObservationMutation.isPending || createActionMutation.isPending,
    [createActionMutation.isPending, createObservationMutation.isPending],
  );

  const handleObservationSubmit = () => {
    if (observationDisabled) {
      toast.error("Add a quick note before saving.");
      return;
    }
    createObservationMutation.mutate({
      content: observationNote.trim(),
      studentId,
    });
  };

  const handleTaskSubmit = () => {
    if (taskDisabled) {
      toast.error("Provide a task title");
      return;
    }
    createActionMutation.mutate({
      title: taskTitle.trim(),
      description: taskNotes.trim().length > 0 ? taskNotes.trim() : undefined,
      studentId,
      type: "task",
    });
  };

  const handleLessonSubmit = () => {
    if (lessonDisabled) {
      toast.error("Provide a lesson focus");
      return;
    }
    createActionMutation.mutate({
      title: lessonTitle.trim(),
      description:
        lessonNotes.trim().length > 0 ? lessonNotes.trim() : undefined,
      studentId,
      type: "lesson",
    });
  };

  return (
    <Card className="rounded-3xl border-border/60 bg-background/80">
      <CardHeader className="space-y-3 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Quick input
        </CardTitle>
        <div className="flex gap-2">
          {modes.map((entry) => (
            <Button
              key={entry.id}
              onClick={() => setMode(entry.id)}
              type="button"
              variant={mode === entry.id ? "default" : "outline"}
            >
              {entry.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "observation" ? (
          <div className="space-y-3">
            <label
              className="block text-sm"
              htmlFor="student-quick-observation"
            >
              <span className="mb-2 block font-medium text-foreground">
                What did you notice?
              </span>
              <div className="relative">
                <Textarea
                  id="student-quick-observation"
                  onChange={(event) => setObservationNote(event.target.value)}
                  placeholder="E.g. Invited a peer to join the bead cabinet"
                  value={observationNote}
                />
                <VoiceInputButton
                  className="absolute right-2 top-2"
                  label="Dictate observation"
                  onTranscript={(value) =>
                    setObservationNote((current) =>
                      current.length === 0 ? value : `${current} ${value}`,
                    )
                  }
                />
              </div>
            </label>
            <Button
              disabled={observationDisabled || isSubmitting}
              onClick={handleObservationSubmit}
              type="button"
            >
              {createObservationMutation.isPending
                ? "Logging…"
                : "Log observation"}
            </Button>
          </div>
        ) : null}

        {mode === "task" ? (
          <div className="space-y-3">
            <label className="block text-sm" htmlFor="student-quick-task-title">
              <span className="mb-2 block font-medium text-foreground">
                Task title
              </span>
              <div className="relative">
                <Input
                  id="student-quick-task-title"
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Follow up on sweeping practice"
                  value={taskTitle}
                />
                <VoiceInputButton
                  className="absolute right-2 top-1.5"
                  label="Dictate task title"
                  onTranscript={(value) =>
                    setTaskTitle((current) =>
                      current.length === 0 ? value : `${current} ${value}`,
                    )
                  }
                />
              </div>
            </label>
            <label className="block text-sm" htmlFor="student-quick-task-notes">
              <span className="mb-2 block font-medium text-foreground">
                Notes
              </span>
              <Textarea
                id="student-quick-task-notes"
                onChange={(event) => setTaskNotes(event.target.value)}
                placeholder="Include any context or desired outcome"
                value={taskNotes}
              />
            </label>
            <Button
              disabled={taskDisabled || isSubmitting}
              onClick={handleTaskSubmit}
              type="button"
            >
              {createActionMutation.isPending ? "Creating…" : "Create task"}
            </Button>
          </div>
        ) : null}

        {mode === "lesson" ? (
          <div className="space-y-3">
            <label
              className="block text-sm"
              htmlFor="student-quick-lesson-title"
            >
              <span className="mb-2 block font-medium text-foreground">
                Lesson focus
              </span>
              <div className="relative">
                <Input
                  id="student-quick-lesson-title"
                  onChange={(event) => setLessonTitle(event.target.value)}
                  placeholder="Golden beads: exchanges"
                  value={lessonTitle}
                />
                <VoiceInputButton
                  className="absolute right-2 top-1.5"
                  label="Dictate lesson focus"
                  onTranscript={(value) =>
                    setLessonTitle((current) =>
                      current.length === 0 ? value : `${current} ${value}`,
                    )
                  }
                />
              </div>
            </label>
            <label
              className="block text-sm"
              htmlFor="student-quick-lesson-notes"
            >
              <span className="mb-2 block font-medium text-foreground">
                Notes
              </span>
              <Textarea
                id="student-quick-lesson-notes"
                onChange={(event) => setLessonNotes(event.target.value)}
                placeholder="Capture prerequisites or companions"
                value={lessonNotes}
              />
            </label>
            <Button
              disabled={lessonDisabled || isSubmitting}
              onClick={handleLessonSubmit}
              type="button"
            >
              {createActionMutation.isPending
                ? "Scheduling…"
                : "Schedule lesson"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
