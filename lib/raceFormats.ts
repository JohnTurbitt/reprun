import type { Station, StationKey } from "./analysis";
import { stations } from "./analysis";

export type RaceFormat = "hyrox" | "tryka800" | "tryka500";

export type RaceFormatOption = {
  id: RaceFormat;
  label: string;
  description: string;
  runLabel: string;
  stationHeading: string;
  stations: Station[];
};

function stationByKey(key: StationKey) {
  const station = stations.find((item) => item.key === key);

  if (!station) {
    throw new Error(`Station ${key} is not configured.`);
  }

  return station;
}

const trykaStationOverrides: Record<StationKey, string> = {
  ski: "SkiErg 1,000m",
  sledPush: "Farmers Carry 200m",
  sledPull: "Ram Thrusters 60 reps",
  burpees: "Sled Push 50m",
  row: "Sled Pull 50m",
  farmers: "Rower 1,000m",
  lunges: "Walking Lunges 100m",
  wallBalls: "Burpee Broad Jumps 80m",
};

function buildTrykaStations(): Station[] {
  return (Object.keys(trykaStationOverrides) as StationKey[]).map((key) => ({
    ...stationByKey(key),
    label: trykaStationOverrides[key],
  }));
}

export const raceFormatOptions: RaceFormatOption[] = [
  {
    id: "hyrox",
    label: "HYROX",
    description: "8 x 1km runs and the standard HYROX station order.",
    runLabel: "1km run",
    stationHeading: "Stations",
    stations,
  },
  {
    id: "tryka800",
    label: "TRYKA 800",
    description: "8 x 800m runs with TRYKA stations.",
    runLabel: "800m run",
    stationHeading: "TRYKA stations",
    stations: buildTrykaStations(),
  },
  {
    id: "tryka500",
    label: "TRYKA 500",
    description: "8 x 500m runs with TRYKA stations.",
    runLabel: "500m run",
    stationHeading: "TRYKA stations",
    stations: buildTrykaStations(),
  },
];

export const raceFormatLabels = raceFormatOptions.reduce(
  (labels, option) => ({
    ...labels,
    [option.id]: option.label,
  }),
  {} as Record<RaceFormat, string>,
);

export function getRaceFormatOption(format: RaceFormat) {
  return raceFormatOptions.find((option) => option.id === format) ??
    raceFormatOptions[0];
}

export function getRaceFormatStations(format: RaceFormat) {
  return getRaceFormatOption(format).stations;
}

export function isRaceFormat(value: string): value is RaceFormat {
  return raceFormatOptions.some((option) => option.id === value);
}
