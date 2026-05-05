import { describe, expect, it } from "vitest";
import {
  formatPaceForUnit,
  formatSpeedForUnit,
  getTotalRunDistance,
  secondsPerDistanceUnit,
} from "./units";

describe("distance unit helpers", () => {
  it("converts segment seconds into mile pace", () => {
    expect(Math.round(secondsPerDistanceUnit(300, "hyrox", "mi"))).toBe(483);
    expect(formatPaceForUnit(300, "hyrox", "mi")).toBe("8:03/mile");
    expect(formatSpeedForUnit(300, "hyrox", "mi")).toBe("7.5 mph");
  });

  it("accounts for shorter race-format run distances", () => {
    expect(formatPaceForUnit(240, "tryka800", "km")).toBe("5:00/km");
    expect(formatSpeedForUnit(240, "tryka800", "km")).toBe("12.0 km/h");
    expect(Math.round(getTotalRunDistance(8, "tryka500", "mi") * 10) / 10).toBe(
      2.5,
    );
  });
});
