import { logger } from "@monte/shared";
import {
  loadTimebackEnv,
  maybeGetTimebackServiceConfig,
} from "@monte/timeback-clients";
import { loadApiEnv } from "../src/lib/env";

async function main() {
  const env = loadApiEnv();
  loadTimebackEnv();
  const config = maybeGetTimebackServiceConfig("caliper");
  if (!config?.credentials) {
    throw new Error("Caliper credentials are not configured");
  }

  const secret = env.TIMEBACK_CALIPER_TOKEN;
  if (!secret) {
    throw new Error(
      "TIMEBACK_CALIPER_TOKEN must be set to register the webhook",
    );
  }

  const targetUrl =
    env.TIMEBACK_CALIPER_WEBHOOK_URL ??
    `${env.API_URL ?? "http://localhost:8787"}/timeback-events/caliper`;

  const token = await fetchAccessToken({
    tokenUrl: config.tokenUrl,
    clientId: config.credentials.clientId,
    clientSecret: config.credentials.clientSecret,
    scope: config.scope,
  });

  const existing = await fetch(`${config.baseUrl}/webhooks/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!existing.ok) {
    throw new Error(`Failed to load existing webhooks: ${existing.status}`);
  }

  const existingPayload = (await existing.json()) as {
    webhooks?: Array<{
      id: string;
      targetUrl: string;
    }>;
  };

  const match = existingPayload.webhooks?.find(
    (webhook) => webhook.targetUrl === targetUrl,
  );

  const payload = {
    name: "Monte Caliper Sink",
    description: "Routes Caliper activity to the Monte API",
    targetUrl,
    secret,
    active: true,
    sensor: null,
  };

  if (match) {
    const updateResponse = await fetch(
      `${config.baseUrl}/webhooks/${match.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!updateResponse.ok) {
      throw new Error(
        `Failed to update webhook ${match.id}: ${updateResponse.status}`,
      );
    }
    logger.info("Updated Caliper webhook", { id: match.id, targetUrl });
    return;
  }

  const createResponse = await fetch(`${config.baseUrl}/webhooks/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create webhook: ${createResponse.status}`);
  }

  const created = (await createResponse.json()) as {
    webhook?: { id?: string };
  };
  logger.info("Created Caliper webhook", {
    id: created.webhook?.id ?? "unknown",
    targetUrl,
  });
}

type TokenRequest = {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
};

async function fetchAccessToken(options: TokenRequest): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: options.clientId,
    client_secret: options.clientSecret,
  });

  if (options.scope) {
    body.set("scope", options.scope);
  }

  const response = await fetch(options.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch access token: ${response.status}`);
  }

  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("Token response did not include access_token");
  }
  return json.access_token;
}

main().catch((error) => {
  logger.error("register-caliper-webhook failed", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
