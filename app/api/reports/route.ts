import { NextRequest, NextResponse } from "next/server";
import { buildAnalysis, Level, StationKey, stations } from "@/lib/analysis";
import { requireCurrentUser } from "@/lib/apiAuth";
import { readString } from "@/lib/apiValidation";
import { prisma } from "@/lib/prisma";
import {
  toPersistableRaceReport,
  toSavedReport,
} from "@/lib/reportPersistence";
import { validateReportInput } from "@/lib/validation";

const levels: Level[] = ["starter", "competitive", "elite"];

type ReportPayload = {
  goal: string;
  targetTime: string;
  level: Level;
  runs: string[];
  stationSplits: Record<StationKey, string>;
};

function parseReportPayload(payload: unknown): {
  errors: string[];
  value?: ReportPayload;
} {
  // Treat the request body as untrusted JSON and rebuild the typed report input
  // before running validation or analysis.
  const record = typeof payload === "object" && payload ? payload : {};
  const goal = readString((record as Record<string, unknown>).goal);
  const targetTime = readString((record as Record<string, unknown>).targetTime);
  const levelValue = readString((record as Record<string, unknown>).level);
  const runsValue = (record as Record<string, unknown>).runs;
  const stationValue = (record as Record<string, unknown>).stationSplits;
  const errors: string[] = [];

  if (!goal) {
    errors.push("Goal is required.");
  }

  if (!levels.includes(levelValue as Level)) {
    errors.push("Choose a valid athlete level.");
  }

  if (!Array.isArray(runsValue) || runsValue.length !== 8) {
    errors.push("Add exactly eight run splits.");
  }

  const runs = Array.isArray(runsValue) ? runsValue.map(readString) : [];
  const stationRecord =
    typeof stationValue === "object" && stationValue
      ? (stationValue as Record<string, unknown>)
      : {};
  const stationSplits = stations.reduce(
    (splits, station) => ({
      ...splits,
      [station.key]: readString(stationRecord[station.key]),
    }),
    {} as Record<StationKey, string>,
  );
  const timeValidation = validateReportInput({
    targetTime,
    runs,
    stationSplits,
  });

  errors.push(...timeValidation.errors);

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    value: {
      goal,
      targetTime,
      level: levelValue as Level,
      runs,
      stationSplits,
    },
  };
}

export async function GET(request: NextRequest) {
  const user = await requireCurrentUser(request);

  if (!user) {
    return NextResponse.json({ errors: ["Sign in required."] }, { status: 401 });
  }

  const reports = await prisma.raceReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    // This endpoint powers history lists, not full archival exports.
    take: 50,
  });

  return NextResponse.json({
    reports: reports.map((report) =>
      toSavedReport({
        id: report.id,
        createdAt: report.createdAt,
        goal: report.goal,
        targetTime: report.targetTime,
        athleteLevel: report.athleteLevel,
        runSplits: report.runSplits,
        stationSplits: report.stationSplits as Record<StationKey, string>,
        finishSeconds: report.finishSeconds,
        predictedTargetSeconds: report.predictedTargetSeconds,
        topLeakLabel: report.topLeakLabel,
      }),
    ),
  });
}

export async function POST(request: NextRequest) {
  const user = await requireCurrentUser(request);

  if (!user) {
    return NextResponse.json({ errors: ["Sign in required."] }, { status: 401 });
  }

  const parsed = parseReportPayload(await request.json().catch(() => null));

  if (!parsed.value) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  // Recompute analysis server-side instead of trusting client-submitted totals.
  // That keeps saved reports consistent with the current deterministic model.
  const analysis = buildAnalysis(
    parsed.value.goal,
    parsed.value.targetTime,
    parsed.value.level,
    parsed.value.runs,
    parsed.value.stationSplits,
  );
  const reportData = toPersistableRaceReport({ ...parsed.value, analysis });
  const report = await prisma.raceReport.create({
    data: {
      userId: user.id,
      goal: reportData.goal,
      targetTime: reportData.targetTime,
      athleteLevel: reportData.athleteLevel,
      runSplits: reportData.runSplits,
      stationSplits: reportData.stationSplits,
      finishSeconds: reportData.finishSeconds,
      predictedTargetSeconds: reportData.predictedTargetSeconds,
      topLeakLabel: reportData.topLeakLabel,
      analysisSnapshot: reportData.analysisSnapshot,
    },
  });

  return NextResponse.json(
    {
      report: toSavedReport({
        ...reportData,
        id: report.id,
        createdAt: report.createdAt,
      }),
    },
    { status: 201 },
  );
}
