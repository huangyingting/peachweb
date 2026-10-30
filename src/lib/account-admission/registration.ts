import type { PrismaClient, User } from "@prisma/client";
import { recordAuditLog } from "./audit";
import { AdmissionError } from "./errors";
import { hashPassword } from "./passwords";
import {
  normalizeDisplayName,
  normalizeEmail,
  validatePasswordPolicy,
} from "./policy";
import { hashInvitationToken } from "./tokens";

export interface AcceptInvitationInput {
  token: string;
  name: string;
  password: string;
  email?: string;
  now?: Date;
}

export async function rejectPublicRegistration(): Promise<never> {
  throw new AdmissionError(
    "PUBLIC_REGISTRATION_DISABLED",
    "Public self-registration is disabled. A valid single-use invitation link is required.",
    403,
  );
}

export async function acceptInvitation(
  prisma: PrismaClient,
  input: AcceptInvitationInput,
): Promise<User> {
  const now = input.now ?? new Date();
  if (!input.token || typeof input.token !== "string") {
    throw new AdmissionError("INVITATION_REQUIRED", "An invitation token is required.", 400);
  }

  const tokenHash = hashInvitationToken(input.token);
  const displayName = normalizeDisplayName(input.name);
  validatePasswordPolicy(input.password);
  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
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
        "This invitation has been revoked.",
        410,
      );
    }

    if (invitation.status === "EXPIRED" || invitation.expiresAt <= now) {
      await tx.invitation.updateMany({
        where: { id: invitation.id, status: "PENDING" },
        data: { status: "EXPIRED", activeForEmail: null },
      });
      throw new AdmissionError(
        "INVITATION_EXPIRED",
        "This invitation has expired.",
        410,
      );
    }

    if (input.email !== undefined) {
      const providedEmail = normalizeEmail(input.email);
      if (providedEmail !== invitation.email) {
        throw new AdmissionError(
          "INVITATION_EMAIL_MISMATCH",
          "Email does not match the invited address.",
          400,
        );
      }
    }

    const existingUser = await tx.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new AdmissionError(
        "USER_ALREADY_EXISTS",
        "An account with this email address already exists.",
        409,
      );
    }

    const claimResult = await tx.invitation.updateMany({
      where: {
        id: invitation.id,
        status: "PENDING",
        expiresAt: { gt: now },
      },
      data: {
        status: "ACCEPTED",
        acceptedAt: now,
        activeForEmail: null,
      },
    });

    if (claimResult.count !== 1) {
      throw new AdmissionError(
        "INVITATION_ALREADY_USED",
        "This invitation has already been used.",
        409,
      );
    }

    const createdUser = await tx.user.create({
      data: {
        email: invitation.email,
        name: displayName,
        emailVerified: now,
        passwordHash,
        role: invitation.role,
        status: "ACTIVE",
        invitedById: invitation.invitedById,
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedByUserId: createdUser.id },
    });

    const slugBase = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace";

    const workspace = await tx.workspace.create({
      data: {
        name: `${displayName}'s Workspace`,
        slug: `${slugBase}-${createdUser.id.slice(-6)}`,
        ownerId: createdUser.id,
        plan: "PRO",
        members: {
          create: {
            userId: createdUser.id,
            role: "OWNER",
          },
        },
      },
    });

    await recordAuditLog(tx, {
      actorId: createdUser.id,
      actorEmail: createdUser.email,
      action: "INVITATION_ACCEPTED",
      targetType: "USER",
      targetId: createdUser.id,
      metadata: {
        invitationId: invitation.id,
        role: createdUser.role,
        defaultWorkspaceId: workspace.id,
      },
    });

    return createdUser;
  });
}
