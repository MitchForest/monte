import type { HabitSchedule } from "@monte/shared";
import {
  ActionDetailResponseSchema,
  ActionsListResponseSchema,
  ClassAreasListResponseSchema,
  ClassroomCreatedResponseSchema,
  ClassroomsListResponseSchema,
  CourseLessonsListResponseSchema,
  CoursesListResponseSchema,
  GuideDashboardResponseSchema,
  HabitCheckinDeletionResponseSchema,
  HabitCheckinDetailResponseSchema,
  HabitCheckinEventsListResponseSchema,
  HabitDetailResponseSchema,
  HabitsListResponseSchema,
  MaterialsListResponseSchema,
  ObservationDetailResponseSchema,
  ObservationsListResponseSchema,
  StudentDashboardResponseSchema,
  StudentDetailResponseSchema,
  StudentLessonDetailResponseSchema,
  StudentLessonsListResponseSchema,
  StudentParentMutateResponseSchema,
  StudentParentsListResponseSchema,
  StudentSummariesListResponseSchema,
  StudentSummaryDetailResponseSchema,
  StudentsListResponseSchema,
  SubjectsListResponseSchema,
  TeamListResponseSchema,
  TopicsListResponseSchema,
  WorkPeriodDetailResponseSchema,
  WorkPeriodsListResponseSchema,
  WorkspaceInviteDetailResponseSchema,
  WorkspaceInvitesListResponseSchema,
} from "@monte/shared";
import {
  type StudentNextPlacement,
  StudentNextPlacementResponseSchema,
  type StudentPlacementCourseProgress,
  type StudentPlacementLevel,
  StudentPlacementLevelResponseSchema,
  StudentPlacementProgressResponseSchema,
  type StudentPlacementTestAttempt,
  StudentPlacementTestsResponseSchema,
  type StudentXpSummary,
  StudentXpSummaryResponseSchema,
  type SubjectTrackAssignment,
  SubjectTrackListResponseSchema,
} from "@monte/shared/student";
import { z } from "zod";

import { apiClient } from "./client";

type RequestOptions = {
  signal?: AbortSignal;
};

type EndpointArgs = {
  param?: Record<string, unknown>;
  json?: unknown;
  query?: Record<string, unknown>;
};

type EndpointInit = {
  init?: {
    signal?: AbortSignal;
  };
};

type ApiEndpoint = {
  $get: (args?: EndpointArgs, init?: EndpointInit) => Promise<Response>;
  $post: (args?: EndpointArgs, init?: EndpointInit) => Promise<Response>;
  $patch: (args?: EndpointArgs, init?: EndpointInit) => Promise<Response>;
  $delete: (args?: EndpointArgs, init?: EndpointInit) => Promise<Response>;
} & {
  [segment: string]: ApiEndpoint;
};

type ApiClientShape = {
  team: ApiEndpoint;
  classrooms: ApiEndpoint;
  students: ApiEndpoint;
  tasks: ApiEndpoint;
  habits: ApiEndpoint;
  observations: ApiEndpoint;
  invites: ApiEndpoint;
  organizations: ApiEndpoint;
  attendance: ApiEndpoint;
  curriculum: ApiEndpoint;
  "guide-dashboard": ApiEndpoint;
  "student-lessons": ApiEndpoint;
  "student-summaries": ApiEndpoint;
  "student-xp": ApiEndpoint;
  "student-placements": ApiEndpoint;
  "subject-tracks": ApiEndpoint;
};

