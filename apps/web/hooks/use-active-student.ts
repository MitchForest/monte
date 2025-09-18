"use client";

import type { Student } from "@monte/shared";
import { useMemo } from "react";

import { useImpersonation } from "@/hooks/use-impersonation";
import { useStudentsLookup } from "@/hooks/use-students-lookup";

export type ActiveStudentResult = {
  activeStudentId: string | null;
  student: Student | null;
  students: Student[];
  isLoading: boolean;
  isError: boolean;
  isImpersonated: boolean;
};

export function useActiveStudent(
  scope: string = "active-student",
): ActiveStudentResult {
  const { selection } = useImpersonation();
  const { students, studentsById, isLoading, isError } =
    useStudentsLookup(scope);

  const impersonatedStudentId = useMemo(() => {
    switch (selection.kind) {
      case "student":
        return selection.studentId;
      case "parent":
        return selection.studentId;
      default:
        return null;
    }
  }, [selection]);

  const activeStudentId = useMemo(() => {
    if (impersonatedStudentId) {
      return impersonatedStudentId;
    }
    const firstStudent = students.at(0);
    return firstStudent ? firstStudent.id : null;
  }, [impersonatedStudentId, students]);

  const student = useMemo(() => {
    if (!activeStudentId) {
      return null;
    }
    return studentsById.get(activeStudentId) ?? null;
  }, [activeStudentId, studentsById]);

  return {
    activeStudentId,
    student,
    students,
    isLoading,
    isError,
    isImpersonated: Boolean(impersonatedStudentId),
  };
}
