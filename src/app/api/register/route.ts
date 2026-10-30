import { rejectPublicRegistration } from "@/lib/account-admission/registration";
import { toErrorResponse } from "@/lib/api";

export async function POST() {
  try {
    await rejectPublicRegistration();
  } catch (error) {
    return toErrorResponse(error);
  }
}
