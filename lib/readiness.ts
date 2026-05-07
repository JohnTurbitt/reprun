import type { Analysis } from "./analysis";

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateRaceReadiness(analysis: Analysis) {
  const strongSegmentRatio =
    analysis.raceSegments.length > 0
      ? analysis.raceSegments.filter((segment) => segment.status === "strong").length /
        analysis.raceSegments.length
      : 0;
  const stationGaps = analysis.stationResults.map((station) =>
    Math.max(0, station.gap),
  );
  const averageStationGap =
    stationGaps.reduce((total, gap) => total + gap, 0) /
    Math.max(stationGaps.length, 1);
  const positiveRunFade = Math.max(0, analysis.runFadeSeconds);

  const runControl = clampScore(100 - analysis.runVolatilitySeconds * 2.8);
  const stationControl = clampScore(100 - averageStationGap * 1.15);
  const durability = clampScore(100 - positiveRunFade * 3.6);
  const targetRealism = clampScore(100 - analysis.requiredGainPercent * 900);
  const executionBase = clampScore(strongSegmentRatio * 100);
  const overall = clampScore(
    runControl * 0.24 +
      stationControl * 0.24 +
      durability * 0.2 +
      targetRealism * 0.18 +
      executionBase * 0.14,
  );

  return {
    durability,
    executionBase,
    overall,
    runControl,
    stationControl,
    targetRealism,
  };
}

export function readinessLabel(score: number) {
  if (score >= 85) {
    return "Race ready";
  }

  if (score >= 70) {
    return "Close";
  }

  if (score >= 55) {
    return "Building";
  }

  return "Needs focus";
}
