import type { PrismaClient, User } from "@prisma/client";
import { recordAuditLog } from "./audit";
import { AdmissionError } from "./errors";
import { verifyPassword } from "./passwords";
import { normalizeEmail } from "./policy";

export interface CredentialsLoginInput {
  email: string;
  password: string;
}

export async function authorizeWithCredentials(
  prisma: PrismaClient,
  input: CredentialsLoginInput,
): Promise<User> {
  let normalizedEmail: string;
  try {
    normalizedEmail = normalizeEmail(input.email);
  } catch {
    throw new AdmissionError("INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.passwordHash) {
    throw new AdmissionError("INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const validPassword = await verifyPassword(input.password, user.passwordHash);
  if (!validPassword) {
    throw new AdmissionError("INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AdmissionError("ACCOUNT_DISABLED", "This account has been disabled.", 403);
  }

  await recordAuditLog(prisma, {
    actorId: user.id,
    actorEmail: user.email,
    action: "USER_LOGIN",
    targetType: "USER",
    targetId: user.id,
    metadata: { role: user.role },
  }).catch(() => undefined);

  return user;
}
