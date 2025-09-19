import crypto from "node:crypto";

import { logger } from "@monte/shared";

import {
  loadTimebackEnv,
  maybeGetTimebackServiceConfig,
} from "@monte/timeback-clients";

import { loadApiEnv } from "../src/lib/env";

const apiEnv = loadApiEnv();

const ORG_SOURCED_ID = apiEnv.MONTE_ONEROSTER_ORG_ID ?? "monte-staging-school";

const STAGING_API =
  apiEnv.ONEROSTER_STAGING_API_URL ?? "https://api.staging.alpha-1edtech.com/";
const BASE_URL = `${STAGING_API.replace(/\/+$/, "")}/ims/oneroster/rostering/v1p2`;

const staffUsers = [
  {
    sourcedId: "monte-admin-laura",
    givenName: "Laura",
    familyName: "Mazer",
    email: "monte.laura.admin@demo.monte",
    role: "administrator" as const,
  },
  {
    sourcedId: "monte-guide-anna",
    givenName: "Anna",
    familyName: "Guide",
    email: "monte.anna.guide@demo.monte",
    role: "teacher" as const,
  },
  {
    sourcedId: "monte-guide-hanna",
    givenName: "Hanna",
    familyName: "Guide",
    email: "monte.hanna.guide@demo.monte",
    role: "teacher" as const,
  },
] as const;

const studentNames = [
  "Alice",
  "Arjun",
  "Ashlee",
  "Clara",
  "Clayton",
  "Griffin",
  "Jake",
  "Karthik",
  "Kriya",
  "Liam",
  "Lyrah",
  "Mebin",
  "Oliver",
  "Orion",
  "Riva",
  "Vikram",
  "Zara",
  "Zander",
] as const;

const parentSeeds = [
  {
    sourcedId: "monte-parent-sophia",
    givenName: "Sophia",
    familyName: "Rivera",
    email: "monte.sophia.parent@demo.monte",
    children: [
      "monte-student-alice",
      "monte-student-arjun",
      "monte-student-ashlee",
    ],
  },
  {
    sourcedId: "monte-parent-michael",
    givenName: "Michael",
    familyName: "Stone",
    email: "monte.michael.parent@demo.monte",
    children: [
      "monte-student-clara",
      "monte-student-clayton",
      "monte-student-griffin",
    ],
  },
  {
    sourcedId: "monte-parent-diana",
    givenName: "Diana",
    familyName: "Singh",
    email: "monte.diana.parent@demo.monte",
    children: [
      "monte-student-jake",
      "monte-student-karthik",
      "monte-student-kriya",
    ],
  },
  {
    sourcedId: "monte-parent-omar",
    givenName: "Omar",
    familyName: "Farah",
    email: "monte.omar.parent@demo.monte",
    children: [
      "monte-student-liam",
      "monte-student-lyrah",
      "monte-student-mebin",
    ],
  },
  {
    sourcedId: "monte-parent-nina",
    givenName: "Nina",
    familyName: "Chen",
    email: "monte.nina.parent@demo.monte",
    children: [
      "monte-student-oliver",
      "monte-student-orion",
      "monte-student-riva",
    ],
  },
  {
    sourcedId: "monte-parent-peter",
    givenName: "Peter",
    familyName: "Lopez",
    email: "monte.peter.parent@demo.monte",
    children: [
      "monte-student-vikram",
      "monte-student-zara",
      "monte-student-zander",
    ],
  },
] as const;

async function main() {
  loadTimebackEnv();
  const config = maybeGetTimebackServiceConfig("oneroster");
  if (!config?.credentials) {
    throw new Error("OneRoster credentials are not configured");
  }

  const token = await fetchAccessToken({
    tokenUrl: config.tokenUrl,
    clientId: config.credentials.clientId,
    clientSecret: config.credentials.clientSecret,
    scope: config.scope,
  });

  await ensureUsers(token, staffUsers);
  await ensureParents(token, parentSeeds);
  await ensureStudents(token, studentNames);
  await linkParentsToStudents(token, parentSeeds);

  logger.info("Timeback Monte users and guardians ensured");
}

type StaffUser = (typeof staffUsers)[number];
type ParentSeed = (typeof parentSeeds)[number];

type TokenRequest = {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
};

