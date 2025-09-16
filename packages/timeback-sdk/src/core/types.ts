import { z } from "zod";
import {
  getEndpoint as getAuthenticationEndpoint,
} from "@monte/shared/timeback/generated/core.ts/Authentication";
import {
  getEndpoint as getOneRosterEndpoint,
  schemas as oneRosterSchemas,
} from "@monte/shared/timeback/generated/core.ts/OneRoster_v1_2___Rostering";
import {
  getEndpoint as getUsersEndpoint,
  schemas as userSchemas,
} from "@monte/shared/timeback/generated/core.ts/Users";
import {
  getEndpoint as getSsoEndpoint,
  schemas as ssoSchemas,
} from "@monte/shared/timeback/generated/core.ts/SSO";
import { getEndpoint as getAuditEndpoint } from "@monte/shared/timeback/generated/core.ts/Audit";

function requireEndpoint(
  get: (alias: string) => unknown,
  alias: string
): { response: z.ZodTypeAny } {
  const endpoint = get(alias) as { response?: z.ZodTypeAny } | undefined;
  if (!endpoint || !endpoint.response) {
    throw new Error(`Endpoint with alias "${alias}" is not available in the generated definitions`);
  }
  return endpoint as { response: z.ZodTypeAny };
}

const authMeEndpoint = requireEndpoint(getAuthenticationEndpoint, "getApiAuthMe");
const authInfoEndpoint = requireEndpoint(getAuthenticationEndpoint, "getApiAuthInfo");
const loginEndpoint = requireEndpoint(getAuthenticationEndpoint, "postApiAuthLogin");
const logoutEndpoint = requireEndpoint(getAuthenticationEndpoint, "postApiAuthLogout");

export type CoreAuthMeEnvelope = z.infer<typeof authMeEndpoint.response>;
export type CoreAuthInfoEnvelope = z.infer<typeof authInfoEndpoint.response>;
export type CoreLoginEnvelope = z.infer<typeof loginEndpoint.response>;
export type CoreLogoutEnvelope = z.infer<typeof logoutEndpoint.response>;

export type AuthRequestOptions = {
  accessToken?: string | null;
  signal?: AbortSignal;
};

export type LoginRequestOptions = AuthRequestOptions;

export type LoginWithPasswordInput = {
  email: string;
  password: string;
  rememberDevice?: boolean;
};

const listSchoolsEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2Schools"
);
const getSchoolEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2SchoolsById"
);

const listUsersEndpoint = requireEndpoint(getUsersEndpoint, "getApiUsers");
const createUserEndpoint = requireEndpoint(getUsersEndpoint, "postApiUsers");
const getUserEndpoint = requireEndpoint(getUsersEndpoint, "getApiUsersById");
const updateUserEndpoint = requireEndpoint(getUsersEndpoint, "putApiUsersById");
const deleteUserEndpoint = requireEndpoint(getUsersEndpoint, "deleteApiUsersById");
const associateUserEndpoint = requireEndpoint(
  getUsersEndpoint,
  "postApiUsersByIdAssociate-oneroster"
);

const registerSessionEndpoint = requireEndpoint(
  getSsoEndpoint,
  "postApiAuthSessionsRegister"
);
const checkSessionEndpoint = requireEndpoint(
  getSsoEndpoint,
  "postApiAuthSessionsCheck"
);
const revokeSessionsEndpoint = requireEndpoint(
  getSsoEndpoint,
  "deleteApiAuthSessionsRevoke"
);
const listSessionsEndpoint = requireEndpoint(
  getSsoEndpoint,
  "getApiAuthSessions"
);

const auditLogsEndpoint = requireEndpoint(
  getAuditEndpoint,
  "getApiAudit-logs"
);
const auditStatsEndpoint = requireEndpoint(
  getAuditEndpoint,
  "getApiAudit-logsStats"
);

const listOrganizationsEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2Orgs"
);
const createOrganizationEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "postImsOnerosterRosteringV1p2Orgs"
);
const getOrganizationEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2OrgsById"
);
const updateOrganizationEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "putImsOnerosterRosteringV1p2OrgsById"
);
const deleteOrganizationEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "deleteImsOnerosterRosteringV1p2OrgsById"
);

const listAcademicSessionsEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2AcademicSessions"
);
const createAcademicSessionEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "postImsOnerosterRosteringV1p2AcademicSessions"
);
const getAcademicSessionEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2AcademicSessionsById"
);
const updateAcademicSessionEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "putImsOnerosterRosteringV1p2AcademicSessionsById"
);
const deleteAcademicSessionEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "deleteImsOnerosterRosteringV1p2AcademicSessionsById"
);

const listCoursesEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2Courses"
);
const createCourseEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "postImsOnerosterRosteringV1p2Courses"
);
const getCourseEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2CoursesById"
);
const updateCourseEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "putImsOnerosterRosteringV1p2CoursesById"
);
const deleteCourseEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "deleteImsOnerosterRosteringV1p2CoursesById"
);

const listClassesEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2Classes"
);
const createClassEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "postImsOnerosterRosteringV1p2Classes"
);
const getClassEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2ClassesById"
);
const updateClassEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "putImsOnerosterRosteringV1p2ClassesById"
);
const deleteClassEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "deleteImsOnerosterRosteringV1p2ClassesById"
);

const listEnrollmentsEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2Enrollments"
);
const createEnrollmentEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "postImsOnerosterRosteringV1p2Enrollments"
);
const getEnrollmentEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "getImsOnerosterRosteringV1p2EnrollmentsById"
);
const updateEnrollmentEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "putImsOnerosterRosteringV1p2EnrollmentsById"
);
const deleteEnrollmentEndpoint = requireEndpoint(
  getOneRosterEndpoint,
  "deleteImsOnerosterRosteringV1p2EnrollmentsById"
);

export const healthSchema = z
  .object({
    status: z.string(),
    timestamp: z.string().optional(),
  })
  .passthrough();

export type ListSchoolsResponse = z.infer<typeof listSchoolsEndpoint.response>;
export type OneRosterSchool = ListSchoolsResponse["schools"][number];

export type GetSchoolResponse = z.infer<typeof getSchoolEndpoint.response>;

export type ListSchoolsOptions = AuthRequestOptions & {
  limit?: number;
  offset?: number;
  sort?: string;
  orderBy?: "asc" | "desc";
  filter?: string;
  fields?: string;
};

export type GetSchoolOptions = AuthRequestOptions;

export type ListUsersResponse = z.infer<typeof listUsersEndpoint.response>;
export type TimebackUser = ListUsersResponse["data"]["items"][number];
export type ListUsersOptions = AuthRequestOptions & {
  page?: number;
  pageSize?: number;
};

export type CreateUserInput = z.input<typeof userSchemas.postApiUsers_Body>;
export type CreateUserResponse = z.infer<typeof createUserEndpoint.response>;
export type GetUserOptions = AuthRequestOptions;
export type GetUserResponse = z.infer<typeof getUserEndpoint.response>;

export type UpdateUserInput = z.input<typeof userSchemas.putApiUsersById_Body>;
export type UpdateUserResponse = z.infer<typeof updateUserEndpoint.response>;
export type DeleteUserResponse = z.infer<typeof deleteUserEndpoint.response>;
export type DeleteUserOptions = AuthRequestOptions;

export type AssociateOneRosterInput = {
  onerosterId: string;
};
export type AssociateOneRosterResponse = z.infer<
  typeof associateUserEndpoint.response
>;
export type AssociateOneRosterOptions = AuthRequestOptions;

export type RegisterSsoInput = z.input<typeof ssoSchemas.postApiAuthSessionsRegister_Body>;
export type RegisterSsoResponse = z.infer<typeof registerSessionEndpoint.response>;
export type CheckSsoResponse = z.infer<typeof checkSessionEndpoint.response>;
export type RevokeSsoResponse = z.infer<typeof revokeSessionsEndpoint.response>;
export type ListSsoSessionsResponse = z.infer<typeof listSessionsEndpoint.response>;
export type SsoRequestOptions = AuthRequestOptions;

export type OneRosterListOptions = AuthRequestOptions & {
  limit?: number;
  offset?: number;
  sort?: string;
  orderBy?: "asc" | "desc";
  filter?: string;
  fields?: string;
};

export type ListOrganizationsOptions = OneRosterListOptions;
export type ListOrganizationsResponse = z.infer<typeof listOrganizationsEndpoint.response>;
export type Organization = ListOrganizationsResponse["orgs"][number];
export type GetOrganizationResponse = z.infer<typeof getOrganizationEndpoint.response>;
export type CreateOrganizationInput = z.input<typeof oneRosterSchemas.postImsOnerosterRosteringV1p2Orgs_Body>;
export type UpdateOrganizationInput = z.input<typeof oneRosterSchemas.putImsOnerosterRosteringV1p2OrgsById_Body>;
export type CreateOrganizationResponse = z.infer<typeof createOrganizationEndpoint.response>;
export type UpdateOrganizationResponse = z.infer<typeof updateOrganizationEndpoint.response>;
export type DeleteOrganizationResponse = z.infer<typeof deleteOrganizationEndpoint.response>;

