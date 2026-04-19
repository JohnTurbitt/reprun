"use client";

import { FormEvent, useMemo, useState } from "react";

type Level = "starter" | "competitive" | "elite";

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
  benchmarkSec: Record<Level, number>;
  recoverability: number;
  raceImpact: number;
  guidance: string;
};

type Leak = {
  id: string;
  label: string;
  type: "station" | "run" | "pacing";
  leakSeconds: number;
  recoverableSeconds: number;
  score: number;
  detail: string;
  recommendation: string;
};

type StationResult = Station & {
  seconds: number;
  benchmark: number;
  gap: number;
  recoverableSeconds: number;
  score: number;
};

type Analysis = {
  finishSeconds: number;
  targetSeconds: number;
  targetGapSeconds: number;
  totalRunSeconds: number;
  totalStationSeconds: number;
  averageRunSeconds: number;
  averageRunPace: string;
  firstHalfRunAvg: number;
  secondHalfRunAvg: number;
  runFadeSeconds: number;
  runVolatilitySeconds: number;
  predictedTargetSeconds: number;
  recoverableSeconds: number;
  topLeaks: Leak[];
  stationResults: StationResult[];
  priorities: string[];
  report: string;
};

const levelLabels: Record<Level, string> = {
  starter: "Starter",
  competitive: "Competitive",
  elite: "Elite",
};

const stations: Station[] = [
  {
    key: "ski",
    label: "SkiErg",
    benchmarkSec: { starter: 300, competitive: 255, elite: 225 },
    recoverability: 0.38,
    raceImpact: 0.8,
    guidance: "Train controlled pulls after running so the first station does not spike the heart rate.",
  },
  {
    key: "sledPush",
    label: "Sled push",
    benchmarkSec: { starter: 360, competitive: 285, elite: 240 },
    recoverability: 0.58,
    raceImpact: 1,
    guidance: "Use heavy pushes for strength and race-weight pushes for foot speed under fatigue.",
  },
  {
    key: "sledPull",
    label: "Sled pull",
    benchmarkSec: { starter: 375, competitive: 300, elite: 255 },
    recoverability: 0.6,
    raceImpact: 0.96,
    guidance: "Practise rope rhythm, foot bracing, and short rests before adding more load.",
  },
  {
    key: "burpees",
    label: "Burpee broad jumps",
    benchmarkSec: { starter: 420, competitive: 330, elite: 285 },
    recoverability: 0.62,
    raceImpact: 0.9,
    guidance: "Build repeatable jump distance and breathing control instead of sprinting the first half.",
  },
  {
    key: "row",
    label: "Row",
    benchmarkSec: { starter: 315, competitive: 260, elite: 235 },
    recoverability: 0.34,
    raceImpact: 0.72,
    guidance: "Hold a sustainable split and exit ready to run, not with a maxed-out pull rate.",
  },
  {
    key: "farmers",
    label: "Farmers carry",
    benchmarkSec: { starter: 270, competitive: 210, elite: 180 },
    recoverability: 0.54,
    raceImpact: 0.74,
    guidance: "Prioritise grip endurance, fast turns, and clean pick-ups.",
  },
  {
    key: "lunges",
    label: "Sandbag lunges",
    benchmarkSec: { starter: 390, competitive: 300, elite: 255 },
    recoverability: 0.66,
    raceImpact: 0.94,
    guidance: "Use steady unbroken chunks and practise standing tall under quad fatigue.",
  },
  {
    key: "wallBalls",
    label: "Wall balls",
    benchmarkSec: { starter: 450, competitive: 360, elite: 300 },
    recoverability: 0.72,
    raceImpact: 1,
    guidance: "Break sets before failure and train quality reps after compromised running.",
  },
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

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));

  return Math.sqrt(variance);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildStationLeak(result: StationResult): Leak {
  return {
    id: result.key,
    label: result.label,
    type: "station",
    leakSeconds: result.gap,
    recoverableSeconds: result.recoverableSeconds,
    score: result.score,
    detail: `${formatTime(result.seconds)} vs ${formatTime(result.benchmark)} benchmark`,
    recommendation: result.guidance,
  };
}

