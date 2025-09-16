import { z, type ZodObject, type ZodTypeAny } from "zod";
import { TimebackHttpClient } from "../http";
import type { HttpMethod, QueryRecord } from "../http";
import {
  getEndpoint as getOneRosterEndpoint,
  schemas as oneRosterSchemas,
} from "../generated/core.ts/OneRoster_v1_2___Rostering";
import type {
  AuthRequestOptions,
  AcademicSession,
  CreateAcademicSessionInput,
  CreateClassInput,
  CreateCourseInput,
  CreateEnrollmentInput,
  CreateOrganizationInput,
  GetAcademicSessionResponse,
  GetClassResponse,
  GetCourseResponse,
  GetEnrollmentResponse,
  GetOrganizationResponse,
  GetSchoolOptions,
  GetSchoolResponse,
  ListAcademicSessionsOptions,
  ListAcademicSessionsResponse,
  ListClassesOptions,
  ListClassesResponse,
  ListCoursesOptions,
  ListCoursesResponse,
  ListEnrollmentsOptions,
  ListEnrollmentsResponse,
  ListOrganizationsOptions,
  ListOrganizationsResponse,
  ListSchoolsOptions,
  ListSchoolsResponse,
  OneRosterSchool,
  Organization,
  Course,
  Class,
  Enrollment,
  OneRosterListOptions,
  UpdateAcademicSessionInput,
  UpdateClassInput,
  UpdateCourseInput,
  UpdateEnrollmentInput,
  UpdateOrganizationInput,
} from "./types";

function requireEndpoint(alias: string) {
  const endpoint = getOneRosterEndpoint(alias);
  if (!endpoint) {
    throw new Error(`OneRoster endpoint "${alias}" is not available`);
  }
  return endpoint as {
    method: string;
    path: string;
    response: z.ZodTypeAny;
    parameters?: Array<{ type: "Query" | "Path"; name: string; schema: unknown }>;
  };
}

const listOrganizationsEndpoint = requireEndpoint(
  "getImsOnerosterRosteringV1p2Orgs"
);
const createOrganizationEndpoint = requireEndpoint(
  "postImsOnerosterRosteringV1p2Orgs"
);
const getOrganizationEndpoint = requireEndpoint(
  "getImsOnerosterRosteringV1p2OrgsById"
);
const updateOrganizationEndpoint = requireEndpoint(
  "putImsOnerosterRosteringV1p2OrgsById"
);
const deleteOrganizationEndpoint = requireEndpoint(
  "deleteImsOnerosterRosteringV1p2OrgsById"
);

const listSchoolsEndpoint = requireEndpoint("getImsOnerosterRosteringV1p2Schools");
const getSchoolEndpoint = requireEndpoint("getImsOnerosterRosteringV1p2SchoolsById");

const listAcademicSessionsEndpoint = requireEndpoint(
  "getImsOnerosterRosteringV1p2AcademicSessions"
);
const createAcademicSessionEndpoint = requireEndpoint(
  "postImsOnerosterRosteringV1p2AcademicSessions"
);
const getAcademicSessionEndpoint = requireEndpoint(
  "getImsOnerosterRosteringV1p2AcademicSessionsById"
);
const updateAcademicSessionEndpoint = requireEndpoint(
  "putImsOnerosterRosteringV1p2AcademicSessionsById"
);
const deleteAcademicSessionEndpoint = requireEndpoint(
  "deleteImsOnerosterRosteringV1p2AcademicSessionsById"
);

const listCoursesEndpoint = requireEndpoint("getImsOnerosterRosteringV1p2Courses");
const createCourseEndpoint = requireEndpoint("postImsOnerosterRosteringV1p2Courses");
const getCourseEndpoint = requireEndpoint("getImsOnerosterRosteringV1p2CoursesById");
const updateCourseEndpoint = requireEndpoint("putImsOnerosterRosteringV1p2CoursesById");
const deleteCourseEndpoint = requireEndpoint("deleteImsOnerosterRosteringV1p2CoursesById");

const listClassesEndpoint = requireEndpoint("getImsOnerosterRosteringV1p2Classes");
const createClassEndpoint = requireEndpoint("postImsOnerosterRosteringV1p2Classes");
const getClassEndpoint = requireEndpoint("getImsOnerosterRosteringV1p2ClassesById");
const updateClassEndpoint = requireEndpoint("putImsOnerosterRosteringV1p2ClassesById");
const deleteClassEndpoint = requireEndpoint("deleteImsOnerosterRosteringV1p2ClassesById");

