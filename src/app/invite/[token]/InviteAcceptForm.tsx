"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Lock, User } from "lucide-react";

interface InviteAcceptFormProps {
  token: string;
  email: string;
  role: string;
  expiresAtIso: string;
}

export function InviteAcceptForm({
  token,
  email,
  role,
  expiresAtIso,
}: InviteAcceptFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name,
          password,
          email,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setError(data.message ?? "Could not accept invitation.");
        return;
      }

      router.push("/workspace");
      router.refresh();
    } catch {
      setError("Network error while redeeming invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-200 space-y-1">
          <div className="font-semibold text-white">
            Valid Single-Use Invitation ({role})
          </div>
          <div>
            Invited Email: <span className="font-mono text-emerald-300">{email}</span>
          </div>
          <div className="text-slate-400">
            Expires: {new Date(expiresAtIso).toLocaleString()}
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="accept-name"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
        >
          Full Name / Studio Handle
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="accept-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Rivera"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0b0d15] border border-white/10 text-sm text-white focus:outline-none focus:border-[#ff6b4a]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="accept-password"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
        >
          Create Password (8+ chars, letter + number)
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="accept-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0b0d15] border border-white/10 text-sm text-white focus:outline-none focus:border-[#ff6b4a]"
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
        disabled={submitting}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white font-semibold text-sm hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
      >
        {submitting ? "Activating Account..." : "Accept Invitation & Launch Studio"}
      </button>
    </form>
  );
}
