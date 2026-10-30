import type { UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { recordAuditLog } from "@/lib/account-admission/audit";
import { AdmissionError } from "@/lib/account-admission/errors";
import { requireAdminActor } from "@/lib/account-admission/session";
import { toErrorResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireAdminActor(prisma);
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      role?: UserRole;
      status?: UserStatus;
    };

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      throw new AdmissionError("NOT_FOUND", "User not found.", 404);
    }

    const updatedRole: UserRole =
      body.role === "ADMIN" || body.role === "USER" ? body.role : target.role;
    const updatedStatus: UserStatus =
      body.status === "ACTIVE" || body.status === "DISABLED"
        ? body.status
        : target.status;

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id },
        data: {
          role: updatedRole,
          status: updatedStatus,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      if (updatedStatus === "DISABLED") {
        await tx.session.deleteMany({ where: { userId: id } });
      }

      if (updatedRole !== target.role) {
        await recordAuditLog(tx, {
          actorId: actor.userId,
          actorEmail: actor.email,
          action: "USER_ROLE_UPDATED",
          targetType: "USER",
          targetId: id,
          metadata: {
            targetEmail: target.email,
            previousRole: target.role,
            newRole: updatedRole,
          },
        });
      }

      if (updatedStatus !== target.status) {
        await recordAuditLog(tx, {
          actorId: actor.userId,
          actorEmail: actor.email,
          action: "USER_STATUS_UPDATED",
          targetType: "USER",
          targetId: id,
          metadata: {
            targetEmail: target.email,
            previousStatus: target.status,
            newStatus: updatedStatus,
          },
        });
      }

      return u;
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