const listEnrollmentsEndpoint = requireEndpoint(
  "getImsOnerosterRosteringV1p2Enrollments"
);
const createEnrollmentEndpoint = requireEndpoint(
  "postImsOnerosterRosteringV1p2Enrollments"
);
const getEnrollmentEndpoint = requireEndpoint(
  "getImsOnerosterRosteringV1p2EnrollmentsById"
);
const updateEnrollmentEndpoint = requireEndpoint(
  "putImsOnerosterRosteringV1p2EnrollmentsById"
);
const deleteEnrollmentEndpoint = requireEndpoint(
  "deleteImsOnerosterRosteringV1p2EnrollmentsById"
);

function toMethod(method: string): HttpMethod {
  return method.toUpperCase() as HttpMethod;
}

type QuerySchemaInfo = {
  schema: ZodObject<Record<string, ZodTypeAny>, "strip", ZodTypeAny, Record<string, unknown>, Record<string, unknown>>;
  keys: string[];
};

type PathSchemaInfo = {
  schema: ZodObject<Record<string, ZodTypeAny>, "strip", ZodTypeAny, Record<string, unknown>, Record<string, unknown>>;
  keys: string[];
};

export class OneRosterClient {
  private readonly http: TimebackHttpClient;
  private readonly namespace: string | null;

  private readonly schoolQueries: QuerySchemaInfo;
  private readonly schoolPath: PathSchemaInfo;

  private readonly orgQueries: QuerySchemaInfo;
  private readonly orgPath: PathSchemaInfo;

  private readonly sessionQueries: QuerySchemaInfo;
  private readonly sessionPath: PathSchemaInfo;

  private readonly courseQueries: QuerySchemaInfo;
  private readonly coursePath: PathSchemaInfo;

  private readonly classQueries: QuerySchemaInfo;
  private readonly classPath: PathSchemaInfo;

  private readonly enrollmentQueries: QuerySchemaInfo;
  private readonly enrollmentPath: PathSchemaInfo;

  constructor(http: TimebackHttpClient, namespace?: string | null) {
    this.http = http;
    this.namespace = namespace ?? null;

    this.schoolQueries = this.buildQuerySchema(listSchoolsEndpoint);
    this.schoolPath = this.buildPathSchema(getSchoolEndpoint);

    this.orgQueries = this.buildQuerySchema(listOrganizationsEndpoint);
    this.orgPath = this.buildPathSchema(getOrganizationEndpoint);

    this.sessionQueries = this.buildQuerySchema(listAcademicSessionsEndpoint);
    this.sessionPath = this.buildPathSchema(getAcademicSessionEndpoint);

    this.courseQueries = this.buildQuerySchema(listCoursesEndpoint);
    this.coursePath = this.buildPathSchema(getCourseEndpoint);

    this.classQueries = this.buildQuerySchema(listClassesEndpoint);
    this.classPath = this.buildPathSchema(getClassEndpoint);

    this.enrollmentQueries = this.buildQuerySchema(listEnrollmentsEndpoint);
    this.enrollmentPath = this.buildPathSchema(getEnrollmentEndpoint);
  }

  listSchools = async (
    options: ListSchoolsOptions = {}
  ): Promise<ListSchoolsResponse> => {
    const { accessToken, signal, ...queryOptions } = options;
    const query = this.parseQuery(this.schoolQueries, queryOptions);

    const response = await this.http.request<ListSchoolsResponse>(
      listSchoolsEndpoint.path,
      {
        method: toMethod(listSchoolsEndpoint.method),
        query,
        schema: listSchoolsEndpoint.response as z.ZodType<ListSchoolsResponse>,
        accessToken,
        signal,
      }
    );

    if (!this.namespace) {
      return response;
    }

    const filteredSchools = response.schools.filter((school: OneRosterSchool) =>
      this.belongsToNamespace(school.metadata)
    );

    return {
      ...response,
      schools: filteredSchools,
    };
  };

