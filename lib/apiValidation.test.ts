import { describe, expect, it } from "vitest";
import { validateAuthPayload, validateProfilePayload } from "./apiValidation";

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

describe("validateProfilePayload", () => {
  it("normalizes valid profile defaults", () => {
    const result = validateProfilePayload({
      name: " Runner ",
      defaultLevel: "elite",
      defaultTargetTime: "1:18:00",
    });

    expect(result.valid).toBe(true);
    expect(result.value).toEqual({
      name: "Runner",
      defaultLevel: "elite",
      defaultTargetTime: "1:18:00",
    });
  });

  it("rejects invalid profile defaults", () => {
    const result = validateProfilePayload({
      name: "x".repeat(81),
      defaultLevel: "pro",
      defaultTargetTime: "1:99:00",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      "Name must be 80 characters or fewer.",
      "Choose a valid default athlete level.",
      "Enter a valid default target time, for example 1:25:00.",
    ]);
  });
});