export type ListAcademicSessionsOptions = OneRosterListOptions;
export type ListAcademicSessionsResponse = z.infer<typeof listAcademicSessionsEndpoint.response>;
export type AcademicSession = ListAcademicSessionsResponse["academicSessions"][number];
export type GetAcademicSessionResponse = z.infer<typeof getAcademicSessionEndpoint.response>;
export type CreateAcademicSessionInput = z.input<typeof oneRosterSchemas.postImsOnerosterRosteringV1p2AcademicSessions_Body>;
export type UpdateAcademicSessionInput = z.input<typeof oneRosterSchemas.putImsOnerosterRosteringV1p2AcademicSessionsById_Body>;
export type CreateAcademicSessionResponse = z.infer<typeof createAcademicSessionEndpoint.response>;
export type UpdateAcademicSessionResponse = z.infer<typeof updateAcademicSessionEndpoint.response>;
export type DeleteAcademicSessionResponse = z.infer<typeof deleteAcademicSessionEndpoint.response>;

export type ListCoursesOptions = OneRosterListOptions;
export type ListCoursesResponse = z.infer<typeof listCoursesEndpoint.response>;
export type Course = ListCoursesResponse["courses"][number];
export type GetCourseResponse = z.infer<typeof getCourseEndpoint.response>;
export type CreateCourseInput = z.input<typeof oneRosterSchemas.postImsOnerosterRosteringV1p2Courses_Body>;
export type UpdateCourseInput = z.input<typeof oneRosterSchemas.putImsOnerosterRosteringV1p2CoursesById_Body>;
export type CreateCourseResponse = z.infer<typeof createCourseEndpoint.response>;
export type UpdateCourseResponse = z.infer<typeof updateCourseEndpoint.response>;
export type DeleteCourseResponse = z.infer<typeof deleteCourseEndpoint.response>;

export type ListClassesOptions = OneRosterListOptions;
export type ListClassesResponse = z.infer<typeof listClassesEndpoint.response>;
export type Class = ListClassesResponse["classes"][number];
export type GetClassResponse = z.infer<typeof getClassEndpoint.response>;
export type CreateClassInput = z.input<typeof oneRosterSchemas.postImsOnerosterRosteringV1p2Classes_Body>;
export type UpdateClassInput = z.input<typeof oneRosterSchemas.putImsOnerosterRosteringV1p2ClassesById_Body>;
export type CreateClassResponse = z.infer<typeof createClassEndpoint.response>;
export type UpdateClassResponse = z.infer<typeof updateClassEndpoint.response>;
export type DeleteClassResponse = z.infer<typeof deleteClassEndpoint.response>;

export type ListEnrollmentsOptions = OneRosterListOptions;
export type ListEnrollmentsResponse = z.infer<typeof listEnrollmentsEndpoint.response>;
export type Enrollment = ListEnrollmentsResponse["enrollments"][number];
export type GetEnrollmentResponse = z.infer<typeof getEnrollmentEndpoint.response>;
export type CreateEnrollmentInput = z.input<typeof oneRosterSchemas.postImsOnerosterRosteringV1p2Enrollments_Body>;
export type UpdateEnrollmentInput = z.input<typeof oneRosterSchemas.putImsOnerosterRosteringV1p2EnrollmentsById_Body>;
export type CreateEnrollmentResponse = z.infer<typeof createEnrollmentEndpoint.response>;
export type UpdateEnrollmentResponse = z.infer<typeof updateEnrollmentEndpoint.response>;
export type DeleteEnrollmentResponse = z.infer<typeof deleteEnrollmentEndpoint.response>;

export type CoreHealthResponse = z.infer<
  typeof healthSchema
>;

export type ListAuditLogsOptions = AuthRequestOptions & {
  userId?: string;
  apiKeyId?: string;
  orgContext?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};
export type ListAuditLogsResponse = z.infer<typeof auditLogsEndpoint.response>;
export type AuditStatsResponse = z.infer<typeof auditStatsEndpoint.response>;
export type AuditStatsOptions = AuthRequestOptions;
