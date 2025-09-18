const rawClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "";
const trimmedClientId = rawClientId.trim();

export const isMockAuthMode =
  process.env.NEXT_PUBLIC_AUTH_MOCK === "true" || trimmedClientId.length === 0;

export const devAccessToken =
  process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN ?? "dev-access-token";
