"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type BarShapeProps,
} from "recharts";
import { Analysis, RaceSegment, formatTime } from "@/lib/analysis";

type RaceVisualProps = {
  analysis: Analysis;
};

type FlowChartSegment = RaceSegment & {
  actualElapsed: number;
  chartValue: number;
  cumulativeGapSeconds: number;
  displayTime: string;
  phase: string;
  shortLabel: string;
  topLeakRank: number;
};

type FlowBarShapeProps = Partial<BarShapeProps> & {
  selectedSegmentId: string;
  onSegmentHover: (segmentId: string) => void;
  onSegmentSelect: (segmentId: string, shouldScroll: boolean) => void;
};

function segmentStyle(segment: RaceSegment): CSSProperties {
  const targetMarker =
    segment.actualSeconds > 0
      ? Math.min((segment.targetSeconds / segment.actualSeconds) * 100, 100)
      : 100;

  return {
    "--segment-width": `${Math.max(segment.widthPercent, 2.4)}%`,
    "--segment-delay": `${segment.startPercent / 14}s`,
    "--target-marker": `${targetMarker}%`,
    "--lost-zone-opacity": segment.leakSeconds > 0 ? 1 : 0,
  } as CSSProperties;
}

function topVisualSegments(analysis: Analysis) {
  return [...analysis.raceSegments]
    .sort((a, b) => b.leakSeconds - a.leakSeconds)
    .slice(0, 5);
}

function statusLabel(status: RaceSegment["status"]) {
  if (status === "leak") {
    return "Leak";
  }

  if (status === "steady") {
    return "Watch";
  }

  return "Strong";
}

function statusColor(status: RaceSegment["status"]) {
  if (status === "leak") {
    return "var(--red)";
  }

  if (status === "steady") {
    return "var(--mid-green)";
  }

  return "var(--lime)";
}

function shortenLabel(label: string) {
  return label
    .replace("Burpee broad jumps", "Burpees")
    .replace("Sandbag lunges", "Lunges")
    .replace("Farmers carry", "Farmers")
    .replace("Wall balls", "Wall balls")
    .replace("Sled push", "Push")
    .replace("Sled pull", "Pull");
}

function segmentGrade(segment: RaceSegment) {
  if (segment.status === "strong") {
    return segment.leakSeconds === 0 ? "A" : "B";
  }

  if (segment.status === "steady") {
    return "C";
  }

  return segment.intensity > 0.84 ? "D" : "C-";
}

function phaseLabel(index: number, totalSegments: number) {
  const progress = (index + 1) / totalSegments;

  if (progress <= 0.34) {
    return "Opening phase";
  }

  if (progress <= 0.68) {
    return "Middle phase";
  }

  return "Closing phase";
}

function buildCoachRead(segment: RaceSegment, cumulativeGapSeconds: number) {
  const phase = segment.type === "run" ? "run split" : "station split";
  const cumulativeGap = formatTime(Math.max(0, cumulativeGapSeconds));

  if (segment.status === "strong") {
    return `${segment.label} is protecting the target profile. Keep this ${phase} controlled so later race sections do not inherit extra fatigue.`;
  }

  if (segment.status === "steady") {
    return `${segment.label} is a watch zone. It is not the biggest leak, but by this point the race is carrying ${cumulativeGap} of cumulative target pressure.`;
  }

  return `${segment.label} is separating from the target profile. This is a high-value training focus because the race has accumulated ${cumulativeGap} of gap by this point.`;
}

