import { describe, expect, it } from "vitest";
import { validateAuthPayload } from "./apiValidation";

describe("validateAuthPayload", () => {
  it("normalizes valid auth payloads", () => {
    const result = validateAuthPayload({
      email: " athlete@example.com ",
      password: "password123",
      name: " Runner ",
    });

    expect(result.valid).toBe(true);
    expect(result.value).toEqual({
      email: "athlete@example.com",
      password: "password123",
      name: "Runner",
    });
  });

  it("rejects bad emails and short passwords", () => {
    const result = validateAuthPayload({
      email: "not-an-email",
      password: "short",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      "Enter a valid email address.",
      "Password must be at least 8 characters.",
    ]);
  });
});
