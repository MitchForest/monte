import type { HabitSchedule } from "@monte/shared";
import {
  ActionDetailResponseSchema,
  ActionsListResponseSchema,
  ClassroomCreatedResponseSchema,
  ClassroomsListResponseSchema,
  HabitCheckinDeletionResponseSchema,
  HabitCheckinDetailResponseSchema,
  HabitDetailResponseSchema,
  HabitsListResponseSchema,
  ObservationDetailResponseSchema,
  ObservationsListResponseSchema,
  StudentDetailResponseSchema,
  StudentSummariesListResponseSchema,
  StudentSummaryDetailResponseSchema,
  StudentsListResponseSchema,
  TeamListResponseSchema,
} from "@monte/shared";
import type { z } from "zod";

import type { ApiClient } from "./client";
import { apiClient } from "./client";

type RequestOptions = {
  signal?: AbortSignal;
};

type ObservationsClient = ApiClient["observations"] & {
  $post: (args: {
    json: {
      content: string;
      studentId?: string | null;
      audioUrl?: string | null;
    };
  }) => Promise<Response>;
};

type ActionsClient = ApiClient["tasks"] & {
  $post: (args: {
    json: {
      title: string;
      description?: string | null;
      studentId: string;
      dueDate?: string | null;
      type: "task" | "lesson";
      assignedToUserId?: string | null;
    };
  }) => Promise<Response>;
  ":id": {
    $patch: (args: {
      param: { id: string };
      json: {
        title?: string;
        description?: string | null;
        status?: "pending" | "in_progress" | "completed" | "cancelled";
        dueDate?: string | null;
        assignedToUserId?: string | null;
      };
    }) => Promise<Response>;
  };
};

type ExtendedApiClient = ApiClient & {
  observations: ObservationsClient;
  tasks: ActionsClient;
};

