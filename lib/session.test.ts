import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
  sessionMaxAgeSeconds,
} from "./session";

describe("session helpers", () => {
  it("creates random tokens and stable hashes", () => {
    const firstToken = createSessionToken();
    const secondToken = createSessionToken();

    expect(firstToken).not.toBe(secondToken);
    expect(hashSessionToken(firstToken)).toBe(hashSessionToken(firstToken));
    expect(hashSessionToken(firstToken)).not.toBe(firstToken);
  });

  it("sets the session expiry from the current time", () => {
    const now = new Date("2026-04-28T12:00:00.000Z");

    expect(getSessionExpiry(now).getTime()).toBe(
      now.getTime() + sessionMaxAgeSeconds * 1000,
    );
  });
});
