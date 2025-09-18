import type { HabitSchedule } from "@monte/shared";
import {
  ActionDetailResponseSchema,
  ActionsListResponseSchema,
  ClassroomCreatedResponseSchema,
  ClassroomsListResponseSchema,
  HabitCheckinDeletionResponseSchema,
  HabitCheckinDetailResponseSchema,
  HabitCheckinEventsListResponseSchema,
  HabitDetailResponseSchema,
  HabitsListResponseSchema,
  ObservationDetailResponseSchema,
  ObservationsListResponseSchema,
  StudentDetailResponseSchema,
  StudentDashboardResponseSchema,
  StudentLessonDetailResponseSchema,
  StudentLessonsListResponseSchema,
  StudentParentMutateResponseSchema,
  StudentParentsListResponseSchema,
  StudentSummariesListResponseSchema,
  StudentSummaryDetailResponseSchema,
  StudentsListResponseSchema,
  TeamListResponseSchema,
  WorkPeriodDetailResponseSchema,
  WorkPeriodsListResponseSchema,
  WorkspaceInviteDetailResponseSchema,
  WorkspaceInvitesListResponseSchema,
  ClassAreasListResponseSchema,
  SubjectsListResponseSchema,
  CoursesListResponseSchema,
  CourseLessonsListResponseSchema,
  MaterialsListResponseSchema,
  TopicsListResponseSchema,
  GuideDashboardResponseSchema,
} from "@monte/shared";
import {
  TimebackAnalyticsResponseSchema,
  type TimebackAnalyticsSummary,
} from "@monte/shared/timeback";
import { z } from "zod";

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

const client = apiClient as ApiClient & {
  observations: ObservationsClient;
  tasks: ActionsClient;
};

const rawClient = apiClient as Record<string, any>;

type TimebackAnalyticsClient = {
  xp: {
    $get: (
      args: {
        query: {
          studentId: string;
          startTime?: string;
          endTime?: string;
          eventType?: string;
          limit?: number;
        };
      },
      init?: Parameters<ApiClient["students"]["$get"]>[1],
    ) => Promise<Response>;
  };
};

const timebackAnalyticsClient = (
  apiClient as unknown as { "timeback-analytics": TimebackAnalyticsClient }
)["timeback-analytics"];

type InvitesClient = {
  $get: (
    args?: unknown,
    init?: Parameters<ApiClient["students"]["$get"]>[1],
  ) => Promise<Response>;
  $post: (args: {
    json: {
      email?: string;
      role?: "administrator" | "teacher" | "student" | "parent";
      expiresInDays?: number;
      maxUses?: number;
    };
  }) => Promise<Response>;
  lookup: {
    $post: (args: { json: { code: string } }) => Promise<Response>;
  };
  redeem: {
    $post: (args: { json: { code: string } }) => Promise<Response>;
  };
  ":id": {
    send: {
      $post: (args: {
        param: { id: string };
        json: { email?: string };
      }) => Promise<Response>;
    };
  };
};

type OrganizationsClient = {
  $post: (args: { json: { name: string } }) => Promise<Response>;
};

const invitesClient = (apiClient as unknown as { invites: InvitesClient })
  .invites;
const organizationsClient = (
  apiClient as unknown as { organizations: OrganizationsClient }
).organizations;

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

