import crypto from "node:crypto";
import type { Json } from "@monte/database";
import { getDb } from "@monte/database";
import { logger } from "@monte/shared";
import { oneroster, TimebackClientError } from "@monte/timeback-clients";
import type { OneRosterClass } from "@monte/timeback-clients/src/oneroster/classes";
import type { OneRosterCourse } from "@monte/timeback-clients/src/oneroster/courses";
import type { OneRosterClassStudentList } from "@monte/timeback-clients/src/oneroster/students";
import type { OneRosterUser } from "@monte/timeback-clients/src/oneroster/users";

import { getOneRosterClient } from "../src/lib/timeback/clients";
import {
  releaseAdvisoryLock,
  TIMEBACK_ROSTER_LOCK_KEY,
  tryAcquireAdvisoryLock,
} from "../src/lib/timeback/locks";
import { getAllowedTimebackOrgs } from "../src/lib/timeback/orgs";

const PAGE_SIZE = 200;
const BACKOFF_INITIAL_MS = 1000;
const BACKOFF_MAX_MS = 16000;

const SYNC_ENTITY_USERS = "org_memberships";
const SYNC_ENTITY_COURSES = "courses";
const SYNC_ENTITY_CLASSROOMS = "classrooms";

type SyncCounters = {
  orgs: number;
  users: number;
  students: number;
  teachers: number;
  administrators: number;
  parents: number;
  classrooms: number;
  courses: number;
  enrollments: number;
  guardianLinks: number;
};

