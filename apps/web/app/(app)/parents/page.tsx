"use client";

import type { StudentParentOverview } from "@monte/shared";
import { useMemo, useState } from "react";

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
import { useParents } from "@/hooks/use-parents";

const contactFilters = [
  { id: "all", label: "All" },
  { id: "missingEmail", label: "Needs email" },
  { id: "missingPhone", label: "Needs phone" },
] as const;

type ContactFilter = (typeof contactFilters)[number]["id"];

export default function ParentsPage() {
  const [search, setSearch] = useState("");
  const [contactFilter, setContactFilter] = useState<ContactFilter>("all");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const parentsQuery = useParents();

  const parents = parentsQuery.data ?? [];

  const filteredParents = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    const results: StudentParentOverview[] = [];
    for (const parent of parents) {
      if (contactFilter === "missingEmail" && parent.email) {
        continue;
      }
      if (contactFilter === "missingPhone" && parent.phone) {
        continue;
      }

      if (lowered.length > 0) {
        const matchesName = parent.name.toLowerCase().includes(lowered);
        const matchesStudent = parent.studentName
          ? parent.studentName.toLowerCase().includes(lowered)
          : false;
        if (!matchesName && !matchesStudent) {
          continue;
        }
      }

      results.push(parent);
    }
    results.sort((a, b) => a.name.localeCompare(b.name));
    return results;
  }, [parents, search, contactFilter]);

  const metrics = useMemo(() => {
    let missingEmail = 0;
    let missingPhone = 0;
    for (const parent of parents) {
      if (!parent.email) {
        missingEmail += 1;
      }
      if (!parent.phone) {
        missingPhone += 1;
      }
    }
    return {
      total: parents.length,
      missingEmail,
      missingPhone,
    };
  }, [parents]);

  const activeParent = useMemo(() => {
    if (!selectedParentId) {
      return null;
    }
    return parents.find((parent) => parent.id === selectedParentId) ?? null;
  }, [parents, selectedParentId]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Guide" }, { label: "Parents" }]}
        description="Keep families in the loop with graceful summaries and timely follow-ups."
        onSearchChange={setSearch}
        primaryAction={{ label: "Compose update", href: "/updates/new" }}
        searchPlaceholder="Search families"
        title="Family communications"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 rounded-full border border-border/60 bg-card/70 p-1">
            {contactFilters.map((option) => (
              <Button
                key={option.id}
                onClick={() => setContactFilter(option.id)}
                type="button"
                variant={contactFilter === option.id ? "default" : "ghost"}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </AppPageHeader>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Parents synced
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {metrics.total}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Missing email
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {metrics.missingEmail}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Missing phone
            </CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {metrics.missingPhone}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              Parents
            </CardTitle>
            <CardDescription>
              Filter by contact completeness and send updates in one click.
            </CardDescription>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredParents.length} of {parents.length}
          </p>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-[1.4rem] border border-border/60">
          <ScrollArea className="max-h-[520px]">
            <Table>
              <TableHeader className="bg-background/70">
                <TableRow>
                  <TableHead>Parent</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Preferred contact</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parentsQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Loading family directory…
                    </TableCell>
                  </TableRow>
                ) : filteredParents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No parents match these filters. Adjust filters or add
                      contact details from the student profile.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell className="align-top text-sm font-medium text-foreground">
                        {parent.name}
                        {parent.relation ? (
                          <span className="ml-2 rounded-full bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            {parent.relation}
                          </span>
                        ) : null}
                        <span className="ml-2 rounded-full bg-muted/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                          {parent.source === "timeback" ? "Synced" : "Manual"}
                        </span>
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {parent.studentName ?? "Learner"}
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {parent.email ?? "—"}
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {parent.phone ?? "—"}
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {parent.preferred_contact_method ?? "—"}
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <Button
                          onClick={() => setSelectedParentId(parent.id)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Communication rhythm
          </CardTitle>
          <CardDescription>
            Batch updates by plane, draft summaries from observations, and
            schedule delivery for calm evenings at home.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Use quick generates from the student page to assemble highlights.
            Then choose{" "}
            <span className="font-medium text-foreground">Send now</span> or {}
            <span className="font-medium text-foreground">Schedule</span> to
            time delivery for family preference.
          </p>
        </CardContent>
      </Card>

      <Dialog
        onOpenChange={(open) => (!open ? setSelectedParentId(null) : null)}
        open={Boolean(activeParent)}
      >
        <DialogContent className="max-w-2xl rounded-3xl">
          {activeParent ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {activeParent.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Guardian for {activeParent.studentName ?? "learner"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p>{activeParent.email ?? "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p>{activeParent.phone ?? "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Relation</p>
                    <p>{activeParent.relation ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Preferred contact
                    </p>
                    <p>{activeParent.preferred_contact_method ?? "—"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" type="button">
                    Generate update
                  </Button>
                  <Button size="sm" type="button" variant="outline">
                    Schedule follow-up
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setSelectedParentId(null)}
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
