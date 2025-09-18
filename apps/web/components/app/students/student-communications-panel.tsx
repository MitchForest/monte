"use client";

import { MailPlus, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type StudentCommunicationsPanelProps = {
  onDraftUpdate?: () => void;
  onSendUpdate?: () => void;
};

export function StudentCommunicationsPanel({
  onDraftUpdate,
  onSendUpdate,
}: StudentCommunicationsPanelProps) {
  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MailPlus className="size-5 text-primary" /> Parent communications
        </CardTitle>
        <CardDescription>
          Draft Montessori stories and send quick updates to families.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground" htmlFor="communication-draft">
            Draft update
          </label>
          <Textarea
            id="communication-draft"
            placeholder="Share today’s highlights…"
            className="min-h-[120px]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" type="button" onClick={onDraftUpdate} className="gap-2">
            <MailPlus className="size-4" /> Save draft
          </Button>
          <Button size="sm" variant="outline" type="button" onClick={onSendUpdate} className="gap-2">
            <Send className="size-4" /> Send now
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: use the AI summary above to jump start your notes, then personalize for guardians.
        </p>
      </CardContent>
    </Card>
  );
}
