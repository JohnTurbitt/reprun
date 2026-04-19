import { Level, StationKey } from "./analysis";

export type SavedReport = {
  id: string;
  createdAt: string;
  goal: string;
  targetTime: string;
  level: Level;
  runs: string[];
  stationSplits: Record<StationKey, string>;
  finishSeconds: number;
  predictedTargetSeconds: number;
  topLeakLabel: string;
};

const storageKey = "reprun.savedReports";

export function loadSavedReports(): SavedReport[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawReports = window.localStorage.getItem(storageKey);

    if (!rawReports) {
      return [];
    }

    const reports = JSON.parse(rawReports);

    if (!Array.isArray(reports)) {
      return [];
    }

    return reports;
  } catch {
    return [];
  }
}

export function saveReports(reports: SavedReport[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(reports));
}