const client = apiClient as ExtendedApiClient;

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
      {
        query:
          params.search && params.search.trim().length > 0
            ? { search: params.search.trim() }
            : {},
      },
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
  const response = await handleResponse(
    client.students.$get(
      {
        query: {
          ...(params.search && params.search.trim().length > 0
            ? { search: params.search.trim() }
            : {}),
          ...(params.classroomId ? { classroomId: params.classroomId } : {}),
        },
      },
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
  const payload: {
    full_name: string;
    dob?: string;
    primary_classroom_id?: string;
  } = {
    full_name: input.fullName,
  };

  if (input.dob) {
    payload.dob = input.dob;
  }

  if (input.primaryClassroomId) {
    payload.primary_classroom_id = input.primaryClassroomId;
  }

  const response = await handleResponse(
    client.students.$post({ json: payload }),
    StudentDetailResponseSchema,
  );
  return response.data.student;
}

export async function getStudent(id: string) {
  const response = await handleResponse(
    client.students[":id"].$get({ param: { id } }),
    StudentDetailResponseSchema,
  );
  return response.data;
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

type HabitCheckinInput = {
  habitId: string;
  date: string;
};

export async function createHabitCheckin(input: HabitCheckinInput) {
  const response = await handleResponse(
    client.habits[":id"]["check-ins"].$post({
      param: { id: input.habitId },
      json: { date: input.date },
    }),
    HabitCheckinDetailResponseSchema,
  );
  return response.data.checkin;
}

export async function deleteHabitCheckin(input: HabitCheckinInput) {
  const response = await handleResponse(
    client.habits[":id"]["check-ins"].$delete({
      param: { id: input.habitId },
      query: { date: input.date },
    }),
    HabitCheckinDeletionResponseSchema,
  );
  return response.data.deleted;
}

type ListStudentSummariesParams = {
  studentId?: string;
};

export async function listStudentSummaries(
  params: ListStudentSummariesParams = {},
  options: RequestOptions = {},
) {
  const response = await handleResponse(
    client["student-summaries"].$get(
      {
        query: params.studentId ? { studentId: params.studentId } : {},
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    StudentSummariesListResponseSchema,
  );
  return response.data.summaries;
}

type CreateStudentSummaryInput = {
  studentId: string;
  scope: "today" | "this_week" | "custom";
  from?: string;
  to?: string;
  includeObservations?: boolean;
  includeTasks?: boolean;
  includeLessons?: boolean;
  includeHabits?: boolean;
  manualNotes?: string;
  model?: string;
  sendEmail?: {
    parentIds?: string[];
    emails?: string[];
  };
};

export async function createStudentSummary(input: CreateStudentSummaryInput) {
  const response = await handleResponse(
    client["student-summaries"].$post({ json: input }),
    StudentSummaryDetailResponseSchema,
  );
  return response.data;
}

export async function getStudentSummary(id: string) {
  const response = await handleResponse(
    client["student-summaries"][":id"].$get({ param: { id } }),
    StudentSummaryDetailResponseSchema,
  );
  return response.data;
}

type ListObservationsParams = {
  studentId?: string;
};

export async function listObservations(
  params: ListObservationsParams = {},
  options: RequestOptions = {},
) {
  const response = await handleResponse(
    client.observations.$get(
      {
        query: params.studentId ? { studentId: params.studentId } : {},
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    ObservationsListResponseSchema,
  );
  return response.data.observations;
}

type CreateObservationInput = {
  content: string;
  studentId?: string | null;
  audioUrl?: string | null;
};

export async function createObservation(input: CreateObservationInput) {
  const response = await handleResponse(
    client.observations.$post({
      json: {
        content: input.content,
        studentId: input.studentId ?? null,
        audioUrl: input.audioUrl ?? null,
      },
    }),
    ObservationDetailResponseSchema,
  );
  return response.data.observation;
}

type ListActionsParams = {
  type?: "task" | "lesson";
  status?: string;
  assignedTo?: string;
  studentId?: string;
};

export async function listActions(
  params: ListActionsParams = {},
  options: RequestOptions = {},
) {
  const response = await handleResponse(
    client.tasks.$get(
      {
        query: {
          type: params.type,
          status: params.status,
          assignedTo: params.assignedTo,
          ...(params.studentId ? { studentId: params.studentId } : {}),
        },
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    ActionsListResponseSchema,
  );
  return response.data.actions;
}

export async function listLessons(options: RequestOptions = {}) {
  return listActions({ type: "lesson" }, options);
}

export async function listTasks(options: RequestOptions = {}) {
  return listActions({ type: "task" }, options);
}

type CreateActionInput = {
  title: string;
  description?: string | null;
  studentId: string;
  dueDate?: string | null;
  type: "task" | "lesson";
  assignedToUserId?: string | null;
};

export async function createAction(input: CreateActionInput) {
  const response = await handleResponse(
    client.tasks.$post({
      json: {
        title: input.title,
        description: input.description ?? null,
        studentId: input.studentId,
        dueDate: input.dueDate ?? null,
        type: input.type,
        assignedToUserId: input.assignedToUserId ?? null,
      },
    }),
    ActionDetailResponseSchema,
  );
  return response.data.action;
}

type UpdateActionInput = {
  id: string;
  title?: string;
  description?: string | null;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate?: string | null;
  assignedToUserId?: string | null;
};

export async function updateAction(input: UpdateActionInput) {
  const payload: {
    title?: string;
    description?: string | null;
    status?: "pending" | "in_progress" | "completed" | "cancelled";
    dueDate?: string | null;
    assignedToUserId?: string | null;
  } = {};

  if (input.title !== undefined) {
    payload.title = input.title;
  }
  if (input.description !== undefined) {
    payload.description = input.description ?? null;
  }
  if (input.status !== undefined) {
    payload.status = input.status;
  }
  if (input.dueDate !== undefined) {
    payload.dueDate = input.dueDate ?? null;
  }
  if (input.assignedToUserId !== undefined) {
    payload.assignedToUserId = input.assignedToUserId ?? null;
  }

  const response = await handleResponse(
    client.tasks[":id"].$patch({
      param: { id: input.id },
      json: payload,
    }),
    ActionDetailResponseSchema,
  );
  return response.data.action;
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
