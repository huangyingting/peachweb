import type { Invitation, InvitationStatus, PrismaClient, UserRole } from "@prisma/client";
import { recordAuditLog } from "./audit";
import { AdmissionError } from "./errors";
import {
  DEFAULT_INVITATION_TTL_DAYS,
  computeExpirationDate,
  normalizeEmail,
} from "./policy";
import { assertAdminActor, type AuthenticatedActor } from "./session";
import {
  buildInvitationUrl,
  generateInvitationToken,
  hashInvitationToken,
} from "./tokens";

export interface CreateInvitationInput {
  email: string;
  role?: UserRole;
  expiresInDays?: number;
  baseUrl?: string;
  now?: Date;
}

export interface CreatedInvitationResult {
  invitation: Invitation;
  rawToken: string;
  inviteUrl: string;
}

export async function expireStaleInvitationsForEmail(
  prisma: PrismaClient,
  email: string,
  now = new Date(),
): Promise<void> {
  await prisma.invitation.updateMany({
    where: {
      email,
      status: "PENDING",
      expiresAt: { lte: now },
    },
    data: {
      status: "EXPIRED",
      activeForEmail: null,
    },
  });
}

export async function createOrRotateInvitation(
  prisma: PrismaClient,
  actor: Pick<AuthenticatedActor, "userId" | "email" | "role" | "status">,
  input: CreateInvitationInput,
): Promise<CreatedInvitationResult> {
  assertAdminActor(actor);

  const now = input.now ?? new Date();
  const normalizedEmail = normalizeEmail(input.email);
  const role: UserRole = input.role ?? "USER";
  const expiresAt = computeExpirationDate(
    input.expiresInDays ?? DEFAULT_INVITATION_TTL_DAYS,
    now,
  );

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AdmissionError(
      "USER_ALREADY_EXISTS",
      "An account with this email address already exists.",
      409,
    );
  }

  await expireStaleInvitationsForEmail(prisma, normalizedEmail, now);

  const { rawToken, tokenHash } = generateInvitationToken();

  const invitation = await prisma.$transaction(async (tx) => {
    await tx.invitation.updateMany({
      where: {
        email: normalizedEmail,
        status: "PENDING",
      },
      data: {
        status: "REVOKED",
        revokedAt: now,
        activeForEmail: null,
      },
    });

    const created = await tx.invitation.create({
      data: {
        email: normalizedEmail,
        tokenHash,
        activeForEmail: normalizedEmail,
        role,
        status: "PENDING",
        expiresAt,
        invitedById: actor.userId,
      },
    });

    await recordAuditLog(tx, {
      actorId: actor.userId,
      actorEmail: actor.email,
      action: "INVITATION_CREATED",
      targetType: "INVITATION",
      targetId: created.id,
      metadata: {
        invitedEmail: normalizedEmail,
        role,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return created;
  });

  return {
    invitation,
    rawToken,
    inviteUrl: buildInvitationUrl(rawToken, input.baseUrl),
  };
}

export async function rotateInvitationById(
  prisma: PrismaClient,
  actor: Pick<AuthenticatedActor, "userId" | "email" | "role" | "status">,
  invitationId: string,
  options?: { expiresInDays?: number; baseUrl?: string; now?: Date },
): Promise<CreatedInvitationResult> {
  assertAdminActor(actor);
  const now = options?.now ?? new Date();

  const existing = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!existing) {
    throw new AdmissionError("INVITATION_INVALID", "Invitation not found.", 404);
  }

  if (existing.status === "ACCEPTED") {
    throw new AdmissionError(
      "INVITATION_ALREADY_USED",
      "Accepted invitations cannot be rotated.",
      409,
    );
  }

  const result = await createOrRotateInvitation(prisma, actor, {
    email: existing.email,
    role: existing.role,
    expiresInDays: options?.expiresInDays ?? DEFAULT_INVITATION_TTL_DAYS,
    baseUrl: options?.baseUrl,
    now,
  });

  await recordAuditLog(prisma, {
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "INVITATION_ROTATED",
    targetType: "INVITATION",
    targetId: result.invitation.id,
    metadata: {
      previousInvitationId: existing.id,
      invitedEmail: existing.email,
    },
  });

  return result;
}

export async function revokeInvitation(
  prisma: PrismaClient,
  actor: Pick<AuthenticatedActor, "userId" | "email" | "role" | "status">,
  invitationId: string,
  now = new Date(),
): Promise<Invitation> {
  assertAdminActor(actor);

  const existing = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!existing) {
    throw new AdmissionError("INVITATION_INVALID", "Invitation not found.", 404);
  }

  if (existing.status === "ACCEPTED") {
    throw new AdmissionError(
      "INVITATION_ALREADY_USED",
      "Accepted invitations cannot be revoked.",
      409,
    );
  }

  if (existing.status === "REVOKED") {
    return existing;
  }

  const revoked = await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "REVOKED",
      revokedAt: now,
      activeForEmail: null,
    },
  });

  await recordAuditLog(prisma, {
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "INVITATION_REVOKED",
    targetType: "INVITATION",
    targetId: revoked.id,
    metadata: {
      invitedEmail: revoked.email,
      role: revoked.role,
    },
  });

  return revoked;
}

export interface ValidatedInvitationSummary {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  expiresAt: Date;
}

export async function validateInvitationToken(
  prisma: PrismaClient,
  rawToken: string,
  now = new Date(),
): Promise<ValidatedInvitationSummary> {
  const tokenHash = hashInvitationToken(rawToken);

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
  });

  if (!invitation) {
    throw new AdmissionError(
      "INVITATION_INVALID",
      "This invitation link is invalid.",
      404,
    );
  }

  if (invitation.status === "ACCEPTED") {
    throw new AdmissionError(
      "INVITATION_ALREADY_USED",
      "This invitation has already been used.",
      409,
    );
  }

  if (invitation.status === "REVOKED") {
    throw new AdmissionError(
      "INVITATION_REVOKED",
      "This invitation has been revoked by an administrator.",
      410,
    );
  }

  if (invitation.status === "EXPIRED" || invitation.expiresAt <= now) {
    if (invitation.status === "PENDING") {
      await prisma.invitation
        .update({
          where: { id: invitation.id },
          data: { status: "EXPIRED", activeForEmail: null },
        })
        .catch(() => undefined);
    }
    throw new AdmissionError(
      "INVITATION_EXPIRED",
      "This invitation has expired.",
      410,
    );
  }

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  };
}

export async function listInvitations(
  prisma: PrismaClient,
  actor: Pick<AuthenticatedActor, "userId" | "role" | "status">,
  now = new Date(),
) {
  assertAdminActor(actor);

  await prisma.invitation.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lte: now },
    },
    data: {
      status: "EXPIRED",
      activeForEmail: null,
    },
  });

  return prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      invitedBy: {
        select: { id: true, email: true, name: true },
      },
      acceptedByUser: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}
