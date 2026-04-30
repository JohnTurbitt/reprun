import { describe, expect, it } from "vitest";
import {
  cloneReportPreset,
  defaultReportPreset,
  emptyReportPreset,
  sampleReportPreset,
} from "./reportPresets";

describe("report presets", () => {
  it("keeps sample and default presets complete", () => {
    expect(defaultReportPreset.runs).toHaveLength(8);
    expect(sampleReportPreset.runs).toHaveLength(8);
    expect(Object.values(defaultReportPreset.stationSplits)).toHaveLength(8);
    expect(Object.values(sampleReportPreset.stationSplits)).toHaveLength(8);
  });

  it("provides an empty preset for clearing the form", () => {
    expect(emptyReportPreset.goal).toBe("");
    expect(emptyReportPreset.targetTime).toBe("");
    expect(emptyReportPreset.runs.every((split) => split === "")).toBe(true);
    expect(
      Object.values(emptyReportPreset.stationSplits).every((split) => split === ""),
    ).toBe(true);
  });

  it("clones nested preset values before editing", () => {
    const clone = cloneReportPreset(sampleReportPreset);

    clone.runs[0] = "9:99";
    clone.stationSplits.ski = "9:99";

    expect(sampleReportPreset.runs[0]).toBe("4:55");
    expect(sampleReportPreset.stationSplits.ski).toBe("4:18");
  });
});
