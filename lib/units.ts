import type { RaceFormat } from "./raceFormats";
import { formatTime } from "./analysis";

export type DistanceUnit = "km" | "mi";

const mileInKm = 1.609344;

export const distanceUnitLabels: Record<DistanceUnit, string> = {
  km: "km",
  mi: "mile",
};

export function getRunDistanceKm(raceFormat: RaceFormat) {
  if (raceFormat === "tryka800") {
    return 0.8;
  }

  if (raceFormat === "tryka500") {
    return 0.5;
  }

  return 1;
}

export function getUnitDistanceKm(unit: DistanceUnit) {
  return unit === "mi" ? mileInKm : 1;
}

export function secondsPerDistanceUnit(
  segmentSeconds: number,
  raceFormat: RaceFormat,
  unit: DistanceUnit,
) {
  const runDistanceKm = getRunDistanceKm(raceFormat);

  if (runDistanceKm <= 0) {
    return segmentSeconds;
  }

  return (segmentSeconds / runDistanceKm) * getUnitDistanceKm(unit);
}

export function formatPaceForUnit(
  segmentSeconds: number,
  raceFormat: RaceFormat,
  unit: DistanceUnit,
) {
  return `${formatTime(secondsPerDistanceUnit(segmentSeconds, raceFormat, unit))}/${distanceUnitLabels[unit]}`;
}

export function formatSpeedForUnit(
  segmentSeconds: number,
  raceFormat: RaceFormat,
  unit: DistanceUnit,
) {
  const paceSeconds = secondsPerDistanceUnit(segmentSeconds, raceFormat, unit);
  const speed = paceSeconds > 0 ? 3600 / paceSeconds : 0;
  const speedLabel = unit === "mi" ? "mph" : "km/h";

  return `${speed.toFixed(1)} ${speedLabel}`;
}

export function getTotalRunDistance(
  runCount: number,
  raceFormat: RaceFormat,
  unit: DistanceUnit,
) {
  const totalKm = runCount * getRunDistanceKm(raceFormat);

  return totalKm / getUnitDistanceKm(unit);
}
