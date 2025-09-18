"use client";

import { AppPageHeader } from "@/components/app/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useActiveStudent } from "@/hooks/use-active-student";

export default function InboxPage() {
  const { student } = useActiveStudent("student-inbox");
  const firstName = student?.full_name.split(" ").at(0) ?? "Learner";

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Home", href: "/home" }, { label: "Inbox" }]}
        description="Messages and updates exchanged with your guide will live here."
        title={`${firstName}'s inbox`}
      />

      <Card className="rounded-3xl border-dashed border-border/60 bg-card/70 p-10 text-center">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl font-semibold text-foreground">
            Coming soon
          </CardTitle>
          <CardDescription className="mx-auto max-w-lg text-sm text-muted-foreground">
            Direct messaging with guides—including voice notes and quick
            attachments—will appear in this inbox once released.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
