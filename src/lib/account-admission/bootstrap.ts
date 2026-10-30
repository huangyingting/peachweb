import type { PrismaClient, User } from "@prisma/client";
import { recordAuditLog } from "./audit";
import { AdmissionError } from "./errors";
import { hashPassword } from "./passwords";
import {
  normalizeDisplayName,
  normalizeEmail,
  validatePasswordPolicy,
} from "./policy";

export interface BootstrapAdminInput {
  email: string;
  password: string;
  name?: string;
}

export async function bootstrapInitialAdmin(
  prisma: PrismaClient,
  input: BootstrapAdminInput,
): Promise<User> {
  const email = normalizeEmail(input.email);
  validatePasswordPolicy(input.password);
  const name = normalizeDisplayName(input.name ?? "Platform Administrator");
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const existingCount = await tx.user.count();
    if (existingCount > 0) {
      throw new AdmissionError(
        "BOOTSTRAP_ALREADY_COMPLETED",
        "Bootstrap refused: one or more users already exist in the database.",
        409,
      );
    }

    const adminUser = await tx.user.create({
      data: {
        email,
        name,
        emailVerified: now,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: "PeachWorlds Studio",
        slug: `peachworlds-${adminUser.id.slice(-6)}`,
        ownerId: adminUser.id,
        plan: "ENTERPRISE",
        members: {
          create: {
            userId: adminUser.id,
            role: "OWNER",
          },
        },
      },
    });

    await recordAuditLog(tx, {
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: "ADMIN_BOOTSTRAP",
      targetType: "USER",
      targetId: adminUser.id,
      metadata: {
        role: "ADMIN",
        workspaceId: workspace.id,
      },
    });

    return adminUser;
  });
}
