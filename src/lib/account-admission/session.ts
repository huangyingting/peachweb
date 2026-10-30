import type { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { AdmissionError } from "./errors";

export const SESSION_COOKIE_NAMES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
] as const;

export interface AuthenticatedActor {
  userId: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  sessionToken: string;
  expires: Date;
}

export async function getActorBySessionToken(
  prisma: PrismaClient,
  sessionToken: string | null | undefined,
  now = new Date(),
): Promise<AuthenticatedActor | null> {
  if (!sessionToken) {
    return null;
  }

  const sessionRecord = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!sessionRecord) {
    return null;
  }

  if (sessionRecord.expires <= now) {
    await prisma.session.delete({ where: { id: sessionRecord.id } }).catch(() => undefined);
    return null;
  }

  if (sessionRecord.user.status !== "ACTIVE") {
    return null;
  }

  return {
    userId: sessionRecord.user.id,
    email: sessionRecord.user.email,
    name: sessionRecord.user.name,
    role: sessionRecord.user.role,
    status: sessionRecord.user.status,
    sessionToken: sessionRecord.sessionToken,
    expires: sessionRecord.expires,
  };
}

export async function getCurrentActor(prisma: PrismaClient): Promise<AuthenticatedActor | null> {
  const cookieStore = await cookies();
  for (const cookieName of SESSION_COOKIE_NAMES) {
    const token = cookieStore.get(cookieName)?.value;
    if (token) {
      const actor = await getActorBySessionToken(prisma, token);
      if (actor) {
        return actor;
      }
    }
  }
  return null;
}

export async function requireAuthenticatedActor(prisma: PrismaClient): Promise<AuthenticatedActor> {
  const actor = await getCurrentActor(prisma);
  if (!actor) {
    throw new AdmissionError("UNAUTHORIZED", "Authentication is required.", 401);
  }
  return actor;
}

export async function requireAdminActor(prisma: PrismaClient): Promise<AuthenticatedActor> {
  const actor = await requireAuthenticatedActor(prisma);
  if (actor.role !== "ADMIN") {
    throw new AdmissionError(
      "FORBIDDEN_ADMIN_ONLY",
      "Administrator privileges are required to perform this action.",
      403,
    );
  }
  return actor;
}

export function assertAdminActor(actor: Pick<AuthenticatedActor, "role" | "status"> | null): void {
  if (!actor) {
    throw new AdmissionError("UNAUTHORIZED", "Authentication is required.", 401);
  }
  if (actor.status !== "ACTIVE") {
    throw new AdmissionError("ACCOUNT_DISABLED", "Your account is disabled.", 403);
  }
  if (actor.role !== "ADMIN") {
    throw new AdmissionError(
      "FORBIDDEN_ADMIN_ONLY",
      "Administrator privileges are required to perform this action.",
      403,
    );
  }
}
