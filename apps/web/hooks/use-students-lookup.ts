"use client";

import type { Student } from "@monte/shared";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { listStudents } from "@/lib/api/endpoints";

export type StudentsLookupResult = {
  students: Student[];
  studentsById: Map<string, Student>;
  isLoading: boolean;
  isError: boolean;
};

export function useStudentsLookup(
  scope: string = "lookup",
): StudentsLookupResult {
  const studentsQuery = useQuery<Student[]>({
    queryKey: ["students", { scope }],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      listStudents({}, { signal }),
  });

  const students = studentsQuery.data ?? [];
  const studentsById = useMemo(() => {
    const map = new Map<string, Student>();
    for (const learner of students) {
      map.set(learner.id, learner);
    }
    return map;
  }, [students]);

  return {
    students,
    studentsById,
    isLoading: studentsQuery.isLoading,
    isError: Boolean(studentsQuery.error),
  };
}
