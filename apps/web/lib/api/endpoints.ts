import type { HabitSchedule } from "@monte/shared";
import {
  ClassroomCreatedResponseSchema,
  ClassroomsListResponseSchema,
  HabitDetailResponseSchema,
  HabitsListResponseSchema,
  StudentDetailResponseSchema,
  StudentsListResponseSchema,
  TeamListResponseSchema,
} from "@monte/shared";
import type { z } from "zod";

import { apiClient } from "./client";

type RequestOptions = {
  signal?: AbortSignal;
};

type ClassroomsClient = {
  $get: (
    args?: { query?: { search?: string } },
    options?: { init?: RequestInit },
  ) => Promise<Response>;
  $post: (args: {
    json: { name: string; guideIds: string[] };
  }) => Promise<Response>;
};

type StudentsClient = {
  $get: (
    args?: { query?: { search?: string; classroomId?: string } },
    options?: { init?: RequestInit },
  ) => Promise<Response>;
  $post: (args: {
    json: {
      full_name: string;
      dob?: string;
      primary_classroom_id?: string | null;
    };
  }) => Promise<Response>;
};

type HabitsClient = {
  $get: (
    args?: undefined,
    options?: { init?: RequestInit },
  ) => Promise<Response>;
  $post: (args: {
    json: { studentId: string; name: string; schedule: HabitSchedule };
  }) => Promise<Response>;
};

type TeamClient = {
  $get: (
    args?: undefined,
    options?: { init?: RequestInit },
  ) => Promise<Response>;
};

type MonteApiClient = {
  classrooms: ClassroomsClient;
  students: StudentsClient;
  habits: HabitsClient;
  team: TeamClient;
};

const client = apiClient as unknown as MonteApiClient;

async function handleResponse<T>(
  promise: Promise<Response>,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await promise;

  if (!response.ok) {
    let message = response.statusText;
    try {
      const errorBody = (await response.json()) as { error?: unknown };
      if (typeof errorBody?.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // ignore parse failure
    }
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as unknown;
  return schema.parse(payload);
}

export async function listTeamMembers(options: RequestOptions = {}) {
  const response = await handleResponse(
    client.team.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    TeamListResponseSchema,
  );
  return response.data.members;
}

type ListClassroomsParams = {
  search?: string;
};

export async function listClassrooms(
  params: ListClassroomsParams = {},
  options: RequestOptions = {},
) {
  const response = await handleResponse(
    client.classrooms.$get(
      params.search && params.search.trim().length > 0
        ? { query: { search: params.search.trim() } }
        : undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    ClassroomsListResponseSchema,
  );
  return response.data.classrooms;
}

type CreateClassroomInput = {
  name: string;
  guideIds: string[];
};

export async function createClassroom(input: CreateClassroomInput) {
  const response = await handleResponse(
    client.classrooms.$post({
      json: {
        name: input.name,
        guideIds: input.guideIds,
      },
    }),
    ClassroomCreatedResponseSchema,
  );
  return response.data.classroom;
}

type ListStudentsParams = {
  search?: string;
  classroomId?: string;
};

export async function listStudents(
  params: ListStudentsParams = {},
  options: RequestOptions = {},
) {
  const query: Record<string, string> = {};
  if (params.search && params.search.trim().length > 0) {
    query.search = params.search.trim();
  }
  if (params.classroomId) {
    query.classroomId = params.classroomId;
  }

  const response = await handleResponse(
    client.students.$get(
      Object.keys(query).length > 0 ? { query } : undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    StudentsListResponseSchema,
  );
  return response.data.students;
}

type CreateStudentInput = {
  fullName: string;
  dob?: string;
  primaryClassroomId?: string | null;
};

export async function createStudent(input: CreateStudentInput) {
  const response = await handleResponse(
    client.students.$post({
      json: {
        full_name: input.fullName,
        dob: input.dob,
        primary_classroom_id: input.primaryClassroomId ?? null,
      },
    }),
    StudentDetailResponseSchema,
  );
  return response.data.student;
}

export async function listHabits(options: RequestOptions = {}) {
  const response = await handleResponse(
    client.habits.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    HabitsListResponseSchema,
  );
  return response.data.habits;
}

type CreateHabitInput = {
  studentId: string;
  name: string;
  schedule: HabitSchedule;
};

export async function createHabit(input: CreateHabitInput) {
  const response = await handleResponse(
    client.habits.$post({
      json: {
        studentId: input.studentId,
        name: input.name,
        schedule: input.schedule,
      },
    }),
    HabitDetailResponseSchema,
  );
  return response.data.habit;
}
