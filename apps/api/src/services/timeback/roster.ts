import { type Database, withDbContext } from "@monte/database";
import type { Student } from "@monte/shared";
import { logger } from "@monte/shared";
import { oneroster } from "@monte/timeback-clients";
import type { Kysely } from "kysely";

import type { AuthenticatedSession } from "../../lib/auth/session";
import { getOneRosterClient } from "../../lib/timeback/clients";
import { getAllowedTimebackOrgs, isOrgAllowed } from "../../lib/timeback/orgs";

type ListStudentsArgs = {
  session: AuthenticatedSession;
  search?: string;
  classroomId?: string;
};

type LocalStudentRow = {
  id: string;
  org_id: string;
  full_name: string;
  avatar_url: string | null;
  dob: Date | string | null;
  primary_classroom_id: string | null;
  created_at: Date | string;
  oneroster_user_id: string | null;
  classroom_id: string | null;
  classroom_name: string | null;
};

type ClassroomRow = {
  id: string;
  name: string | null;
  oneroster_class_id: string | null;
};

type OneRosterStudentList = Awaited<ReturnType<typeof oneroster.listStudents>>;
type OneRosterClassStudentList = Awaited<
  ReturnType<typeof oneroster.listClassStudents>
>;
type OneRosterStudent = OneRosterStudentList["users"][number];
type OneRosterStudentDetail = Awaited<ReturnType<typeof oneroster.getStudent>>;

const DEFAULT_LIMIT = 200;

const dbContext = (session: AuthenticatedSession) => ({
  userId: session.session.userId,
  orgId: session.session.orgId,
});

