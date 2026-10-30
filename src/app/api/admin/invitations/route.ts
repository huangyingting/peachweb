import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  createOrRotateInvitation,
  listInvitations,
} from "@/lib/account-admission/invitations";
import { requireAdminActor } from "@/lib/account-admission/session";
import { toErrorResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const actor = await requireAdminActor(prisma);
    const [invitations, users] = await Promise.all([
      listInvitations(prisma, actor),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          invitedBy: {
            select: { id: true, email: true, name: true },
          },
        },
      }),
    ]);

    return NextResponse.json({ invitations, users });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdminActor(prisma);
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      role?: UserRole;
      expiresInDays?: number;
    };

    const origin = new URL(request.url).origin;
    const result = await createOrRotateInvitation(prisma, actor, {
      email: body.email ?? "",
      role: body.role === "ADMIN" ? "ADMIN" : "USER",
      expiresInDays: typeof body.expiresInDays === "number" ? body.expiresInDays : 7,
      baseUrl: origin,
    });

    return NextResponse.json(
      {
        invitation: result.invitation,
        inviteUrl: result.inviteUrl,
        rawToken: result.rawToken,
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
