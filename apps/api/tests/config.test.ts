import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { getCorsOrigins } from "../src/lib/app";

const originalEnv = { ...process.env };

describe("getCorsOrigins", () => {
  beforeEach(() => {
    Object.assign(process.env, originalEnv);
    process.env.APP_ORIGINS = "";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.APP_URL = "http://localhost:4000";
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  });

  it("falls back to default local origins when none are provided", () => {
    delete process.env.APP_ORIGINS;

    const origins = getCorsOrigins();

    expect(origins).toContain("http://localhost:3000");
    expect(origins).toContain("http://localhost:3001");
  });

  it("prefers configured origins when APP_ORIGINS is set", () => {
    process.env.APP_ORIGINS = "https://app.monte.app, https://studio.monte.app";

    const origins = getCorsOrigins();

    expect(origins).toEqual([
      "https://app.monte.app",
      "https://studio.monte.app",
    ]);
  });
});