async function main() {
  const client = getOneRosterClient();
  if (!client) {
    throw new Error("OneRoster client is not configured");
  }

  const allowlist = Array.from(getAllowedTimebackOrgs());
  if (allowlist.length === 0) {
    logger.info(
      "No allowlisted orgs. Set TIMEBACK_ORG_ALLOWLIST to sync roster data.",
    );
    return;
  }

  const db = getDb();
  const acquired = await tryAcquireAdvisoryLock(TIMEBACK_ROSTER_LOCK_KEY);
  if (!acquired) {
    logger.info("Roster sync is already running; exiting");
    return;
  }

  const totals: SyncCounters = {
    orgs: 0,
    users: 0,
    students: 0,
    teachers: 0,
    administrators: 0,
    parents: 0,
    classrooms: 0,
    courses: 0,
    enrollments: 0,
    guardianLinks: 0,
  };

  const userCursor = normalizeCursor(
    await getSyncCursor(db, SYNC_ENTITY_USERS),
  );
  const courseCursor = normalizeCursor(
    await getSyncCursor(db, SYNC_ENTITY_COURSES),
  );
  const classroomCursor = normalizeCursor(
    await getSyncCursor(db, SYNC_ENTITY_CLASSROOMS),
  );

  const globalStudentSourcedIds = new Set<string>();
  const globalGuardianSourcedIds = new Set<string>();
  const globalCourseIds = new Set<string>();
  const globalClassIds = new Set<string>();
  const globalMemberships = new Set<string>();

  try {
    for (const orgSourcedId of allowlist) {
      logger.info("Syncing OneRoster org", { orgSourcedId });

      let orgId: string | null = null;
      let orgName = `Org ${orgSourcedId}`;
      try {
        const orgDetailResponse = await oneroster.callOneRosterOperation(
          client,
          "getOrg",
          {
            path: { sourcedId: orgSourcedId },
          },
        );
        const orgDetail = orgDetailResponse.org;
        orgName = orgDetail?.name ?? orgName;
        orgId = await ensureOrganization(db, orgSourcedId, orgName);
        totals.orgs += 1;
      } catch (error) {
        logger.error("Failed to fetch OneRoster org", {
          orgSourcedId,
          message: error instanceof Error ? error.message : String(error),
        });
        continue;
      }

      if (!orgId) {
        continue;
      }

      const users = await fetchAllUsersForOrg(client, orgSourcedId, userCursor);
      logger.info("Fetched OneRoster users", { orgName, count: users.length });

      const remoteUserIds = new Set<string>();
      const remoteStudentIds = new Set<string>();
      const rosterStudentMap = new Map<string, string>();
      const parentRosterMap = new Map<string, OneRosterUser>();

      for (const user of users) {
        remoteUserIds.add(user.sourcedId);
        const guardianRelation = extractGuardianRelation(user);
        if (guardianRelation) {
          parentRosterMap.set(user.sourcedId, user);
        }
        globalMemberships.add(`${orgId}:${user.sourcedId}`);
        const { userId, role } = await upsertUserAndMembership(
          db,
          orgId,
          orgSourcedId,
          user,
        );
        totals.users += 1;
        switch (role) {
          case "administrator":
            totals.administrators += 1;
            if (guardianRelation) {
              totals.parents += 1;
            }
            break;
          case "teacher":
            totals.teachers += 1;
            if (guardianRelation) {
              totals.parents += 1;
            }
            break;
          case "parent":
            totals.parents += 1;
            break;
          case "student":
            totals.students += 1;
            {
              const studentId = await ensureStudent(
                db,
                orgId,
                orgSourcedId,
                user,
                userId,
              );
              remoteStudentIds.add(user.sourcedId);
              rosterStudentMap.set(user.sourcedId, studentId);
              globalStudentSourcedIds.add(user.sourcedId);
            }
            break;
          default:
            if (guardianRelation) {
              totals.parents += 1;
            }
            break;
        }
      }

      await pruneOrgMemberships(db, orgId, remoteUserIds);
      await pruneStudents(db, orgId, remoteStudentIds);

      const courseSync = await syncCoursesForOrg(
        db,
        client,
        orgId,
        orgSourcedId,
        courseCursor,
      );
      totals.courses += courseSync.upserts;
      for (const id of courseSync.courseIds) {
        globalCourseIds.add(id);
      }

      const classroomSync = await syncClassroomsForOrg(
        db,
        client,
        orgId,
        orgSourcedId,
        classroomCursor,
      );
      totals.classrooms += classroomSync.upserts;
      for (const id of classroomSync.classRosterIds) {
        globalClassIds.add(id);
      }

      const enrollmentUpdates = await syncClassroomMemberships(
        db,
        client,
        orgId,
        classroomSync.classrooms,
        remoteStudentIds,
      );
      totals.enrollments += enrollmentUpdates;

      const guardianResult = await syncStudentGuardians(
        db,
        client,
        orgId,
        rosterStudentMap,
        parentRosterMap,
      );
      totals.guardianLinks += guardianResult.links;
      for (const id of guardianResult.guardianIds) {
        globalGuardianSourcedIds.add(id);
      }
    }

    const runFinishedAt = new Date();

    await Promise.all([
      recordSyncState(db, "students", {
        success: true,
        lastRunAt: runFinishedAt,
        cursor: runFinishedAt.toISOString(),
        lastHash: JSON.stringify({ count: globalStudentSourcedIds.size }),
      }),
      recordSyncState(db, "guardians", {
        success: true,
        lastRunAt: runFinishedAt,
        cursor: runFinishedAt.toISOString(),
        lastHash: JSON.stringify({ count: globalGuardianSourcedIds.size }),
      }),
      recordSyncState(db, "courses", {
        success: true,
        lastRunAt: runFinishedAt,
        cursor: runFinishedAt.toISOString(),
        lastHash: JSON.stringify({ count: globalCourseIds.size }),
      }),
      recordSyncState(db, "classrooms", {
        success: true,
        lastRunAt: runFinishedAt,
        cursor: runFinishedAt.toISOString(),
        lastHash: JSON.stringify({ count: globalClassIds.size }),
      }),
      recordSyncState(db, "org_memberships", {
        success: true,
        lastRunAt: runFinishedAt,
        cursor: runFinishedAt.toISOString(),
        lastHash: JSON.stringify({ count: globalMemberships.size }),
      }),
    ]);

    await recordSyncState(db, "roster", {
      success: true,
      lastRunAt: runFinishedAt,
      cursor: runFinishedAt.toISOString(),
      lastHash: JSON.stringify({
        students: globalStudentSourcedIds.size,
        guardians: globalGuardianSourcedIds.size,
        courses: globalCourseIds.size,
        classrooms: globalClassIds.size,
        memberships: globalMemberships.size,
      }),
    });

    logger.info("Roster sync complete", {
      orgs: totals.orgs,
      users: totals.users,
      administrators: totals.administrators,
      teachers: totals.teachers,
      students: totals.students,
      parents: totals.parents,
      courses: totals.courses,
      classrooms: totals.classrooms,
      enrollments: totals.enrollments,
      guardianLinks: totals.guardianLinks,
    });

    await emitMetric("roster.students.total", globalStudentSourcedIds.size);
    await emitMetric("roster.guardians.total", globalGuardianSourcedIds.size);
    await emitMetric("roster.courses.total", globalCourseIds.size);
    await emitMetric("roster.classrooms.total", globalClassIds.size);
    await emitMetric("roster.memberships.total", globalMemberships.size);
  } catch (error) {
    await recordSyncState(db, "roster", {
      success: false,
      lastRunAt: new Date(),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    await releaseAdvisoryLock(TIMEBACK_ROSTER_LOCK_KEY);
  }
}

async function ensureOrganization(
  db: ReturnType<typeof getDb>,
  orgSourcedId: string,
  name: string,
): Promise<string> {
  const existing = await db
    .selectFrom("organizations")
    .select(["id", "name"])
    .where("oneroster_sourced_id", "=", orgSourcedId)
    .executeTakeFirst();

  if (existing) {
    if (existing.name !== name) {
      await db
        .updateTable("organizations")
        .set({ name })
        .where("id", "=", existing.id)
        .execute();
    }
    return existing.id;
  }

  const inserted = await db
    .insertInto("organizations")
    .values({
      id: crypto.randomUUID(),
      name,
      oneroster_sourced_id: orgSourcedId,
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();

  return inserted.id;
}

async function fetchAllUsersForOrg(
  client: NonNullable<ReturnType<typeof getOneRosterClient>>,
  orgSourcedId: string,
  updatedSince: string | null,
): Promise<OneRosterUser[]> {
  const collected: OneRosterUser[] = [];
  let offset = 0;

  const filters = [
    `roles.org.sourcedId='${orgSourcedId}'`,
    `primaryOrg.sourcedId='${orgSourcedId}'`,
  ].map((filter) => buildUpdatedFilter(filter, updatedSince));

  let filterIndex = 0;
  let backoffMs = BACKOFF_INITIAL_MS;

  for (;;) {
    let response: Awaited<ReturnType<typeof oneroster.listUsers>> | null = null;
    for (; filterIndex < filters.length; filterIndex += 1) {
      try {
        response = await oneroster.listUsers(client, {
          filter: filters[filterIndex],
          limit: PAGE_SIZE,
          offset,
        });
        backoffMs = BACKOFF_INITIAL_MS;
        break;
      } catch (error) {
        if (error instanceof TimebackClientError && error.status === 429) {
          await delay(backoffMs);
          backoffMs = Math.min(backoffMs * 2, BACKOFF_MAX_MS);
          filterIndex = Math.max(filterIndex - 1, 0);
          continue;
        }
        if (error instanceof TimebackClientError && error.status === 400) {
          continue;
        }
        throw error;
      }
    }

    if (!response) {
      break;
    }

    const batch = response.users ?? [];
    collected.push(...batch);

    if (batch.length < PAGE_SIZE) {
      if (filterIndex >= filters.length - 1) {
        break;
      }
      filterIndex += 1;
      offset = 0;
      continue;
    }

    offset += PAGE_SIZE;
  }

  return collected;
}

type Role = "administrator" | "teacher" | "student" | "parent";

async function upsertUserAndMembership(
  db: ReturnType<typeof getDb>,
  orgId: string,
  orgSourcedId: string,
  user: OneRosterUser,
): Promise<{ userId: string; role: Role }> {
  const userId = await ensureUser(db, user);
  const role = resolveRole(user);
  const nowIso = new Date().toISOString();

  const orgMembership = {
    id: crypto.randomUUID(),
    org_id: orgId,
    user_id: userId,
    role,
    oneroster_user_id: user.sourcedId,
    oneroster_org_id: orgSourcedId,
    status: "active" as const,
    synced_at: nowIso,
    deleted_at: null,
  } as const;

  await db
    .insertInto("org_memberships")
    .values(orgMembership)
    .onConflict((oc) =>
      oc.columns(["org_id", "user_id"]).doUpdateSet((eb) => ({
        role: eb.ref("excluded.role"),
        oneroster_user_id: eb.ref("excluded.oneroster_user_id"),
        oneroster_org_id: eb.ref("excluded.oneroster_org_id"),
        status: eb.val("active"),
        synced_at: eb.val(nowIso),
        deleted_at: eb.val(null),
      })),
    )
    .execute();

  return { userId, role };
}

async function ensureUser(
  db: ReturnType<typeof getDb>,
  user: OneRosterUser,
): Promise<string> {
  const existing = await db
    .selectFrom("users")
    .select(["id"])
    .where("oneroster_user_id", "=", user.sourcedId)
    .executeTakeFirst();

  const email = user.email ?? user.username ?? `${user.sourcedId}@unknown.org`;
  const fullName = [user.givenName, user.familyName]
    .filter((part): part is string => Boolean(part && part.trim().length > 0))
    .join(" ")
    .trim();

  if (existing) {
    await db
      .updateTable("users")
      .set({
        email,
        name:
          fullName.length > 0 ? fullName : (user.username ?? user.sourcedId),
        oneroster_user_id: user.sourcedId,
      })
      .where("id", "=", existing.id)
      .execute();
    return existing.id;
  }

  const inserted = await db
    .insertInto("users")
    .values({
      id: crypto.randomUUID(),
      email,
      name: fullName.length > 0 ? fullName : (user.username ?? user.sourcedId),
      image_url: null,
      oneroster_user_id: user.sourcedId,
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();

  return inserted.id;
}

function resolveRole(user: OneRosterUser): Role {
  const roles = user.roles ?? [];
  const normalized = roles
    .map((role) => role?.role?.toLowerCase() ?? "")
    .filter((value) => value.length > 0);

  if (normalized.includes("administrator")) {
    return "administrator";
  }
  if (normalized.includes("teacher")) {
    return "teacher";
  }
  if (normalized.includes("parent") || normalized.includes("guardian")) {
    return "parent";
  }
  if (normalized.includes("student")) {
    return "student";
  }

  return "teacher";
}

async function ensureStudent(
  db: ReturnType<typeof getDb>,
  orgId: string,
  orgSourcedId: string,
  user: OneRosterUser,
  userId: string,
): Promise<string> {
  const existing = await db
    .selectFrom("students")
    .select(["id"])
    .where("oneroster_user_id", "=", user.sourcedId)
    .where("org_id", "=", orgId)
    .executeTakeFirst();

  const fullName = [user.givenName, user.familyName]
    .filter((part): part is string => Boolean(part && part.trim().length > 0))
    .join(" ")
    .trim();

  const nowIso = new Date().toISOString();

  if (existing) {
    await db
      .updateTable("students")
      .set({
        full_name:
          fullName.length > 0 ? fullName : (user.username ?? user.sourcedId),
        oneroster_user_id: user.sourcedId,
        oneroster_org_id: orgSourcedId,
        status: "active",
        deleted_at: null,
        synced_at: nowIso,
      })
      .where("id", "=", existing.id)
      .execute();
    return existing.id;
  }

  await db
    .insertInto("students")
    .values({
      id: crypto.randomUUID(),
      org_id: orgId,
      full_name:
        fullName.length > 0 ? fullName : (user.username ?? user.sourcedId),
      avatar_url: null,
      dob: null,
      primary_classroom_id: null,
      oneroster_user_id: user.sourcedId,
      oneroster_org_id: orgSourcedId,
      created_at: nowIso,
      status: "active",
      deleted_at: null,
      synced_at: nowIso,
    })
    .execute();

  // ensure membership role aligns with student
  await db
    .updateTable("org_memberships")
    .set({
      role: "student",
      status: "active",
      deleted_at: null,
      synced_at: nowIso,
    })
    .where("org_id", "=", orgId)
    .where("user_id", "=", userId)
    .execute();

  const inserted = await db
    .selectFrom("students")
    .select(["id"])
    .where("oneroster_user_id", "=", user.sourcedId)
    .where("org_id", "=", orgId)
    .executeTakeFirstOrThrow();

  return inserted.id;
}

type ParentContact = {
  name: string;
  email: string | null;
  phone: string | null;
  relation: string | null;
  preferredContactMethod: string | null;
};

type GuardianLink = {
  guardianId: string;
  contact: ParentContact;
};

async function syncStudentGuardians(
  db: ReturnType<typeof getDb>,
  client: NonNullable<ReturnType<typeof getOneRosterClient>>,
  orgId: string,
  rosterStudentMap: Map<string, string>,
  parentRosterMap: Map<string, OneRosterUser>,
): Promise<{ links: number; guardianIds: Set<string> }> {
  if (rosterStudentMap.size === 0 || parentRosterMap.size === 0) {
    return { links: 0, guardianIds: new Set() };
  }

  const linksByStudent = new Map<string, GuardianLink[]>();
  const activeGuardianSourcedIds = new Set<string>();

  for (const [parentRosterId, parentUser] of parentRosterMap) {
    const relation = extractGuardianRelation(parentUser);
    if (!relation) {
      continue;
    }

    const contact = buildParentContact(parentUser, relation);

    const guardianId = await ensureGuardianRecord(
      db,
      orgId,
      parentRosterId,
      contact,
    );
    activeGuardianSourcedIds.add(parentRosterId);

    const childRosterIds = await fetchChildrenForParent(client, parentRosterId);
    for (const childRosterId of childRosterIds) {
      const studentId = rosterStudentMap.get(childRosterId);
      if (!studentId) {
        continue;
      }
      const bucket = linksByStudent.get(childRosterId) ?? [];
      bucket.push({
        guardianId,
        contact,
      });
      linksByStudent.set(childRosterId, bucket);
    }
  }

  const allStudentEntries = Array.from(rosterStudentMap.entries());
  let linksPersisted = 0;
  for (const [studentRosterId, studentDbId] of allStudentEntries) {
    const links = linksByStudent.get(studentRosterId) ?? [];
    linksPersisted += await reconcileStudentGuardians(
      db,
      studentRosterId,
      studentDbId,
      links,
    );
  }

  await markInactiveGuardians(db, orgId, activeGuardianSourcedIds);

  return { links: linksPersisted, guardianIds: activeGuardianSourcedIds };
}

type SyncStateOptions = {
  success: boolean;
  lastRunAt?: Date;
  cursor?: string | null;
  lastHash?: string | null;
  error?: string | null;
};

async function recordSyncState(
  db: ReturnType<typeof getDb>,
  entity: string,
  options: SyncStateOptions,
): Promise<void> {
  const lastRunAt = options.lastRunAt ?? new Date();
  const cursor = options.cursor ?? null;
  const lastHash = options.lastHash ?? null;
  const errorMessage = options.error ?? null;
  const now = new Date();

  await db
    .insertInto("sync_state")
    .values({
      entity,
      cursor,
      last_hash: lastHash,
      last_run_at: lastRunAt,
      success: options.success,
      error_message: errorMessage,
      updated_at: now,
    })
    .onConflict((oc) =>
      oc.column("entity").doUpdateSet(({ val }) => ({
        cursor: val(cursor),
        last_hash: val(lastHash),
        last_run_at: val(lastRunAt),
        success: val(options.success),
        error_message: val(errorMessage),
        updated_at: val(now),
      })),
    )
    .execute();
}

function buildParentContact(
  user: OneRosterUser,
  relation: string,
): ParentContact | null {
  const name = buildFullName(user);
  if (!name) {
    return null;
  }
  const email = user.email ?? null;
  const phone = user.phone ?? user.sms ?? null;
  return {
    name,
    email,
    phone,
    relation,
    preferredContactMethod: email ? "email" : phone ? "phone" : null,
  };
}

function extractGuardianRelation(user: OneRosterUser): string | null {
  const roles = user.roles ?? [];
  for (const role of roles) {
    const value = role?.role?.toLowerCase();
    if (!value) {
      continue;
    }
    if (value === "parent" || value === "guardian" || value === "relative") {
      return value;
    }
  }
  return null;
}

function buildFullName(user: OneRosterUser): string {
  const first = user.preferredFirstName ?? user.givenName ?? "";
  const last = user.preferredLastName ?? user.familyName ?? "";
  const composed = `${first} ${last}`.trim();
  if (composed.length > 0) {
    return composed;
  }
  if (user.username) {
    return user.username;
  }
  if (user.sourcedId) {
    return user.sourcedId;
  }
  return "";
}

function contactKey(contact: ParentContact): string {
  return (contact.email ?? contact.name).toLowerCase();
}

async function getSyncCursor(
  db: ReturnType<typeof getDb>,
  entity: string,
): Promise<string | null> {
  const record = await db
    .selectFrom("sync_state")
    .select(["cursor"])
    .where("entity", "=", entity)
    .executeTakeFirst();
  return record?.cursor ?? null;
}

function normalizeCursor(since: string | null): string | null {
  if (!since) {
    return null;
  }
  const parsed = new Date(since);
  if (Number.isNaN(parsed.getTime())) {
    return since;
  }
  parsed.setSeconds(parsed.getSeconds() - 5);
  return parsed.toISOString();
}

function buildUpdatedFilter(base: string, since: string | null): string {
  if (!since) {
    return base;
  }
  return `${base} and dateLastModified>'${since}'`;
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function emitMetric(
  name: string,
  value: number,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const timestamp = new Date().toISOString();
  const payload = {
    name,
    value,
    ...metadata,
    timestamp,
  };
  logger.info("roster metric", payload);

  const metadataPayload =
    Object.keys(metadata).length > 0 ? (metadata as Json) : null;

  await getDb()
    .insertInto("sync_metrics")
    .values({
      entity: name,
      value,
      recorded_at: timestamp,
      metadata: metadataPayload,
    })
    .execute();
}

function contactRowKey(row: {
  email: string | null;
  name: string | null;
  id: string;
}): string {
  return (row.email ?? row.name ?? row.id).toLowerCase();
}

async function ensureGuardianRecord(
  db: ReturnType<typeof getDb>,
  orgId: string,
  guardianSourcedId: string,
  contact: ParentContact,
): Promise<string> {
  const existing = await db
    .selectFrom("guardians")
    .select(["id"])
    .where("sourced_id", "=", guardianSourcedId)
    .where("org_id", "=", orgId)
    .executeTakeFirst();

  const nowIso = new Date().toISOString();

  if (existing) {
    await db
      .updateTable("guardians")
      .set({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        relation: contact.relation,
        status: "active",
        deleted_at: null,
        synced_at: nowIso,
      })
      .where("id", "=", existing.id)
      .execute();
    return existing.id;
  }

  const inserted = await db
    .insertInto("guardians")
    .values({
      id: crypto.randomUUID(),
      org_id: orgId,
      sourced_id: guardianSourcedId,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      relation: contact.relation,
      status: "active",
      deleted_at: null,
      synced_at: nowIso,
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();

  return inserted.id;
}

async function reconcileStudentGuardians(
  db: ReturnType<typeof getDb>,
  studentRosterId: string,
  studentDbId: string,
  links: GuardianLink[],
): Promise<number> {
  const nowIso = new Date().toISOString();
  const nextGuardianIds = new Set(links.map((link) => link.guardianId));

  const existingLinks = await db
    .selectFrom("student_guardians")
    .select(["guardian_id"])
    .where("student_sourced_id", "=", studentRosterId)
    .execute();

  const existingSet = new Set(existingLinks.map((row) => row.guardian_id));

  for (const guardianId of existingSet) {
    if (!nextGuardianIds.has(guardianId)) {
      await db
        .deleteFrom("student_guardians")
        .where("student_sourced_id", "=", studentRosterId)
        .where("guardian_id", "=", guardianId)
        .execute();
    }
  }

  for (const link of links) {
    await db
      .insertInto("student_guardians")
      .values({
        student_sourced_id: studentRosterId,
        guardian_id: link.guardianId,
        relation: link.contact.relation,
        synced_at: nowIso,
      })
      .onConflict((oc) =>
        oc
          .columns(["student_sourced_id", "guardian_id"])
          .doUpdateSet(({ val }) => ({
            relation: val(link.contact.relation ?? null),
            synced_at: val(nowIso),
          })),
      )
      .execute();
  }

  await syncLegacyStudentParents(
    db,
    studentDbId,
    links.map((link) => link.contact),
  );

  return links.length;
}

async function syncLegacyStudentParents(
  db: ReturnType<typeof getDb>,
  studentDbId: string,
  contacts: ParentContact[],
): Promise<void> {
  const nowIso = new Date().toISOString();
  const contactMap = new Map<string, ParentContact>();
  for (const contact of contacts) {
    contactMap.set(contactKey(contact), contact);
  }

  const existingRows = await db
    .selectFrom("student_parents")
    .select(["id", "email", "name"])
    .where("student_id", "=", studentDbId)
    .execute();

  const existingMap = new Map<string, { id: string }>();
  for (const row of existingRows) {
    existingMap.set(contactRowKey(row), { id: row.id });
  }

  for (const [key, row] of existingMap) {
    if (!contactMap.has(key)) {
      await db
        .updateTable("student_parents")
        .set({ status: "inactive", deleted_at: nowIso, synced_at: nowIso })
        .where("id", "=", row.id)
        .execute();
    }
  }

  for (const [key, contact] of contactMap) {
    const existing = existingMap.get(key);
    if (existing) {
      await db
        .updateTable("student_parents")
        .set({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          relation: contact.relation,
          preferred_contact_method: contact.preferredContactMethod,
          status: "active",
          deleted_at: null,
          synced_at: nowIso,
        })
        .where("id", "=", existing.id)
        .execute();
    } else {
      await db
        .insertInto("student_parents")
        .values({
          id: crypto.randomUUID(),
          student_id: studentDbId,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          relation: contact.relation,
          preferred_contact_method: contact.preferredContactMethod,
          status: "active",
          synced_at: nowIso,
          deleted_at: null,
        })
        .execute();
    }
  }
}

async function markInactiveGuardians(
  db: ReturnType<typeof getDb>,
  orgId: string,
  activeGuardianSourcedIds: Set<string>,
): Promise<void> {
  if (activeGuardianSourcedIds.size === 0) {
    return;
  }

  const nowIso = new Date().toISOString();

  let query = db
    .updateTable("guardians")
    .set({ status: "inactive", deleted_at: nowIso, synced_at: nowIso })
    .where("org_id", "=", orgId)
    .where("deleted_at", "is", null);

  if (activeGuardianSourcedIds.size > 0) {
    query = query.where(
      "sourced_id",
      "not in",
      Array.from(activeGuardianSourcedIds),
    );
  }

  await query.execute();
}

async function fetchChildrenForParent(
  client: NonNullable<ReturnType<typeof getOneRosterClient>>,
  parentRosterId: string,
): Promise<string[]> {
  try {
    const response = await oneroster.listUsersForAgent(client, parentRosterId);

    const children = Array.isArray(response.users)
      ? response.users
          .map((user) => user?.sourcedId ?? null)
          .filter((id): id is string => Boolean(id))
      : [];

    return children;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Failed to fetch agentFor", { parentRosterId, message });
    return [];
  }
}

async function pruneOrgMemberships(
  db: ReturnType<typeof getDb>,
  orgId: string,
  remoteUserIds: Set<string>,
): Promise<number> {
  const nowIso = new Date().toISOString();

  let query = db
    .updateTable("org_memberships")
    .set({ status: "inactive", deleted_at: nowIso, synced_at: nowIso })
    .where("org_id", "=", orgId)
    .where("deleted_at", "is", null);

  if (remoteUserIds.size > 0) {
    query = query.where(
      "oneroster_user_id",
      "not in",
      Array.from(remoteUserIds),
    );
  }

  const result = await query.executeTakeFirst();
  return Number(result?.numUpdatedRows ?? 0);
}

async function pruneStudents(
  db: ReturnType<typeof getDb>,
  orgId: string,
  remoteStudentIds: Set<string>,
): Promise<number> {
  const nowIso = new Date().toISOString();

  let query = db
    .updateTable("students")
    .set({ status: "inactive", deleted_at: nowIso, synced_at: nowIso })
    .where("org_id", "=", orgId)
    .where("deleted_at", "is", null);

  if (remoteStudentIds.size > 0) {
    query = query.where(
      "oneroster_user_id",
      "not in",
      Array.from(remoteStudentIds),
    );
  }

  const result = await query.executeTakeFirst();
  return Number(result?.numUpdatedRows ?? 0);
}

async function syncCoursesForOrg(
  db: ReturnType<typeof getDb>,
  client: NonNullable<ReturnType<typeof getOneRosterClient>>,
  orgId: string,
  orgSourcedId: string,
  updatedSince: string | null,
): Promise<{ upserts: number; courseIds: Set<string> }> {
  const courses = await fetchAllCoursesForOrg(
    client,
    orgSourcedId,
    updatedSince,
  );
  const seen = new Set<string>();
  let upserts = 0;

  for (const course of courses) {
    if (!course?.sourcedId) {
      continue;
    }
    const changed = await upsertCourse(db, orgId, orgSourcedId, course);
    if (changed) {
      upserts += 1;
    }
    seen.add(course.sourcedId);
  }

  await pruneCourses(db, orgId, seen);

  return { upserts, courseIds: seen };
}

async function fetchAllCoursesForOrg(
  client: NonNullable<ReturnType<typeof getOneRosterClient>>,
  orgSourcedId: string,
  updatedSince: string | null,
): Promise<OneRosterCourse[]> {
  const collected: OneRosterCourse[] = [];
  let offset = 0;

  const filter = buildUpdatedFilter(
    `org.sourcedId='${orgSourcedId}'`,
    updatedSince,
  );
  let backoffMs = BACKOFF_INITIAL_MS;

  for (;;) {
    const response = await oneroster
      .listCourses(client, {
        filter,
        limit: PAGE_SIZE,
        offset,
      })
      .catch(async (error: unknown) => {
        if (error instanceof TimebackClientError && error.status === 429) {
          await delay(backoffMs);
          backoffMs = Math.min(backoffMs * 2, BACKOFF_MAX_MS);
          return null;
        }
        throw error;
      });

    if (!response) {
      continue;
    }

    backoffMs = BACKOFF_INITIAL_MS;

    const batch = response.courses ?? [];
    collected.push(...batch);
    if (batch.length < PAGE_SIZE) {
      break;
    }
    offset += PAGE_SIZE;
  }

  return collected;
}

async function upsertCourse(
  db: ReturnType<typeof getDb>,
  orgId: string,
  orgSourcedId: string,
  course: OneRosterCourse,
): Promise<boolean> {
  if (!course.sourcedId) {
    logger.warn("Skipping course without sourcedId during roster sync");
    return false;
  }

  const existing = await db
    .selectFrom("courses")
    .select(["id", "name", "description"])
    .where("org_id", "=", orgId)
    .where("oneroster_course_id", "=", course.sourcedId)
    .executeTakeFirst();

  const name = course?.title ?? `Course ${course?.sourcedId ?? "unknown"}`;
  const description = course?.courseCode ?? null;
  const nowIso = new Date().toISOString();

  if (existing) {
    await db
      .updateTable("courses")
      .set({
        name,
        description,
        oneroster_course_id: course.sourcedId,
        oneroster_org_id: orgSourcedId,
        status: "active",
        deleted_at: null,
        synced_at: nowIso,
      })
      .where("id", "=", existing.id)
      .execute();
    return true;
  }

  await db
    .insertInto("courses")
    .values({
      id: crypto.randomUUID(),
      org_id: orgId,
      subject_id: null,
      name,
      description,
      oneroster_course_id: course.sourcedId,
      oneroster_org_id: orgSourcedId,
      status: "active",
      deleted_at: null,
      synced_at: nowIso,
    })
    .execute();

  return true;
}

async function pruneCourses(
  db: ReturnType<typeof getDb>,
  orgId: string,
  remoteCourseIds: Set<string>,
): Promise<number> {
  const nowIso = new Date().toISOString();

  let query = db
    .updateTable("courses")
    .set({ status: "inactive", deleted_at: nowIso, synced_at: nowIso })
    .where("org_id", "=", orgId)
    .where("deleted_at", "is", null);

  if (remoteCourseIds.size > 0) {
    query = query.where(
      "oneroster_course_id",
      "not in",
      Array.from(remoteCourseIds),
    );
  }

  const result = await query.executeTakeFirst();
  return Number(result?.numUpdatedRows ?? 0);
}

async function syncClassroomsForOrg(
  db: ReturnType<typeof getDb>,
  client: NonNullable<ReturnType<typeof getOneRosterClient>>,
  orgId: string,
  orgSourcedId: string,
  updatedSince: string | null,
): Promise<{
  upserts: number;
  classrooms: Map<string, { id: string; classType: string | null }>;
  classRosterIds: Set<string>;
}> {
  const classes = await fetchAllClassesForOrg(
    client,
    orgSourcedId,
    updatedSince,
  );
  const seen = new Set<string>();
  const classroomMap = new Map<
    string,
    { id: string; classType: string | null }
  >();
  let upserts = 0;

  for (const klass of classes) {
    if (!klass?.sourcedId) {
      continue;
    }
    const result = await upsertClassroom(db, orgId, orgSourcedId, klass);
    if (result.updated) {
      upserts += 1;
    }
    if (!result.classroomId) {
      continue;
    }
    seen.add(klass.sourcedId);
    classroomMap.set(klass.sourcedId, {
      id: result.classroomId,
      classType: klass.classType ?? null,
    });
  }

  await pruneClassrooms(db, orgId, seen);

  return { upserts, classrooms: classroomMap, classRosterIds: seen };
}

async function fetchAllClassesForOrg(
  client: NonNullable<ReturnType<typeof getOneRosterClient>>,
  orgSourcedId: string,
  updatedSince: string | null,
): Promise<OneRosterClass[]> {
  const collected: OneRosterClass[] = [];
  let offset = 0;
  const filter = buildUpdatedFilter(
    `school.sourcedId='${orgSourcedId}'`,
    updatedSince,
  );
  let backoffMs = BACKOFF_INITIAL_MS;

  for (;;) {
    const response = await oneroster
      .listClasses(client, {
        filter,
        limit: PAGE_SIZE,
        offset,
      })
      .catch(async (error: unknown) => {
        if (error instanceof TimebackClientError && error.status === 429) {
          await delay(backoffMs);
          backoffMs = Math.min(backoffMs * 2, BACKOFF_MAX_MS);
          return null;
        }
        throw error;
      });

    if (!response) {
      continue;
    }

    backoffMs = BACKOFF_INITIAL_MS;

    const batch = response.classes ?? [];
    collected.push(...batch);
    if (batch.length < PAGE_SIZE) {
      break;
    }
    offset += PAGE_SIZE;
  }

  return collected;
}

async function upsertClassroom(
  db: ReturnType<typeof getDb>,
  orgId: string,
  orgSourcedId: string,
  klass: OneRosterClass,
): Promise<{ classroomId: string; updated: boolean }> {
  const classSourcedId = klass.sourcedId?.trim();
  if (!classSourcedId) {
    logger.warn("Skipping classroom without sourcedId during roster sync");
    return { classroomId: "", updated: false };
  }

  const existing = await db
    .selectFrom("classrooms")
    .select(["id", "name"])
    .where("org_id", "=", orgId)
    .where("oneroster_class_id", "=", classSourcedId)
    .executeTakeFirst();

  const name = klass?.title ?? `Class ${klass?.sourcedId ?? "unknown"}`;
  const nowIso = new Date().toISOString();

  if (existing) {
    await db
      .updateTable("classrooms")
      .set({
        name,
        oneroster_class_id: classSourcedId,
        oneroster_org_id: orgSourcedId,
        status: "active",
        deleted_at: null,
        synced_at: nowIso,
      })
      .where("id", "=", existing.id)
      .execute();
    const updated = existing.name !== name;
    return { classroomId: existing.id, updated };
  }

  const inserted = await db
    .insertInto("classrooms")
    .values({
      id: crypto.randomUUID(),
      org_id: orgId,
      name,
      oneroster_class_id: classSourcedId,
      oneroster_org_id: orgSourcedId,
      status: "active",
      deleted_at: null,
      synced_at: nowIso,
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();

  return { classroomId: inserted.id, updated: true };
}

async function pruneClassrooms(
  db: ReturnType<typeof getDb>,
  orgId: string,
  remoteClassIds: Set<string>,
): Promise<number> {
  const nowIso = new Date().toISOString();

  let query = db
    .updateTable("classrooms")
    .set({ status: "inactive", deleted_at: nowIso, synced_at: nowIso })
    .where("org_id", "=", orgId)
    .where("deleted_at", "is", null);

  if (remoteClassIds.size > 0) {
    query = query.where(
      "oneroster_class_id",
      "not in",
      Array.from(remoteClassIds),
    );
  }

  const result = await query.executeTakeFirst();
  return Number(result?.numUpdatedRows ?? 0);
}

async function syncClassroomMemberships(
  db: ReturnType<typeof getDb>,
  client: NonNullable<ReturnType<typeof getOneRosterClient>>,
  orgId: string,
  classrooms: Map<string, { id: string; classType: string | null }>,
  remoteStudentIds: Set<string>,
): Promise<number> {
  const assignments = new Map<
    string,
    { classroomId: string; priority: number }
  >();

  for (const [classRosterId, metadata] of classrooms) {
    const classroomStudents = await fetchAllStudentsForClass(
      client,
      classRosterId,
    );
    const students = classroomStudents.students ?? [];
    const priority = metadata.classType === "homeroom" ? 0 : 1;

    for (const student of students) {
      if (!student?.sourcedId || !remoteStudentIds.has(student.sourcedId)) {
        continue;
      }

      const existing = assignments.get(student.sourcedId);
      if (!existing || priority < existing.priority) {
        assignments.set(student.sourcedId, {
          classroomId: metadata.id,
          priority,
        });
      }
    }
  }

  if (remoteStudentIds.size === 0) {
    return 0;
  }

  const remoteIds = Array.from(remoteStudentIds);
  const studentRows = await db
    .selectFrom("students")
    .select(["id", "primary_classroom_id", "oneroster_user_id"])
    .where("org_id", "=", orgId)
    .where("oneroster_user_id", "in", remoteIds)
    .execute();

  let updates = 0;

  for (const row of studentRows) {
    const rosterId = row.oneroster_user_id ?? "";
    const assignment = assignments.get(rosterId);
    const desiredClassroomId = assignment?.classroomId ?? null;
    const currentClassroomId = row.primary_classroom_id ?? null;

    if (currentClassroomId === desiredClassroomId) {
      continue;
    }

    await db
      .updateTable("students")
      .set({ primary_classroom_id: desiredClassroomId })
      .where("id", "=", row.id)
      .execute();
    updates += 1;
  }

  return updates;
}

async function fetchAllStudentsForClass(
  client: NonNullable<ReturnType<typeof getOneRosterClient>>,
  classSourcedId: string,
): Promise<OneRosterClassStudentList> {
  let offset = 0;
  let accumulated: OneRosterClassStudentList | null = null;

  for (;;) {
    const response = await oneroster.listClassStudents(client, {
      classSourcedId,
      limit: PAGE_SIZE,
      offset,
    });

    if (!accumulated) {
      accumulated = response;
    } else {
      const existing = accumulated.students ?? [];
      const incoming = response.students ?? [];
      accumulated = {
        ...accumulated,
        students: [...existing, ...incoming],
      };
    }

    const batch = response.students ?? [];
    if (batch.length < PAGE_SIZE) {
      break;
    }
    offset += PAGE_SIZE;
  }

  return (
    accumulated ?? {
      students: [],
      totalCount: 0,
      pageCount: 0,
      pageNumber: 0,
      offset: 0,
      limit: PAGE_SIZE,
    }
  );
}

main().catch((error) => {
  logger.error("sync-timeback-roster failed", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