async function fetchAccessToken(options: TokenRequest): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: options.clientId,
    client_secret: options.clientSecret,
  });

  if (options.scope) {
    body.set("scope", options.scope);
  }

  const response = await fetch(options.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to fetch access token (${response.status}): ${text}`,
    );
  }

  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("access_token not present in token response");
  }
  return json.access_token;
}

async function ensureUsers(token: string, users: ReadonlyArray<StaffUser>) {
  for (const user of users) {
    await upsertUser(token, {
      sourcedId: user.sourcedId,
      givenName: user.givenName,
      familyName: user.familyName,
      email: user.email,
      role: user.role,
      grades: [],
    });
  }
}

async function ensureStudents(token: string, names: ReadonlyArray<string>) {
  for (const name of names) {
    const slug = slugify(name);
    await upsertUser(token, {
      sourcedId: `monte-student-${slug}`,
      givenName: name,
      familyName: "Learner",
      email: `${slug || crypto.randomUUID()}@students.monte.demo`,
      role: "student",
      grades: ["03"],
    });
  }
}

async function ensureParents(
  token: string,
  parents: ReadonlyArray<ParentSeed>,
) {
  for (const parent of parents) {
    await upsertUser(token, {
      sourcedId: parent.sourcedId,
      givenName: parent.givenName,
      familyName: parent.familyName,
      email: parent.email,
      role: "parent",
    });
  }
}

async function linkParentsToStudents(
  token: string,
  parents: ReadonlyArray<ParentSeed>,
): Promise<void> {
  for (const parent of parents) {
    for (const child of parent.children) {
      await ensureAgentLink(token, child, parent.sourcedId);
    }
  }
}

type UpsertUserArgs = {
  sourcedId: string;
  givenName: string;
  familyName: string;
  email: string;
  role: "administrator" | "teacher" | "student" | "parent";
  grades?: string[];
};

async function upsertUser(token: string, args: UpsertUserArgs): Promise<void> {
  const basePayload = {
    sourcedId: args.sourcedId,
    status: "active",
    enabledUser: "true",
    givenName: args.givenName,
    familyName: args.familyName,
    email: args.email,
    username: args.sourcedId,
    roles: [
      {
        role: args.role,
        roleType: "primary",
        org: { sourcedId: ORG_SOURCED_ID },
      },
    ],
    grades: args.role === "student" ? args.grades : undefined,
    primaryOrg: { sourcedId: ORG_SOURCED_ID, type: "org" },
  } as const;

  const createResponse = await fetch(`${BASE_URL}/users/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: basePayload }),
  });

  if (createResponse.ok) {
    logger.info("Created Timeback user", { sourcedId: args.sourcedId });
    return;
  }

  if (createResponse.status !== 409 && createResponse.status !== 422) {
    const text = await createResponse.text();
    throw new Error(
      `Failed to create user ${args.sourcedId} (${createResponse.status}): ${text}`,
    );
  }

  const updateResponse = await fetch(`${BASE_URL}/users/${args.sourcedId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: basePayload }),
  });

  if (!updateResponse.ok) {
    const text = await updateResponse.text();
    throw new Error(
      `Failed to update user ${args.sourcedId} (${updateResponse.status}): ${text}`,
    );
  }

  logger.info("Updated Timeback user", { sourcedId: args.sourcedId });
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function ensureAgentLink(
  token: string,
  studentSourcedId: string,
  parentSourcedId: string,
): Promise<void> {
  const deleteResponse = await fetch(
    `${BASE_URL}/users/${studentSourcedId}/agents/${parentSourcedId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!deleteResponse.ok && deleteResponse.status !== 404) {
    const text = await deleteResponse.text();
    logger.warn("Failed to remove existing agent link", {
      parentSourcedId,
      studentSourcedId,
      status: deleteResponse.status,
      message: text,
    });
  }

  const response = await fetch(`${BASE_URL}/users/${studentSourcedId}/agents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agentSourcedId: parentSourcedId }),
  });

  if (!response.ok && response.status !== 409 && response.status !== 422) {
    const text = await response.text();
    throw new Error(
      `Failed to link parent ${parentSourcedId} to student ${studentSourcedId} (${response.status}): ${text}`,
    );
  }

  if (response.ok) {
    logger.info("Linked parent to student", {
      parentSourcedId,
      studentSourcedId,
    });
  }
}

main().catch((error) => {
  logger.error("create-timeback-monte failed", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
