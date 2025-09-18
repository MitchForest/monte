import type {
  RouteConfig,
  RouteConfigToTypedResponse,
} from "@hono/zod-openapi";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { JSONValue } from "hono/utils/types";

export function respond<R extends RouteConfig>(
  _route: R,
  c: Context,
  data: JSONValue,
): RouteConfigToTypedResponse<R>;

export function respond<R extends RouteConfig>(
  _route: R,
  c: Context,
  data: JSONValue,
  status: ContentfulStatusCode,
): RouteConfigToTypedResponse<R>;

export function respond<R extends RouteConfig>(
  _route: R,
  c: Context,
  data: JSONValue,
  status?: ContentfulStatusCode,
): RouteConfigToTypedResponse<R> {
  const json = c.json as unknown as (
    body: JSONValue,
    code?: ContentfulStatusCode,
  ) => Response;

  const response =
    status === undefined ? json.call(c, data) : json.call(c, data, status);

  return response as unknown as RouteConfigToTypedResponse<R>;
}

export function respondNoContent<R extends RouteConfig>(
  _route: R,
  c: Context,
): RouteConfigToTypedResponse<R> {
  const response = c.body(null, 204);
  return response as unknown as RouteConfigToTypedResponse<R>;
}
