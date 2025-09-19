import { describe, expect, test } from "bun:test";
import { StudentParentOverviewSchema } from "@monte/shared";
import {
  buildContactKey,
  resolvePreferredContact,
} from "../src/routes/parents";

describe("parents utilities", () => {
  test("resolvePreferredContact prefers email", () => {
    expect(resolvePreferredContact("guardian@example.com", null)).toBe("email");
    expect(resolvePreferredContact(null, "+15555550123")).toBe("phone");
    expect(resolvePreferredContact(null, null)).toBeNull();
  });

  test("buildContactKey normalizes inputs", () => {
    expect(buildContactKey("Guardian@Example.com", null, "fallback")).toBe(
      "guardian@example.com",
    );
    expect(buildContactKey(null, " 12345 ", "fallback")).toBe("12345");
    expect(buildContactKey(null, null, "ID")).toBe("ID");
  });

  test("StudentParentOverviewSchema requires source", () => {
    expect(() =>
      StudentParentOverviewSchema.parse({
        id: "1",
        student_id: "student",
        name: "Guardian",
        email: null,
        phone: null,
        relation: null,
        preferred_contact_method: null,
        created_at: new Date().toISOString(),
        studentId: "student",
        studentName: null,
        source: "timeback",
      }),
    ).not.toThrow();

    expect(() =>
      StudentParentOverviewSchema.parse({
        id: "1",
        student_id: "student",
        name: "Guardian",
        email: null,
        phone: null,
        relation: null,
        preferred_contact_method: null,
        created_at: new Date().toISOString(),
        studentId: "student",
        studentName: null,
      }),
    ).toThrow();
  });
});
