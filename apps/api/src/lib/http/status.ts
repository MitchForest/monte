export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  badGateway: 502,
  serviceUnavailable: 503,
  internalServerError: 500,
} as const;

export type HttpStatusKey = keyof typeof HTTP_STATUS;
