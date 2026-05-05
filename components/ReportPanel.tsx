import { useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { Analysis, formatTime } from "@/lib/analysis";
import { buildReportExportText } from "@/lib/reportExport";
import {
  DistanceUnit,
  distanceUnitLabels,
  formatPaceForUnit,
  formatSpeedForUnit,
  secondsPerDistanceUnit,
} from "@/lib/units";
import { CalculationExplainer } from "./CalculationExplainer";
import { Hint } from "./Hint";
import { PremiumBadge } from "./PremiumBadge";
import {
  PremiumReportPoster,
  RaceFlowMap,
  RaceReplayMode,
  TargetGhostOverlay,
  TimeLeakHeatmap,
} from "./RaceVisuals";
import { TargetSimulator } from "./TargetSimulator";

type ReportPanelProps = {
  analysis: Analysis;
  distanceUnit: DistanceUnit;
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

type ReportSectionProps = {
  title: string;
  defaultOpen?: boolean;
  premium?: boolean;
  children: React.ReactNode;
};

function ReportSection({
  title,
  defaultOpen = false,
  premium = false,
  children,
}: ReportSectionProps) {
  return (
    <details className="report-section" open={defaultOpen}>
      <summary>
        <span>
          {title} {premium ? <PremiumBadge /> : null}
        </span>
        <strong>View</strong>
      </summary>
      <div className="report-section__body">{children}</div>
    </details>
  );
}

export function ReportPanel({
  analysis,
  distanceUnit,
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
  const reportCaptureRef = useRef<HTMLElement>(null);
  const [generatedDate, setGeneratedDate] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const visibleLeaks = fullReportUnlocked
    ? analysis.topLeaks
    : analysis.topLeaks.slice(0, 2);

  const exportText = buildReportExportText(analysis, generatedDate, distanceUnit);
  const averageRunPace = formatPaceForUnit(
    analysis.averageRunSeconds,
    analysis.raceFormat,
    distanceUnit,
  );
  const averageRunSpeed = formatSpeedForUnit(
    analysis.averageRunSeconds,
    analysis.raceFormat,
    distanceUnit,
  );
  const runFadePace = secondsPerDistanceUnit(
    analysis.runFadeSeconds,
    analysis.raceFormat,
    distanceUnit,
  );

  useEffect(() => {
    setGeneratedDate(new Date().toLocaleDateString());
  }, []);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(exportText);
      setExportMessage("Report copied.");
      setExportMenuOpen(false);
    } catch {
      setExportMessage("Copy was blocked by the browser.");
    }
  }

  async function shareReport() {
    try {
      const captureBackground =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--panel")
          .trim() || "#ffffff";
      const reportBlob = reportCaptureRef.current
        ? await toBlob(reportCaptureRef.current, {
            backgroundColor: captureBackground,
            cacheBust: true,
            filter: (node) => {
              if (!(node instanceof HTMLElement)) {
                return true;
              }

              return !(
                node.classList.contains("report-actions") ||
                node.classList.contains("report__print")
              );
            },
            pixelRatio: 2,
          })
        : null;

      if (reportBlob && navigator.share) {
        const reportFile = new File([reportBlob], "reprun-race-report.png", {
          type: "image/png",
        });
        const shareData = {
          files: [reportFile],
          text: "RepRun race report",
          title: "RepRun Race Report",
        };

        if (!navigator.canShare || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setExportMessage("Report image shared.");
          setExportMenuOpen(false);
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: "RepRun Race Report",
          text: exportText,
        });
        setExportMessage("Share sheet opened.");
        setExportMenuOpen(false);
        return;
      }

      await copyReport();
    } catch {
      setExportMessage("Share was cancelled or blocked.");
    }
  }

  function downloadReport() {
    try {
      const reportBlob = new Blob([exportText], { type: "text/plain" });
      const reportUrl = URL.createObjectURL(reportBlob);
      const reportLink = document.createElement("a");

      reportLink.href = reportUrl;
      reportLink.download = "reprun-race-report.txt";
      reportLink.click();
      URL.revokeObjectURL(reportUrl);
      setExportMessage("Report downloaded.");
      setExportMenuOpen(false);
    } catch {
      setExportMessage("Download was blocked by the browser.");
    }
  }

  return (
    <aside className="report" aria-live="polite" ref={reportCaptureRef}>
      <div className="report__header">
        <div className="section-heading">
          <p className="eyebrow">Math Engine</p>
          <h2>{hasGeneratedReport ? "Your race breakdown" : "Live preview"}</h2>
        </div>
        <div className="report-actions report-actions--header">
          {fullReportUnlocked ? (
            <div className="export-menu">
              <button
                type="button"
                onClick={() => setExportMenuOpen((isOpen) => !isOpen)}
                aria-expanded={exportMenuOpen}
              >
                Export <PremiumBadge />
              </button>
              {exportMenuOpen ? (
                <div className="export-menu__options">
                  <button type="button" onClick={() => void copyReport()}>
                    Copy summary
                  </button>
                  <button type="button" onClick={() => void shareReport()}>
                    Share image
                  </button>
                  <button type="button" onClick={downloadReport}>
                    Download .txt
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          <button
            className="report__print"
            type="button"
            onClick={() => window.print()}
            disabled={!fullReportUnlocked}
          >
            Print report
          </button>
        </div>
      </div>
      <p className="report__date">
        {generatedDate ? `Generated ${generatedDate} - RepRun` : "RepRun"}
      </p>
      <p className="report__summary">{analysis.report}</p>

      <div className="report-strip">
        <div>
          <span>Projected</span>
          <strong>{formatTime(analysis.finishSeconds)}</strong>
        </div>
        <div>
          <span>Gap</span>
          <strong>{formatTime(analysis.targetGapSeconds)}</strong>
        </div>
        <div>
          <span>Biggest leak</span>
          <strong>{analysis.topLeaks[0]?.label ?? "Not clear"}</strong>
        </div>
        <div>
          <span>Target</span>
          <strong>{analysis.targetDifficultyLabel}</strong>
        </div>
      </div>

      <div className="benchmark-context">
        <div>
          <span>Athlete level</span>
          <strong>{analysis.levelLabel}</strong>
        </div>
        <p>{analysis.stationBenchmarkSummary}</p>
      </div>

      <ReportSection title="Race flow map" defaultOpen>
        <RaceFlowMap analysis={analysis} distanceUnit={distanceUnit} />
      </ReportSection>

      <div className="metric-row metric-row--three">
        <div>
          <span>Average run pace</span>
          <strong>{averageRunPace}</strong>
          <small>{averageRunSpeed}</small>
        </div>
        <div>
          <span>
            <Hint enabled={showHints} hint="runFade" term="Run fade" />
          </span>
          <strong>
            {formatTime(runFadePace)}/{distanceUnitLabels[distanceUnit]}
          </strong>
        </div>
        <div>
          <span>
            <Hint enabled={showHints} hint="targetGap" term="Target gap" />
          </span>
          <strong>{formatTime(analysis.targetGapSeconds)}</strong>
        </div>
      </div>

      <ReportSection title="Target math" defaultOpen>
        <div className="target-plan">
          <div className="target-plan__header">
            <div>
              <p className="eyebrow">Target math</p>
              <h3>{analysis.targetDifficultyLabel}</h3>
            </div>
            <strong>
              {analysis.requiredGainPercent > 0
                ? `${Math.round(analysis.requiredGainPercent * 1000) / 10}% gain`
                : "No gap"}
            </strong>
          </div>
          <p>{analysis.targetPlanSummary}</p>
          <div className="target-plan__grid">
            <div>
              <span>Run-only route</span>
              <strong>{formatTime(analysis.requiredGainPerRunSeconds)}</strong>
              <small>needed from each run</small>
            </div>
            <div>
              <span>Station-only route</span>
              <strong>{formatTime(analysis.requiredGainPerStationSeconds)}</strong>
              <small>needed from each station</small>
            </div>
            <div>
              <span>Balanced run target</span>
              <strong>{formatTime(analysis.targetRunAverageSeconds)}</strong>
              <small>average run split</small>
            </div>
            <div>
              <span>Balanced station target</span>
              <strong>{formatTime(analysis.targetStationAverageSeconds)}</strong>
              <small>average station split</small>
            </div>
          </div>
        </div>
      </ReportSection>

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
            <h3>
              Unlock the complete race plan <PremiumBadge />
            </h3>
            <p>
              Paid access includes the full leak list, four-week focus,
              ghost overlay, heatmap, race replay, report poster, target
              simulator, print view, and calculation breakdown.
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
          <p className="helper-text" aria-live="polite">
            {exportMessage ||
              "Export includes the full leak list, training plan, target, and station ranking."}
          </p>

          <ReportSection title="Training priorities" defaultOpen premium>
            <ol>
              {analysis.priorities.map((priority) => (
                <li key={priority}>{priority}</li>
              ))}
            </ol>
          </ReportSection>

          <ReportSection title="Four-week focus" premium>
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
          </ReportSection>

          <ReportSection title="Target simulator" premium>
            <TargetSimulator
              analysis={analysis}
              distanceUnit={distanceUnit}
              runGainPerKm={runGainPerKm}
              stationGain={stationGain}
              transitionGain={transitionGain}
              showHints={showHints}
              onRunGainPerKmChange={onRunGainPerKmChange}
              onStationGainChange={onStationGainChange}
              onTransitionGainChange={onTransitionGainChange}
            />
          </ReportSection>

          <ReportSection title="Target ghost overlay" premium>
            <TargetGhostOverlay analysis={analysis} />
          </ReportSection>

          <ReportSection title="Time leak heatmap" premium>
            <TimeLeakHeatmap analysis={analysis} />
          </ReportSection>

          <ReportSection title="Race replay mode" premium>
            <RaceReplayMode analysis={analysis} />
          </ReportSection>

          <ReportSection title="Premium report poster" premium>
            <PremiumReportPoster analysis={analysis} />
          </ReportSection>

          <ReportSection title="Station ranking" premium>
            <p className="helper-text">
              Each station is compared with the {analysis.levelLabel}{" "}
              <Hint enabled={showHints} hint="benchmark" term="benchmark" />.
            </p>
            <div className="station-table">
              {analysis.stationResults.map((station) => (
                <div key={station.key}>
                  <span>{station.label}</span>
                  <strong>{formatTime(station.gap)} leak</strong>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="Calculation breakdown" premium>
            <CalculationExplainer analysis={analysis} distanceUnit={distanceUnit} />
          </ReportSection>
        </>
      )}
    </aside>
  );
}
