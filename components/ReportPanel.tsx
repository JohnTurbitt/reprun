import { Analysis, formatTime } from "@/lib/analysis";
import { Hint } from "./Hint";
import { TargetSimulator } from "./TargetSimulator";

type ReportPanelProps = {
  analysis: Analysis;
  hasGeneratedReport: boolean;
  showHints: boolean;
  runGainPerKm: string;
  stationGain: string;
  transitionGain: string;
  onRunGainPerKmChange: (value: string) => void;
  onStationGainChange: (value: string) => void;
  onTransitionGainChange: (value: string) => void;
};

export function ReportPanel({
  analysis,
  hasGeneratedReport,
  showHints,
  runGainPerKm,
  stationGain,
  transitionGain,
  onRunGainPerKmChange,
  onStationGainChange,
  onTransitionGainChange,
}: ReportPanelProps) {
  return (
    <aside className="report" aria-live="polite">
      <div className="section-heading">
        <p className="eyebrow">Math Engine</p>
        <h2>{hasGeneratedReport ? "Your race breakdown" : "Live preview"}</h2>
      </div>
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
        {analysis.topLeaks.map((leak, index) => (
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
        {analysis.priorities.map((priority) => (
          <li key={priority}>{priority}</li>
        ))}
      </ol>

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
    </aside>
  );
}
