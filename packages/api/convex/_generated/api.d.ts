/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as betterAuth__generated_api from "../betterAuth/_generated/api.js";
import type * as betterAuth__generated_server from "../betterAuth/_generated/server.js";
import type * as core_auth_adapter from "../core/auth/adapter.js";
import type * as core_auth_client from "../core/auth/client.js";
import type * as core_auth_component from "../core/auth/component.js";
import type * as core_auth_hooks from "../core/auth/hooks.js";
import type * as core_auth_services from "../core/auth/services.js";
import type * as core_auth_static from "../core/auth/static.js";
import type * as core_config__generated_api from "../core/config/_generated/api.js";
import type * as core_config__generated_server from "../core/config/_generated/server.js";
import type * as core_generated_betterAuth__generated_api from "../core/generated/betterAuth/_generated/api.js";
import type * as core_generated_betterAuth__generated_server from "../core/generated/betterAuth/_generated/server.js";
import type * as core_generated_convex_api from "../core/generated/convex/api.js";
import type * as core_generated_convex_server from "../core/generated/convex/server.js";
import type * as curriculum from "../curriculum.js";
import type * as domains_curriculum_index from "../domains/curriculum/index.js";
import type * as domains_curriculum_mutations from "../domains/curriculum/mutations.js";
import type * as domains_curriculum_queries from "../domains/curriculum/queries.js";
import type * as domains_curriculum_services from "../domains/curriculum/services.js";
import type * as http from "../http.js";
import type * as index from "../index.js";
import type * as routes_http from "../routes/http.js";
import type * as schema_index from "../schema/index.js";
import type * as schema_tables from "../schema/tables.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "betterAuth/_generated/api": typeof betterAuth__generated_api;
  "betterAuth/_generated/server": typeof betterAuth__generated_server;
  "core/auth/adapter": typeof core_auth_adapter;
  "core/auth/client": typeof core_auth_client;
  "core/auth/component": typeof core_auth_component;
  "core/auth/hooks": typeof core_auth_hooks;
  "core/auth/services": typeof core_auth_services;
  "core/auth/static": typeof core_auth_static;
  "core/config/_generated/api": typeof core_config__generated_api;
  "core/config/_generated/server": typeof core_config__generated_server;
  "core/generated/betterAuth/_generated/api": typeof core_generated_betterAuth__generated_api;
  "core/generated/betterAuth/_generated/server": typeof core_generated_betterAuth__generated_server;
  "core/generated/convex/api": typeof core_generated_convex_api;
  "core/generated/convex/server": typeof core_generated_convex_server;
  curriculum: typeof curriculum;
  "domains/curriculum/index": typeof domains_curriculum_index;
  "domains/curriculum/mutations": typeof domains_curriculum_mutations;
  "domains/curriculum/queries": typeof domains_curriculum_queries;
  "domains/curriculum/services": typeof domains_curriculum_services;
  http: typeof http;
  index: typeof index;
  "routes/http": typeof routes_http;
  "schema/index": typeof schema_index;
  "schema/tables": typeof schema_tables;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: {};
};
