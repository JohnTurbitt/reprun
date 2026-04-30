import { Level, StationKey, initialRuns, initialStations } from "./analysis";

export type ReportPreset = {
  goal: string;
  targetTime: string;
  level: Level;
  runs: string[];
  stationSplits: Record<StationKey, string>;
};

export const defaultReportPreset: ReportPreset = {
  goal: "Sub 1:25 at my next race",
  targetTime: "1:25:00",
  level: "competitive",
  runs: initialRuns,
  stationSplits: initialStations,
};

export const sampleReportPreset: ReportPreset = {
  goal: "Break 1:20 with cleaner sleds and late-run control",
  targetTime: "1:20:00",
  level: "competitive",
  runs: ["4:55", "4:58", "5:02", "5:06", "5:18", "5:24", "5:29", "5:36"],
  stationSplits: {
    ski: "4:18",
    sledPush: "5:45",
    sledPull: "6:20",
    burpees: "5:52",
    row: "4:38",
    farmers: "3:26",
    lunges: "5:22",
    wallBalls: "6:42",
  },
};

export const emptyReportPreset: ReportPreset = {
  goal: "",
  targetTime: "",
  level: "competitive",
  runs: Array.from({ length: 8 }, () => ""),
  stationSplits: {
    ski: "",
    sledPush: "",
    sledPull: "",
    burpees: "",
    row: "",
    farmers: "",
    lunges: "",
    wallBalls: "",
  },
};

export function cloneReportPreset(preset: ReportPreset): ReportPreset {
  return {
    ...preset,
    runs: [...preset.runs],
    stationSplits: { ...preset.stationSplits },
  };
}
