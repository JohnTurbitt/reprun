import { useEffect, useRef, useState, type RefObject } from "react";
import { toBlob } from "html-to-image";
import { Analysis, formatTime } from "@/lib/analysis";
import { calculateRaceReadiness, readinessLabel } from "@/lib/readiness";
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
  RaceStory,
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

function describeGoodGap(gapSeconds: number) {
  if (gapSeconds <= 0) {
    return "Ahead of benchmark";
  }

  if (gapSeconds <= 10) {
    return "Near benchmark";
  }

  return "Closest benchmark match";
}

function ReadinessMetric({
  label,
  score,
  detail,
}: {
  label: string;
  score: number;
  detail: string;
}) {
  return (
    <span>
      {label}
      <strong>
        {score}
        <small>/100</small>
      </strong>
      <em>{detail}</em>
    </span>
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
  const sharePosterCaptureRef = useRef<HTMLDivElement>(null);
  const [generatedDate, setGeneratedDate] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const visibleLeaks = fullReportUnlocked
    ? analysis.topLeaks
    : analysis.topLeaks.slice(0, 2);
  const bestSegment = [...analysis.raceSegments].sort(
    (a, b) => a.leakSeconds - b.leakSeconds,
  )[0];
  const bestStation = [...analysis.stationResults].sort((a, b) => a.gap - b.gap)[0];
  const strongSegments = analysis.raceSegments.filter(
    (segment) => segment.status === "strong",
  );
  const readiness = calculateRaceReadiness(analysis);

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

  useEffect(() => {
    if (!shareModalOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShareModalOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [shareModalOpen]);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(exportText);
      setExportMessage("Report copied.");
      setShareModalOpen(false);
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
                node.classList.contains("report__print") ||
                node.classList.contains("share-preview-modal")
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
          setShareModalOpen(false);
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: "RepRun Race Report",
          text: exportText,
        });
        setExportMessage("Share sheet opened.");
        setShareModalOpen(false);
        return;
      }

      await copyReport();
    } catch {
      setExportMessage("Share was cancelled or blocked.");
    }
  }

  async function createPosterBlob(
    targetRef: RefObject<HTMLDivElement | null> = sharePosterCaptureRef,
  ) {
    if (!targetRef.current) {
      return null;
    }

    return toBlob(targetRef.current, {
      backgroundColor: "transparent",
      cacheBust: true,
      pixelRatio: 3,
    });
  }

  async function copyPosterImage(
    targetRef: RefObject<HTMLDivElement | null> = sharePosterCaptureRef,
  ) {
    try {
      const posterBlob = await createPosterBlob(targetRef);

      if (!posterBlob) {
        setExportMessage("Poster was not ready to copy.");
        return;
      }

      if ("ClipboardItem" in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ [posterBlob.type]: posterBlob }),
        ]);
        setExportMessage("Poster image copied.");
        setShareModalOpen(false);
        return;
      }

      setExportMessage("Image clipboard is not supported in this browser.");
    } catch {
      setExportMessage("Poster copy was blocked by the browser.");
    }
  }

  async function sharePosterImage(
    targetRef: RefObject<HTMLDivElement | null> = sharePosterCaptureRef,
  ) {
    try {
      const posterBlob = await createPosterBlob(targetRef);

      if (!posterBlob) {
        setExportMessage("Poster was not ready to share.");
        return;
      }

      const posterFile = new File([posterBlob], "reprun-story-poster.png", {
        type: "image/png",
      });
      const shareData = {
        files: [posterFile],
        text: "RepRun race poster",
        title: "RepRun Race Poster",
      };

      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        setExportMessage("Poster shared.");
        setShareModalOpen(false);
        return;
      }

      await copyPosterImage(targetRef);
    } catch {
      setExportMessage("Poster share was cancelled or blocked.");
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
      setShareModalOpen(false);
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
            <button
              className="share-trigger"
              type="button"
              onClick={() => setShareModalOpen(true)}
              aria-label="Open share options"
              title="Share and export"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                <path d="M12 16V4" />
                <path d="M7 9l5-5 5 5" />
              </svg>
              <PremiumBadge />
            </button>
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

      <ReportSection title="Race readiness score" defaultOpen>
        <div className="readiness-card">
          <div className="readiness-card__score">
            <span>{readinessLabel(readiness.overall)}</span>
            <strong>{readiness.overall}</strong>
            <small>/100</small>
          </div>
          <div className="readiness-card__body">
            <h3>How prepared this race profile looks</h3>
            <p>
              All numbers are out of 100. Higher means that part of the race is
              closer to target, more repeatable, or already well protected.
            </p>
            <div className="readiness-card__grid">
              <ReadinessMetric
                label="Run control"
                score={readiness.runControl}
                detail="split variation"
              />
              <ReadinessMetric
                label="Station control"
                score={readiness.stationControl}
                detail="benchmark gap"
              />
              <ReadinessMetric
                label="Durability"
                score={readiness.durability}
                detail="late-race fade"
              />
              <ReadinessMetric
                label="Target realism"
                score={readiness.targetRealism}
                detail="required gain"
              />
              <ReadinessMetric
                label="Execution base"
                score={readiness.executionBase}
                detail="protected splits"
              />
            </div>
          </div>
        </div>
      </ReportSection>

      <ReportSection title="What went well" defaultOpen>
        <div className="positive-grid">
          <article>
            <span>Best controlled split</span>
            <h4>{bestSegment?.label ?? "Not clear"}</h4>
            <strong>{formatTime(bestSegment?.leakSeconds ?? 0)} from target</strong>
            <p>
              This is the split rhythm to protect and reuse around harder race
              sections.
            </p>
          </article>
          <article>
            <span>Strongest station</span>
            <h4>{bestStation?.label ?? "Not clear"}</h4>
            <strong>{describeGoodGap(bestStation?.gap ?? 0)}</strong>
            <p>
              {bestStation
                ? `${formatTime(bestStation.seconds)} against the ${analysis.levelLabel} station benchmark.`
                : "Add station splits to show your strongest benchmark match."}
            </p>
          </article>
          <article>
            <span>Reliable segments</span>
            <h4>
              {strongSegments.length}/{analysis.raceSegments.length}
            </h4>
            <strong>strong or protected</strong>
            <p>
              These sections are not the main limiter, so they should be
              maintained while training the bigger gaps.
            </p>
          </article>
          <article>
            <span>Run control</span>
            <h4>{formatTime(analysis.runVolatilitySeconds)}</h4>
            <strong>split variation</strong>
            <p>
              Lower variation means the run profile is easier to trust when
              setting future targets.
            </p>
          </article>
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
              heatmap, race story, report poster, target simulator, print view,
              and calculation breakdown.
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

          <ReportSection title="Time leak heatmap" premium>
            <TimeLeakHeatmap analysis={analysis} />
          </ReportSection>

          <ReportSection title="Race story" premium>
            <RaceStory analysis={analysis} />
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
      {shareModalOpen ? (
        <div
          className="share-preview-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShareModalOpen(false);
            }
          }}
        >
          <section
            className="share-carousel"
            aria-modal="true"
            role="dialog"
            aria-label="Share options preview"
          >
            <header className="share-carousel__header">
              <div>
                <span>Share preview</span>
                <h3>Choose what to share</h3>
              </div>
              <button type="button" onClick={() => setShareModalOpen(false)}>
                Close
              </button>
            </header>

            <div className="share-carousel__track" aria-label="Swipe share options">
              <article className="share-carousel__slide">
                <div className="share-carousel__copy-preview">
                  <img src="/brand/reprun-logo-09-wordmark.svg" alt="RepRun" />
                  <p>{analysis.report}</p>
                </div>
                <div className="share-carousel__content">
                  <span>Text summary</span>
                  <h4>Copy a clean report summary</h4>
                  <p>Best for notes, messages, or sending to a coach.</p>
                  <button type="button" onClick={() => void copyReport()}>
                    Copy summary
                  </button>
                </div>
              </article>

              <article className="share-carousel__slide">
                <div className="share-preview__report">
                  <img src="/brand/reprun-logo-09-wordmark.svg" alt="RepRun" />
                  <div>
                    <span>Projected finish</span>
                    <strong>{formatTime(analysis.finishSeconds)}</strong>
                  </div>
                  <div>
                    <span>Target path</span>
                    <strong>{formatTime(analysis.predictedTargetSeconds)}</strong>
                  </div>
                <div>
                  <span>Avg run</span>
                  <strong>{averageRunPace}</strong>
                </div>
                  <p>
                    The full report image includes the current report panel,
                    charts, premium sections, and calculation detail.
                  </p>
                </div>
                <div className="share-carousel__content">
                  <span>Full report image</span>
                  <h4>Share the complete report view</h4>
                  <p>Best for saving the whole analysis as one image.</p>
                  <button type="button" onClick={() => void shareReport()}>
                    Share full report image
                  </button>
                </div>
              </article>

              <article className="share-carousel__slide share-carousel__slide--poster">
                <div className="share-preview__poster">
                  <div className="share-preview__poster-mini">
                    <PremiumReportPoster
                      analysis={analysis}
                      distanceUnit={distanceUnit}
                    />
                  </div>
                </div>
                <div className="share-carousel__content">
                  <span>Story poster</span>
                  <h4>Share the social poster</h4>
                  <p>Best for Instagram stories, WhatsApp, or quick updates.</p>
                  <div className="share-carousel__buttons">
                    <button
                      type="button"
                      onClick={() => void copyPosterImage()}
                    >
                      Copy poster
                    </button>
                    <button
                      type="button"
                      onClick={() => void sharePosterImage()}
                    >
                      Share poster
                    </button>
                  </div>
                </div>
              </article>

              <article className="share-carousel__slide">
                <div className="share-carousel__file-preview">
                  <span>TXT</span>
                  <strong>reprun-race-report.txt</strong>
                  <p>Plain text export with targets, leaks, and rankings.</p>
                </div>
                <div className="share-carousel__content">
                  <span>Text file</span>
                  <h4>Download the report data</h4>
                  <p>Best for keeping a local copy or pasting into training logs.</p>
                  <button type="button" onClick={downloadReport}>
                    Download .txt
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>
      ) : null}
      {fullReportUnlocked ? (
        <div className="share-poster-capture" aria-hidden="true">
          <PremiumReportPoster
            analysis={analysis}
            distanceUnit={distanceUnit}
            captureRef={sharePosterCaptureRef}
          />
        </div>
      ) : null}
    </aside>
  );
}
