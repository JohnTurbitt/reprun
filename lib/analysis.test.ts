import { describe, expect, it } from "vitest";
import {
  StationKey,
  buildAnalysis,
  formatTime,
  initialStations,
  parseTime,
} from "./analysis";

const steadyRuns = Array.from({ length: 8 }, () => "5:00");

const stationSplits: Record<StationKey, string> = {
  ...initialStations,
  wallBalls: "8:00",
  sledPull: "7:00",
};

describe("time helpers", () => {
  it("parses hours, minutes and seconds", () => {
    expect(parseTime("1:25:00")).toBe(5100);
  });

  it("parses minutes and seconds", () => {
    expect(parseTime("5:30")).toBe(330);
  });

  it("formats seconds into race time", () => {
    expect(formatTime(5100)).toBe("1:25:00");
  });
});

describe("buildAnalysis", () => {
  it("calculates target gap from projected finish", () => {
    const analysis = buildAnalysis(
      "Sub 1:25",
      "1:25:00",
      "competitive",
      steadyRuns,
      stationSplits,
    );

    expect(analysis.finishSeconds).toBe(5105);
    expect(analysis.targetGapSeconds).toBe(5);
  });

  it("calculates second-half run fade per kilometre", () => {
    const analysis = buildAnalysis(
      "Even pacing",
      "1:25:00",
      "competitive",
      ["5:00", "5:00", "5:00", "5:00", "5:20", "5:20", "5:20", "5:20"],
      initialStations,
    );

    expect(analysis.runFadeSeconds).toBe(20);
  });

  it("ranks the highest scoring time leak first", () => {
    const analysis = buildAnalysis(
      "Fix the worst station",
      "1:25:00",
      "competitive",
      steadyRuns,
      stationSplits,
    );

    expect(analysis.topLeaks[0].id).toBe("wallBalls");
    expect(analysis.topLeaks[0].recoverableSeconds).toBe(86);
  });

  it("changes station benchmarks when athlete level changes", () => {
    const starter = buildAnalysis(
      "Starter benchmark",
      "1:25:00",
      "starter",
      steadyRuns,
      initialStations,
    );
    const elite = buildAnalysis(
      "Elite benchmark",
      "1:25:00",
      "elite",
      steadyRuns,
      initialStations,
    );

    const starterWallBalls = starter.stationResults.find(
      (station) => station.key === "wallBalls",
    );
    const eliteWallBalls = elite.stationResults.find(
      (station) => station.key === "wallBalls",
    );

    expect(starterWallBalls?.benchmark).toBe(450);
    expect(eliteWallBalls?.benchmark).toBe(300);
    expect(starterWallBalls?.gap).toBe(0);
    expect(eliteWallBalls?.gap).toBe(110);
  });

  it("caps recoverable time at twelve percent of projected finish", () => {
    const slowStations: Record<StationKey, string> = {
      ski: "20:00",
      sledPush: "20:00",
      sledPull: "20:00",
      burpees: "20:00",
      row: "20:00",
      farmers: "20:00",
      lunges: "20:00",
      wallBalls: "20:00",
    };

    const analysis = buildAnalysis(
      "Huge improvement target",
      "1:25:00",
      "elite",
      steadyRuns,
      slowStations,
    );

    expect(analysis.recoverableSeconds).toBe(
      Math.round(analysis.finishSeconds * 0.12),
    );
  });
});