function FlowBarShape({
  x,
  y,
  width,
  height,
  payload,
  selectedSegmentId,
  onSegmentHover,
  onSegmentSelect,
}: FlowBarShapeProps) {
  const segment = payload as FlowChartSegment;
  const barX = Number(x ?? 0);
  const barY = Number(y ?? 0);
  const barWidth = Number(width ?? 0);
  const barHeight = Number(height ?? 0);
  const isSelected = selectedSegmentId === segment.id;
  const lostRatio =
    segment.actualSeconds > 0
      ? Math.min(segment.leakSeconds / segment.actualSeconds, 1)
      : 0;
  const lostWidth = barWidth * lostRatio;
  const labelX = barX + barWidth + 8;
  const labelY = barY + barHeight / 2 + 4;
  const rankX = barX + Math.max(12, barWidth - 10);
  const rankY = barY + barHeight / 2;

  function selectSegment() {
    onSegmentSelect(segment.id, true);
  }

  return (
    <g
      className="race-flow-svg__bar"
      role="button"
      tabIndex={0}
      aria-label={`${segment.label}: ${formatTime(segment.actualSeconds)}`}
      onClick={selectSegment}
      onFocus={() => onSegmentSelect(segment.id, false)}
      onMouseEnter={() => onSegmentHover(segment.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectSegment();
        }
      }}
    >
      <rect
        x={barX}
        y={barY}
        width={barWidth}
        height={barHeight}
        rx={8}
        fill={statusColor(segment.status)}
        stroke={isSelected ? "var(--ink)" : "rgba(11, 18, 15, 0.22)"}
        strokeWidth={isSelected ? 3 : 1}
      />
      {lostWidth > 2 ? (
        <rect
          className="race-flow-svg__lost"
          x={barX + barWidth - lostWidth}
          y={barY}
          width={lostWidth}
          height={barHeight}
          rx={8}
        />
      ) : null}
      {segment.topLeakRank ? (
        <g transform={`translate(${rankX} ${rankY}) rotate(-45)`}>
          <path className="race-flow-svg__leak" d="M0 -9 C5 -4 8 0 8 5 C8 10 4 14 0 14 C-4 14 -8 10 -8 5 C-8 0 -5 -4 0 -9 Z" />
          <text
            className="race-flow-svg__leak-text"
            transform="rotate(45)"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {segment.topLeakRank}
          </text>
        </g>
      ) : null}
      <text
        className="race-flow-svg__time"
        x={labelX}
        y={labelY}
        textAnchor="start"
      >
        {segment.displayTime}
      </text>
    </g>
  );
}

