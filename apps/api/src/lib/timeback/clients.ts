import {
  caliper,
  maybeGetTimebackServiceConfig,
  oneroster,
  powerpath,
  qti,
  type TimebackService,
} from "@monte/timeback-clients";

type CaliperClient = ReturnType<typeof caliper.createCaliperClient> | null;
type OneRosterClient = ReturnType<
  typeof oneroster.createOneRosterClient
> | null;
type PowerpathClient = ReturnType<
  typeof powerpath.createPowerpathClient
> | null;
type QtiClient = ReturnType<typeof qti.createQtiClient> | null;

type ServiceClientMap = {
  caliper: CaliperClient;
  oneroster: OneRosterClient;
  powerpath: PowerpathClient;
  qti: QtiClient;
};

type ServiceFactoryMap = {
  [Service in TimebackService]: (options: {
    environment: "staging" | "production";
  }) => ServiceClientMap[Service];
};

const factories: ServiceFactoryMap = {
  caliper: (options) => caliper.createCaliperClient(options),
  oneroster: (options) => oneroster.createOneRosterClient(options),
  powerpath: (options) => powerpath.createPowerpathClient(options),
  qti: (options) => qti.createQtiClient(options),
};

const clientCache: Partial<ServiceClientMap> = {};

function createClientForService<Service extends TimebackService>(
  service: Service,
): ServiceClientMap[Service] {
  const cached = clientCache[service];
  if (cached !== undefined) {
    return cached as ServiceClientMap[Service];
  }

  const config = maybeGetTimebackServiceConfig(service);
  if (!config) {
    clientCache[service] = null;
    return null as ServiceClientMap[Service];
  }

  const factory = factories[service];

  try {
    const client = factory({ environment: config.environment });
    clientCache[service] = client;
    return client as ServiceClientMap[Service];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Timeback error";
    process.stderr.write(
      `Failed to initialise Timeback ${service} client: ${message}\n`,
    );
    clientCache[service] = null;
    return null as ServiceClientMap[Service];
  }
}

export function resetTimebackClients(): void {
  for (const key of Object.keys(clientCache) as Array<keyof ServiceClientMap>) {
    delete clientCache[key];
  }
}

export function getCaliperClient(): CaliperClient {
  return createClientForService("caliper");
}

export function isCaliperConfigured(): boolean {
  return Boolean(getCaliperClient());
}

export function getPowerpathClient(): PowerpathClient {
  return createClientForService("powerpath");
}

export function isPowerpathConfigured(): boolean {
  return Boolean(getPowerpathClient());
}

export function getOneRosterClient(): OneRosterClient {
  return createClientForService("oneroster");
}

export function isOneRosterConfigured(): boolean {
  return Boolean(getOneRosterClient());
}

export function getQtiClient(): QtiClient {
  return createClientForService("qti");
}

export function isQtiConfigured(): boolean {
  return Boolean(getQtiClient());
}
