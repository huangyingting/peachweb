import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/account-admission/passwords";
import {
  normalizeDisplayName,
  validatePasswordPolicy,
} from "@/lib/account-admission/policy";
import { requireAuthenticatedActor } from "@/lib/account-admission/session";
import { toErrorResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const actor = await requireAuthenticatedActor(prisma);
    const user = await prisma.user.findUnique({
      where: { id: actor.userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarColor: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ user });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAuthenticatedActor(prisma);
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      bio?: string;
      avatarColor?: string;
      newPassword?: string;
    };

    const data: {
      name?: string;
      bio?: string;
      avatarColor?: string;
      passwordHash?: string;
    } = {};

    if (typeof body.name === "string") {
      data.name = normalizeDisplayName(body.name);
    }
    if (typeof body.bio === "string") {
      data.bio = body.bio.trim().slice(0, 300);
    }
    if (typeof body.avatarColor === "string" && body.avatarColor.startsWith("#")) {
      data.avatarColor = body.avatarColor;
    }
    if (typeof body.newPassword === "string" && body.newPassword.length > 0) {
      validatePasswordPolicy(body.newPassword);
      data.passwordHash = await hashPassword(body.newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: actor.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarColor: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
