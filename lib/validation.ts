import { StationKey, stations } from "./analysis";

export type ValidationInput = {
  targetTime: string;
  runs: string[];
  stationSplits: Record<StationKey, string>;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const timePattern = /^\d+(?::\d{1,2}){0,2}$/;

export function isValidTime(value: string) {
  const trimmed = value.trim();

  if (!trimmed || !timePattern.test(trimmed)) {
    return false;
  }

  const parts = trimmed.split(":").map(Number);
  const minutes = parts.length === 3 ? parts[1] : parts.length === 2 ? parts[0] : 0;
  const seconds = parts.length > 1 ? parts[parts.length - 1] : 0;

  if (parts.some((part) => !Number.isInteger(part) || part < 0)) {
    return false;
  }

  if (parts.length > 1 && seconds > 59) {
    return false;
  }

  if (parts.length === 3 && minutes > 59) {
    return false;
  }

  return true;
}

export function validateReportInput({
  targetTime,
  runs,
  stationSplits,
}: ValidationInput): ValidationResult {
  const errors: string[] = [];

  if (!isValidTime(targetTime)) {
    errors.push("Enter a valid target time, for example 1:25:00.");
  }

  runs.forEach((split, index) => {
    if (!isValidTime(split)) {
      errors.push(`Run ${index + 1} needs a valid time, for example 5:30.`);
    }
  });

  stations.forEach((station) => {
    if (!isValidTime(stationSplits[station.key])) {
      errors.push(`${station.label} needs a valid time, for example 5:00.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
