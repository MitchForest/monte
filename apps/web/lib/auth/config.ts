import { isAuthMockEnabled, publicEnv } from "@/lib/env";

export const isMockAuthMode = isAuthMockEnabled();

export const devAccessToken = publicEnv.devAccessToken;
