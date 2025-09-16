export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  internalServerError: 500,
} as const;

export type HttpStatusKey = keyof typeof HTTP_STATUS;
