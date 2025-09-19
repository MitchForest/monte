"use client";

import type { Observation, Student } from "@monte/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay, isSameMonth, isSameWeek } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  createObservation,
  listObservations,
  listStudents,
} from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";

const ranges = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All" },
] as const;

const densities = [
  { id: "compact", label: "Compact" },
  { id: "cozy", label: "Comfort" },
] as const;

type RangeId = (typeof ranges)[number]["id"];
type DensityId = (typeof densities)[number]["id"];

function extractTags(content: string): string[] {
  const matches = content.matchAll(/#(\w+)/g);
  const unique = new Set<string>();
  for (const match of matches) {
    const [, tag] = match;
    if (tag) {
      unique.add(tag);
    }
  }
  return Array.from(unique);
}

function passesRangeFilter(range: RangeId, createdAt: Date): boolean {
  const now = new Date();
  switch (range) {
    case "today":
      return isSameDay(createdAt, now);
    case "week":
      return isSameWeek(createdAt, now, { weekStartsOn: 1 });
    case "month":
      return isSameMonth(createdAt, now);
    default:
      return true;
  }
}

function formatRelative(createdAt: Date): string {
  if (isSameDay(createdAt, new Date())) {
    return `Today · ${format(createdAt, "p")}`;
  }
  return format(createdAt, "MMM d · p");
}

export default function ObservationsPage() {
  const queryClient = useQueryClient();
  const [range, setRange] = useState<RangeId>("today");
  const [density, setDensity] = useState<DensityId>("compact");
  const [search, setSearch] = useState("");
  const [selectedObservationId, setSelectedObservationId] = useState<
    string | null
  >(null);
  const [draftContent, setDraftContent] = useState("");
  const [draftStudentId, setDraftStudentId] = useState("");
  const [lastDraftSaved, setLastDraftSaved] = useState<Date | null>(null);

  const observationsQuery = useQuery({
    queryKey: ["observations", { scope: "all" }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listObservations({}, { signal }),
  });

  const studentsQuery = useQuery({
    queryKey: ["students", { scope: "observations" }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listStudents({}, { signal }),
  });

  const observations = observationsQuery.data ?? [];
  const students = studentsQuery.data ?? [];

  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    for (const student of students) {
      map.set(student.id, student);
    }
    return map;
  }, [students]);

  const filteredObservations = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    const results: Observation[] = [];

    for (const observation of observations) {
      const createdAt = new Date(observation.created_at);
      if (!passesRangeFilter(range, createdAt)) {
        continue;
      }

      if (lowered.length > 0) {
        const studentName =
          studentMap.get(observation.student_id)?.full_name ?? "";
        const tags = extractTags(observation.content);
        const matchesContent = observation.content
          .toLowerCase()
          .includes(lowered);
        const matchesStudent = studentName.toLowerCase().includes(lowered);
        let matchesTag = false;
        for (const tag of tags) {
          if (tag.toLowerCase().includes(lowered)) {
            matchesTag = true;
            break;
          }
        }
        if (!matchesContent && !matchesStudent && !matchesTag) {
          continue;
        }
      }

      results.push(observation);
    }

    results.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return results;
  }, [observations, range, search, studentMap]);

  const activeObservation = useMemo(() => {
    if (!selectedObservationId) {
      return null;
    }
    return (
      observations.find((item) => item.id === selectedObservationId) ?? null
    );
  }, [observations, selectedObservationId]);

  const insight = useMemo(() => {
    let withAudio = 0;
    let todayCount = 0;
    let weekCount = 0;
    for (const observation of observations) {
      if (observation.audio_url) {
        withAudio += 1;
      }
      const createdAt = new Date(observation.created_at);
      if (isSameDay(createdAt, new Date())) {
        todayCount += 1;
      }
      if (isSameWeek(createdAt, new Date(), { weekStartsOn: 1 })) {
        weekCount += 1;
      }
    }

    return {
      total: observations.length,
      withAudio,
      todayCount,
      weekCount,
    };
  }, [observations]);

  const tagSuggestions = useMemo(() => {
    const unique = new Set<string>();
    for (const observation of observations) {
      for (const tag of extractTags(observation.content)) {
        unique.add(tag);
        if (unique.size >= 6) {
          break;
        }
      }
      if (unique.size >= 6) {
        break;
      }
    }
    return Array.from(unique);
  }, [observations]);

  useEffect(() => {
    if (draftContent.trim().length === 0) {
      setLastDraftSaved(null);
      return;
    }
    const handle = window.setTimeout(() => {
      setLastDraftSaved(new Date());
    }, 800);
    return () => window.clearTimeout(handle);
  }, [draftContent]);

  const createObservationMutation = useMutation({
    mutationFn: ({
      content,
      studentId,
    }: {
      content: string;
      studentId?: string;
    }) => createObservation({ content, studentId }),
    onSuccess: () => {
      toast.success("Observation captured");
      setDraftContent("");
      setDraftStudentId("");
      setLastDraftSaved(null);
      queryClient.invalidateQueries({ queryKey: ["observations"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to save observation",
      );
    },
  });

  const handleRecordObservation = () => {
    if (draftContent.trim().length < 3) {
      toast.error("Add a brief note before recording");
      return;
    }

    createObservationMutation.mutate({
      content: draftContent.trim(),
      studentId: draftStudentId ? draftStudentId : undefined,
    });
  };

  const densityRowClass = density === "compact" ? "py-3" : "py-4";

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Guide" }, { label: "Observations" }]}
        description="Capture Montessori-aligned notes, tag materials, and share when ready."
        onSearchChange={setSearch}
        primaryAction={{
          label: "New observation",
          onClick: () => {
            const textarea = document.getElementById("observation-composer");
            textarea?.focus();
          },
        }}
        searchPlaceholder="Search by student, tag, or note"
        title="Observation studio"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 rounded-full border border-border/60 bg-card/70 p-1">
            {ranges.map((item) => (
              <Button
                key={item.id}
                onClick={() => setRange(item.id)}
                type="button"
                variant={range === item.id ? "default" : "ghost"}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 rounded-full border border-border/60 bg-card/70 p-1">
            {densities.map((item) => (
              <Button
                key={item.id}
                onClick={() => setDensity(item.id)}
                type="button"
                variant={density === item.id ? "default" : "ghost"}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </AppPageHeader>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Captured today
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {insight.todayCount}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              This week
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {insight.weekCount}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Voice notes
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {insight.withAudio}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Total saved
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {insight.total}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Quick capture
            </CardTitle>
            <CardDescription>
              Autosaves as you type. Add tags to surface this moment later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label
              className="flex flex-col gap-2 text-sm"
              htmlFor="observation-composer"
            >
              <span className="font-medium text-foreground">Observation</span>
              <Textarea
                id="observation-composer"
                onChange={(event) => setDraftContent(event.target.value)}
                placeholder="Document what you notice…"
                value={draftContent}
              />
            </label>
            <div className="flex flex-col gap-2 text-sm">
              <label
                className="font-medium text-foreground"
                htmlFor="observation-student"
              >
                Student (optional)
              </label>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="observation-student"
                onChange={(event) => setDraftStudentId(event.target.value)}
                value={draftStudentId}
              >
                <option value="">Select a learner</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </div>
            {tagSuggestions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Suggested tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                      onClick={() => {
                        const hashtag = `#${tag}`;
                        if (!draftContent.includes(hashtag)) {
                          setDraftContent((current) =>
                            current.length > 0
                              ? `${current} ${hashtag}`
                              : hashtag,
                          );
                        }
                      }}
                      type="button"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {lastDraftSaved
                  ? `Draft saved ${format(lastDraftSaved, "pp")}`
                  : "Draft saves automatically"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={createObservationMutation.isPending}
                  onClick={handleRecordObservation}
                  type="button"
                >
                  {createObservationMutation.isPending
                    ? "Saving…"
                    : "Record observation"}
                </Button>
                <Button
                  onClick={() => {
                    setDraftContent("");
                    setDraftStudentId("");
                    setLastDraftSaved(null);
                  }}
                  type="button"
                  variant="ghost"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Smart filters
            </CardTitle>
            <CardDescription>
              Combine hashtags, materials, and learners to narrow focus fast.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Use hashtags like{" "}
              <span className="font-medium text-foreground">#sensorial</span> or
              <span className="font-medium text-foreground">#cosmic</span> to
              surface patterns. Highlight any word to tag it on the fly.
            </p>
            <p>
              Observations auto-save every few seconds so you can stay present
              in the classroom.
            </p>
            <p>
              Add a voice memo when you need to capture the moment hands-free.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              Observation log
            </CardTitle>
            <CardDescription>
              Filter by day, type, or learner. Open any note to enrich or share.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Showing {filteredObservations.length} of {observations.length}
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-[1.4rem] border border-border/60">
          <ScrollArea className="max-h-[520px]">
            <Table>
              <TableHeader className="bg-background/70">
                <TableRow>
                  <TableHead>Observation</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Captured</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {observationsQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Loading observations…
                    </TableCell>
                  </TableRow>
                ) : filteredObservations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No observations yet. Try a different filter or capture a
                      new moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredObservations.map((observation) => {
                    const createdAt = new Date(observation.created_at);
                    const student = studentMap.get(observation.student_id);
                    const tags = extractTags(observation.content);
                    return (
                      <TableRow
                        key={observation.id}
                        className={cn(densityRowClass)}
                      >
                        <TableCell className="align-top text-sm text-foreground">
                          <p className="line-clamp-2 leading-relaxed">
                            {observation.content}
                          </p>
                          {observation.audio_url ? (
                            <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              Voice note attached
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          {student ? student.full_name : "—"}
                        </TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          {formatRelative(createdAt)}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-right">
                          <Button
                            onClick={() =>
                              setSelectedObservationId(observation.id)
                            }
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

      <Dialog
        onOpenChange={(open) => (!open ? setSelectedObservationId(null) : null)}
        open={Boolean(activeObservation)}
      >
        <DialogContent className="max-w-3xl rounded-3xl">
          {activeObservation ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  Observation details
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {formatRelative(new Date(activeObservation.created_at))}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground">
                  {activeObservation.content}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {extractTags(activeObservation.content).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                  {activeObservation.audio_url ? (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Voice note available
                    </span>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  Highlight any word in the note to tag it as a material,
                  subject, or student. Use badges below to keep structured data
                  tidy.
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setSelectedObservationId(null)}
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
