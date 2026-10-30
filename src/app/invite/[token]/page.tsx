import Link from "next/link";
import { isAdmissionError } from "@/lib/account-admission/errors";
import { validateInvitationToken } from "@/lib/account-admission/invitations";
import { prisma } from "@/lib/prisma";
import { InviteAcceptForm } from "./InviteAcceptForm";

export const dynamic = "force-dynamic";

export default async function InviteRedemptionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let validated: Awaited<ReturnType<typeof validateInvitationToken>> | null = null;
  let errorCode = "INVITATION_INVALID";
  let errorMessage = "This invitation link is invalid.";

  try {
    validated = await validateInvitationToken(prisma, token);
  } catch (error) {
    if (isAdmissionError(error)) {
      errorCode = error.code;
      errorMessage = error.message;
    }
  }

  return (
    <div className="min-h-screen bg-[#08090f] text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full rounded-3xl bg-[#11131e] border border-white/10 p-8 shadow-2xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#9333ea] flex items-center justify-center font-bold text-white">
            P
          </div>
          <span className="font-bold text-base">
            Peach<span className="text-[#ff6b4a]">Worlds</span> Studio Invitation
          </span>
        </div>

        {validated ? (
          <>
            <h1 className="text-2xl font-bold mb-1">Accept Your Invitation</h1>
            <p className="text-xs text-slate-400 mb-6">
              Complete your profile to activate your PeachWorlds 3D Builder account.
            </p>
            <InviteAcceptForm
              token={token}
              email={validated.email}
              role={validated.role}
              expiresAtIso={validated.expiresAt.toISOString()}
            />
          </>
        ) : (
          <div className="space-y-4">
            <div className="px-4 py-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30">
              <div className="text-xs font-mono uppercase tracking-wider text-rose-300 mb-1">
                {errorCode}
              </div>
              <h1 className="text-lg font-bold text-white mb-1">
                Invitation Unavailable
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <Link href="/login" className="text-[#ff6b4a] hover:underline font-medium">
                Go to Sign In
              </Link>
              <Link href="/" className="hover:text-white">
                Return Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
