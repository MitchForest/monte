import { toTimebackSuccess, type TimebackSuccess } from "@monte/shared/timeback";
import type { TimebackClient } from "../client";
import type {
  AuthRequestOptions,
  CoreAuthInfoEnvelope,
  CoreAuthMeEnvelope,
  CoreLoginEnvelope,
  CoreLogoutEnvelope,
  LoginRequestOptions,
  LoginWithPasswordInput,
  ListUsersOptions,
  ListUsersResponse,
  CreateUserInput,
  CreateUserResponse,
  GetUserOptions,
  GetUserResponse,
  UpdateUserInput,
  UpdateUserResponse,
  DeleteUserOptions,
  DeleteUserResponse,
  AssociateOneRosterInput,
  AssociateOneRosterOptions,
  AssociateOneRosterResponse,
} from "../core/types";
import type {
  ListSchoolsOptions,
  ListSchoolsResponse,
  GetSchoolOptions,
  GetSchoolResponse,
  ListOrganizationsOptions,
  ListOrganizationsResponse,
  GetOrganizationResponse,
  CreateOrganizationInput,
  CreateOrganizationResponse,
  UpdateOrganizationInput,
  UpdateOrganizationResponse,
  DeleteOrganizationResponse,
  ListAcademicSessionsOptions,
  ListAcademicSessionsResponse,
  GetAcademicSessionResponse,
  CreateAcademicSessionInput,
  UpdateAcademicSessionInput,
  CreateAcademicSessionResponse,
  UpdateAcademicSessionResponse,
  DeleteAcademicSessionResponse,
  ListCoursesOptions,
  ListCoursesResponse,
  GetCourseResponse,
  CreateCourseInput,
  UpdateCourseInput,
  CreateCourseResponse,
  UpdateCourseResponse,
  DeleteCourseResponse,
  ListClassesOptions,
  ListClassesResponse,
  GetClassResponse,
  CreateClassInput,
  UpdateClassInput,
  CreateClassResponse,
  UpdateClassResponse,
  DeleteClassResponse,
  ListEnrollmentsOptions,
  ListEnrollmentsResponse,
  GetEnrollmentResponse,
  CreateEnrollmentInput,
  UpdateEnrollmentInput,
  CreateEnrollmentResponse,
  UpdateEnrollmentResponse,
  DeleteEnrollmentResponse,
} from "../core/types";
import type {
  RegisterSsoInput,
  RegisterSsoResponse,
  CheckSsoResponse,
  RevokeSsoResponse,
  ListSsoSessionsResponse,
  SsoRequestOptions,
} from "../core/types";
import type {
  AuditStatsOptions,
  AuditStatsResponse,
  ListAuditLogsOptions,
  ListAuditLogsResponse,
} from "../core/types";
import type {
  CaliperAnalyticsResponse,
  CaliperAnalyticsEvent,
  CaliperEnvelope,
  CaliperIngestOptions,
  CaliperIngestResponse,
  CaliperWebhook,
  CaliperValidationOptions,
  CaliperValidationResponse,
  CaliperHealthResponse,
  CreateWebhookBody,
  CreateWebhookOptions,
  ListWebhooksOptions,
  ListWebhooksResponse,
  GetWebhookOptions,
  UpdateWebhookBody,
  UpdateWebhookOptions,
  DeleteWebhookOptions,
  QueryEventsOptions,
  GetEventOptions,
} from "../caliper/types";