export async function getStudentDashboard(
  id: string,
  params: {
    range?: "daily" | "weekly" | "monthly";
    start?: string;
    end?: string;
  } = {},
  options: RequestOptions = {},
) {
  const query: Record<string, unknown> = {};
  if (params.range) {
    query.range = params.range;
  }
  if (params.start) {
    query.start = params.start;
  }
  if (params.end) {
    query.end = params.end;
  }

  const response = await handleResponse(
    (rawClient.students as any)[":id"].dashboard.$get(
      {
        param: { id },
        query,
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    StudentDashboardResponseSchema,
  );

  return response.data;
}

type CreateStudentParentInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  relation?: string | null;
  preferredContactMethod?: string | null;
};

export async function listStudentParents(studentId: string) {
  const response = await handleResponse(
    (rawClient.students as any)[":studentId"].parents.$get({
      param: { studentId },
    }) as Promise<Response>,
    StudentParentsListResponseSchema,
  );

  return response.data.parents;
}

export async function createStudentParent(
  studentId: string,
  input: CreateStudentParentInput,
) {
  const response = await handleResponse(
    (rawClient.students as any)[":studentId"].parents.$post({
      param: { studentId },
      json: {
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        relation: input.relation ?? null,
        preferredContactMethod: input.preferredContactMethod ?? null,
      },
    }) as Promise<Response>,
    StudentParentMutateResponseSchema,
  );

  return response.data.parent;
}

export async function updateStudentParent(
  studentId: string,
  parentId: string,
  input: Partial<CreateStudentParentInput>,
) {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) {
    payload.name = input.name;
  }
  if (input.email !== undefined) {
    payload.email = input.email;
  }
  if (input.phone !== undefined) {
    payload.phone = input.phone;
  }
  if (input.relation !== undefined) {
    payload.relation = input.relation;
  }
  if (input.preferredContactMethod !== undefined) {
    payload.preferredContactMethod = input.preferredContactMethod;
  }

  const response = await handleResponse(
    (rawClient.students as any)[":studentId"].parents[":parentId"].$patch({
      param: { studentId, parentId },
      json: payload,
    }) as Promise<Response>,
    StudentParentMutateResponseSchema,
  );

  return response.data.parent;
}

export async function deleteStudentParent(studentId: string, parentId: string) {
  await (rawClient.students as any)[":studentId"].parents[":parentId"].$delete({
    param: { studentId, parentId },
  });
}

type ListHabitsParams = {
  studentId?: string;
  active?: boolean;
};

