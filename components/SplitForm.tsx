import { FormEvent } from "react";
import {
  Level,
  StationKey,
  levelLabels,
  stations,
} from "@/lib/analysis";

type SplitFormProps = {
  goal: string;
  targetTime: string;
  level: Level;
  runs: string[];
  stationSplits: Record<StationKey, string>;
  errors: string[];
  fieldErrors: Record<string, string>;
  onGoalChange: (value: string) => void;
  onTargetTimeChange: (value: string) => void;
  onLevelChange: (value: Level) => void;
  onRunChange: (index: number, value: string) => void;
  onStationChange: (key: StationKey, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SplitForm({
  goal,
  targetTime,
  level,
  runs,
  stationSplits,
  errors,
  fieldErrors,
  onGoalChange,
  onTargetTimeChange,
  onLevelChange,
  onRunChange,
  onStationChange,
  onSubmit,
}: SplitFormProps) {
  return (
    <form className="split-form" onSubmit={onSubmit}>
      <div className="section-heading">
        <p className="eyebrow">Race Input</p>
        <h2>Your splits</h2>
      </div>

      {errors.length > 0 ? (
        <div className="form-errors" role="alert">
          <h3>Fix these before generating</h3>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="input-row">
        <label className="field">
          <span>Goal</span>
          <input
            value={goal}
            onChange={(event) => onGoalChange(event.target.value)}
            placeholder="Sub 1:25 at my next race"
          />
        </label>

        <label className="field">
          <span>Target time</span>
          <input
            className={fieldErrors.targetTime ? "is-invalid" : undefined}
            value={targetTime}
            onChange={(event) => onTargetTimeChange(event.target.value)}
            inputMode="numeric"
            placeholder="1:25:00"
            aria-invalid={Boolean(fieldErrors.targetTime)}
          />
          {fieldErrors.targetTime ? (
            <small className="field-error">{fieldErrors.targetTime}</small>
          ) : null}
        </label>
      </div>

      <label className="field field--wide">
        <span>Athlete level</span>
        <select
          value={level}
          onChange={(event) => onLevelChange(event.target.value as Level)}
        >
          {Object.entries(levelLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="split-group">
        <h3>Run splits</h3>
        <div className="split-grid">
          {runs.map((split, index) => (
            <label className="field" key={`run-${index + 1}`}>
              <span>Run {index + 1}</span>
              <input
                className={fieldErrors[`run-${index}`] ? "is-invalid" : undefined}
                value={split}
                onChange={(event) => onRunChange(index, event.target.value)}
                inputMode="numeric"
                placeholder="5:30"
                aria-invalid={Boolean(fieldErrors[`run-${index}`])}
              />
              {fieldErrors[`run-${index}`] ? (
                <small className="field-error">
                  {fieldErrors[`run-${index}`]}
                </small>
              ) : null}
            </label>
          ))}
        </div>
      </div>

      <div className="split-group">
        <h3>Stations</h3>
        <div className="split-grid">
          {stations.map((station) => (
            <label className="field" key={station.key}>
              <span>{station.label}</span>
              <input
                className={
                  fieldErrors[`station-${station.key}`] ? "is-invalid" : undefined
                }
                value={stationSplits[station.key]}
                onChange={(event) =>
                  onStationChange(station.key, event.target.value)
                }
                inputMode="numeric"
                placeholder="5:00"
                aria-invalid={Boolean(fieldErrors[`station-${station.key}`])}
              />
              {fieldErrors[`station-${station.key}`] ? (
                <small className="field-error">
                  {fieldErrors[`station-${station.key}`]}
                </small>
              ) : null}
            </label>
          ))}
        </div>
      </div>

      <button type="submit">Generate race report</button>
    </form>
  );
}
