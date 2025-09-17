"use client";

import type {
  StudentParent,
  StudentSummary,
  StudentSummaryRecipient,
} from "@monte/shared";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createStudentSummary } from "@/lib/api/endpoints";

import { VoiceInputButton } from "./voice-input-button";

type Scope = "today" | "this_week" | "custom";

type StudentSummaryPanelProps = {
  studentId: string;
  parents: StudentParent[];
  summaries: StudentSummary[];
  onSummaryCreated: (payload: {
    summary: StudentSummary;
    recipients: StudentSummaryRecipient[];
  }) => void;
};

export function StudentSummaryPanel({
  studentId,
  parents,
  summaries,
  onSummaryCreated,
}: StudentSummaryPanelProps) {
  const [scope, setScope] = useState<Scope>("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [includeObservations, setIncludeObservations] = useState(true);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeLessons, setIncludeLessons] = useState(true);
  const [includeHabits, setIncludeHabits] = useState(true);
  const [manualNotes, setManualNotes] = useState("");
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [manualEmailDraft, setManualEmailDraft] = useState("");

  const createSummaryMutation = useMutation({
    mutationFn: createStudentSummary,
    onSuccess: (payload) => {
      toast.success("Summary generated");
      onSummaryCreated(payload);
      setManualNotes("");
      setManualEmailDraft("");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to generate summary",
      );
    },
  });

  const latestSummary = useMemo(() => summaries.at(0) ?? null, [summaries]);

  const toggleParent = (parentId: string) => {
    setSelectedParentIds((current) => {
      if (current.includes(parentId)) {
        return current.filter((id) => id !== parentId);
      }
      return [...current, parentId];
    });
  };

  const addManualEmail = () => {
    const trimmed = manualEmailDraft.trim();
    if (trimmed.length === 0) {
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }
    setManualEmails((current) => {
      if (current.includes(trimmed)) {
        return current;
      }
      return [...current, trimmed];
    });
    setManualEmailDraft("");
  };

  const removeManualEmail = (email: string) => {
    setManualEmails((current) => current.filter((item) => item !== email));
  };

  const handleGenerate = () => {
    if (scope === "custom" && (fromDate.length === 0 || toDate.length === 0)) {
      toast.error("Provide a start and end date");
      return;
    }

    const sendEmailPayload = (() => {
      if (selectedParentIds.length === 0 && manualEmails.length === 0) {
        return undefined;
      }
      return {
        parentIds: selectedParentIds.length > 0 ? selectedParentIds : undefined,
        emails: manualEmails.length > 0 ? manualEmails : undefined,
      };
    })();

    createSummaryMutation.mutate({
      studentId,
      scope,
      from: scope === "custom" ? fromDate : undefined,
      to: scope === "custom" ? toDate : undefined,
      includeObservations,
      includeTasks,
      includeLessons,
      includeHabits,
      manualNotes:
        manualNotes.trim().length > 0 ? manualNotes.trim() : undefined,
      sendEmail: sendEmailPayload,
    });
  };

  return (
    <Card className="rounded-3xl border-border/60 bg-background/80">
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          AI summary
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {(["today", "this_week", "custom"] as Scope[]).map((value) => (
            <Button
              key={value}
              onClick={() => setScope(value)}
              type="button"
              variant={scope === value ? "default" : "outline"}
            >
              {value === "today"
                ? "Today"
                : value === "this_week"
                  ? "This week"
                  : "Custom"}
            </Button>
          ))}
        </div>
        {scope === "custom" ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <label
              className="flex w-full flex-col text-sm"
              htmlFor="summary-from"
            >
              <span className="mb-2 font-medium text-foreground">From</span>
              <Input
                id="summary-from"
                onChange={(event) => setFromDate(event.target.value)}
                type="date"
                value={fromDate}
              />
            </label>
            <label
              className="flex w-full flex-col text-sm"
              htmlFor="summary-to"
            >
              <span className="mb-2 font-medium text-foreground">To</span>
              <Input
                id="summary-to"
                onChange={(event) => setToDate(event.target.value)}
                type="date"
                value={toDate}
              />
            </label>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Include data from
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setIncludeObservations((value) => !value)}
              type="button"
              variant={includeObservations ? "default" : "outline"}
            >
              Observations
            </Button>
            <Button
              onClick={() => setIncludeLessons((value) => !value)}
              type="button"
              variant={includeLessons ? "default" : "outline"}
            >
              Lessons
            </Button>
            <Button
              onClick={() => setIncludeTasks((value) => !value)}
              type="button"
              variant={includeTasks ? "default" : "outline"}
            >
              Tasks
            </Button>
            <Button
              onClick={() => setIncludeHabits((value) => !value)}
              type="button"
              variant={includeHabits ? "default" : "outline"}
            >
              Habits
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <label className="block text-sm" htmlFor="summary-notes">
            <span className="mb-2 block font-medium text-foreground">
              Highlight any context to guide tone
            </span>
            <div className="relative">
              <Textarea
                id="summary-notes"
                onChange={(event) => setManualNotes(event.target.value)}
                placeholder="E.g. family welcomed a new sibling this week"
                value={manualNotes}
              />
              <VoiceInputButton
                className="absolute right-2 top-2"
                label="Dictate notes"
                onTranscript={(value) =>
                  setManualNotes((current) =>
                    current.length === 0 ? value : `${current} ${value}`,
                  )
                }
              />
            </div>
          </label>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Email summary to guardians
          </h3>
          {parents.length > 0 ? (
            <ul className="grid gap-2">
              {parents.map((parent) => (
                <li
                  key={parent.id}
                  className="flex items-center justify-between gap-3"
                >
                  <label
                    className="flex items-center gap-3 text-sm"
                    htmlFor={`parent-${parent.id}`}
                  >
                    <input
                      checked={selectedParentIds.includes(parent.id)}
                      className="size-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      id={`parent-${parent.id}`}
                      onChange={() => toggleParent(parent.id)}
                      type="checkbox"
                    />
                    <span className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {parent.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {parent.email ?? "No email on file"}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add guardians to the learner to enable one-click family updates.
            </p>
          )}

          <div className="space-y-2">
            <label className="block text-sm" htmlFor="manual-email">
              <span className="mb-2 block font-medium text-foreground">
                Additional emails
              </span>
              <div className="flex items-center gap-2">
                <Input
                  id="manual-email"
                  onChange={(event) => setManualEmailDraft(event.target.value)}
                  placeholder="guardian@example.com"
                  type="email"
                  value={manualEmailDraft}
                />
                <Button
                  onClick={addManualEmail}
                  type="button"
                  variant="outline"
                >
                  Add
                </Button>
              </div>
            </label>
            {manualEmails.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {manualEmails.map((email) => (
                  <li key={email}>
                    <button
                      className="rounded-full border border-border/60 bg-muted px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => removeManualEmail(email)}
                      type="button"
                    >
                      {email}
                      <span className="ml-2 text-muted-foreground">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            disabled={createSummaryMutation.isPending}
            onClick={handleGenerate}
            type="button"
          >
            {createSummaryMutation.isPending
              ? "Generating…"
              : "Generate summary"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Summaries are stored securely and can be revisited before sharing.
          </p>
        </div>

        {latestSummary ? (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Latest summary
            </h3>
            <article className="rounded-2xl border border-border/60 bg-card/70 p-4 text-sm leading-relaxed text-foreground">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {new Date(latestSummary.created_at).toLocaleString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <h4 className="mt-2 text-base font-semibold">
                {latestSummary.title}
              </h4>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {latestSummary.content}
              </p>
            </article>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
