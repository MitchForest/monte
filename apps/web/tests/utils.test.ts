import { describe, expect, it } from "bun:test";

import { cn } from "../lib/utils";

describe("cn", () => {
  it("merges class names without duplicates", () => {
    const merged = cn("flex", false && "hidden", "items-center", "flex");
    const tokens = merged.split(" ");

    expect(tokens).toContain("flex");
    expect(tokens).toContain("items-center");
    expect(new Set(tokens).size).toBe(tokens.length);
  });
});
