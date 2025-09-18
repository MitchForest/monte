"use client";

import { useState } from "react";
import { Mic, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function StudentQuickCommunications() {
  const [note, setNote] = useState("");

  return (
    <Card className="rounded-3xl border-border/60 bg-background/80">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Quick parent update
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Celebrations, reminders, or highlights to share"
          className="min-h-[120px]"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setNote((current) => `${current ? `${current} ` : ""}🎉 Great job completing math work today!`)}
          >
            <Mic className="size-4" /> Voice-to-text
          </Button>
          <Button type="button" size="sm" className="gap-2">
            <Send className="size-4" /> Send update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
