/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as core_auth_adapter from "../core/auth/adapter.js";
import type * as core_auth_client from "../core/auth/client.js";
import type * as core_auth_component from "../core/auth/component.js";
import type * as core_auth_hooks from "../core/auth/hooks.js";
import type * as core_auth_services from "../core/auth/services.js";
import type * as core_auth_static from "../core/auth/static.js";
import type * as core_generated_betterAuth__generated_api from "../core/generated/betterAuth/_generated/api.js";
import type * as core_generated_betterAuth__generated_server from "../core/generated/betterAuth/_generated/server.js";
import type * as domains_curriculum_index from "../domains/curriculum/index.js";
import type * as modules_curriculum_index from "../modules/curriculum/index.js";
import type * as routes_http from "../routes/http.js";
import type * as schema_tables from "../schema/tables.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "core/auth/adapter": typeof core_auth_adapter;
  "core/auth/client": typeof core_auth_client;
  "core/auth/component": typeof core_auth_component;
  "core/auth/hooks": typeof core_auth_hooks;
  "core/auth/services": typeof core_auth_services;
  "core/auth/static": typeof core_auth_static;
  "core/generated/betterAuth/_generated/api": typeof core_generated_betterAuth__generated_api;
  "core/generated/betterAuth/_generated/server": typeof core_generated_betterAuth__generated_server;
  "domains/curriculum/index": typeof domains_curriculum_index;
  "modules/curriculum/index": typeof modules_curriculum_index;
  "routes/http": typeof routes_http;
  "schema/tables": typeof schema_tables;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
