import { Analysis, formatTime } from "@/lib/analysis";

type CalculationExplainerProps = {
  analysis: Analysis;
};

export function CalculationExplainer({ analysis }: CalculationExplainerProps) {
  const primaryLeak = analysis.topLeaks[0];

  return (
    <section className="calculation-explainer">
      <div>
        <p className="eyebrow">Calculations</p>
        <h3>How RepRun scores this race</h3>
        <p>
          The report is built from fixed formulas. The model compares each split
          with a benchmark, estimates how much time is realistically recoverable,
          then ranks the highest-impact leaks.
        </p>
      </div>

      <div className="formula-grid">
        <article>
          <span>Station leak</span>
          <strong>split - benchmark</strong>
          <p>
            Example: {primaryLeak?.label ?? "Top leak"} is currently worth{" "}
            {formatTime(primaryLeak?.leakSeconds ?? 0)} against the selected
            level.
          </p>
        </article>

        <article>
          <span>Recoverable time</span>
          <strong>leak x recoverability</strong>
          <p>
            RepRun estimates {formatTime(primaryLeak?.recoverableSeconds ?? 0)}
            {" "}could be won back from the top leak with focused training.
          </p>
        </article>

        <article>
          <span>Priority score</span>
          <strong>leak x recoverability x impact</strong>
          <p>
            Higher scores move to the top because they are more likely to affect
            total finish time.
          </p>
        </article>

        <article>
          <span>Run fade</span>
          <strong>runs 5-8 avg - runs 1-4 avg</strong>
          <p>
            This race fades by {formatTime(analysis.runFadeSeconds)} per km in
            the second half.
          </p>
        </article>
      </div>
    </section>
  );
}