function buildAnalysis(
  goal: string,
  targetTime: string,
  level: Level,
  runs: string[],
  stationSplits: Record<StationKey, string>,
): Analysis {
  const runSeconds = runs.map(parseTime);
  const totalRunSeconds = runSeconds.reduce((total, split) => total + split, 0);
  const totalValidRuns = runSeconds.filter((split) => split > 0).length || 8;
  const averageRunSeconds = totalRunSeconds / totalValidRuns;
  const firstHalfRunAvg = average(runSeconds.slice(0, 4));
  const secondHalfRunAvg = average(runSeconds.slice(4));
  const runFadeSeconds = Math.max(0, secondHalfRunAvg - firstHalfRunAvg);
  const runVolatilitySeconds = standardDeviation(runSeconds);

  const stationResults = stations
    .map((station) => {
      const seconds = parseTime(stationSplits[station.key]);
      const benchmark = station.benchmarkSec[level];
      const gap = Math.max(0, seconds - benchmark);
      const confidence = seconds > 0 ? 1 : 0;
      const recoverableSeconds = Math.round(gap * station.recoverability);
      const score = Math.round(
        gap * station.recoverability * station.raceImpact * confidence,
      );

      return {
        ...station,
        seconds,
        benchmark,
        gap,
        recoverableSeconds,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  const totalStationSeconds = stationResults.reduce(
    (total, station) => total + station.seconds,
    0,
  );
  const finishSeconds = totalRunSeconds + totalStationSeconds;
  const targetSeconds = parseTime(targetTime);
  const targetGapSeconds = Math.max(0, finishSeconds - targetSeconds);

  const runFadeLeak: Leak = {
    id: "run-fade",
    label: "Second-half run fade",
    type: "run",
    leakSeconds: Math.round(runFadeSeconds * 4),
    recoverableSeconds: Math.round(runFadeSeconds * 4 * 0.55),
    score: Math.round(runFadeSeconds * 4 * 0.55 * 1.08),
    detail: `${formatTime(firstHalfRunAvg)} average for runs 1-4, ${formatTime(secondHalfRunAvg)} for runs 5-8`,
    recommendation:
      "Add one compromised run session each week: station work straight into 600m-1km repeats at controlled race pace.",
  };

  const pacingLeak: Leak = {
    id: "pacing-volatility",
    label: "Pacing volatility",
    type: "pacing",
    leakSeconds: Math.round(runVolatilitySeconds * 3.2),
    recoverableSeconds: Math.round(runVolatilitySeconds * 3.2 * 0.45),
    score: Math.round(runVolatilitySeconds * 3.2 * 0.45 * 0.86),
    detail: `${formatTime(runVolatilitySeconds)} standard deviation across run splits`,
    recommendation:
      "Set a ceiling for the first two runs and practise even kilometre repeats after stations.",
  };

  const leaks = [
    ...stationResults.filter((station) => station.score > 0).map(buildStationLeak),
    ...(runFadeLeak.score > 12 ? [runFadeLeak] : []),
    ...(pacingLeak.score > 10 ? [pacingLeak] : []),
  ].sort((a, b) => b.score - a.score);

  const topLeaks = leaks.slice(0, 3);
  const rawRecoverableSeconds = topLeaks.reduce(
    (total, leak) => total + leak.recoverableSeconds,
    0,
  );
  const recoverableSeconds = Math.round(
    clamp(rawRecoverableSeconds, finishSeconds * 0.025, finishSeconds * 0.12),
  );
  const predictedTargetSeconds = finishSeconds - recoverableSeconds;
  const priorities = topLeaks.map(
    (leak) =>
      `${leak.label}: ${formatTime(leak.recoverableSeconds)} realistic gain. ${leak.recommendation}`,
  );
  const primaryLeak = topLeaks[0];
  const targetLine =
    targetSeconds > 0
      ? `Your entered target is ${formatTime(targetSeconds)}, leaving ${formatTime(targetGapSeconds)} to find.`
      : "Add a target finish time to see the exact gap you need to close.";

  return {
    finishSeconds,
    targetSeconds,
    targetGapSeconds,
    totalRunSeconds,
    totalStationSeconds,
    averageRunSeconds,
    averageRunPace: formatTime(averageRunSeconds),
    firstHalfRunAvg,
    secondHalfRunAvg,
    runFadeSeconds,
    runVolatilitySeconds,
    predictedTargetSeconds,
    recoverableSeconds,
    topLeaks,
    stationResults,
    priorities,
    report: `The model projects ${formatTime(finishSeconds)} from these splits. ${targetLine} The biggest recoverable leak is ${primaryLeak?.label.toLowerCase() ?? "not clear yet"}, worth about ${formatTime(primaryLeak?.recoverableSeconds ?? 0)} if trained well. Based on the top three leaks, a realistic next step is ${formatTime(predictedTargetSeconds)} without needing random extra volume.`,
  };
}

export default function Home() {
  const [goal, setGoal] = useState("Sub 1:25 at my next race");
  const [targetTime, setTargetTime] = useState("1:25:00");
  const [level, setLevel] = useState<Level>("competitive");
  const [runs, setRuns] = useState(initialRuns);
  const [stationSplits, setStationSplits] = useState(initialStations);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const preview = useMemo(
    () => buildAnalysis(goal, targetTime, level, runs, stationSplits),
    [goal, targetTime, level, runs, stationSplits],
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
    setAnalysis(buildAnalysis(goal, targetTime, level, runs, stationSplits));
  }

  const activeAnalysis = analysis ?? preview;

  return (
    <main>
      <section className="intro">
        <div className="intro__copy">
          <p className="eyebrow">RepRun</p>
          <h1>Find the time leaks between your reps and runs.</h1>
          <p>
            Enter your splits to get a deterministic race breakdown, ranked weak
            points, and a realistic next target without AI guesswork.
          </p>
        </div>
        <div className="quick-stats" aria-label="Current split summary">
          <div>
            <span>Projected finish</span>
            <strong>{formatTime(activeAnalysis.finishSeconds)}</strong>
          </div>
          <div>
            <span>Recoverable time</span>
            <strong>{formatTime(activeAnalysis.recoverableSeconds)}</strong>
          </div>
          <div>
            <span>Next target</span>
            <strong>{formatTime(activeAnalysis.predictedTargetSeconds)}</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <form className="split-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <p className="eyebrow">Race Input</p>
            <h2>Your splits</h2>
          </div>

          <div className="input-row">
            <label className="field">
              <span>Goal</span>
              <input
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Sub 1:25 at my next race"
              />
            </label>

            <label className="field">
              <span>Target time</span>
              <input
                value={targetTime}
                onChange={(event) => setTargetTime(event.target.value)}
                inputMode="numeric"
                placeholder="1:25:00"
              />
            </label>
          </div>

          <label className="field field--wide">
            <span>Athlete level</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value as Level)}
            >
              {Object.entries(levelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
            <p className="eyebrow">Math Engine</p>
            <h2>{analysis ? "Your race breakdown" : "Live preview"}</h2>
          </div>
          <p className="report__summary">{activeAnalysis.report}</p>

          <div className="metric-row metric-row--three">
            <div>
              <span>Average run</span>
              <strong>{activeAnalysis.averageRunPace}</strong>
            </div>
            <div>
              <span>Run fade</span>
              <strong>{formatTime(activeAnalysis.runFadeSeconds)}/km</strong>
            </div>
            <div>
              <span>Target gap</span>
              <strong>{formatTime(activeAnalysis.targetGapSeconds)}</strong>
            </div>
          </div>

          <h3>Top time leaks</h3>
          <div className="leak-list">
            {activeAnalysis.topLeaks.map((leak, index) => (
              <article className="leak-card" key={leak.id}>
                <div>
                  <span>#{index + 1}</span>
                  <h4>{leak.label}</h4>
                  <p>{leak.detail}</p>
                </div>
                <strong>{formatTime(leak.recoverableSeconds)}</strong>
              </article>
            ))}
          </div>

          <h3>Training priorities</h3>
          <ol>
            {activeAnalysis.priorities.map((priority) => (
              <li key={priority}>{priority}</li>
            ))}
          </ol>

          <h3>Station ranking</h3>
          <div className="station-table">
            {activeAnalysis.stationResults.map((station) => (
              <div key={station.key}>
                <span>{station.label}</span>
                <strong>{formatTime(station.gap)} leak</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
