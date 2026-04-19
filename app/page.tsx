"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Hint } from "@/components/Hint";
import { ReportHistory } from "@/components/ReportHistory";
import { ReportPanel } from "@/components/ReportPanel";
import { SplitForm } from "@/components/SplitForm";
import { Toast, ToastMessage } from "@/components/Toast";
import {
  Analysis,
  Level,
  StationKey,
  buildAnalysis,
  formatTime,
  initialRuns,
  initialStations,
} from "@/lib/analysis";
import {
  SavedReport,
  loadSavedReports,
  saveReports,
} from "@/lib/reportStorage";
import { validateReportInput } from "@/lib/validation";

type ActiveTab = "new" | "history";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("new");
  const [goal, setGoal] = useState("Sub 1:25 at my next race");
  const [targetTime, setTargetTime] = useState("1:25:00");
  const [level, setLevel] = useState<Level>("competitive");
  const [runs, setRuns] = useState(initialRuns);
  const [stationSplits, setStationSplits] = useState(initialStations);
  const [runGainPerKm, setRunGainPerKm] = useState("8");
  const [stationGain, setStationGain] = useState("2:30");
  const [transitionGain, setTransitionGain] = useState("0:45");
  const [showHints, setShowHints] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

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
    const validation = validateReportInput({
      targetTime,
      runs,
      stationSplits,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setToast({
        id: Date.now(),
        title: "Report not generated",
        message:
          validation.errors.length === 1
            ? validation.errors[0]
            : `${validation.errors.length} fields need valid times before RepRun can calculate the report.`,
        tone: "error",
      });
      return;
    }

    const generatedAnalysis = buildAnalysis(
      goal,
      targetTime,
      level,
      runs,
      stationSplits,
    );
    const savedReport: SavedReport = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      goal,
      targetTime,
      level,
      runs,
      stationSplits,
      finishSeconds: generatedAnalysis.finishSeconds,
      predictedTargetSeconds: generatedAnalysis.predictedTargetSeconds,
      topLeakLabel: generatedAnalysis.topLeaks[0]?.label ?? "",
    };
    const nextReports = [savedReport, ...savedReports].slice(0, 12);

    setAnalysis(generatedAnalysis);
    setValidationErrors([]);
    setToast({
      id: Date.now(),
      title: "Report generated",
      message: "Your report has been saved in Previous reports on this device.",
      tone: "success",
    });
    setSavedReports(nextReports);
    saveReports(nextReports);
    setActiveTab("new");
    window.requestAnimationFrame(() => {
      reportRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function loadReport(report: SavedReport) {
    const loadedAnalysis = buildAnalysis(
      report.goal,
      report.targetTime,
      report.level,
      report.runs,
      report.stationSplits,
    );

    setGoal(report.goal);
    setTargetTime(report.targetTime);
    setLevel(report.level);
    setRuns(report.runs);
    setStationSplits(report.stationSplits);
    setAnalysis(loadedAnalysis);
    setActiveTab("new");
    window.requestAnimationFrame(() => {
      reportRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function deleteReport(reportId: string) {
    const nextReports = savedReports.filter((report) => report.id !== reportId);

    setSavedReports(nextReports);
    saveReports(nextReports);
  }

  const activeAnalysis = analysis ?? preview;

  useEffect(() => {
    setSavedReports(loadSavedReports());
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 560);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 4600);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

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
        <nav className="tab-bar" aria-label="Report navigation">
          <button
            className={activeTab === "new" ? "tab-bar__tab is-active" : "tab-bar__tab"}
            type="button"
            onClick={() => setActiveTab("new")}
          >
            New report
          </button>
          <button
            className={
              activeTab === "history" ? "tab-bar__tab is-active" : "tab-bar__tab"
            }
            type="button"
            onClick={() => setActiveTab("history")}
          >
            Previous reports
            {savedReports.length > 0 ? <span>{savedReports.length}</span> : null}
          </button>
        </nav>

        {activeTab === "new" ? (
          <>
            <SplitForm
              goal={goal}
              targetTime={targetTime}
              level={level}
              runs={runs}
              stationSplits={stationSplits}
              errors={validationErrors}
              onGoalChange={setGoal}
              onTargetTimeChange={setTargetTime}
              onLevelChange={setLevel}
              onRunChange={updateRun}
              onStationChange={updateStation}
              onSubmit={handleSubmit}
            />

            <div ref={reportRef} className="report-anchor">
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
            </div>
          </>
        ) : (
          <ReportHistory
            reports={savedReports}
            onLoadReport={loadReport}
            onDeleteReport={deleteReport}
          />
        )}
      </section>

      <button
        className={`scroll-top ${showScrollTop ? "scroll-top--visible" : ""}`}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-hidden={!showScrollTop}
        tabIndex={showScrollTop ? 0 : -1}
      >
        Back to top
      </button>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