const client = apiClient as unknown as ApiClientShape;
const teamClient = client.team;
const classroomsClient = client.classrooms;
const studentsClient = client.students;
const tasksClient = client.tasks;
const habitsClient = client.habits;
const observationsClient = client.observations;
const invitesClient = client.invites;
const organizationsClient = client.organizations;
const attendanceClient = client.attendance;
const curriculumClient = client.curriculum;
const guideDashboardClient = client["guide-dashboard"];
const studentLessonsClient = client["student-lessons"];
const studentSummariesClient = client["student-summaries"];
const studentXpClient = client["student-xp"];
const studentPlacementsClient = client["student-placements"];
const subjectTracksClient = client["subject-tracks"];

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
    teamClient.$get(
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
    classroomsClient.$get(
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
    classroomsClient.$post({
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
    studentsClient.$get(
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
    studentsClient.$post({ json: payload }),
    StudentDetailResponseSchema,
  );
  return response.data.student;
}

export async function getStudent(id: string) {
  const response = await handleResponse(
    studentsClient[":id"].$get({ param: { id } }),
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
    studentsClient[":id"].dashboard.$get(
      {
        param: { id },
        query,
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
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
    studentsClient[":studentId"].parents.$get({
      param: { studentId },
    }),
    StudentParentsListResponseSchema,
  );

  return response.data.parents;
}

export async function createStudentParent(
  studentId: string,
  input: CreateStudentParentInput,
) {
  const response = await handleResponse(
    studentsClient[":studentId"].parents.$post({
      param: { studentId },
      json: {
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        relation: input.relation ?? null,
        preferredContactMethod: input.preferredContactMethod ?? null,
      },
    }),
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
    studentsClient[":studentId"].parents[":parentId"].$patch({
      param: { studentId, parentId },
      json: payload,
    }),
    StudentParentMutateResponseSchema,
  );

  return response.data.parent;
}

export async function deleteStudentParent(studentId: string, parentId: string) {
  await studentsClient[":studentId"].parents[":parentId"].$delete({
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
    habitsClient.$get(
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
    habitsClient[":id"]["check-ins"].$post({
      param: { id: input.habitId },
      json: { date: input.date },
    }),
    HabitCheckinDetailResponseSchema,
  );
  return response.data.checkin;
}

export async function deleteHabitCheckin(input: HabitCheckinInput) {
  const response = await handleResponse(
    habitsClient[":id"]["check-ins"].$delete({
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
    habitsClient[":id"]["check-ins"].$get(
      {
        param: { id: params.habitId },
        query,
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
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
    studentSummariesClient.$get(
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
    studentLessonsClient.$get(
      Object.keys(query).length > 0 ? { query } : undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
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
    studentLessonsClient.$post({
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
    }),
    StudentLessonDetailResponseSchema,
  );

  return response.data.lesson;
}

export async function getStudentLesson(id: string) {
  const response = await handleResponse(
    studentLessonsClient[":id"].$get({
      param: { id },
    }),
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
    studentLessonsClient[":id"].$patch({
      param: { id: input.id },
      json: payload,
    }),
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
    studentSummariesClient.$post({ json: input }),
    StudentSummaryDetailResponseSchema,
  );
  return response.data;
}

export async function getStudentSummary(id: string) {
  const response = await handleResponse(
    studentSummariesClient[":id"].$get({ param: { id } }),
    StudentSummaryDetailResponseSchema,
  );
  return response.data;
}

export async function sendStudentSummary(
  id: string,
  input: { parentIds?: string[]; emails?: string[] },
) {
  const response = await handleResponse(
    studentSummariesClient[":id"].send.$post({
      param: { id },
      json: {
        parentIds: input.parentIds,
        emails: input.emails,
      },
    }),
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
    observationsClient.$get(
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
    observationsClient.$post({
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
    tasksClient.$get(
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
    tasksClient.$post({
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
    tasksClient[":id"].$patch({
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
    attendanceClient.$get(
      Object.keys(query).length > 0 ? { query } : undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
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
    attendanceClient.$post({
      json: {
        studentId: input.studentId,
        startTime: input.startTime,
        notes: input.notes ?? null,
      },
    }),
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
    attendanceClient[":id"].$patch({
      param: { id: input.id },
      json: payload,
    }),
    WorkPeriodDetailResponseSchema,
  );

  return response.data.workPeriod;
}

export async function deleteAttendance(id: string) {
  await attendanceClient[":id"].$delete({
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
    habitsClient.$post({
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
): Promise<StudentXpSummary> {
  const response = await handleResponse(
    studentXpClient.summary.$get(
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
    StudentXpSummaryResponseSchema,
  );

  return response.data;
}

type StudentPlacementParams = {
  studentId: string;
  subject?: string | null;
};

export async function getStudentPlacementCourses(
  params: StudentPlacementParams,
  options: RequestOptions = {},
): Promise<StudentPlacementCourseProgress[]> {
  const response = await handleResponse(
    studentPlacementsClient.progress.$get(
      {
        query: {
          studentId: params.studentId,
          ...(params.subject ? { subject: params.subject } : {}),
        },
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    StudentPlacementProgressResponseSchema,
  );

  return response.data.courses;
}

export async function getStudentPlacementLevel(
  params: StudentPlacementParams,
  options: RequestOptions = {},
): Promise<StudentPlacementLevel | null> {
  const response = await handleResponse(
    studentPlacementsClient["current-level"].$get(
      {
        query: {
          studentId: params.studentId,
          ...(params.subject ? { subject: params.subject } : {}),
        },
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    StudentPlacementLevelResponseSchema,
  );

  return response.data.currentLevel ?? null;
}

export async function getStudentNextPlacement(
  params: StudentPlacementParams,
  options: RequestOptions = {},
): Promise<StudentNextPlacement | null> {
  const response = await handleResponse(
    studentPlacementsClient["next-test"].$get(
      {
        query: {
          studentId: params.studentId,
          ...(params.subject ? { subject: params.subject } : {}),
        },
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    StudentNextPlacementResponseSchema,
  );

  return response.data.nextPlacement ?? null;
}

export async function getStudentPlacementTests(
  params: StudentPlacementParams,
  options: RequestOptions = {},
): Promise<StudentPlacementTestAttempt[]> {
  const response = await handleResponse(
    studentPlacementsClient.tests.$get(
      {
        query: {
          studentId: params.studentId,
          ...(params.subject ? { subject: params.subject } : {}),
        },
      },
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    StudentPlacementTestsResponseSchema,
  );

  return response.data.tests;
}

export async function listSubjectTracks(
  options: RequestOptions = {},
): Promise<SubjectTrackAssignment[]> {
  const response = await handleResponse(
    subjectTracksClient.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    SubjectTrackListResponseSchema,
  );

  return response.data.tracks;
}

export async function listClassAreas(options: RequestOptions = {}) {
  const response = await handleResponse(
    curriculumClient.areas.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    ClassAreasListResponseSchema,
  );
  return response.data.classAreas;
}

export async function listSubjects(options: RequestOptions = {}) {
  const response = await handleResponse(
    curriculumClient.subjects.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
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
    curriculumClient.courses.$get(
      Object.keys(query).length > 0 ? { query } : undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    CoursesListResponseSchema,
  );
  return response.data.courses;
}

export async function listCourseLessons(courseId: string) {
  const response = await handleResponse(
    curriculumClient.courses[":id"].lessons.$get({
      param: { id: courseId },
    }),
    CourseLessonsListResponseSchema,
  );
  return response.data.lessons;
}

export async function listMaterials(options: RequestOptions = {}) {
  const response = await handleResponse(
    curriculumClient.materials.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    MaterialsListResponseSchema,
  );
  return response.data.materials;
}

export async function listTopics(options: RequestOptions = {}) {
  const response = await handleResponse(
    curriculumClient.topics.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    TopicsListResponseSchema,
  );
  return response.data.topics;
}

export async function getGuideDashboard(options: RequestOptions = {}) {
  const response = await handleResponse(
    guideDashboardClient.$get(
      undefined,
      options.signal ? { init: { signal: options.signal } } : undefined,
    ),
    GuideDashboardResponseSchema,
  );

  return response.data;
}
