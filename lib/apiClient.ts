import { Level, StationKey } from "./analysis";
import { SavedReport } from "./reportStorage";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  subscription: "FREE" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  createdAt: string;
};

export type AuthFormInput = {
  email: string;
  password: string;
  name?: string;
};

export type ReportRequestInput = {
  goal: string;
  targetTime: string;
  level: Level;
  runs: string[];
  stationSplits: Record<StationKey, string>;
};

async function readApiResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errors = Array.isArray(body.errors)
      ? body.errors
      : ["The server could not complete that request."];

    throw new Error(errors.join(" "));
  }

  return body as T;
}

export async function getCurrentUser() {
  const response = await fetch("/api/auth/me");
  const body = await readApiResponse<{ user: AuthUser | null }>(response);

  return body.user;
}

export async function signUp(input: AuthFormInput) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readApiResponse<{ user: AuthUser }>(response);

  return body.user;
}

export async function logIn(input: AuthFormInput) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readApiResponse<{ user: AuthUser }>(response);

  return body.user;
}

export async function logOut() {
  const response = await fetch("/api/auth/logout", { method: "POST" });

  await readApiResponse<{ ok: true }>(response);
}

export async function loadRemoteReports() {
  const response = await fetch("/api/reports");
  const body = await readApiResponse<{ reports: SavedReport[] }>(response);

  return body.reports;
}

export async function saveRemoteReport(input: ReportRequestInput) {
  const response = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readApiResponse<{ report: SavedReport }>(response);

  return body.report;
}

export async function deleteRemoteReport(reportId: string) {
  const response = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });

  await readApiResponse<{ ok: true }>(response);
}
