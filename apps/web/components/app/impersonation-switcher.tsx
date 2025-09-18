"use client";

import type { Student, StudentParentOverview, TeamMember } from "@monte/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Fragment } from "react";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useImpersonation } from "@/hooks/use-impersonation";
import {
  getCurrentUser,
  listParents,
  listStudents,
  listTeamMembers,
} from "@/lib/api/endpoints";
import { isMockAuthMode } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

function buildLabel(
  selection: ReturnType<typeof useImpersonation>["selection"],
  students: Student[],
  team: TeamMember[],
  parents: StudentParentOverview[],
): string {
  switch (selection.kind) {
    case "self":
      return "Your account";
    case "student": {
      const student = students.find((item) => item.id === selection.studentId);
      return student?.full_name ?? "Student";
    }
    case "guide": {
      const guide = team.find((item) => item.id === selection.guideId);
      return guide?.name ?? guide?.email ?? "Guide";
    }
    case "parent": {
      const parent = parents.find((item) => item.id === selection.parentId);
      if (parent) {
        const base = parent.name ?? parent.email ?? "Parent";
        const student = students.find((item) => item.id === parent.studentId);
        return student ? `${base} (for ${student.full_name})` : base;
      }
      return "Parent";
    }
    default:
      return "Your account";
  }
}

function buildDescription(
  selection: ReturnType<typeof useImpersonation>["selection"],
): string {
  switch (selection.kind) {
    case "self":
      return "You are viewing Monte as yourself.";
    case "student":
      return "You are viewing Monte as a student.";
    case "guide":
      return "You are viewing Monte as a guide.";
    case "parent":
      return "You are viewing Monte as a parent.";
    default:
      return "You are viewing Monte as yourself.";
  }
}

export function ImpersonationMenuSection() {
  const { selection, setSelection, reset, isImpersonating } =
    useImpersonation();

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["impersonation", "students"],
    queryFn: ({ signal }) => listStudents({}, { signal }),
  });

  const teamQuery = useQuery<TeamMember[]>({
    queryKey: ["impersonation", "team"],
    queryFn: ({ signal }) => listTeamMembers({ signal }),
  });

  const parentsQuery = useQuery<StudentParentOverview[]>({
    queryKey: ["impersonation", "parents"],
    queryFn: ({ signal }) => listParents({ signal }),
  });

  const currentUserQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: ({ signal }) => getCurrentUser({ signal }),
  });

  const students = studentsQuery.data ?? [];
  const team = teamQuery.data ?? [];
  const parents = parentsQuery.data ?? [];

  const role = currentUserQuery.data?.role;
  const canImpersonate =
    isMockAuthMode || role === undefined || role === "administrator";

  const label = buildLabel(selection, students, team, parents);
  const description = buildDescription(selection);

  if (!canImpersonate) {
    return null;
  }

  const isLoading =
    studentsQuery.isLoading ||
    teamQuery.isLoading ||
    parentsQuery.isLoading ||
    currentUserQuery.isLoading;

  const guides = team.filter((member) => member.role !== "student");
  const studentItems = students.map((student) => ({
    id: student.id,
    label: student.full_name,
    active:
      (selection.kind === "student" && selection.studentId === student.id) ||
      (selection.kind === "parent" && selection.studentId === student.id),
    onSelect: () => setSelection({ kind: "student", studentId: student.id }),
  }));
  const guideItems = guides.map((member) => ({
    id: member.id,
    label: member.name ?? member.email ?? "Guide",
    active: selection.kind === "guide" && selection.guideId === member.id,
    onSelect: () => setSelection({ kind: "guide", guideId: member.id }),
  }));
  const parentItems = parents.map((parent) => ({
    id: parent.id,
    label:
      (parent.name ?? parent.email ?? "Parent") +
      (parent.studentName ? ` — ${parent.studentName}` : ""),
    active: selection.kind === "parent" && selection.parentId === parent.id,
    onSelect: () =>
      setSelection({
        kind: "parent",
        parentId: parent.id,
        studentId: parent.studentId,
      }),
  }));

  const renderGroup = (
    title: string,
    items: Array<{
      id: string;
      label: string;
      active: boolean;
      onSelect: () => void;
    }>,
  ) => {
    if (items.length === 0) {
      return null;
    }
    return (
      <Fragment key={title}>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            className={cn(
              "cursor-pointer",
              item.active &&
                "bg-accent text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            )}
            onClick={item.onSelect}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </Fragment>
    );
  };

  return (
    <>
      <DropdownMenuLabel>
        {isImpersonating ? `Impersonating: ${label}` : `Viewing as: ${label}`}
      </DropdownMenuLabel>
      <DropdownMenuItem
        disabled
        className="whitespace-normal text-xs text-muted-foreground"
      >
        {description}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {isLoading ? (
        <>
          <DropdownMenuItem disabled>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Loading identities…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      ) : (
        <>
          <DropdownMenuItem
            className={cn(
              "cursor-pointer",
              selection.kind === "self" &&
                "bg-accent text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            )}
            onClick={() => setSelection({ kind: "self" })}
          >
            Your account
          </DropdownMenuItem>
          {renderGroup("Guides", guideItems)}
          {renderGroup("Students", studentItems)}
          {renderGroup("Parents", parentItems)}
          {isImpersonating ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={reset}>
                Stop impersonating
              </DropdownMenuItem>
            </>
          ) : null}
          <DropdownMenuSeparator />
        </>
      )}
    </>
  );
}
