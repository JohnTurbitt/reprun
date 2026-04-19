import { Analysis, clamp, formatTime, parseTime } from "@/lib/analysis";
import { Hint } from "./Hint";

type TargetSimulatorProps = {
  analysis: Analysis;
  runGainPerKm: string;
  stationGain: string;
  transitionGain: string;
  showHints: boolean;
  onRunGainPerKmChange: (value: string) => void;
  onStationGainChange: (value: string) => void;
  onTransitionGainChange: (value: string) => void;
};

export function TargetSimulator({
  analysis,
  runGainPerKm,
  stationGain,
  transitionGain,
  showHints,
  onRunGainPerKmChange,
  onStationGainChange,
  onTransitionGainChange,
}: TargetSimulatorProps) {
  const simulatedRunGain = clamp(Number(runGainPerKm) || 0, 0, 90) * 8;
  const simulatedStationGain = clamp(parseTime(stationGain), 0, 900);
  const simulatedTransitionGain = clamp(parseTime(transitionGain), 0, 300);
  const simulatedSavings =
    simulatedRunGain + simulatedStationGain + simulatedTransitionGain;
  const simulatedFinish = Math.max(analysis.finishSeconds - simulatedSavings, 0);
  const simulatedTargetGap = Math.max(
    simulatedFinish - analysis.targetSeconds,
    0,
  );

  return (
    <div className="simulator">
      <div className="simulator__inputs">
        <label className="field">
          <span>
            Run <Hint enabled={showHints} hint="gain" term="gain" /> per km
          </span>
          <input
            value={runGainPerKm}
            onChange={(event) => onRunGainPerKmChange(event.target.value)}
            inputMode="numeric"
            placeholder="8"
          />
        </label>
        <label className="field">
          <span>
            Station <Hint enabled={showHints} hint="gain" term="gain" />
          </span>
          <input
            value={stationGain}
            onChange={(event) => onStationGainChange(event.target.value)}
            inputMode="numeric"
            placeholder="2:30"
          />
        </label>
        <label className="field">
          <span>
            <Hint enabled={showHints} hint="transition" term="Transition" />{" "}
            <Hint enabled={showHints} hint="gain" term="gain" />
          </span>
          <input
            value={transitionGain}
            onChange={(event) => onTransitionGainChange(event.target.value)}
            inputMode="numeric"
            placeholder="0:45"
          />
        </label>
      </div>
      <div className="simulator__result">
        <span>Projected finish</span>
        <strong>{formatTime(simulatedFinish)}</strong>
        <p>
          {formatTime(simulatedSavings)} saved.{" "}
          {simulatedTargetGap > 0
            ? `${formatTime(simulatedTargetGap)} still to find.`
            : "This beats the entered target."}
        </p>
      </div>
    </div>
  );
}
