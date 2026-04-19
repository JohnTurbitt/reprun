import { formatTime, levelLabels } from "@/lib/analysis";
import { SavedReport } from "@/lib/reportStorage";

type ReportHistoryProps = {
  reports: SavedReport[];
  onLoadReport: (report: SavedReport) => void;
  onDeleteReport: (reportId: string) => void;
};

export function ReportHistory({
  reports,
  onLoadReport,
  onDeleteReport,
}: ReportHistoryProps) {
  return (
    <section className="report-history">
      <div className="section-heading">
        <p className="eyebrow">Previous Reports</p>
        <h2>Saved in this browser</h2>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <h3>No reports saved yet</h3>
          <p>
            Generate a race report and RepRun will keep it here on this device.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {reports.map((report) => (
            <article className="history-card" key={report.id}>
              <div>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                <h3>{report.goal || "Race report"}</h3>
                <p>
                  {levelLabels[report.level]} · Top leak:{" "}
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
                <button type="button" onClick={() => onLoadReport(report)}>
                  Load report
                </button>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => onDeleteReport(report.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
