import { NextResponse } from "next/server";
import {
  revokeInvitation,
  rotateInvitationById,
} from "@/lib/account-admission/invitations";
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
      action?: "revoke" | "rotate";
      expiresInDays?: number;
    };

    if (body.action === "rotate") {
      const origin = new URL(request.url).origin;
      const result = await rotateInvitationById(prisma, actor, id, {
        expiresInDays: body.expiresInDays,
        baseUrl: origin,
      });
      return NextResponse.json({
        invitation: result.invitation,
        inviteUrl: result.inviteUrl,
        rawToken: result.rawToken,
      });
    }

    const revoked = await revokeInvitation(prisma, actor, id);
    return NextResponse.json({ invitation: revoked });
  } catch (error) {
    return toErrorResponse(error);
  }
}