  getSchool = async (
    id: string,
    options: GetSchoolOptions = {}
  ): Promise<GetSchoolResponse> => {
    const { accessToken, signal } = options;
    const parsedParams = this.parsePath(this.schoolPath, { id });
    const path = this.interpolatePath(getSchoolEndpoint.path, parsedParams);

    const response = await this.http.request<GetSchoolResponse>(path, {
      method: toMethod(getSchoolEndpoint.method),
      schema: getSchoolEndpoint.response as z.ZodType<GetSchoolResponse>,
      accessToken,
      signal,
    });

    if (this.namespace) {
      this.assertNamespace(response.school.metadata, "school", parsedParams.id);
    }

    return response;
  };

  listOrganizations = async (
    options: ListOrganizationsOptions = {}
  ): Promise<ListOrganizationsResponse> => {
    const { accessToken, signal, ...queryOptions } = options;
    const query = this.parseQuery(this.orgQueries, queryOptions);

    const response = await this.http.request<ListOrganizationsResponse>(
      listOrganizationsEndpoint.path,
      {
        method: toMethod(listOrganizationsEndpoint.method),
        query,
        schema: listOrganizationsEndpoint.response as z.ZodType<ListOrganizationsResponse>,
        accessToken,
        signal,
      }
    );

    if (!this.namespace) {
      return response;
    }

    const filteredOrgs = response.orgs.filter((org: Organization) =>
      this.belongsToNamespace(org.metadata)
    );

    return {
      ...response,
      orgs: filteredOrgs,
    };
  };

  createOrganization = async (
    input: CreateOrganizationInput,
    options: AuthRequestOptions = {}
  ) => {
    const body = this.withNamespaceMetadata(
      oneRosterSchemas.postImsOnerosterRosteringV1p2Orgs_Body.parse(input)
    );

    return this.http.request<z.infer<typeof createOrganizationEndpoint.response>>(
      createOrganizationEndpoint.path,
      {
        method: toMethod(createOrganizationEndpoint.method),
        body,
        schema: createOrganizationEndpoint.response as z.ZodType<
          z.infer<typeof createOrganizationEndpoint.response>
        >,
        accessToken: options.accessToken,
        signal: options.signal,
      }
    );
  };

  getOrganization = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<GetOrganizationResponse> => {
    const parsedParams = this.parsePath(this.orgPath, { id });
    const path = this.interpolatePath(getOrganizationEndpoint.path, parsedParams);

    const response = await this.http.request<GetOrganizationResponse>(path, {
      method: toMethod(getOrganizationEndpoint.method),
      schema: getOrganizationEndpoint.response as z.ZodType<GetOrganizationResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });

    if (this.namespace) {
      this.assertNamespace(response.org.metadata, "organization", parsedParams.id);
    }

    return response;
  };

