import type { PrismaClient } from "@prisma/client";

export interface AuditLogInput {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: "USER" | "INVITATION" | "WORKSPACE" | "WEBSITE" | "SYSTEM";
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function recordAuditLog(
  prisma: PrismaClient | Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  input: AuditLogInput,
) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      actorEmail: input.actorEmail ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      metadataJson: JSON.stringify(input.metadata ?? {}),
      ipAddress: input.ipAddress ?? null,
    },
  });
}