export function createMonteTimeback(client: TimebackClient) {
  return {
    auth: {
      getCurrentUser: async (
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<CoreAuthMeEnvelope>> => {
        const response = await client.core.auth.getCurrentUser(options);
        return toTimebackSuccess(response);
      },
      getAuthInfo: async (
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<CoreAuthInfoEnvelope>> => {
        const response = await client.core.auth.getAuthInfo(options);
        return toTimebackSuccess(response);
      },
      loginWithPassword: async (
        credentials: LoginWithPasswordInput,
        options: LoginRequestOptions = {}
      ): Promise<TimebackSuccess<CoreLoginEnvelope>> => {
        const response = await client.core.auth.loginWithPassword(credentials, options);
        return toTimebackSuccess(response);
      },
      logout: async (
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<CoreLogoutEnvelope>> => {
        const response = await client.core.auth.logout(options);
        return toTimebackSuccess(response);
      },
    },
    users: {
      list: async (
        options: ListUsersOptions = {}
      ): Promise<TimebackSuccess<ListUsersResponse>> => {
        const response = await client.core.users.list(options);
        return toTimebackSuccess(response);
      },
      create: async (
        input: CreateUserInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<CreateUserResponse>> => {
        const response = await client.core.users.create(input, options);
        return toTimebackSuccess(response);
      },
      get: async (
        id: string,
        options: GetUserOptions = {}
      ): Promise<TimebackSuccess<GetUserResponse>> => {
        const response = await client.core.users.get(id, options);
        return toTimebackSuccess(response);
      },
      update: async (
        id: string,
        input: UpdateUserInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<UpdateUserResponse>> => {
        const response = await client.core.users.update(id, input, options);
        return toTimebackSuccess(response);
      },
      delete: async (
        id: string,
        options: DeleteUserOptions = {}
      ): Promise<TimebackSuccess<DeleteUserResponse>> => {
        const response = await client.core.users.delete(id, options);
        return toTimebackSuccess(response);
      },
      associateWithOneRoster: async (
        id: string,
        input: AssociateOneRosterInput,
        options: AssociateOneRosterOptions = {}
      ): Promise<TimebackSuccess<AssociateOneRosterResponse>> => {
        const response = await client.core.users.associateWithOneRoster(
          id,
          input,
          options
        );
        return toTimebackSuccess(response);
      },
    },
    oneRoster: {
      listSchools: async (
        options: ListSchoolsOptions = {}
      ): Promise<TimebackSuccess<ListSchoolsResponse>> => {
        const response = await client.core.oneroster.listSchools(options);
        return toTimebackSuccess(response);
      },
      getSchool: async (
        id: string,
        options: GetSchoolOptions = {}
      ): Promise<TimebackSuccess<GetSchoolResponse>> => {
        const response = await client.core.oneroster.getSchool(id, options);
        return toTimebackSuccess(response);
      },
      listOrganizations: async (
        options: ListOrganizationsOptions = {}
      ): Promise<TimebackSuccess<ListOrganizationsResponse>> => {
        const response = await client.core.oneroster.listOrganizations(options);
        return toTimebackSuccess(response);
      },
      getOrganization: async (
        id: string,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<GetOrganizationResponse>> => {
        const response = await client.core.oneroster.getOrganization(id, options);
        return toTimebackSuccess(response);
      },
      createOrganization: async (
        input: CreateOrganizationInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<CreateOrganizationResponse>> => {
        const response = await client.core.oneroster.createOrganization(input, options);
        return toTimebackSuccess(response);
      },
      updateOrganization: async (
        id: string,
        input: UpdateOrganizationInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<UpdateOrganizationResponse>> => {
        const response = await client.core.oneroster.updateOrganization(id, input, options);
        return toTimebackSuccess(response);
      },
      deleteOrganization: async (
        id: string,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<void>> => {
        await client.core.oneroster.deleteOrganization(id, options);
        return toTimebackSuccess(undefined);
      },
      listAcademicSessions: async (
        options: ListAcademicSessionsOptions = {}
      ): Promise<TimebackSuccess<ListAcademicSessionsResponse>> => {
        const response = await client.core.oneroster.listAcademicSessions(options);
        return toTimebackSuccess(response);
      },
      getAcademicSession: async (
        id: string,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<GetAcademicSessionResponse>> => {
        const response = await client.core.oneroster.getAcademicSession(id, options);
        return toTimebackSuccess(response);
      },
      createAcademicSession: async (
        input: CreateAcademicSessionInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<CreateAcademicSessionResponse>> => {
        const response = await client.core.oneroster.createAcademicSession(input, options);
        return toTimebackSuccess(response);
      },
      updateAcademicSession: async (
        id: string,
        input: UpdateAcademicSessionInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<UpdateAcademicSessionResponse>> => {
        const response = await client.core.oneroster.updateAcademicSession(id, input, options);
        return toTimebackSuccess(response);
      },
      listCourses: async (
        options: ListCoursesOptions = {}
      ): Promise<TimebackSuccess<ListCoursesResponse>> => {
        const response = await client.core.oneroster.listCourses(options);
        return toTimebackSuccess(response);
      },
      getCourse: async (
        id: string,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<GetCourseResponse>> => {
        const response = await client.core.oneroster.getCourse(id, options);
        return toTimebackSuccess(response);
      },
      createCourse: async (
        input: CreateCourseInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<CreateCourseResponse>> => {
        const response = await client.core.oneroster.createCourse(input, options);
        return toTimebackSuccess(response);
      },
      updateCourse: async (
        id: string,
        input: UpdateCourseInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<UpdateCourseResponse>> => {
        const response = await client.core.oneroster.updateCourse(id, input, options);
        return toTimebackSuccess(response);
      },
      listClasses: async (
        options: ListClassesOptions = {}
      ): Promise<TimebackSuccess<ListClassesResponse>> => {
        const response = await client.core.oneroster.listClasses(options);
        return toTimebackSuccess(response);
      },
      getClass: async (
        id: string,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<GetClassResponse>> => {
        const response = await client.core.oneroster.getClass(id, options);
        return toTimebackSuccess(response);
      },
      createClass: async (
        input: CreateClassInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<CreateClassResponse>> => {
        const response = await client.core.oneroster.createClass(input, options);
        return toTimebackSuccess(response);
      },
      updateClass: async (
        id: string,
        input: UpdateClassInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<UpdateClassResponse>> => {
        const response = await client.core.oneroster.updateClass(id, input, options);
        return toTimebackSuccess(response);
      },
      listEnrollments: async (
        options: ListEnrollmentsOptions = {}
      ): Promise<TimebackSuccess<ListEnrollmentsResponse>> => {
        const response = await client.core.oneroster.listEnrollments(options);
        return toTimebackSuccess(response);
      },
      getEnrollment: async (
        id: string,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<GetEnrollmentResponse>> => {
        const response = await client.core.oneroster.getEnrollment(id, options);
        return toTimebackSuccess(response);
      },
      createEnrollment: async (
        input: CreateEnrollmentInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<CreateEnrollmentResponse>> => {
        const response = await client.core.oneroster.createEnrollment(input, options);
        return toTimebackSuccess(response);
      },
      updateEnrollment: async (
        id: string,
        input: UpdateEnrollmentInput,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<UpdateEnrollmentResponse>> => {
        const response = await client.core.oneroster.updateEnrollment(id, input, options);
        return toTimebackSuccess(response);
      },
      deleteEnrollment: async (
        id: string,
        options: AuthRequestOptions = {}
      ): Promise<TimebackSuccess<void>> => {
        await client.core.oneroster.deleteEnrollment(id, options);
        return toTimebackSuccess(undefined);
      },
    },
    sso: {
      register: async (
        input: RegisterSsoInput,
        options: SsoRequestOptions = {}
      ): Promise<TimebackSuccess<RegisterSsoResponse>> => {
        const response = await client.core.sso.register(input, options);
        return toTimebackSuccess(response);
      },
      check: async (
        input: RegisterSsoInput,
        options: SsoRequestOptions = {}
      ): Promise<TimebackSuccess<CheckSsoResponse>> => {
        const response = await client.core.sso.check(input, options);
        return toTimebackSuccess(response);
      },
      list: async (
        options: SsoRequestOptions = {}
      ): Promise<TimebackSuccess<ListSsoSessionsResponse>> => {
        const response = await client.core.sso.listSessions(options);
        return toTimebackSuccess(response);
      },
      revoke: async (
        options: SsoRequestOptions = {}
      ): Promise<TimebackSuccess<RevokeSsoResponse>> => {
        const response = await client.core.sso.revokeAll(options);
        return toTimebackSuccess(response);
      },
    },
    audit: {
      listLogs: async (
        options: ListAuditLogsOptions = {}
      ): Promise<TimebackSuccess<ListAuditLogsResponse>> => {
        const response = await client.core.audit.listLogs(options);
        return toTimebackSuccess(response);
      },
      stats: async (
        options: AuditStatsOptions = {}
      ): Promise<TimebackSuccess<AuditStatsResponse>> => {
        const response = await client.core.audit.getStats(options);
        return toTimebackSuccess(response);
      },
    },
    caliper: {
      validateEnvelope: async (
        envelope: CaliperEnvelope,
        options: CaliperValidationOptions = {}
      ): Promise<TimebackSuccess<CaliperValidationResponse>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        const response = await client.caliper.validateEnvelope(envelope, options);
        return toTimebackSuccess(response);
      },
      sendEnvelope: async (
        envelope: CaliperEnvelope,
        options: CaliperIngestOptions = {}
      ): Promise<TimebackSuccess<CaliperIngestResponse>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        const response = await client.caliper.sendEnvelope(envelope, options);
        return toTimebackSuccess(response);
      },
      queryEvents: async (
        options: QueryEventsOptions = {}
      ): Promise<TimebackSuccess<CaliperAnalyticsResponse>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        const response = await client.caliper.queryEvents(options);
        return toTimebackSuccess(response);
      },
      getEvent: async (
        id: string,
        options: GetEventOptions = {}
      ): Promise<TimebackSuccess<CaliperAnalyticsEvent>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        const response = await client.caliper.getEvent(id, options);
        return toTimebackSuccess(response);
      },
      listWebhooks: async (
        options: ListWebhooksOptions = {}
      ): Promise<TimebackSuccess<ListWebhooksResponse>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        const response = await client.caliper.listWebhooks(options);
        return toTimebackSuccess(response);
      },
      getWebhook: async (
        id: string,
        options: GetWebhookOptions = {}
      ): Promise<TimebackSuccess<CaliperWebhook>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        const response = await client.caliper.getWebhook(id, options);
        return toTimebackSuccess(response);
      },
      createWebhook: async (
        body: CreateWebhookBody,
        options: CreateWebhookOptions = {}
      ): Promise<TimebackSuccess<CaliperWebhook>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        const response = await client.caliper.createWebhook(body, options);
        return toTimebackSuccess(response);
      },
      updateWebhook: async (
        id: string,
        body: UpdateWebhookBody,
        options: UpdateWebhookOptions = {}
      ): Promise<TimebackSuccess<CaliperWebhook>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        const response = await client.caliper.updateWebhook(id, body, options);
        return toTimebackSuccess(response);
      },
      deleteWebhook: async (
        id: string,
        options: DeleteWebhookOptions = {}
      ): Promise<TimebackSuccess<void>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        await client.caliper.deleteWebhook(id, options);
        return toTimebackSuccess(undefined);
      },
      health: async (): Promise<TimebackSuccess<CaliperHealthResponse>> => {
        if (!client.caliper) {
          throw new Error("Caliper client is not configured");
        }
        const response = await client.caliper.getHealth();
        return toTimebackSuccess(response);
      },
    },
  };
}
