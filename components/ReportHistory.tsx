import { useMemo, useState } from "react";
import { buildAnalysis, formatTime, levelLabels } from "@/lib/analysis";
import { getRaceFormatStations } from "@/lib/raceFormats";
import { SavedReport } from "@/lib/reportStorage";

type ReportHistoryProps = {
  reports: SavedReport[];
  storageLabel: string;
  loading: boolean;
  onLoadReport: (report: SavedReport) => void;
  onDeleteReport: (reportId: string) => void | Promise<void>;
};

function analyzeSavedReport(report: SavedReport) {
  const raceFormat = report.raceFormat ?? "hyrox";

  return buildAnalysis(
    report.goal,
    report.targetTime,
    report.level,
    report.runs,
    report.stationSplits,
    report.stationDefinitions ?? getRaceFormatStations(raceFormat),
    raceFormat,
  );
}

function formatChange(seconds: number) {
  if (seconds === 0) {
    return "No change";
  }

  return `${seconds > 0 ? "-" : "+"}${formatTime(Math.abs(seconds))}`;
}

function describeChange(seconds: number) {
  if (seconds > 0) {
    return "faster";
  }

  if (seconds < 0) {
    return "slower";
  }

  return "unchanged";
}

export function ReportHistory({
  reports,
  storageLabel,
  loading,
  onLoadReport,
  onDeleteReport,
}: ReportHistoryProps) {
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const comparison = useMemo(() => {
    if (selectedReportIds.length !== 2) {
      return null;
    }

    const selectedReports = selectedReportIds
      .map((id) => reports.find((report) => report.id === id))
      .filter((report): report is SavedReport => Boolean(report))
      .sort(
        (first, second) =>
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime(),
      );

    if (selectedReports.length !== 2) {
      return null;
    }

    const [baseline, current] = selectedReports;
    const baselineAnalysis = analyzeSavedReport(baseline);
    const currentAnalysis = analyzeSavedReport(current);
    const finishChange =
      baselineAnalysis.finishSeconds - currentAnalysis.finishSeconds;
    const targetGapChange =
      baselineAnalysis.targetGapSeconds - currentAnalysis.targetGapSeconds;
    const averageRunChange =
      baselineAnalysis.averageRunSeconds - currentAnalysis.averageRunSeconds;
    const runTotalChange =
      baselineAnalysis.totalRunSeconds - currentAnalysis.totalRunSeconds;
    const stationTotalChange =
      baselineAnalysis.totalStationSeconds - currentAnalysis.totalStationSeconds;
    const bestArea =
      Math.abs(runTotalChange) >= Math.abs(stationTotalChange)
        ? "run pacing"
        : "station execution";

    return {
      averageRunChange,
      baseline,
      baselineAnalysis,
      bestArea,
      current,
      currentAnalysis,
      finishChange,
      targetGapChange,
    };
  }, [reports, selectedReportIds]);

  function toggleComparison(reportId: string) {
    setSelectedReportIds((current) => {
      if (current.includes(reportId)) {
        return current.filter((id) => id !== reportId);
      }

      return [reportId, ...current].slice(0, 2);
    });
  }

  return (
    <section className="report-history">
      <div className="section-heading">
        <p className="eyebrow">Previous reports</p>
        <h2>{storageLabel}</h2>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading reports</h3>
          <p>Ocht is checking the saved history for this account.</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <h3>No reports saved yet</h3>
          <p>Generate a race report and Ocht will keep it in this history.</p>
        </div>
      ) : (
        <>
          <div className="history-compare">
            <div>
              <span>Compare reports</span>
              <h3>
                {comparison
                  ? `${comparison.baseline.goal || "Earlier report"} vs ${
                      comparison.current.goal || "Latest report"
                    }`
                  : "Select two reports"}
              </h3>
              <p>
                Pick any two saved reports to see what changed in finish time,
                target pressure, run pace, and biggest leak.
              </p>
            </div>

            {comparison ? (
              <div className="history-compare__panel">
                <div>
                  <span>Finish change</span>
                  <strong>{formatChange(comparison.finishChange)}</strong>
                  <small>{describeChange(comparison.finishChange)}</small>
                </div>
                <div>
                  <span>Time to find</span>
                  <strong>{formatChange(comparison.targetGapChange)}</strong>
                  <small>{describeChange(comparison.targetGapChange)}</small>
                </div>
                <div>
                  <span>Avg run</span>
                  <strong>{formatChange(comparison.averageRunChange)}</strong>
                  <small>{describeChange(comparison.averageRunChange)}</small>
                </div>
                <div>
                  <span>Best movement</span>
                  <strong>{comparison.bestArea}</strong>
                  <small>
                    Runs {formatChange(comparison.averageRunChange)} avg
                  </small>
                </div>
                <p>
                  Biggest leak changed from{" "}
                  <strong>
                    {comparison.baselineAnalysis.topLeaks[0]?.label ?? "not clear"}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {comparison.currentAnalysis.topLeaks[0]?.label ?? "not clear"}
                  </strong>
                  .
                </p>
              </div>
            ) : (
              <p className="history-compare__empty">
                {selectedReportIds.length === 0
                  ? "No reports selected."
                  : "Select one more report to compare."}
              </p>
            )}
          </div>

          <div className="history-list">
            {reports.map((report) => {
              const selected = selectedReportIds.includes(report.id);

              return (
                <article
                  className={selected ? "history-card is-selected" : "history-card"}
                  key={report.id}
                >
                  <div>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    <h3>{report.goal || "Race report"}</h3>
                    <p>
                      {levelLabels[report.level]} - Top leak:{" "}
                      {report.topLeakLabel || "Not available"}
                    </p>
                  </div>
                  <div className="history-card__metrics">
                    <div>
                      <span>Finish</span>
                      <strong>{formatTime(report.finishSeconds)}</strong>
                    </div>
                    <div>
                      <span>Next target</span>
                      <strong>{formatTime(report.predictedTargetSeconds)}</strong>
                    </div>
                  </div>
                  <div className="history-card__actions">
                    <button
                      className={
                        selected ? "button-secondary is-selected" : "button-secondary"
                      }
                      type="button"
                      onClick={() => toggleComparison(report.id)}
                    >
                      {selected ? "Selected" : "Compare"}
                    </button>
                    <button type="button" onClick={() => onLoadReport(report)}>
                      Load report
                    </button>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => void onDeleteReport(report.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
