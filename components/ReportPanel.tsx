import { useEffect, useState } from "react";
import { Analysis, formatTime } from "@/lib/analysis";
import { CalculationExplainer } from "./CalculationExplainer";
import { Hint } from "./Hint";
import { TargetSimulator } from "./TargetSimulator";

type ReportPanelProps = {
  analysis: Analysis;
  hasGeneratedReport: boolean;
  fullReportUnlocked: boolean;
  canStartCheckout: boolean;
  billingLoading: boolean;
  showHints: boolean;
  runGainPerKm: string;
  stationGain: string;
  transitionGain: string;
  onStartCheckout: () => void;
  onRunGainPerKmChange: (value: string) => void;
  onStationGainChange: (value: string) => void;
  onTransitionGainChange: (value: string) => void;
};

export function ReportPanel({
  analysis,
  hasGeneratedReport,
  fullReportUnlocked,
  canStartCheckout,
  billingLoading,
  showHints,
  runGainPerKm,
  stationGain,
  transitionGain,
  onStartCheckout,
  onRunGainPerKmChange,
  onStationGainChange,
  onTransitionGainChange,
}: ReportPanelProps) {
  const [generatedDate, setGeneratedDate] = useState("");
  const visibleLeaks = fullReportUnlocked
    ? analysis.topLeaks
    : analysis.topLeaks.slice(0, 2);

  useEffect(() => {
    setGeneratedDate(new Date().toLocaleDateString());
  }, []);

  return (
    <aside className="report" aria-live="polite">
      <div className="report__header">
        <div className="section-heading">
          <p className="eyebrow">Math Engine</p>
          <h2>{hasGeneratedReport ? "Your race breakdown" : "Live preview"}</h2>
        </div>
        <button
          className="report__print"
          type="button"
          onClick={() => window.print()}
          disabled={!fullReportUnlocked}
        >
          Print report
        </button>
      </div>
      <p className="report__date">
        {generatedDate ? `Generated ${generatedDate} - RepRun` : "RepRun"}
      </p>
      <p className="report__summary">{analysis.report}</p>

      <div className="metric-row metric-row--three">
        <div>
          <span>Average run</span>
          <strong>{analysis.averageRunPace}</strong>
        </div>
        <div>
          <span>
            <Hint enabled={showHints} hint="runFade" term="Run fade" />
          </span>
          <strong>{formatTime(analysis.runFadeSeconds)}/km</strong>
        </div>
        <div>
          <span>
            <Hint enabled={showHints} hint="targetGap" term="Target gap" />
          </span>
          <strong>{formatTime(analysis.targetGapSeconds)}</strong>
        </div>
      </div>

      <h3>
        Top <Hint enabled={showHints} hint="timeLeak" term="time leaks" />
      </h3>
      <div className="leak-list">
        {visibleLeaks.map((leak, index) => (
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

      {!fullReportUnlocked ? (
        <div className="paywall">
          <div>
            <p className="eyebrow">Full report</p>
            <h3>Unlock the complete race plan</h3>
            <p>
              Paid access includes the full leak list, four-week focus,
              station ranking, target simulator, print view, and calculation
              breakdown.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartCheckout}
            disabled={!canStartCheckout || billingLoading}
          >
            {billingLoading
              ? "Opening checkout..."
              : canStartCheckout
                ? "Unlock full report"
                : "Sign in to unlock"}
          </button>
        </div>
      ) : (
        <>
          <h3>Training priorities</h3>
          <ol>
            {analysis.priorities.map((priority) => (
              <li key={priority}>{priority}</li>
            ))}
          </ol>

          <h3>Four-week focus</h3>
          <div className="training-plan">
            {analysis.trainingPlan.map((week) => (
              <article className="training-week" key={week.week}>
                <div className="training-week__header">
                  <span>Week {week.week}</span>
                  <h4>{week.focus}</h4>
                </div>
                <ul>
                  {week.sessions.map((session) => (
                    <li key={session}>{session}</li>
                  ))}
                </ul>
                <p>{week.target}</p>
              </article>
            ))}
          </div>

          <h3>Target simulator</h3>
          <TargetSimulator
            analysis={analysis}
            runGainPerKm={runGainPerKm}
            stationGain={stationGain}
            transitionGain={transitionGain}
            showHints={showHints}
            onRunGainPerKmChange={onRunGainPerKmChange}
            onStationGainChange={onStationGainChange}
            onTransitionGainChange={onTransitionGainChange}
          />

          <h3>Station ranking</h3>
          <p className="helper-text">
            Each station is compared with the{" "}
            <Hint enabled={showHints} hint="benchmark" term="benchmark" /> for your
            selected level.
          </p>
          <div className="station-table">
            {analysis.stationResults.map((station) => (
              <div key={station.key}>
                <span>{station.label}</span>
                <strong>{formatTime(station.gap)} leak</strong>
              </div>
            ))}
          </div>

          <CalculationExplainer analysis={analysis} />
        </>
      )}
    </aside>
  );
}
