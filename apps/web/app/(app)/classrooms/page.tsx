"use client";

import type { ClassroomWithGuides, TeamMember } from "@monte/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  createClassroom,
  listClassrooms,
  listTeamMembers,
} from "@/lib/api/endpoints";

export default function ClassroomsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);

  const teamQuery = useQuery({
    queryKey: ["team"],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listTeamMembers({ signal }),
  });

  useEffect(() => {
    if (teamQuery.error instanceof Error) {
      toast.error(teamQuery.error.message);
    }
  }, [teamQuery.error]);

  const classroomsQuery = useQuery({
    queryKey: ["classrooms", { search }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listClassrooms({ search }, { signal }),
  });

  useEffect(() => {
    if (classroomsQuery.error instanceof Error) {
      toast.error(classroomsQuery.error.message);
    }
  }, [classroomsQuery.error]);

  const createMutation = useMutation({
    mutationFn: createClassroom,
    onSuccess: () => {
      toast.success("Classroom created");
      setName("");
      setSelectedGuides([]);
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to create classroom",
      );
    },
  });

  const classrooms = (classroomsQuery.data ?? []) as ClassroomWithGuides[];
  const isLoading = classroomsQuery.isLoading;
  const isFetching = classroomsQuery.isFetching;

  const handleCreate = () => {
    if (name.trim().length === 0) {
      toast.error("Classroom name is required");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      guideIds: selectedGuides,
    });
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
              {isLoading || isFetching
                ? "Loading classrooms…"
                : "No classrooms yet."}
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
                {(teamQuery.data ?? []).map((member: TeamMember) => {
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
                              : prev.filter((id) => id !== member.id),
                          );
                        }}
                        type="checkbox"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
                {(teamQuery.data?.length ?? 0) === 0 && (
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
            <Button disabled={createMutation.isPending} onClick={handleCreate}>
              {createMutation.isPending ? "Creating..." : "Create classroom"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
