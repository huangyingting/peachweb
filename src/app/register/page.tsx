"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound, ShieldAlert, ArrowLeft } from "lucide-react";

export default function RegisterGatePage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = token.trim();
    if (!cleaned) return;
    const extracted = cleaned.includes("/invite/")
      ? cleaned.split("/invite/").pop() || cleaned
      : cleaned;
    router.push(`/invite/${encodeURIComponent(extracted)}`);
  }

  return (
    <div className="min-h-screen bg-[#08090f] text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl bg-[#11131e] border border-white/10 p-8 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[#ff6b4a]/15 border border-[#ff6b4a]/30 flex items-center justify-center text-[#ff6b4a] mb-5">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Invite-Only Registration</h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          Public self-registration is disabled on PeachWorlds. To create an account, you must use a single-use invitation link issued by a platform administrator.
        </p>

        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label
              htmlFor="invite-token-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Invitation Code or Link
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="invite-token-input"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your single-use invitation token"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0b0d15] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff6b4a]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white font-semibold text-sm hover:opacity-95 transition cursor-pointer"
          >
            Validate Invitation
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <Link href="/login" className="hover:text-white flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
          <Link href="/" className="hover:text-white">
            Explore peachweb.io
          </Link>
        </div>
      </div>
    </div>
  );
}