export function RaceFlowMap({ analysis }: RaceVisualProps) {
  const [compactChart, setCompactChart] = useState(false);
  const detailRef = useRef<HTMLElement>(null);
  const cumulativeSegments = useMemo(() => {
    let actualElapsed = 0;
    let targetElapsed = 0;
    const topLeakRanks = new Map(
      [...analysis.raceSegments]
        .sort((a, b) => b.leakSeconds - a.leakSeconds)
        .slice(0, 3)
        .map((segment, index) => [segment.id, index + 1]),
    );

    return analysis.raceSegments.map((segment, index) => {
      actualElapsed += segment.actualSeconds;
      targetElapsed += segment.targetSeconds;

      return {
        ...segment,
        actualElapsed,
        chartValue: segment.actualSeconds,
        cumulativeGapSeconds: Math.max(0, actualElapsed - targetElapsed),
        displayTime: formatTime(segment.actualSeconds),
        phase: phaseLabel(index, analysis.raceSegments.length),
        shortLabel: shortenLabel(segment.label),
        topLeakRank: topLeakRanks.get(segment.id) ?? 0,
      };
    });
  }, [analysis.raceSegments]);
  const defaultSegment = useMemo(
    () =>
      [...cumulativeSegments].sort(
        (a, b) => b.leakSeconds - a.leakSeconds,
      )[0] ?? cumulativeSegments[0],
    [cumulativeSegments],
  );
  const [selectedSegmentId, setSelectedSegmentId] = useState(
    defaultSegment?.id ?? "",
  );
  const selectedSegment =
    cumulativeSegments.find((segment) => segment.id === selectedSegmentId) ??
    defaultSegment;
  const chartHeight = Math.max(
    compactChart ? 500 : 560,
    cumulativeSegments.length * (compactChart ? 26 : 34) +
      (compactChart ? 88 : 118),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");

    setCompactChart(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      setCompactChart(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function selectSegment(segmentId: string, shouldScroll: boolean) {
    setSelectedSegmentId(segmentId);

    if (shouldScroll && compactChart) {
      window.requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  return (
    <div className="race-visual race-flow">
      <div className="race-flow__header">
        <span>Segment</span>
        <span>Split duration</span>
      </div>
      <div className="race-flow__chart" aria-label="Race flow map">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            layout="vertical"
            data={cumulativeSegments}
            margin={
              compactChart
                ? { top: 10, right: 44, bottom: 22, left: 0 }
                : { top: 18, right: 70, bottom: 30, left: 8 }
            }
          >
            <defs>
              <pattern
                id="race-flow-lost-zone"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="8" height="8" fill="rgba(11, 18, 15, 0.12)" />
                <rect width="3" height="8" fill="rgba(255, 255, 255, 0.36)" />
              </pattern>
            </defs>
            <CartesianGrid stroke="var(--line)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => formatTime(Number(value))}
              tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 800 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="shortLabel"
              type="category"
              tick={{
                fill: "var(--muted)",
                fontSize: compactChart ? 10 : 12,
                fontWeight: 800,
              }}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
              width={compactChart ? 68 : 88}
            />
            <Bar
              dataKey="chartValue"
              maxBarSize={compactChart ? 28 : 44}
              shape={
                <FlowBarShape
                  selectedSegmentId={selectedSegment?.id ?? ""}
                  onSegmentHover={setSelectedSegmentId}
                  onSegmentSelect={selectSegment}
                />
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {selectedSegment ? (
        <article
          className={`race-flow__detail race-flow__detail--${selectedSegment.status}`}
          ref={detailRef}
        >
          <div>
            <span>
              {selectedSegment.phase} / {statusLabel(selectedSegment.status)}
            </span>
            <h4>{selectedSegment.label}</h4>
            <p>{buildCoachRead(selectedSegment, selectedSegment.cumulativeGapSeconds)}</p>
          </div>
          <dl>
            <div className="race-flow__grade">
              <dt>Grade</dt>
              <dd>{segmentGrade(selectedSegment)}</dd>
            </div>
            <div>
              <dt>Actual</dt>
              <dd>{formatTime(selectedSegment.actualSeconds)}</dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>{formatTime(selectedSegment.targetSeconds)}</dd>
            </div>
            <div>
              <dt>Leak</dt>
              <dd>{formatTime(selectedSegment.leakSeconds)}</dd>
            </div>
            <div>
              <dt>Race share</dt>
              <dd>{Math.round(selectedSegment.widthPercent)}%</dd>
            </div>
            <div>
              <dt>Cumulative</dt>
              <dd>{formatTime(selectedSegment.actualElapsed)}</dd>
            </div>
            <div>
              <dt>Cum. gap</dt>
              <dd>{formatTime(selectedSegment.cumulativeGapSeconds)}</dd>
            </div>
          </dl>
        </article>
      ) : null}
      <div className="race-visual__legend">
        <span className="race-visual__legend-item race-visual__legend-item--strong">
          Strong
        </span>
        <span className="race-visual__legend-item race-visual__legend-item--steady">
          Watch
        </span>
        <span className="race-visual__legend-item race-visual__legend-item--leak">
          Leak
        </span>
        <span className="race-visual__legend-item race-visual__legend-item--target">
          Lost-time zone
        </span>
        <span className="race-visual__legend-item race-visual__legend-item--pin">
          Leak marker
        </span>
      </div>
    </div>
  );
}

export function TargetGhostOverlay({ analysis }: RaceVisualProps) {
  return (
    <div className="race-visual ghost-overlay">
      {analysis.raceSegments.map((segment) => {
        const targetWidth =
          segment.actualSeconds > 0
            ? Math.max((segment.targetSeconds / segment.actualSeconds) * 100, 8)
            : 0;

        return (
          <div className="ghost-row" key={segment.id}>
            <span>{segment.label}</span>
            <div className="ghost-row__bar">
              <i style={{ width: "100%" }} />
              <b style={{ width: `${Math.min(targetWidth, 100)}%` }} />
            </div>
            <strong>{formatTime(segment.leakSeconds)}</strong>
          </div>
        );
      })}
    </div>
  );
}

export function TimeLeakHeatmap({ analysis }: RaceVisualProps) {
  return (
    <div className="race-visual heatmap">
      {analysis.raceSegments.map((segment) => (
        <article
          className={`heatmap__cell heatmap__cell--${segment.status}`}
          key={segment.id}
          style={{ "--heat": segment.intensity } as CSSProperties}
        >
          <span>{segment.label}</span>
          <strong>{formatTime(segment.leakSeconds)}</strong>
          <small>
            {formatTime(segment.actualSeconds)} actual /{" "}
            {formatTime(segment.targetSeconds)} target
          </small>
        </article>
      ))}
    </div>
  );
}

export function RaceReplayMode({ analysis }: RaceVisualProps) {
  return (
    <div className="race-visual race-replay">
      <div className="race-replay__track" aria-label="Race replay mode">
        {analysis.raceSegments.map((segment) => (
          <div
            className={`race-replay__segment race-replay__segment--${segment.status}`}
            key={segment.id}
            style={segmentStyle(segment)}
          >
            <span>{segment.label}</span>
          </div>
        ))}
      </div>
      <p>
        Replay highlights the race in order. Longer red sections are where the
        target version moves away fastest.
      </p>
    </div>
  );
}

export function PremiumReportPoster({ analysis }: RaceVisualProps) {
  const topSegments = topVisualSegments(analysis);

  return (
    <div className="poster-card">
      <div>
        <span>RepRun premium poster</span>
        <h3>{formatTime(analysis.finishSeconds)}</h3>
        <p>
          Target path: {formatTime(analysis.predictedTargetSeconds)} with{" "}
          {formatTime(analysis.recoverableSeconds)} realistic gain.
        </p>
      </div>
      <div className="poster-card__fingerprint">
        {topSegments.map((segment) => (
          <i
            key={segment.id}
            style={{ height: `${28 + segment.intensity * 72}%` }}
            title={segment.label}
          />
        ))}
      </div>
      <strong>{analysis.topLeaks[0]?.label ?? "No clear leak"}</strong>
    </div>
  );
}
