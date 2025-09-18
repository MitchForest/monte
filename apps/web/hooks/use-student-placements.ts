import { useQuery } from "@tanstack/react-query";

import {
  getStudentNextPlacement,
  getStudentPlacementCourses,
  getStudentPlacementLevel,
  getStudentPlacementTests,
} from "@/lib/api/endpoints";

export const studentPlacementCoursesKey = (
  studentId: string | null | undefined,
  subject: string | null | undefined,
) => ["student-placements", "courses", studentId, subject ?? null];

export function useStudentPlacementCourses(
  params: { studentId: string | null | undefined; subject?: string | null },
  options?: { enabled?: boolean },
) {
  const { studentId, subject } = params;
  return useQuery({
    queryKey: studentPlacementCoursesKey(studentId, subject ?? null),
    enabled: Boolean(studentId) && (options?.enabled ?? true),
    queryFn: ({ signal }) =>
      getStudentPlacementCourses(
        {
          studentId: studentId as string,
          subject: subject ?? null,
        },
        { signal },
      ),
  });
}

export const studentPlacementLevelKey = (
  studentId: string | null | undefined,
  subject: string | null | undefined,
) => ["student-placements", "current-level", studentId, subject ?? null];

export function useStudentPlacementLevel(
  params: { studentId: string | null | undefined; subject?: string | null },
  options?: { enabled?: boolean },
) {
  const { studentId, subject } = params;
  return useQuery({
    queryKey: studentPlacementLevelKey(studentId, subject ?? null),
    enabled: Boolean(studentId) && (options?.enabled ?? true),
    queryFn: ({ signal }) =>
      getStudentPlacementLevel(
        {
          studentId: studentId as string,
          subject: subject ?? null,
        },
        { signal },
      ),
  });
}

export const studentNextPlacementKey = (
  studentId: string | null | undefined,
  subject: string | null | undefined,
) => ["student-placements", "next", studentId, subject ?? null];

export function useStudentNextPlacement(
  params: { studentId: string | null | undefined; subject?: string | null },
  options?: { enabled?: boolean },
) {
  const { studentId, subject } = params;
  return useQuery({
    queryKey: studentNextPlacementKey(studentId, subject ?? null),
    enabled: Boolean(studentId) && (options?.enabled ?? true),
    queryFn: ({ signal }) =>
      getStudentNextPlacement(
        {
          studentId: studentId as string,
          subject: subject ?? null,
        },
        { signal },
      ),
  });
}

export const studentPlacementTestsKey = (
  studentId: string | null | undefined,
  subject: string | null | undefined,
) => ["student-placements", "tests", studentId, subject ?? null];

export function useStudentPlacementTests(
  params: { studentId: string | null | undefined; subject?: string | null },
  options?: { enabled?: boolean },
) {
  const { studentId, subject } = params;
  return useQuery({
    queryKey: studentPlacementTestsKey(studentId, subject ?? null),
    enabled: Boolean(studentId) && (options?.enabled ?? true),
    queryFn: ({ signal }) =>
      getStudentPlacementTests(
        {
          studentId: studentId as string,
          subject: subject ?? null,
        },
        { signal },
      ),
  });
}
