"use client";

import { FormEvent, useMemo, useState } from "react";
import { Hint } from "@/components/Hint";
import { ReportPanel } from "@/components/ReportPanel";
import { SplitForm } from "@/components/SplitForm";
import {
  Analysis,
  Level,
  StationKey,
  buildAnalysis,
  formatTime,
  initialRuns,
  initialStations,
} from "@/lib/analysis";

export default function Home() {
  const [goal, setGoal] = useState("Sub 1:25 at my next race");
  const [targetTime, setTargetTime] = useState("1:25:00");
  const [level, setLevel] = useState<Level>("competitive");
  const [runs, setRuns] = useState(initialRuns);
  const [stationSplits, setStationSplits] = useState(initialStations);
  const [runGainPerKm, setRunGainPerKm] = useState("8");
  const [stationGain, setStationGain] = useState("2:30");
  const [transitionGain, setTransitionGain] = useState("0:45");
  const [showHints, setShowHints] = useState(true);
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
          <label className="hint-toggle">
            <input
              checked={showHints}
              onChange={(event) => setShowHints(event.target.checked)}
              type="checkbox"
            />
            <span>Show beginner hints</span>
          </label>
        </div>
        <div className="quick-stats" aria-label="Current split summary">
          <div>
            <span>Projected finish</span>
            <strong>{formatTime(activeAnalysis.finishSeconds)}</strong>
          </div>
          <div>
            <span>
              <Hint enabled={showHints} hint="recoverable" term="Recoverable" />{" "}
              time
            </span>
            <strong>{formatTime(activeAnalysis.recoverableSeconds)}</strong>
          </div>
          <div>
            <span>Next target</span>
            <strong>{formatTime(activeAnalysis.predictedTargetSeconds)}</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <SplitForm
          goal={goal}
          targetTime={targetTime}
          level={level}
          runs={runs}
          stationSplits={stationSplits}
          onGoalChange={setGoal}
          onTargetTimeChange={setTargetTime}
          onLevelChange={setLevel}
          onRunChange={updateRun}
          onStationChange={updateStation}
          onSubmit={handleSubmit}
        />

        <ReportPanel
          analysis={activeAnalysis}
          hasGeneratedReport={Boolean(analysis)}
          showHints={showHints}
          runGainPerKm={runGainPerKm}
          stationGain={stationGain}
          transitionGain={transitionGain}
          onRunGainPerKmChange={setRunGainPerKm}
          onStationGainChange={setStationGain}
          onTransitionGainChange={setTransitionGain}
        />
      </section>
    </main>
  );
}
