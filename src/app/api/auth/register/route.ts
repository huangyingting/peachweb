import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "REGISTRATION_DISABLED",
      message:
        "Public self-registration is disabled. Account creation requires a valid single-use invitation link.",
    },
    { status: 403 },
  );
}
