import { AdmissionError } from "./errors";

export const DEFAULT_INVITATION_TTL_DAYS = 7;
export const MIN_INVITATION_TTL_DAYS = 1;
export const MAX_INVITATION_TTL_DAYS = 30;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(rawEmail: string): string {
  const normalized = rawEmail.trim().toLowerCase();
  if (!normalized || normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
    throw new AdmissionError("INVALID_EMAIL", "A valid email address is required.", 400);
  }
  return normalized;
}

export function validatePasswordPolicy(password: string): void {
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new AdmissionError(
      "WEAK_PASSWORD",
      `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
      400,
    );
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasLetter || !hasDigit) {
    throw new AdmissionError(
      "WEAK_PASSWORD",
      "Password must contain at least one letter and one number.",
      400,
    );
  }
}

export function normalizeDisplayName(name: string): string {
  const trimmed = (name ?? "").trim();
  if (trimmed.length < 2 || trimmed.length > 80) {
    throw new AdmissionError(
      "INVALID_NAME",
      "Display name must be between 2 and 80 characters.",
      400,
    );
  }
  return trimmed;
}

export function computeExpirationDate(
  expiresInDays = DEFAULT_INVITATION_TTL_DAYS,
  now = new Date(),
): Date {
  if (
    !Number.isInteger(expiresInDays) ||
    expiresInDays < MIN_INVITATION_TTL_DAYS ||
    expiresInDays > MAX_INVITATION_TTL_DAYS
  ) {
    throw new AdmissionError(
      "INVALID_TTL",
      `Invitation expiration must be an integer between ${MIN_INVITATION_TTL_DAYS} and ${MAX_INVITATION_TTL_DAYS} days.`,
      400,
    );
  }

  return new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
}
