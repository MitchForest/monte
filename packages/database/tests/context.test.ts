import { describe, expect, it, mock } from "bun:test";

const fakeTrx = {};
const capturedStatements: Array<{ statement: string; params: unknown[] }> = [];

mock.module("../src/client", () => {
  return {
    getDb: () => ({
      transaction: () => ({
        execute: async (callback: (trx: typeof fakeTrx) => Promise<unknown>) =>
          callback(fakeTrx),
      }),
    }),
  };
});

mock.module("kysely", () => {
  return {
    sql: (strings: TemplateStringsArray, ...params: unknown[]) => ({
      execute: async () => {
        capturedStatements.push({
          statement: strings.join("?"),
          params,
        });
        return undefined;
      },
    }),
  };
});

describe("withDbContext", () => {
  it("sets RLS headers before invoking the callback", async () => {
    capturedStatements.length = 0;

    const { withDbContext } = await import("../src/context");

    const result = await withDbContext(
      { userId: "user-123", orgId: "org-456" },
      async (trx) => {
        expect(trx).toBe(fakeTrx);
        return "done";
      },
    );

    expect(result).toBe("done");
    expect(capturedStatements).toEqual([
      {
        statement: "select set_config('app.user_id', ?, true)",
        params: ["user-123"],
      },
      {
        statement: "select set_config('app.org_id', ?, true)",
        params: ["org-456"],
      },
    ]);
  });
});
