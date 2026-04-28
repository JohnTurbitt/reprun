import { describe, expect, it } from "vitest";
import { hashPassword, normalizeEmail, verifyPassword } from "./auth";

describe("auth helpers", () => {
  it("normalizes email addresses before lookup", () => {
    expect(normalizeEmail("  Athlete@RepRun.COM ")).toBe("athlete@reprun.com");
  });

  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash).not.toBe("correct horse battery staple");
    await expect(
      verifyPassword("correct horse battery staple", hash),
    ).resolves.toBe(true);
    await expect(verifyPassword("wrong password", hash)).resolves.toBe(false);
  });
});
