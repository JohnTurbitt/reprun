import { FormEvent, useState } from "react";
import { Level, levelLabels } from "@/lib/analysis";
import { AuthFormInput, AuthUser, ProfileFormInput } from "@/lib/apiClient";
import { PremiumBadge } from "./PremiumBadge";

type AuthPanelProps = {
  user: AuthUser | null;
  loading: boolean;
  billingLoading: boolean;
  onLogin: (input: AuthFormInput) => Promise<void>;
  onSignup: (input: AuthFormInput) => Promise<void>;
  onLogout: () => Promise<void>;
  onManageBilling: () => void;
  onSaveProfile: (input: ProfileFormInput) => Promise<void>;
};

type AuthMode = "login" | "signup";

const subscriptionLabels: Record<AuthUser["subscription"], string> = {
  ACTIVE: "Paid access",
  CANCELED: "Subscription canceled",
  FREE: "Free account",
  PAST_DUE: "Payment past due",
};

export function AuthPanel({
  user,
  loading,
  billingLoading,
  onLogin,
  onSignup,
  onLogout,
  onManageBilling,
  onSaveProfile,
}: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileLevel, setProfileLevel] = useState<Level>("competitive");
  const [profileTargetTime, setProfileTargetTime] = useState("1:25:00");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "signup") {
        await onSignup({ email, password, name });
      } else {
        await onLogin({ email, password });
      }

      setPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  if (user) {
    const canManageBilling = user.subscription !== "FREE";

    return (
      <aside className="auth-panel auth-panel--signed-in">
        <div className="auth-panel__identity">
          <div>
            <span>Signed in</span>
            <strong>{user.name || user.email}</strong>
            <p>
              {subscriptionLabels[user.subscription]}{" "}
              {user.subscription === "ACTIVE" ? <PremiumBadge /> : null}
            </p>
          </div>
          <p>
            Defaults: {levelLabels[user.defaultLevel]}, {user.defaultTargetTime}
          </p>
        </div>
        <div className="auth-panel__actions">
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              setProfileName(user.name ?? "");
              setProfileLevel(user.defaultLevel);
              setProfileTargetTime(user.defaultTargetTime);
              setProfileOpen((isOpen) => !isOpen);
            }}
            disabled={loading}
          >
            Profile settings
          </button>
          {canManageBilling ? (
            <button
              className="button-secondary"
              type="button"
              onClick={onManageBilling}
              disabled={loading || billingLoading}
            >
              {billingLoading ? "Opening..." : "Manage billing"}
            </button>
          ) : null}
          <button
            className="button-secondary"
            type="button"
            onClick={() => void onLogout()}
            disabled={loading}
          >
            Log out
          </button>
        </div>
        {profileOpen ? (
          <form
            className="profile-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitting(true);

              try {
                await onSaveProfile({
                  name: profileName,
                  defaultLevel: profileLevel,
                  defaultTargetTime: profileTargetTime,
                });
                setProfileOpen(false);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <label className="field">
              <span>Name</span>
              <input
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Runner name"
              />
            </label>
            <label className="field">
              <span>Default athlete level</span>
              <select
                value={profileLevel}
                onChange={(event) => setProfileLevel(event.target.value as Level)}
              >
                {Object.entries(levelLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Default target time</span>
              <input
                value={profileTargetTime}
                onChange={(event) => setProfileTargetTime(event.target.value)}
                inputMode="numeric"
                placeholder="1:25:00"
              />
            </label>
            <button type="submit" disabled={submitting || loading}>
              {submitting ? "Saving..." : "Save profile"}
            </button>
          </form>
        ) : null}
      </aside>
    );
  }

  return (
    <aside className="auth-panel">
      <div className="auth-panel__signed-out">
        <p>Save reports and unlock paid race analytics.</p>
        <div className="auth-panel__switch" aria-label="Auth mode">
          <button
            className={mode === "login" ? "is-active" : undefined}
            type="button"
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "is-active" : undefined}
            type="button"
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>
      </div>

      {mode ? (
        <form
          className={
            mode === "signup"
              ? "auth-panel__form auth-panel__form--signup"
              : "auth-panel__form auth-panel__form--login"
          }
          onSubmit={handleSubmit}
        >
          {mode === "signup" ? (
            <label className="field">
              <span>Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Test Runner"
              />
            </label>
          ) : null}
          <label className="field auth-panel__email-field">
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="runner@example.com"
              type="email"
            />
          </label>
          <label className="field auth-panel__password-field">
            <span>Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              type="password"
            />
          </label>
          <button type="submit" disabled={submitting || loading}>
            {submitting
              ? "Working..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
      ) : null}
    </aside>
  );
}
