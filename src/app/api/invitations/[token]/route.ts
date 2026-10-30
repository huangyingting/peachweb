import { NextResponse } from "next/server";
import { validateInvitationToken } from "@/lib/account-admission/invitations";
import { toErrorResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const invitation = await validateInvitationToken(prisma, token);
    return NextResponse.json({ invitation });
  } catch (error) {
    return toErrorResponse(error);
  }
}
