export type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readString(value: unknown) {
  // Route handlers receive unknown JSON. Normalize strings at the edge before
  // passing values into domain logic.
  return typeof value === "string" ? value.trim() : "";
}

export function validateAuthPayload(payload: unknown): {
  valid: boolean;
  errors: string[];
  value?: AuthPayload;
} {
  const record = typeof payload === "object" && payload ? payload : {};
  const email = readString((record as Record<string, unknown>).email);
  const password = readString((record as Record<string, unknown>).password);
  const name = readString((record as Record<string, unknown>).name);
  const errors: string[] = [];

  if (!emailPattern.test(email)) {
    errors.push("Enter a valid email address.");
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors,
    value: {
      email,
      password,
      name: name || undefined,
    },
  };
}
