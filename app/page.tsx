"use client";

import { FormEvent, useMemo, useState } from "react";

type StationKey =
  | "ski"
  | "sledPush"
  | "sledPull"
  | "burpees"
  | "row"
  | "farmers"
  | "lunges"
  | "wallBalls";

type Station = {
  key: StationKey;
  label: string;
  benchmarkSec: number;
};

type Analysis = {
  finishSeconds: number;
  totalRunSeconds: number;
  totalStationSeconds: number;
  averageRunPace: string;
  biggestLeak: string;
  predictedTarget: string;
  priorities: string[];
  report: string;
};

const stations: Station[] = [
  { key: "ski", label: "SkiErg", benchmarkSec: 255 },
  { key: "sledPush", label: "Sled push", benchmarkSec: 285 },
  { key: "sledPull", label: "Sled pull", benchmarkSec: 300 },
  { key: "burpees", label: "Burpee broad jumps", benchmarkSec: 330 },
  { key: "row", label: "Row", benchmarkSec: 260 },
  { key: "farmers", label: "Farmers carry", benchmarkSec: 210 },
  { key: "lunges", label: "Sandbag lunges", benchmarkSec: 300 },
  { key: "wallBalls", label: "Wall balls", benchmarkSec: 360 },
];

const initialRuns: string[] = Array.from({ length: 8 }, (_, index) =>
  index < 4 ? "5:15" : "5:35",
);

const initialStations: Record<StationKey, string> = {
  ski: "4:35",
  sledPush: "5:20",
  sledPull: "5:50",
  burpees: "6:10",
  row: "4:45",
  farmers: "3:40",
  lunges: "5:35",
  wallBalls: "6:50",
};

function parseTime(value: string) {
  const parts = value.trim().split(":").map(Number);

  if (parts.some(Number.isNaN)) {
    return 0;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return parts[0] || 0;
}

function formatTime(totalSeconds: number) {
  const rounded = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function buildAnalysis(
  goal: string,
  runs: string[],
  stationSplits: Record<StationKey, string>,
): Analysis {
  const runSeconds = runs.map(parseTime);
  const totalRunSeconds = runSeconds.reduce((total, split) => total + split, 0);
  const stationRows = stations.map((station) => {
    const seconds = parseTime(stationSplits[station.key]);
    return {
      ...station,
      seconds,
      gap: seconds - station.benchmarkSec,
    };
  });
  const totalStationSeconds = stationRows.reduce(
    (total, station) => total + station.seconds,
    0,
  );
  const finishSeconds = totalRunSeconds + totalStationSeconds;
  const biggestStation = stationRows.sort((a, b) => b.gap - a.gap)[0];
  const runFade = runSeconds.slice(4).reduce((a, b) => a + b, 0) / 4 -
    runSeconds.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
  const biggestLeak =
    runFade > biggestStation.gap
      ? "running fade after the fourth kilometre"
      : biggestStation.label.toLowerCase();
  const realisticGain = Math.min(
    Math.max(finishSeconds * 0.06, 180),
    finishSeconds * 0.12,
  );
  const predictedTarget = formatTime(finishSeconds - realisticGain);
  const priorities = [
    runFade > 10
      ? "Build compromised running with short station-to-run repeats."
      : "Keep run pace steady and protect it with controlled station exits.",
    `${biggestStation.label} is the biggest station leak. Give it one focused exposure each week.`,
    goal
      ? `Shape the next block around ${goal.toLowerCase()} instead of adding random volume.`
      : "Pick one race target so the plan has a clear direction.",
  ];

  return {
    finishSeconds,
    totalRunSeconds,
    totalStationSeconds,
    averageRunPace: formatTime(totalRunSeconds / 8),
    biggestLeak,
    predictedTarget,
    priorities,
    report: `Your current profile points to a ${formatTime(
      finishSeconds,
    )} finish from the splits entered. The fastest path forward is not more random volume; it is tightening ${biggestLeak} while keeping your average run split around ${formatTime(
      totalRunSeconds / 8,
    )}. A realistic next target is ${predictedTarget} if the next block is focused and consistent.`,
  };
}

export default function Home() {
  const [goal, setGoal] = useState("Sub 1:25 at my next race");
  const [runs, setRuns] = useState(initialRuns);
  const [stationSplits, setStationSplits] = useState(initialStations);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const preview = useMemo(
    () => buildAnalysis(goal, runs, stationSplits),
    [goal, runs, stationSplits],
  );

  function updateRun(index: number, value: string) {
    setRuns((current) =>
      current.map((split, splitIndex) => (splitIndex === index ? value : split)),
    );
  }

  function updateStation(key: StationKey, value: string) {
    setStationSplits((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnalysis(buildAnalysis(goal, runs, stationSplits));
  }

  const activeAnalysis = analysis ?? preview;

  return (
    <main>
      <section className="intro">
        <div className="intro__copy">
          <p className="eyebrow">RepRun</p>
          <h1>Know exactly where your next race gets faster.</h1>
          <p>
            Enter your run and station splits to get a clear breakdown, a
            realistic target, and the training priorities that matter next.
          </p>
        </div>
        <div className="quick-stats" aria-label="Current split summary">
          <div>
            <span>Projected finish</span>
            <strong>{formatTime(activeAnalysis.finishSeconds)}</strong>
          </div>
          <div>
            <span>Average run</span>
            <strong>{activeAnalysis.averageRunPace}</strong>
          </div>
          <div>
            <span>Next target</span>
            <strong>{activeAnalysis.predictedTarget}</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <form className="split-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <p className="eyebrow">Race Input</p>
            <h2>Your splits</h2>
          </div>

          <label className="field field--wide">
            <span>Goal</span>
            <input
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="Sub 1:25 at my next race"
            />
          </label>

          <div className="split-group">
            <h3>Run splits</h3>
            <div className="split-grid">
              {runs.map((split, index) => (
                <label className="field" key={`run-${index + 1}`}>
                  <span>Run {index + 1}</span>
                  <input
                    value={split}
                    onChange={(event) => updateRun(index, event.target.value)}
                    inputMode="numeric"
                    placeholder="5:30"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="split-group">
            <h3>Stations</h3>
            <div className="split-grid">
              {stations.map((station) => (
                <label className="field" key={station.key}>
                  <span>{station.label}</span>
                  <input
                    value={stationSplits[station.key]}
                    onChange={(event) =>
                      updateStation(station.key, event.target.value)
                    }
                    inputMode="numeric"
                    placeholder="5:00"
                  />
                </label>
              ))}
            </div>
          </div>

          <button type="submit">Generate race report</button>
        </form>

        <aside className="report" aria-live="polite">
          <div className="section-heading">
            <p className="eyebrow">Report</p>
            <h2>{analysis ? "Your race breakdown" : "Live preview"}</h2>
          </div>
          <p className="report__summary">{activeAnalysis.report}</p>

          <div className="metric-row">
            <div>
              <span>Run total</span>
              <strong>{formatTime(activeAnalysis.totalRunSeconds)}</strong>
            </div>
            <div>
              <span>Station total</span>
              <strong>{formatTime(activeAnalysis.totalStationSeconds)}</strong>
            </div>
          </div>

          <h3>Training priorities</h3>
          <ol>
            {activeAnalysis.priorities.map((priority) => (
              <li key={priority}>{priority}</li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}
