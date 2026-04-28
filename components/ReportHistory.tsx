import { formatTime, levelLabels } from "@/lib/analysis";
import { SavedReport } from "@/lib/reportStorage";

type ReportHistoryProps = {
  reports: SavedReport[];
  storageLabel: string;
  loading: boolean;
  onLoadReport: (report: SavedReport) => void;
  onDeleteReport: (reportId: string) => void | Promise<void>;
};

export function ReportHistory({
  reports,
  storageLabel,
  loading,
  onLoadReport,
  onDeleteReport,
}: ReportHistoryProps) {
  return (
    <section className="report-history">
      <div className="section-heading">
        <p className="eyebrow">Previous Reports</p>
        <h2>{storageLabel}</h2>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading reports</h3>
          <p>RepRun is checking the saved history for this account.</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <h3>No reports saved yet</h3>
          <p>
            Generate a race report and RepRun will keep it in this history.
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
                  onClick={() => void onDeleteReport(report.id)}
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