export async function listStudentsForOrganization(
  args: ListStudentsArgs,
): Promise<Student[]> {
  const search = args.search?.trim();
  const context = dbContext(args.session);
  const oneRosterClient = getOneRosterClient();
  const allowedOrgs = getAllowedTimebackOrgs();

  if (allowedOrgs.size > 0 && !isOrgAllowed(context.orgId)) {
    return [];
  }

  if (!oneRosterClient) {
    return listLocalStudents(context, {
      search,
      classroomId: args.classroomId,
    });
  }

  const classroomMapping = args.classroomId
    ? await findClassroomById(context, args.classroomId)
    : null;

  if (args.classroomId && !classroomMapping) {
    return [];
  }

  if (args.classroomId && !classroomMapping?.oneroster_class_id) {
    return listLocalStudents(context, {
      search,
      classroomId: args.classroomId,
    });
  }

  try {
    const rosterResponse = classroomMapping?.oneroster_class_id
      ? await oneroster.listClassStudents(oneRosterClient, {
          classSourcedId: classroomMapping.oneroster_class_id,
          search: search || undefined,
          limit: DEFAULT_LIMIT,
        })
      : await oneroster.listStudents(oneRosterClient, {
          search: search || undefined,
          limit: DEFAULT_LIMIT,
        });

    const rosterStudents = extractRosterStudents(rosterResponse)
      .filter(hasStudentRole)
      .slice(0, DEFAULT_LIMIT);

    const filteredRosterStudents = rosterStudents.filter((student) =>
      isOrgAllowed(getRosterOrgId(student)),
    );

    const rosterIds = filteredRosterStudents.map(
      (student) => student.sourcedId,
    );

    const overlays =
      rosterIds.length > 0
        ? await withDbContext(context, (trx) =>
            queryStudents(trx, context.orgId ?? "", {
              rosterIds,
            }),
          )
        : [];

    const overlayByRosterId = new Map(
      overlays
        .map((row) => [row.oneroster_user_id ?? "", row] as const)
        .filter(([key]) => key.length > 0),
    );

    const mappedRosterStudents = filteredRosterStudents.map((student) => {
      const base = mapRosterStudent(student, context.orgId);
      const overlay = overlayByRosterId.get(student.sourcedId);
      return overlay ? applyOverlay(base, overlay) : base;
    });

    const customStudents = await listLocalStudents(context, {
      search,
      classroomId: args.classroomId,
      onlyCustom: true,
    });

    return [...mappedRosterStudents, ...customStudents].sort((a, b) =>
      a.full_name.localeCompare(b.full_name),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown OneRoster error";
    logger.error("Failed to fetch OneRoster students", { message });
    return listLocalStudents(context, {
      search,
      classroomId: args.classroomId,
    });
  }
}

export async function syncStudentByRosterId(
  session: AuthenticatedSession,
  rosterStudentId: string,
): Promise<Student | null> {
  const client = getOneRosterClient();
  if (!client) {
    return null;
  }

  try {
    const detail: OneRosterStudentDetail = await oneroster.getStudent(
      client,
      rosterStudentId,
    );
    const rosterStudent = detail.user;

    if (!isOrgAllowed(getRosterOrgId(rosterStudent))) {
      return null;
    }

    return withDbContext(dbContext(session), async (trx) => {
      const rows = await queryStudents(trx, session.session.orgId ?? "", {
        rosterIds: [rosterStudent.sourcedId],
      });

      const row = rows.at(0);
      const base = mapRosterStudent(rosterStudent, session.session.orgId);
      return row ? applyOverlay(base, row) : base;
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown OneRoster error";
    logger.error("Failed to sync OneRoster student", { message });
    return null;
  }
}

function extractRosterStudents(
  payload: OneRosterStudentList | OneRosterClassStudentList,
): OneRosterStudent[] {
  if ("students" in payload) {
    return payload.students as OneRosterStudent[];
  }
  return payload.users;
}

async function findClassroomById(
  context: { userId?: string; orgId?: string },
  classroomId: string,
): Promise<ClassroomRow | null> {
  const row = await withDbContext(context, (trx) =>
    trx
      .selectFrom("classrooms")
      .select([
        "classrooms.id as id",
        "classrooms.name as name",
        "classrooms.oneroster_class_id as oneroster_class_id",
      ])
      .where("classrooms.id", "=", classroomId)
      .where("classrooms.org_id", "=", context.orgId ?? "")
      .executeTakeFirst(),
  );

  return row ?? null;
}

async function listLocalStudents(
  context: { userId?: string; orgId?: string },
  options: {
    search?: string | null;
    classroomId?: string;
    onlyCustom?: boolean;
  },
): Promise<Student[]> {
  const rows = await withDbContext(context, (trx) =>
    queryStudents(trx, context.orgId ?? "", {
      search: options.search ?? undefined,
      classroomId: options.classroomId,
      onlyCustom: options.onlyCustom,
    }),
  );
  return rows.filter((row) => isOrgAllowed(row.org_id)).map(mapRowToStudent);
}

function buildRosterFullName(student: OneRosterStudent): string {
  const preferredFirst = student.preferredFirstName ?? student.givenName ?? "";
  const preferredLast = student.preferredLastName ?? student.familyName ?? "";
  const composed = `${preferredFirst} ${preferredLast}`.trim();
  if (composed.length > 0) {
    return composed;
  }
  if (student.username) {
    return student.username;
  }
  return student.sourcedId;
}

function mapRosterStudent(
  student: OneRosterStudent,
  orgId: string | undefined,
): Student {
  const resolvedOrgId = getRosterOrgId(student) ?? orgId ?? "";
  return {
    id: student.sourcedId,
    org_id: resolvedOrgId,
    full_name: buildRosterFullName(student),
    avatar_url: null,
    dob: null,
    primary_classroom_id: null,
    created_at: student.dateLastModified ?? new Date().toISOString(),
    oneroster_user_id: student.sourcedId,
    classroom: null,
  };
}

function applyOverlay(student: Student, row: LocalStudentRow): Student {
  return {
    ...student,
    full_name: row.full_name ?? student.full_name,
    avatar_url: row.avatar_url ?? student.avatar_url,
    primary_classroom_id:
      row.primary_classroom_id ?? student.primary_classroom_id,
    classroom: row.classroom_id
      ? {
          id: row.classroom_id,
          name: row.classroom_name ?? "",
        }
      : student.classroom,
    created_at: toIsoString(row.created_at),
  };
}

function mapRowToStudent(row: LocalStudentRow): Student {
  return {
    id: row.id,
    org_id: row.org_id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    dob: row.dob ? toIsoString(row.dob) : null,
    primary_classroom_id: row.primary_classroom_id,
    created_at: toIsoString(row.created_at),
    oneroster_user_id: row.oneroster_user_id,
    classroom: row.classroom_id
      ? {
          id: row.classroom_id,
          name: row.classroom_name ?? "",
        }
      : null,
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

async function queryStudents(
  trx: Kysely<Database>,
  orgId: string,
  options: {
    search?: string;
    classroomId?: string;
    onlyCustom?: boolean;
    rosterIds?: string[];
  },
): Promise<LocalStudentRow[]> {
  let query = trx
    .selectFrom("students")
    .leftJoin("classrooms", "classrooms.id", "students.primary_classroom_id")
    .select([
      "students.id as id",
      "students.org_id as org_id",
      "students.full_name as full_name",
      "students.avatar_url as avatar_url",
      "students.dob as dob",
      "students.primary_classroom_id as primary_classroom_id",
      "students.created_at as created_at",
      "students.oneroster_user_id as oneroster_user_id",
      "classrooms.id as classroom_id",
      "classrooms.name as classroom_name",
    ])
    .where("students.org_id", "=", orgId)
    .where("students.status", "=", "active")
    .where("students.deleted_at", "is", null)
    .orderBy("students.full_name", "asc");

  if (options.onlyCustom) {
    query = query.where("students.oneroster_user_id", "is", null);
  }

  if (options.search && options.search.trim().length > 0) {
    query = query.where(
      "students.full_name",
      "ilike",
      `%${options.search.trim()}%`,
    );
  }

  if (options.classroomId) {
    query = query.where(
      "students.primary_classroom_id",
      "=",
      options.classroomId,
    );
    query = query
      .where("classrooms.status", "=", "active")
      .where("classrooms.deleted_at", "is", null);
  }

  if (options.rosterIds) {
    if (options.rosterIds.length === 0) {
      return [];
    }
    query = query.where("students.oneroster_user_id", "in", options.rosterIds);
  }

  return query.execute();
}

function hasStudentRole(student: OneRosterStudent): boolean {
  const roles = normalizeRoles(student.roles);
  return roles.some((role) => role?.role === "student");
}

type OneRosterRole =
  | {
      role?: string;
      org?: {
        sourcedId?: string;
      } | null;
    }
  | null
  | undefined;

function normalizeRoles(roles: OneRosterStudent["roles"]): OneRosterRole[] {
  if (!roles) {
    return [];
  }
  if (Array.isArray(roles)) {
    return roles as OneRosterRole[];
  }
  return [];
}

function getRosterOrgId(student: OneRosterStudent): string | null {
  const roles = normalizeRoles(student.roles);
  const studentRole = roles.find((role) => role?.role === "student");
  if (studentRole?.org?.sourcedId) {
    return studentRole.org.sourcedId;
  }
  const primaryOrg = student.primaryOrg;
  if (primaryOrg && typeof primaryOrg === "object" && primaryOrg.sourcedId) {
    return primaryOrg.sourcedId;
  }
  return null;
}
