export type AdmissionErrorCode =
  | "PUBLIC_REGISTRATION_DISABLED"
  | "INVITATION_REQUIRED"
  | "INVITATION_INVALID"
  | "INVITATION_EXPIRED"
  | "INVITATION_REVOKED"
  | "INVITATION_ALREADY_USED"
  | "INVITATION_EMAIL_MISMATCH"
  | "USER_ALREADY_EXISTS"
  | "INVALID_EMAIL"
  | "WEAK_PASSWORD"
  | "INVALID_NAME"
  | "INVALID_TTL"
  | "UNAUTHORIZED"
  | "FORBIDDEN_ADMIN_ONLY"
  | "ACCOUNT_DISABLED"
  | "INVALID_CREDENTIALS"
  | "BOOTSTRAP_ALREADY_COMPLETED"
  | "NOT_FOUND";

export class AdmissionError extends Error {
  readonly code: AdmissionErrorCode;
  readonly httpStatus: number;

  constructor(code: AdmissionErrorCode, message: string, httpStatus = 400) {
    super(message);
    this.name = "AdmissionError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export function isAdmissionError(error: unknown): error is AdmissionError {
  return error instanceof AdmissionError;
}
