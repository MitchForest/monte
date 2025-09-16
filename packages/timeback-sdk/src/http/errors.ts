import type { TimebackRequestContext } from "./types";

export type TimebackErrorOptions = {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
  request: TimebackRequestContext;
};

export class TimebackError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly request: TimebackRequestContext;

  constructor(options: TimebackErrorOptions) {
    super(options.message);
    this.name = "TimebackError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.request = options.request;
  }
}
