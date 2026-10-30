import { createHash, randomBytes } from "node:crypto";
import { AdmissionError } from "./errors";

const TOKEN_BYTE_LENGTH = 32;

export function generateInvitationToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = randomBytes(TOKEN_BYTE_LENGTH).toString("base64url");
  const tokenHash = hashInvitationToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashInvitationToken(rawToken: string): string {
  const trimmed = (rawToken ?? "").trim();
  if (!trimmed || trimmed.length < 16) {
    throw new AdmissionError("INVITATION_INVALID", "Invitation token is invalid.", 404);
  }
  return createHash("sha256").update(trimmed).digest("hex");
}

export function buildInvitationUrl(rawToken: string, baseUrl?: string): string {
  const origin = (
    baseUrl ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3100"
  ).replace(/\/$/, "");
  return `${origin}/invite/${encodeURIComponent(rawToken)}`;
}
