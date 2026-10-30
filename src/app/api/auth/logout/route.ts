import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAMES } from "@/lib/account-admission/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  for (const name of SESSION_COOKIE_NAMES) {
    const token = cookieStore.get(name)?.value;
    if (token) {
      await prisma.session.deleteMany({ where: { sessionToken: token } }).catch(() => undefined);
    }
  }

  const response = NextResponse.json({ ok: true });
  for (const name of SESSION_COOKIE_NAMES) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
  }
  return response;
}
