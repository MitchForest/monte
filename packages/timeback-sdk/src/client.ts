import { CoreClient } from "./core";
import { CaliperClient } from "./caliper";
import { TimebackHttpClient } from "./http";
import type { FetchLike, TimebackHttpClientOptions } from "./http";

export type ServiceOptions = Omit<TimebackHttpClientOptions, "fetch"> & {
  baseUrl: string;
};

export type CoreServiceOptions = ServiceOptions & {
  namespace?: string | null;
};

export type TimebackClientOptions = {
  core: CoreServiceOptions;
  caliper?: ServiceOptions;
  fetch?: FetchLike;
};

export class TimebackClient {
  readonly core: CoreClient;
  readonly caliper?: CaliperClient;

  constructor(options: TimebackClientOptions) {
    const sharedFetch = options.fetch;

    const { namespace, ...coreOptions } = options.core;
    const coreHttp = new TimebackHttpClient({
      ...coreOptions,
      fetch: sharedFetch ?? undefined,
    });
    this.core = new CoreClient(coreHttp, namespace ?? null);

    if (options.caliper) {
      const caliperHttp = new TimebackHttpClient({
        ...options.caliper,
        fetch: sharedFetch ?? undefined,
      });
      this.caliper = new CaliperClient(caliperHttp);
    }
  }

  setCoreAccessToken = (token: string | null): void => {
    this.core.http.setAccessToken(token);
  };

  setCaliperAccessToken = (token: string | null): void => {
    if (!this.caliper) {
      return;
    }
    this.caliper.http.setAccessToken(token);
  };
}

export { CoreClient } from "./core";
export { CaliperClient } from "./caliper";
