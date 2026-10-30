import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/account-admission/session";
import { toErrorResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireAdminActor(prisma);
    const { searchParams } = new URL(request.url);
    const actionFilter = searchParams.get("action") || undefined;

    const logs = await prisma.auditLog.findMany({
      where: actionFilter ? { action: actionFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    return toErrorResponse(error);
  }
}
