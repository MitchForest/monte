"use client";

import { useEffect, useState } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";
import type {
  ClassroomWithGuides,
  TeamListResponse,
  TeamMember,
} from "@monte/shared";

type Classroom = ClassroomWithGuides;
type ClassroomResponse = {
  classrooms: ClassroomWithGuides[];
};

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const payload = await apiFetch<TeamListResponse>("/team");
        setTeam(payload.members);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load team"
        );
      }
    };

    loadTeam();
  }, []);

  useEffect(() => {
    const loadClassrooms = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim().length > 0) {
          params.set("search", search.trim());
        }
        const payload = await apiFetch<ClassroomResponse>(
          `/classrooms${params.size > 0 ? `?${params.toString()}` : ""}`
        );
        setClassrooms(payload.classrooms);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load classrooms"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadClassrooms();
  }, [search]);

  const handleCreate = async () => {
    if (name.trim().length === 0) {
      toast.error("Classroom name is required");
      return;
    }
    try {
      const created = await apiFetch<Classroom>("/classrooms", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          guideIds: selectedGuides,
        }),
      });
      toast.success("Classroom created");
      setName("");
      setSelectedGuides([]);
      setDialogOpen(false);
      setClassrooms((prev) => [created, ...prev]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create classroom"
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Classrooms" },
        ]}
        description="See every prepared environment at a glance and keep teams balanced."
        onSearchChange={setSearch}
        primaryAction={{
          label: "Add classroom",
          onClick: () => setDialogOpen(true),
        }}
        searchPlaceholder="Search classrooms or guides"
        title="Classroom environments"
      />

      <Card className="rounded-3xl border-border/60 bg-card/90 shadow-md">
        <CardHeader>
          <CardTitle className="font-semibold text-xl">
            Classrooms ({classrooms.length})
          </CardTitle>
          <CardDescription>
            Adjust ratios, roster notes, and guide assignments for each room.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classrooms.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {isLoading ? "Loading classrooms…" : "No classrooms yet."}
            </p>
          ) : (
            <ul className="divide-y divide-border/50 text-muted-foreground text-sm">
              {classrooms.map((room) => (
                <li
                  className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0"
                  key={room.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{room.name}</p>
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
                      Founded{" "}
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        year: "numeric",
                      }).format(new Date(room.created_at))}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs uppercase tracking-[0.22em]">
                    {room.guides.length > 0 ? (
                      <span>
                        Guides:{" "}
                        {room.guides
                          .map((guide) => guide.name ?? guide.email)
                          .join(" • ")}
                      </span>
                    ) : (
                      <span>No guides assigned yet</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setDialogOpen} open={isDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create classroom</DialogTitle>
            <DialogDescription>
              Give the environment a name and optionally pair guides right away.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label
              className="flex flex-col gap-2 text-sm"
              htmlFor="classroom-name"
            >
              <span className="font-medium text-foreground">
                Classroom name
              </span>
              <Input
                autoFocus
                id="classroom-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Primary West"
                value={name}
              />
            </label>
            <div className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Guides</span>
              <div className="flex flex-wrap gap-2">
                {team.map((member) => {
                  const label = member.name ?? member.email;
                  const isChecked = selectedGuides.includes(member.id);
                  return (
                    <label
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1"
                      htmlFor={`guide-${member.id}`}
                      key={member.id}
                    >
                      <input
                        checked={isChecked}
                        className="size-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                        id={`guide-${member.id}`}
                        onChange={(event) => {
                          setSelectedGuides((prev) =>
                            event.target.checked
                              ? [...prev, member.id]
                              : prev.filter((id) => id !== member.id)
                          );
                        }}
                        type="checkbox"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
                {team.length === 0 && (
                  <span className="text-muted-foreground">
                    Invite teammates to assign guides later.
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create classroom</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
