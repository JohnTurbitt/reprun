import { describe, expect, it } from "vitest";
import { initialRuns, initialStations } from "./analysis";
import { isValidTime, validateReportInput } from "./validation";

describe("isValidTime", () => {
  it("accepts seconds, minute splits and race times", () => {
    expect(isValidTime("330")).toBe(true);
    expect(isValidTime("5:30")).toBe(true);
    expect(isValidTime("1:25:00")).toBe(true);
  });

  it("rejects empty, malformed and impossible times", () => {
    expect(isValidTime("")).toBe(false);
    expect(isValidTime("abc")).toBe(false);
    expect(isValidTime("5:99")).toBe(false);
    expect(isValidTime("1:99:00")).toBe(false);
  });
});

describe("validateReportInput", () => {
  it("returns valid when all report inputs are valid", () => {
    const result = validateReportInput({
      targetTime: "1:25:00",
      runs: initialRuns,
      stationSplits: initialStations,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("reports target, run and station errors", () => {
    const result = validateReportInput({
      targetTime: "1:99:00",
      runs: ["", ...initialRuns.slice(1)],
      stationSplits: {
        ...initialStations,
        wallBalls: "bad",
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Enter a valid target time, for example 1:25:00.",
    );
    expect(result.errors).toContain("Run 1 needs a valid time, for example 5:30.");
    expect(result.errors).toContain(
      "Wall balls needs a valid time, for example 5:00.",
    );
  });
});
