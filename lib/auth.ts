import bcrypt from "bcryptjs";

const passwordSaltRounds = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, passwordSaltRounds);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
