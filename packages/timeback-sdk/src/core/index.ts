import { TimebackHttpClient } from "../http";
import { CoreAuthClient } from "./auth";
import { OneRosterClient } from "./oneroster";
import { UsersClient } from "./users";
import { SsoClient } from "./sso";
import { AuditClient } from "./audit";
import { HealthClient } from "./health";
import type { TimebackHttpClientOptions } from "../http";

export class CoreClient {
  readonly http: TimebackHttpClient;
  readonly namespace: string | null;
  readonly auth: CoreAuthClient;
  readonly oneroster: OneRosterClient;
  readonly users: UsersClient;
  readonly sso: SsoClient;
  readonly audit: AuditClient;
  readonly health: HealthClient;

  constructor(http: TimebackHttpClient, namespace?: string | null) {
    this.http = http;
    this.namespace = namespace ?? null;
    this.auth = new CoreAuthClient(this.http);
    this.oneroster = new OneRosterClient(this.http, this.namespace);
    this.users = new UsersClient(this.http);
    this.sso = new SsoClient(this.http);
    this.audit = new AuditClient(this.http);
    this.health = new HealthClient(this.http);
  }

  static fromOptions = (
    options: TimebackHttpClientOptions & { namespace?: string | null }
  ): CoreClient => {
    return new CoreClient(new TimebackHttpClient(options), options.namespace ?? null);
  };
}

export type {
  AssociateOneRosterInput,
  AssociateOneRosterOptions,
  AssociateOneRosterResponse,
  AuditStatsOptions,
  AuditStatsResponse,
  AcademicSession,
  AuthRequestOptions,
  CheckSsoResponse,
  CoreAuthInfoEnvelope,
  CoreAuthMeEnvelope,
  CoreHealthResponse,
  CoreLoginEnvelope,
  CoreLogoutEnvelope,
  Course,
  CreateUserInput,
  CreateUserResponse,
  CreateAcademicSessionInput,
  CreateClassInput,
  CreateCourseInput,
  CreateEnrollmentInput,
  CreateOrganizationInput,
  DeleteUserOptions,
  DeleteUserResponse,
  Enrollment,
  GetAcademicSessionResponse,
  GetSchoolOptions,
  GetSchoolResponse,
  GetClassResponse,
  GetCourseResponse,
  GetEnrollmentResponse,
  GetOrganizationResponse,
  GetUserOptions,
  GetUserResponse,
  ListAuditLogsOptions,
  ListAuditLogsResponse,
  ListAcademicSessionsOptions,
  ListAcademicSessionsResponse,
  ListSchoolsOptions,
  ListSchoolsResponse,
  ListSsoSessionsResponse,
  ListClassesOptions,
  ListClassesResponse,
  ListCoursesOptions,
  ListCoursesResponse,
  ListEnrollmentsOptions,
  ListEnrollmentsResponse,
  ListOrganizationsOptions,
  ListOrganizationsResponse,
  ListUsersOptions,
  ListUsersResponse,
  LoginRequestOptions,
  LoginWithPasswordInput,
  Organization,
  OneRosterSchool,
  RegisterSsoInput,
  RegisterSsoResponse,
  RevokeSsoResponse,
  SsoRequestOptions,
  TimebackUser,
  UpdateAcademicSessionInput,
  UpdateClassInput,
  UpdateCourseInput,
  UpdateEnrollmentInput,
  UpdateOrganizationInput,
  UpdateUserInput,
  UpdateUserResponse,
} from "./types";
export { OneRosterClient } from "./oneroster";
export { CoreAuthClient } from "./auth";
export { UsersClient } from "./users";
export { SsoClient } from "./sso";
export { AuditClient } from "./audit";
export { HealthClient } from "./health";
