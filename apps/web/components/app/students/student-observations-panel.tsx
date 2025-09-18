"use client";

import { NotebookText, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type StudentObservationItem = {
  id: string;
  createdAt: string;
  author?: string | null;
  summary: string;
};

type StudentObservationsPanelProps = {
  observations?: StudentObservationItem[] | null;
  onCreateObservation?: () => void;
};

const demoObservations: StudentObservationItem[] = [
  {
    id: "obs-1",
    createdAt: new Date().toISOString(),
    author: "Guide Rivera",
    summary:
      "Invited a younger child to join sweeping work and showed patience.",
  },
  {
    id: "obs-2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    author: "Guide Patel",
    summary: "Completed golden bead subtraction with minimal prompts.",
  },
];

export function StudentObservationsPanel({
  observations,
  onCreateObservation,
}: StudentObservationsPanelProps) {
  const entries = useMemo(
    () =>
      observations && observations.length > 0 ? observations : demoObservations,
    [observations],
  );

  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <NotebookText className="size-5 text-primary" /> Observations
          </CardTitle>
          <CardDescription>
            Capture quick Montessori notes to share during debriefs or family
            updates.
          </CardDescription>
        </div>
        <Button onClick={onCreateObservation} size="sm" type="button">
          New observation
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/70 p-4"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span>{entry.author ?? "Guide"}</span>
              <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-foreground">{entry.summary}</p>
          </div>
        ))}
        <Button size="sm" variant="ghost" className="gap-2" type="button">
          <Sparkles className="size-4" /> Generate AI summary
        </Button>
      </CardContent>
    </Card>
  );
}
