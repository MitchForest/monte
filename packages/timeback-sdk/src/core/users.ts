import { z } from "zod";
import { TimebackHttpClient } from "../http";
import type { HttpMethod } from "../http";
import {
  getEndpoint as getUsersEndpoint,
  schemas as userSchemas,
} from "../generated/core.ts/Users";
import type {
  AssociateOneRosterInput,
  AssociateOneRosterOptions,
  AssociateOneRosterResponse,
  AuthRequestOptions,
  CreateUserInput,
  CreateUserResponse,
  DeleteUserOptions,
  DeleteUserResponse,
  GetUserOptions,
  GetUserResponse,
  ListUsersOptions,
  ListUsersResponse,
  TimebackUser,
  UpdateUserInput,
  UpdateUserResponse,
} from "./types";

function requireEndpoint(alias: string) {
  const endpoint = getUsersEndpoint(alias);
  if (!endpoint) {
    throw new Error(`Users endpoint "${alias}" is not available`);
  }
  return endpoint as {
    method: string;
    path: string;
    response: z.ZodTypeAny;
    parameters?: Array<{ type: string; name: string; schema: unknown }>;
  };
}

const listUsersEndpoint = requireEndpoint("getApiUsers");
const createUserEndpoint = requireEndpoint("postApiUsers");
const getUserEndpoint = requireEndpoint("getApiUsersById");
const updateUserEndpoint = requireEndpoint("putApiUsersById");
const deleteUserEndpoint = requireEndpoint("deleteApiUsersById");
const associateEndpoint = requireEndpoint(
  "postApiUsersByIdAssociate-oneroster"
);

const listUsersQuerySchema = z
  .object(
    Object.fromEntries(
      (listUsersEndpoint.parameters ?? [])
        .filter((parameter) => parameter.type === "Query")
        .map((parameter) => [parameter.name, parameter.schema as z.ZodTypeAny])
    )
  )
  .partial();

const userIdSchema = z.object({ id: z.string().uuid() });

const associateBodyParameter = (associateEndpoint.parameters ?? []).find(
  (parameter) => parameter.type === "Body"
);
const associateBodySchema = (associateBodyParameter?.schema as z.ZodTypeAny) ??
  z.object({ onerosterId: z.string().min(1) }).strict();

function toMethod(method: string): HttpMethod {
  return method.toUpperCase() as HttpMethod;
}

function applyPathParams(
  path: string,
  params: Record<string, string | number | boolean>
): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, (segment, key) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing value for path parameter "${key}"`);
    }
    return encodeURIComponent(String(value));
  });
}

export class UsersClient {
  private readonly http: TimebackHttpClient;

  constructor(http: TimebackHttpClient) {
    this.http = http;
  }

  list = async (
    options: ListUsersOptions = {}
  ): Promise<ListUsersResponse> => {
    const { accessToken, signal, page, pageSize } = options;
    const query = listUsersQuerySchema.parse({ page, pageSize });

    return this.http.request<ListUsersResponse>(listUsersEndpoint.path, {
      method: toMethod(listUsersEndpoint.method),
      query,
      schema: listUsersEndpoint.response as z.ZodType<ListUsersResponse>,
      accessToken,
      signal,
    });
  };

  create = async (
    input: CreateUserInput,
    options: AuthRequestOptions = {}
  ): Promise<CreateUserResponse> => {
    const body = userSchemas.postApiUsers_Body.parse(input);

    return this.http.request<CreateUserResponse>(createUserEndpoint.path, {
      method: toMethod(createUserEndpoint.method),
      body,
      schema: createUserEndpoint.response as z.ZodType<CreateUserResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  get = async (
    id: TimebackUser["id"],
    options: GetUserOptions = {}
  ): Promise<GetUserResponse> => {
    const { id: parsedId } = userIdSchema.parse({ id });
    const path = applyPathParams(getUserEndpoint.path, { id: parsedId });

    return this.http.request<GetUserResponse>(path, {
      method: toMethod(getUserEndpoint.method),
      schema: getUserEndpoint.response as z.ZodType<GetUserResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  update = async (
    id: TimebackUser["id"],
    input: UpdateUserInput,
    options: AuthRequestOptions = {}
  ): Promise<UpdateUserResponse> => {
    const { id: parsedId } = userIdSchema.parse({ id });
    const path = applyPathParams(updateUserEndpoint.path, { id: parsedId });
    const body = userSchemas.putApiUsersById_Body.parse(input);

    return this.http.request<UpdateUserResponse>(path, {
      method: toMethod(updateUserEndpoint.method),
      body,
      schema: updateUserEndpoint.response as z.ZodType<UpdateUserResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  delete = async (
    id: TimebackUser["id"],
    options: DeleteUserOptions = {}
  ): Promise<DeleteUserResponse> => {
    const { id: parsedId } = userIdSchema.parse({ id });
    const path = applyPathParams(deleteUserEndpoint.path, { id: parsedId });

    return this.http.request<DeleteUserResponse>(path, {
      method: toMethod(deleteUserEndpoint.method),
      schema: deleteUserEndpoint.response as z.ZodType<DeleteUserResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };

  associateWithOneRoster = async (
    id: TimebackUser["id"],
    input: AssociateOneRosterInput,
    options: AssociateOneRosterOptions = {}
  ): Promise<AssociateOneRosterResponse> => {
    const { id: parsedId } = userIdSchema.parse({ id });
    const path = applyPathParams(associateEndpoint.path, { id: parsedId });
    const body = associateBodySchema.parse(input);

    return this.http.request<AssociateOneRosterResponse>(path, {
      method: toMethod(associateEndpoint.method),
      body,
      schema: associateEndpoint.response as z.ZodType<AssociateOneRosterResponse>,
      accessToken: options.accessToken,
      signal: options.signal,
    });
  };
}