  updateOrganization = async (
    id: string,
    input: UpdateOrganizationInput,
    options: AuthRequestOptions = {}
  ) => {
    const existing = await this.getOrganization(id, options);
    const parsedParams = this.parsePath(this.orgPath, { id });
    const path = this.interpolatePath(updateOrganizationEndpoint.path, parsedParams);

    const body = this.withNamespaceMetadata(
      oneRosterSchemas.putImsOnerosterRosteringV1p2OrgsById_Body.parse(input),
      existing.org
    );

    return this.http.request<z.infer<typeof updateOrganizationEndpoint.response>>(path, {
      method: toMethod(updateOrganizationEndpoint.method),
      body,
      schema: updateOrganizationEndpoint.response as z.ZodType<
        z.infer<typeof updateOrganizationEndpoint.response>
      >,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  deleteOrganization = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<void> => {
    const existing = await this.getOrganization(id, options);
    const parsedParams = this.parsePath(this.orgPath, { id });
    this.assertNamespace(existing.org.metadata, "organization", parsedParams.id);

    const path = this.interpolatePath(deleteOrganizationEndpoint.path, parsedParams);
    await this.http.request<void>(path, {
      method: toMethod(deleteOrganizationEndpoint.method),
      schema: deleteOrganizationEndpoint.response as z.ZodType<void>,
      accessToken: options.accessToken,
      signal: options.signal,
      expect: "void",
    });
  };

  listAcademicSessions = async (
    options: ListAcademicSessionsOptions = {}
  ): Promise<ListAcademicSessionsResponse> => {
    const { accessToken, signal, ...queryOptions } = options;
    const query = this.parseQuery(this.sessionQueries, queryOptions);

    const response = await this.http.request<ListAcademicSessionsResponse>(
      listAcademicSessionsEndpoint.path,
      {
        method: toMethod(listAcademicSessionsEndpoint.method),
        query,
        schema: listAcademicSessionsEndpoint.response as z.ZodType<ListAcademicSessionsResponse>,
        accessToken,
        signal,
      }
    );

    if (!this.namespace) {
      return response;
    }

    const filteredSessions = response.academicSessions.filter(
      (session: AcademicSession) => this.belongsToNamespace(session.metadata)
    );

    return {
      ...response,
      academicSessions: filteredSessions,
    };
  };

  createAcademicSession = async (
    input: CreateAcademicSessionInput,
    options: AuthRequestOptions = {}
  ) => {
    const body = this.withNamespaceMetadata(
      oneRosterSchemas.postImsOnerosterRosteringV1p2AcademicSessions_Body.parse(input)
    );

    return this.http.request<z.infer<typeof createAcademicSessionEndpoint.response>>(
      createAcademicSessionEndpoint.path,
      {
        method: toMethod(createAcademicSessionEndpoint.method),
        body,
        schema: createAcademicSessionEndpoint.response as z.ZodType<
          z.infer<typeof createAcademicSessionEndpoint.response>
        >,
        accessToken: options.accessToken,
        signal: options.signal,
      }
    );
  };

  getAcademicSession = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<GetAcademicSessionResponse> => {
    const parsedParams = this.parsePath(this.sessionPath, { id });
    const path = this.interpolatePath(getAcademicSessionEndpoint.path, parsedParams);

    const response = await this.http.request<GetAcademicSessionResponse>(path, {
      method: toMethod(getAcademicSessionEndpoint.method),
      schema: getAcademicSessionEndpoint.response as z.ZodType<GetAcademicSessionResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });

    if (this.namespace) {
      this.assertNamespace(
        response.academicSession.metadata,
        "academic session",
        parsedParams.id
      );
    }

    return response;
  };

  updateAcademicSession = async (
    id: string,
    input: UpdateAcademicSessionInput,
    options: AuthRequestOptions = {}
  ) => {
    const existing = await this.getAcademicSession(id, options);
    const parsedParams = this.parsePath(this.sessionPath, { id });
    const path = this.interpolatePath(updateAcademicSessionEndpoint.path, parsedParams);

    const body = this.withNamespaceMetadata(
      oneRosterSchemas.putImsOnerosterRosteringV1p2AcademicSessionsById_Body.parse(
        input
      ),
      existing.academicSession
    );

    return this.http.request<z.infer<typeof updateAcademicSessionEndpoint.response>>(
      path,
      {
        method: toMethod(updateAcademicSessionEndpoint.method),
        body,
        schema: updateAcademicSessionEndpoint.response as z.ZodType<
          z.infer<typeof updateAcademicSessionEndpoint.response>
        >,
        accessToken: options.accessToken,
        signal: options.signal,
      }
    );
  };

  deleteAcademicSession = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<void> => {
    const existing = await this.getAcademicSession(id, options);
    const parsedParams = this.parsePath(this.sessionPath, { id });
    this.assertNamespace(
      existing.academicSession.metadata,
      "academic session",
      parsedParams.id
    );

    const path = this.interpolatePath(deleteAcademicSessionEndpoint.path, parsedParams);
    await this.http.request<void>(path, {
      method: toMethod(deleteAcademicSessionEndpoint.method),
      schema: deleteAcademicSessionEndpoint.response as z.ZodType<void>,
      accessToken: options.accessToken,
      signal: options.signal,
      expect: "void",
    });
  };

  listCourses = async (
    options: ListCoursesOptions = {}
  ): Promise<ListCoursesResponse> => {
    const { accessToken, signal, ...queryOptions } = options;
    const query = this.parseQuery(this.courseQueries, queryOptions);

    const response = await this.http.request<ListCoursesResponse>(
      listCoursesEndpoint.path,
      {
        method: toMethod(listCoursesEndpoint.method),
        query,
        schema: listCoursesEndpoint.response as z.ZodType<ListCoursesResponse>,
        accessToken,
        signal,
      }
    );

    if (!this.namespace) {
      return response;
    }

    const filteredCourses = response.courses.filter((course: Course) =>
      this.belongsToNamespace(course.metadata)
    );

    return {
      ...response,
      courses: filteredCourses,
    };
  };

  createCourse = async (
    input: CreateCourseInput,
    options: AuthRequestOptions = {}
  ) => {
    const body = this.withNamespaceMetadata(
      oneRosterSchemas.postImsOnerosterRosteringV1p2Courses_Body.parse(input)
    );

    return this.http.request<z.infer<typeof createCourseEndpoint.response>>(
      createCourseEndpoint.path,
      {
        method: toMethod(createCourseEndpoint.method),
        body,
        schema: createCourseEndpoint.response as z.ZodType<
          z.infer<typeof createCourseEndpoint.response>
        >,
        accessToken: options.accessToken,
        signal: options.signal,
      }
    );
  };

  getCourse = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<GetCourseResponse> => {
    const parsedParams = this.parsePath(this.coursePath, { id });
    const path = this.interpolatePath(getCourseEndpoint.path, parsedParams);

    const response = await this.http.request<GetCourseResponse>(path, {
      method: toMethod(getCourseEndpoint.method),
      schema: getCourseEndpoint.response as z.ZodType<GetCourseResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });

    if (this.namespace) {
      this.assertNamespace(response.course.metadata, "course", parsedParams.id);
    }

    return response;
  };

  updateCourse = async (
    id: string,
    input: UpdateCourseInput,
    options: AuthRequestOptions = {}
  ) => {
    const existing = await this.getCourse(id, options);
    const parsedParams = this.parsePath(this.coursePath, { id });
    const path = this.interpolatePath(updateCourseEndpoint.path, parsedParams);

    const body = this.withNamespaceMetadata(
      oneRosterSchemas.putImsOnerosterRosteringV1p2CoursesById_Body.parse(input),
      existing.course
    );

    return this.http.request<z.infer<typeof updateCourseEndpoint.response>>(path, {
      method: toMethod(updateCourseEndpoint.method),
      body,
      schema: updateCourseEndpoint.response as z.ZodType<
        z.infer<typeof updateCourseEndpoint.response>
      >,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  deleteCourse = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<void> => {
    const existing = await this.getCourse(id, options);
    const parsedParams = this.parsePath(this.coursePath, { id });
    this.assertNamespace(existing.course.metadata, "course", parsedParams.id);

    const path = this.interpolatePath(deleteCourseEndpoint.path, parsedParams);
    await this.http.request<void>(path, {
      method: toMethod(deleteCourseEndpoint.method),
      schema: deleteCourseEndpoint.response as z.ZodType<void>,
      accessToken: options.accessToken,
      signal: options.signal,
      expect: "void",
    });
  };

  listClasses = async (
    options: ListClassesOptions = {}
  ): Promise<ListClassesResponse> => {
    const { accessToken, signal, ...queryOptions } = options;
    const query = this.parseQuery(this.classQueries, queryOptions);

    const response = await this.http.request<ListClassesResponse>(
      listClassesEndpoint.path,
      {
        method: toMethod(listClassesEndpoint.method),
        query,
        schema: listClassesEndpoint.response as z.ZodType<ListClassesResponse>,
        accessToken,
        signal,
      }
    );

    if (!this.namespace) {
      return response;
    }

    const filteredClasses = response.classes.filter((cls: Class) =>
      this.belongsToNamespace(cls.metadata)
    );

    return {
      ...response,
      classes: filteredClasses,
    };
  };

  createClass = async (
    input: CreateClassInput,
    options: AuthRequestOptions = {}
  ) => {
    const body = this.withNamespaceMetadata(
      oneRosterSchemas.postImsOnerosterRosteringV1p2Classes_Body.parse(input)
    );

    return this.http.request<z.infer<typeof createClassEndpoint.response>>(
      createClassEndpoint.path,
      {
        method: toMethod(createClassEndpoint.method),
        body,
        schema: createClassEndpoint.response as z.ZodType<
          z.infer<typeof createClassEndpoint.response>
        >,
        accessToken: options.accessToken,
        signal: options.signal,
      }
    );
  };

  getClass = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<GetClassResponse> => {
    const parsedParams = this.parsePath(this.classPath, { id });
    const path = this.interpolatePath(getClassEndpoint.path, parsedParams);

    const response = await this.http.request<GetClassResponse>(path, {
      method: toMethod(getClassEndpoint.method),
      schema: getClassEndpoint.response as z.ZodType<GetClassResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });

    if (this.namespace) {
      this.assertNamespace(response.class.metadata, "class", parsedParams.id);
    }

    return response;
  };

  updateClass = async (
    id: string,
    input: UpdateClassInput,
    options: AuthRequestOptions = {}
  ) => {
    const existing = await this.getClass(id, options);
    const parsedParams = this.parsePath(this.classPath, { id });
    const path = this.interpolatePath(updateClassEndpoint.path, parsedParams);

    const body = this.withNamespaceMetadata(
      oneRosterSchemas.putImsOnerosterRosteringV1p2ClassesById_Body.parse(input),
      existing.class
    );

    return this.http.request<z.infer<typeof updateClassEndpoint.response>>(path, {
      method: toMethod(updateClassEndpoint.method),
      body,
      schema: updateClassEndpoint.response as z.ZodType<
        z.infer<typeof updateClassEndpoint.response>
      >,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  deleteClass = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<void> => {
    const existing = await this.getClass(id, options);
    const parsedParams = this.parsePath(this.classPath, { id });
    this.assertNamespace(existing.class.metadata, "class", parsedParams.id);

    const path = this.interpolatePath(deleteClassEndpoint.path, parsedParams);
    await this.http.request<void>(path, {
      method: toMethod(deleteClassEndpoint.method),
      schema: deleteClassEndpoint.response as z.ZodType<void>,
      accessToken: options.accessToken,
      signal: options.signal,
      expect: "void",
    });
  };

  listEnrollments = async (
    options: ListEnrollmentsOptions = {}
  ): Promise<ListEnrollmentsResponse> => {
    const { accessToken, signal, ...queryOptions } = options;
    const query = this.parseQuery(this.enrollmentQueries, queryOptions);

    const response = await this.http.request<ListEnrollmentsResponse>(
      listEnrollmentsEndpoint.path,
      {
        method: toMethod(listEnrollmentsEndpoint.method),
        query,
        schema: listEnrollmentsEndpoint.response as z.ZodType<ListEnrollmentsResponse>,
        accessToken,
        signal,
      }
    );

    if (!this.namespace) {
      return response;
    }

    const filteredEnrollments = response.enrollments.filter(
      (enrollment: Enrollment) => this.belongsToNamespace(enrollment.metadata)
    );

    return {
      ...response,
      enrollments: filteredEnrollments,
    };
  };

  createEnrollment = async (
    input: CreateEnrollmentInput,
    options: AuthRequestOptions = {}
  ) => {
    const body = this.withNamespaceMetadata(
      oneRosterSchemas.postImsOnerosterRosteringV1p2Enrollments_Body.parse(input)
    );

    return this.http.request<z.infer<typeof createEnrollmentEndpoint.response>>(
      createEnrollmentEndpoint.path,
      {
        method: toMethod(createEnrollmentEndpoint.method),
        body,
        schema: createEnrollmentEndpoint.response as z.ZodType<
          z.infer<typeof createEnrollmentEndpoint.response>
        >,
        accessToken: options.accessToken,
        signal: options.signal,
      }
    );
  };

  getEnrollment = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<GetEnrollmentResponse> => {
    const parsedParams = this.parsePath(this.enrollmentPath, { id });
    const path = this.interpolatePath(getEnrollmentEndpoint.path, parsedParams);

    const response = await this.http.request<GetEnrollmentResponse>(path, {
      method: toMethod(getEnrollmentEndpoint.method),
      schema: getEnrollmentEndpoint.response as z.ZodType<GetEnrollmentResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });

    if (this.namespace) {
      this.assertNamespace(
        response.enrollment.metadata,
        "enrollment",
        parsedParams.id
      );
    }

    return response;
  };

  updateEnrollment = async (
    id: string,
    input: UpdateEnrollmentInput,
    options: AuthRequestOptions = {}
  ) => {
    const existing = await this.getEnrollment(id, options);
    const parsedParams = this.parsePath(this.enrollmentPath, { id });
    const path = this.interpolatePath(updateEnrollmentEndpoint.path, parsedParams);

    const body = this.withNamespaceMetadata(
      oneRosterSchemas.putImsOnerosterRosteringV1p2EnrollmentsById_Body.parse(input),
      existing.enrollment
    );

    return this.http.request<z.infer<typeof updateEnrollmentEndpoint.response>>(
      path,
      {
        method: toMethod(updateEnrollmentEndpoint.method),
        body,
        schema: updateEnrollmentEndpoint.response as z.ZodType<
          z.infer<typeof updateEnrollmentEndpoint.response>
        >,
        accessToken: options.accessToken,
        signal: options.signal,
      }
    );
  };

  deleteEnrollment = async (
    id: string,
    options: AuthRequestOptions = {}
  ): Promise<void> => {
    const existing = await this.getEnrollment(id, options);
    const parsedParams = this.parsePath(this.enrollmentPath, { id });
    this.assertNamespace(
      existing.enrollment.metadata,
      "enrollment",
      parsedParams.id
    );

    const path = this.interpolatePath(deleteEnrollmentEndpoint.path, parsedParams);
    await this.http.request<void>(path, {
      method: toMethod(deleteEnrollmentEndpoint.method),
      schema: deleteEnrollmentEndpoint.response as z.ZodType<void>,
      accessToken: options.accessToken,
      signal: options.signal,
      expect: "void",
    });
  };

  private buildQuerySchema(endpoint: {
    parameters?: Array<{ type: "Query" | "Path"; name: string; schema: unknown }>;
  }): QuerySchemaInfo {
    const shape: Record<string, ZodTypeAny> = {};
    const keys: string[] = [];
    for (const parameter of endpoint.parameters ?? []) {
      if (parameter.type === "Query") {
        shape[parameter.name] = parameter.schema as ZodTypeAny;
        keys.push(parameter.name);
      }
    }
    return {
      schema: z.object(shape).partial(),
      keys,
    };
  }

  private buildPathSchema(endpoint: {
    parameters?: Array<{ type: "Query" | "Path"; name: string; schema: unknown }>;
  }): PathSchemaInfo {
    const shape: Record<string, ZodTypeAny> = {};
    const keys: string[] = [];
    for (const parameter of endpoint.parameters ?? []) {
      if (parameter.type === "Path") {
        shape[parameter.name] = parameter.schema as ZodTypeAny;
        keys.push(parameter.name);
      }
    }
    return {
      schema: z.object(shape),
      keys,
    };
  }

  private parseQuery(
    info: QuerySchemaInfo,
    options: Record<string, unknown>
  ): QueryRecord {
    const payload: Record<string, unknown> = {};
    for (const key of info.keys) {
      const value = options[key];
      if (value !== undefined) {
        payload[key] = value;
      }
    }
    return info.schema.parse(payload) as QueryRecord;
  }

  private parsePath(
    info: PathSchemaInfo,
    options: Record<string, unknown>
  ): Record<string, string> {
    if (info.keys.length === 0) {
      return {} as Record<string, string>;
    }
    const parsed = info.schema.parse(options);
    const normalized: Record<string, string> = {};
    for (const key of info.keys) {
      const value = parsed[key];
      normalized[key] = String(value);
    }
    return normalized;
  }

  private interpolatePath(
    template: string,
    params: Record<string, string>
  ): string {
    return template.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
      const value = params[key];
      if (value === undefined) {
        throw new Error(`Missing value for path parameter "${key}"`);
      }
      return encodeURIComponent(value);
    });
  }

  private withNamespaceMetadata<T extends { metadata?: Record<string, unknown> | null }>(
    payload: T,
    existing?: { metadata?: Record<string, unknown> | null }
  ): T {
    if (!this.namespace) {
      return payload;
    }
    const merged = {
      ...(existing?.metadata ?? {}),
      ...(payload.metadata ?? {}),
      monteNamespace: this.namespace,
    };
    return {
      ...payload,
      metadata: merged,
    };
  }

  private belongsToNamespace(metadata: unknown): boolean {
    if (!this.namespace) {
      return true;
    }
    if (!metadata || typeof metadata !== "object") {
      return false;
    }
    const value = (metadata as Record<string, unknown>).monteNamespace;
    return value === this.namespace;
  }

  private assertNamespace(metadata: unknown, resource: string, id: string): void {
    if (!this.namespace) {
      return;
    }
    if (!this.belongsToNamespace(metadata)) {
      throw new Error(
        `Cannot operate on ${resource} ${id} because it does not belong to namespace "${this.namespace}"`
      );
    }
  }
}
