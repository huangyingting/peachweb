import { NextResponse } from "next/server";
import { isAdmissionError } from "./account-admission/errors";

export function toErrorResponse(error: unknown) {
  if (isAdmissionError(error)) {
    return NextResponse.json(
      {
        code: error.code,
        message: error.message,
      },
      { status: error.httpStatus },
    );
  }

  console.error("[PeachWeb API Error]", error);
  return NextResponse.json(
    {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
    { status: 500 },
  );
}
