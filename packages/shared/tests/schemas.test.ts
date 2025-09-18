import { describe, expect, it } from "bun:test";

import { StudentSchema } from "../src/schemas";

describe("StudentSchema", () => {
  it("parses minimal student data", () => {
    const parsed = StudentSchema.parse({
      id: "student-1",
      org_id: "org-1",
      full_name: "Maria Montessori",
      avatar_url: null,
      dob: null,
      primary_classroom_id: null,
      created_at: new Date().toISOString(),
      oneroster_user_id: null,
      classroom: null,
    });

    expect(parsed.full_name).toBe("Maria Montessori");
  });
});