export async function listHabits(
  params: ListHabitsParams = {},
  options: RequestOptions = {},
) {
  const query: Record<string, unknown> = {};
  if (params.studentId) {
    query.studentId = params.studentId;
  }
  if (typeof params.active === "boolean") {
    query.active = params.active;
  }

  const response = await handleResponse(
    client.habits.$get(
      Object.keys(query).length > 0 ? { query } : undefined,
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

type ListHabitCheckinsParams = {
  habitId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
};

export async function listHabitCheckins(
  params: ListHabitCheckinsParams,
  options: RequestOptions = {},
) {
  const query: Record<string, unknown> = {};
  if (params.startDate) {
    query.startDate = params.startDate;
  }
  if (params.endDate) {
    query.endDate = params.endDate;
  }
  if (params.limit) {
    query.limit = params.limit;
  }

  const response = await handleResponse(
    (rawClient.habits as any)[":id"]["check-ins"].$get(
      {
        param: { id: params.habitId },
        query,
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    HabitCheckinEventsListResponseSchema,
  );
  return response.data.events;
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

type ListStudentLessonsParams = {
  studentId?: string;
  status?: "unscheduled" | "scheduled" | "completed";
  scheduledFrom?: string;
  scheduledTo?: string;
  limit?: number;
};

export async function listStudentLessons(
  params: ListStudentLessonsParams = {},
  options: RequestOptions = {},
) {
  const query: Record<string, unknown> = {};
  if (params.studentId) {
    query.studentId = params.studentId;
  }
  if (params.status) {
    query.status = params.status;
  }
  if (params.scheduledFrom) {
    query.scheduledFrom = params.scheduledFrom;
  }
  if (params.scheduledTo) {
    query.scheduledTo = params.scheduledTo;
  }
  if (params.limit) {
    query.limit = params.limit;
  }

  const response = await handleResponse(
    (rawClient["student-lessons"] as any).$get(
      Object.keys(query).length > 0 ? { query } : undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    StudentLessonsListResponseSchema,
  );

  return response.data.lessons;
}

type CreateStudentLessonInput = {
  studentId: string;
  courseLessonId?: string | null;
  customTitle?: string | null;
  notes?: string | null;
  status?: "unscheduled" | "scheduled" | "completed";
  scheduledFor?: string | null;
  assignedByUserId?: string | null;
  rescheduledFromId?: string | null;
};

export async function createStudentLesson(input: CreateStudentLessonInput) {
  const response = await handleResponse(
    (rawClient["student-lessons"] as any).$post({
      json: {
        studentId: input.studentId,
        courseLessonId: input.courseLessonId ?? null,
        customTitle: input.customTitle ?? null,
        notes: input.notes ?? null,
        status: input.status,
        scheduledFor: input.scheduledFor ?? null,
        assignedByUserId: input.assignedByUserId ?? null,
        rescheduledFromId: input.rescheduledFromId ?? null,
      },
    }) as Promise<Response>,
    StudentLessonDetailResponseSchema,
  );

  return response.data.lesson;
}

export async function getStudentLesson(id: string) {
  const response = await handleResponse(
    (rawClient["student-lessons"] as any)[":id"].$get({
      param: { id },
    }) as Promise<Response>,
    StudentLessonDetailResponseSchema,
  );

  return response.data.lesson;
}

type UpdateStudentLessonInput = {
  id: string;
  courseLessonId?: string | null;
  customTitle?: string | null;
  notes?: string | null;
  status?: "unscheduled" | "scheduled" | "completed";
  scheduledFor?: string | null;
  assignedByUserId?: string | null;
  rescheduledFromId?: string | null;
};

export async function updateStudentLesson(input: UpdateStudentLessonInput) {
  const payload: Record<string, unknown> = {};
  if (input.courseLessonId !== undefined) {
    payload.courseLessonId = input.courseLessonId;
  }
  if (input.customTitle !== undefined) {
    payload.customTitle = input.customTitle;
  }
  if (input.notes !== undefined) {
    payload.notes = input.notes;
  }
  if (input.status !== undefined) {
    payload.status = input.status;
  }
  if (input.scheduledFor !== undefined) {
    payload.scheduledFor = input.scheduledFor;
  }
  if (input.assignedByUserId !== undefined) {
    payload.assignedByUserId = input.assignedByUserId;
  }
  if (input.rescheduledFromId !== undefined) {
    payload.rescheduledFromId = input.rescheduledFromId;
  }

  const response = await handleResponse(
    (rawClient["student-lessons"] as any)[":id"].$patch({
      param: { id: input.id },
      json: payload,
    }) as Promise<Response>,
    StudentLessonDetailResponseSchema,
  );

  return response.data.lesson;
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

export async function sendStudentSummary(
  id: string,
  input: { parentIds?: string[]; emails?: string[] },
) {
  const response = await handleResponse(
    (rawClient["student-summaries"] as any)[":id"].send.$post({
      param: { id },
      json: {
        parentIds: input.parentIds,
        emails: input.emails,
      },
    }) as Promise<Response>,
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

type ListAttendanceParams = {
  studentId?: string;
  date?: string;
  limit?: number;
};

export async function listAttendance(
  params: ListAttendanceParams = {},
  options: RequestOptions = {},
) {
  const query: Record<string, unknown> = {};
  if (params.studentId) {
    query.studentId = params.studentId;
  }
  if (params.date) {
    query.date = params.date;
  }
  if (params.limit) {
    query.limit = params.limit;
  }

  const response = await handleResponse(
    (rawClient.attendance as any).$get(
      Object.keys(query).length > 0 ? { query } : undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    WorkPeriodsListResponseSchema,
  );

  return response.data.workPeriods;
}

type CreateAttendanceInput = {
  studentId: string;
  startTime?: string;
  notes?: string | null;
};

export async function createAttendance(input: CreateAttendanceInput) {
  const response = await handleResponse(
    (rawClient.attendance as any).$post({
      json: {
        studentId: input.studentId,
        startTime: input.startTime,
        notes: input.notes ?? null,
      },
    }) as Promise<Response>,
    WorkPeriodDetailResponseSchema,
  );

  return response.data.workPeriod;
}

type UpdateAttendanceInput = {
  id: string;
  startTime?: string;
  endTime?: string;
  notes?: string | null;
};

export async function updateAttendance(input: UpdateAttendanceInput) {
  const payload: Record<string, unknown> = {};
  if (input.startTime !== undefined) {
    payload.startTime = input.startTime;
  }
  if (input.endTime !== undefined) {
    payload.endTime = input.endTime;
  }
  if (input.notes !== undefined) {
    payload.notes = input.notes;
  }

  const response = await handleResponse(
    (rawClient.attendance as any)[":id"].$patch({
      param: { id: input.id },
      json: payload,
    }) as Promise<Response>,
    WorkPeriodDetailResponseSchema,
  );

  return response.data.workPeriod;
}

export async function deleteAttendance(id: string) {
  await (rawClient.attendance as any)[":id"].$delete({
    param: { id },
  });
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

export async function createWorkspace(name: string) {
  const schema = z.object({
    data: z.object({
      organization: z.object({ id: z.string(), name: z.string() }),
    }),
  });

  const response = await handleResponse(
    organizationsClient.$post({
      json: { name },
    }),
    schema,
  );

  return response.data.organization;
}

export async function listWorkspaceInvites() {
  const response = await handleResponse(
    invitesClient.$get(),
    WorkspaceInvitesListResponseSchema,
  );
  return response.data.invites;
}

export async function createWorkspaceInvite(input: {
  email?: string;
  role?: "administrator" | "teacher" | "student" | "parent";
  expiresInDays?: number;
  maxUses?: number;
}) {
  const response = await handleResponse(
    invitesClient.$post({ json: input }),
    WorkspaceInviteDetailResponseSchema,
  );

  return response.data;
}

export async function sendWorkspaceInvite(id: string, email?: string) {
  const response = await handleResponse(
    invitesClient[":id"].send.$post({
      param: { id },
      json: email ? { email } : {},
    }),
    WorkspaceInviteDetailResponseSchema,
  );

  return response.data;
}

export async function lookupWorkspaceInvite(code: string) {
  const response = await handleResponse(
    invitesClient.lookup.$post({ json: { code } }),
    WorkspaceInviteDetailResponseSchema,
  );

  return response.data;
}

export async function redeemWorkspaceInvite(code: string) {
  const response = await handleResponse(
    invitesClient.redeem.$post({ json: { code } }),
    WorkspaceInviteDetailResponseSchema,
  );

  return response.data;
}

type GetStudentXpSummaryParams = {
  studentId: string;
  startTime?: string;
  endTime?: string;
  eventType?: string;
  limit?: number;
};

export async function getStudentXpSummary(
  params: GetStudentXpSummaryParams,
  options: RequestOptions = {},
): Promise<TimebackAnalyticsSummary> {
  const response = await handleResponse(
    timebackAnalyticsClient.xp.$get(
      {
        query: {
          studentId: params.studentId,
          ...(params.startTime ? { startTime: params.startTime } : {}),
          ...(params.endTime ? { endTime: params.endTime } : {}),
          ...(params.eventType ? { eventType: params.eventType } : {}),
          ...(params.limit ? { limit: params.limit } : {}),
        },
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    TimebackAnalyticsResponseSchema,
  );

  return response.data;
}

export async function listClassAreas(options: RequestOptions = {}) {
  const response = await handleResponse(
    (rawClient.curriculum as any).areas.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    ClassAreasListResponseSchema,
  );
  return response.data.classAreas;
}

type ListSubjectsParams = {
  // reserved for future filters
};

export async function listSubjects(
  _params: ListSubjectsParams = {},
  options: RequestOptions = {},
) {
  const response = await handleResponse(
    (rawClient.curriculum as any).subjects.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    SubjectsListResponseSchema,
  );
  return response.data.subjects;
}

type ListCoursesParams = {
  subjectId?: string;
  search?: string;
};

export async function listCourses(
  params: ListCoursesParams = {},
  options: RequestOptions = {},
) {
  const query: Record<string, unknown> = {};
  if (params.subjectId) {
    query.subjectId = params.subjectId;
  }
  if (params.search && params.search.trim().length > 0) {
    query.search = params.search.trim();
  }

  const response = await handleResponse(
    (rawClient.curriculum as any).courses.$get(
      Object.keys(query).length > 0 ? { query } : undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    CoursesListResponseSchema,
  );
  return response.data.courses;
}

export async function listCourseLessons(courseId: string) {
  const response = await handleResponse(
    (rawClient.curriculum as any).courses[":id"].lessons.$get({
      param: { id: courseId },
    }) as Promise<Response>,
    CourseLessonsListResponseSchema,
  );
  return response.data.lessons;
}

export async function listMaterials(options: RequestOptions = {}) {
  const response = await handleResponse(
    (rawClient.curriculum as any).materials.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    MaterialsListResponseSchema,
  );
  return response.data.materials;
}

export async function listTopics(options: RequestOptions = {}) {
  const response = await handleResponse(
    (rawClient.curriculum as any).topics.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    TopicsListResponseSchema,
  );
  return response.data.topics;
}

export async function getGuideDashboard(options: RequestOptions = {}) {
  const response = await handleResponse(
    (rawClient["guide-dashboard"] as any).$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ) as Promise<Response>,
    GuideDashboardResponseSchema,
  );

  return response.data;
}
