import { Analysis, Level, StationKey } from "./analysis";
import { SavedReport } from "./reportStorage";

export type PersistableReportInput = {
  goal: string;
  targetTime: string;
  level: Level;
  runs: string[];
  stationSplits: Record<StationKey, string>;
  analysis: Analysis;
};

export type PersistableRaceReport = {
  goal: string;
  targetTime: string;
  athleteLevel: "STARTER" | "COMPETITIVE" | "ELITE";
  runSplits: string[];
  stationSplits: Record<StationKey, string>;
  finishSeconds: number;
  predictedTargetSeconds: number;
  topLeakLabel: string;
  analysisSnapshot: Analysis;
};

const athleteLevelByLevel: Record<Level, PersistableRaceReport["athleteLevel"]> = {
  starter: "STARTER",
  competitive: "COMPETITIVE",
  elite: "ELITE",
};

const levelByAthleteLevel: Record<PersistableRaceReport["athleteLevel"], Level> = {
  STARTER: "starter",
  COMPETITIVE: "competitive",
  ELITE: "elite",
};

export function toPersistableRaceReport({
  goal,
  targetTime,
  level,
  runs,
  stationSplits,
  analysis,
}: PersistableReportInput): PersistableRaceReport {
  return {
    goal,
    targetTime,
    athleteLevel: athleteLevelByLevel[level],
    runSplits: runs,
    stationSplits,
    finishSeconds: analysis.finishSeconds,
    predictedTargetSeconds: analysis.predictedTargetSeconds,
    topLeakLabel: analysis.topLeaks[0]?.label ?? "",
    analysisSnapshot: analysis,
  };
}

export function toSavedReport(
  report: PersistableRaceReport & { id: string; createdAt: Date | string },
): SavedReport {
  return {
    id: report.id,
    createdAt:
      report.createdAt instanceof Date
        ? report.createdAt.toISOString()
        : report.createdAt,
    goal: report.goal,
    targetTime: report.targetTime,
    level: levelByAthleteLevel[report.athleteLevel],
    runs: report.runSplits,
    stationSplits: report.stationSplits,
    finishSeconds: report.finishSeconds,
    predictedTargetSeconds: report.predictedTargetSeconds,
    topLeakLabel: report.topLeakLabel,
  };
}
