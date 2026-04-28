import { FormEvent, useState } from "react";
import { AuthFormInput, AuthUser } from "@/lib/apiClient";

type AuthPanelProps = {
  user: AuthUser | null;
  loading: boolean;
  onLogin: (input: AuthFormInput) => Promise<void>;
  onSignup: (input: AuthFormInput) => Promise<void>;
  onLogout: () => Promise<void>;
};

type AuthMode = "login" | "signup";

export function AuthPanel({
  user,
  loading,
  onLogin,
  onSignup,
  onLogout,
}: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
    return (
      <aside className="auth-panel auth-panel--signed-in">
        <div>
          <span>Signed in</span>
          <strong>{user.name || user.email}</strong>
          <p>{user.subscription === "ACTIVE" ? "Paid access" : "Free account"}</p>
        </div>
        <button
          className="button-secondary"
          type="button"
          onClick={() => void onLogout()}
          disabled={loading}
        >
          Log out
        </button>
      </aside>
    );
  }

  return (
    <aside className="auth-panel">
      <div className="auth-panel__heading">
        <div>
          <p className="eyebrow">Account</p>
          <h2>{mode === "signup" ? "Create account" : "Sign in"}</h2>
        </div>
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

      <form className="auth-panel__form" onSubmit={handleSubmit}>
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
        <label className="field">
          <span>Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="runner@example.com"
            type="email"
          />
        </label>
        <label className="field">
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
    </aside>
  );
}
