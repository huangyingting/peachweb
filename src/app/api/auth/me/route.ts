import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/account-admission/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const actor = await getCurrentActor(prisma);
  if (!actor) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

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
}
