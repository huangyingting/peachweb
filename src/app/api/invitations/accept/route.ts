import { NextResponse } from "next/server";
import { acceptInvitation } from "@/lib/account-admission/registration";
import { toErrorResponse } from "@/lib/api";
import { createDatabaseSessionForUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      token?: string;
      name?: string;
      password?: string;
      email?: string;
    };

    const user = await acceptInvitation(prisma, {
      token: body.token ?? "",
      name: body.name ?? "",
      password: body.password ?? "",
      email: body.email,
    });

    const sessionInfo = await createDatabaseSessionForUser(user.id);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
      },
      { status: 201 },
    );

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
