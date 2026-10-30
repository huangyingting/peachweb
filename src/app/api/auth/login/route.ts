import { NextResponse } from "next/server";
import { authorizeWithCredentials } from "@/lib/account-admission/credentials";
import { toErrorResponse } from "@/lib/api";
import { createDatabaseSessionForUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };

    const user = await authorizeWithCredentials(prisma, {
      email: body.email ?? "",
      password: body.password ?? "",
    });

    const sessionInfo = await createDatabaseSessionForUser(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });

    response.cookies.set(sessionInfo.cookieName, sessionInfo.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: sessionInfo.secure,
      expires: sessionInfo.expires,
    });

    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
