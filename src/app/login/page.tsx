"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Lock, Mail, ArrowRight, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        user?: { role?: string };
      };

      if (!response.ok) {
        setError(data.message ?? "Invalid email or password.");
        return;
      }

      router.push("/workspace");
      router.refresh();
    } catch {
      setError("Unable to reach authentication service.");
    } finally {
      setLoading(false);
    }
  }

  function handleRedeemInvite(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = inviteCode.trim();
    if (!cleaned) return;
    const tokenPart = cleaned.includes("/invite/")
      ? cleaned.split("/invite/").pop() || cleaned
      : cleaned;
    router.push(`/invite/${encodeURIComponent(tokenPart)}`);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#08090f] text-white">
      {/* Left Column: PeachWorlds Login Form */}
      <div className="flex flex-col justify-between px-8 py-10 sm:px-14 lg:px-20">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#9333ea] flex items-center justify-center font-bold text-white shadow-lg shadow-[#ff6b4a]/25">
              P
            </div>
            <span className="text-lg font-bold tracking-tight">
              Peach<span className="text-[#ff6b4a]">Worlds</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Back to peachweb.io
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#ff6b4a] mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D WebGL Studio & Spatial Builder</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Welcome to PeachWorlds
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            Sign in to your workspace to design, animate, and publish 3D websites.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#121420] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff6b4a]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#121420] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff6b4a]"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b4a]/25 transition disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Signing in..." : "Continue to Studio"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Invite-only platform admission</span>
              <button
                type="button"
                onClick={() => setShowInviteInput(!showInviteInput)}
                className="text-[#ff6b4a] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Have an invitation code?</span>
              </button>
            </div>

            {showInviteInput && (
              <form onSubmit={handleRedeemInvite} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Paste invite token or /invite/... URL"
                  className="flex-1 px-3.5 py-2 rounded-lg bg-[#121420] border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff6b4a]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Redeem
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-between">
          <span>© 2026 PeachWorlds Inc.</span>
          <Link href="/register" className="hover:text-slate-300">
            Invitation Policy
          </Link>
        </div>
      </div>

      {/* Right Column: 3D Spatial Visual Showcase */}
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center p-16 bg-gradient-to-br from-[#130d26] via-[#0d1021] to-[#08090f] border-l border-white/10">
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-[#ff6b4a]/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full bg-[#9333ea]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
          <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-[#ff6b4a]/30 via-[#9333ea]/30 to-[#090a10] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#ff6b4a] via-[#ec4899] to-[#38bdf8] shadow-[0_0_80px_rgba(255,107,74,0.6)] animate-pulse" />
            <div className="absolute inset-x-4 bottom-4 px-4 py-2.5 rounded-xl bg-black/55 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Real-Time WebGL 2.0 Viewport</span>
              <span className="text-[#ff6b4a] font-mono">60 FPS • Bloom + PBR</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Design in UI, 3D & Scroll Keyframes
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Build interactive 3D websites with our AI Site Generator Wizard, customize PBR materials and shader effects, and publish straight to production.
          </p>
        </div>
      </div>
    </div>
  );
}
