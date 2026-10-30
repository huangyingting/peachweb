"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Copy,
  RefreshCw,
  Ban,
  Check,
  FileText,
  ArrowLeft,
  Users,
} from "lucide-react";

interface InvitationRecord {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
  invitedBy?: { email: string; name: string | null };
  acceptedByUser?: { email: string; name: string | null } | null;
}

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [latestInviteUrl, setLatestInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invitations");
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        setError(err.message ?? "Administrator access required.");
        return;
      }
      const data = (await res.json()) as {
        invitations: InvitationRecord[];
        users: UserRecord[];
      };
      setInvitations(data.invitations);
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLatestInviteUrl(null);

    const res = await fetch("/api/admin/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, expiresInDays }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      inviteUrl?: string;
      message?: string;
    };

    if (!res.ok) {
      setError(data.message ?? "Failed to create invitation.");
      return;
    }

    setEmail("");
    setLatestInviteUrl(data.inviteUrl ?? null);
    await loadData();
  }

  async function handleInvitationAction(id: string, action: "revoke" | "rotate") {
    setError(null);
    const res = await fetch(`/api/admin/invitations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, expiresInDays: 7 }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      inviteUrl?: string;
      message?: string;
    };
    if (!res.ok) {
      setError(data.message ?? `Failed to ${action} invitation.`);
      return;
    }
    if (data.inviteUrl) {
      setLatestInviteUrl(data.inviteUrl);
    }
    await loadData();
  }

  async function handleUserUpdate(
    id: string,
    patch: { role?: "USER" | "ADMIN"; status?: "ACTIVE" | "DISABLED" },
  ) {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      setError(data.message ?? "Failed to update user.");
      return;
    }
    await loadData();
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#08090f] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-[#ff6b4a] font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>ADMIN GOVERNANCE CONSOLE</span>
            </div>
            <h1 className="text-2xl font-bold">
              Invite-Only Admission, RBAC & User Revocation
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/audit-logs"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#ff6b4a]" />
              <span>Security Audit Logs</span>
            </Link>
            <Link
              href="/workspace"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Workspace</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Issue Single-Use Invitation Form */}
        <div className="rounded-3xl bg-[#11131e] border border-white/10 p-6">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#ff6b4a]" />
            <span>Issue Single-Use Invitation Code</span>
          </h2>

          <form
            onSubmit={handleCreateInvite}
            className="grid sm:grid-cols-4 gap-4 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">
                Recipient Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="designer@studio.io"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0d15] border border-white/10 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0d15] border border-white/10 text-sm text-white"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="w-24">
                <label className="block text-xs text-slate-400 mb-1.5">
                  TTL (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0b0d15] border border-white/10 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold hover:opacity-95 transition cursor-pointer mt-auto h-[42px]"
              >
                Generate Link
              </button>
            </div>
          </form>

          {latestInviteUrl && (
            <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-emerald-300">
                  One-Time Invitation Link Generated (Copy now — raw token is never stored in DB):
                </div>
                <div
                  data-testid="generated-invite-url"
                  className="text-xs font-mono text-white break-all"
                >
                  {latestInviteUrl}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void copyUrl(latestInviteUrl)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy Invite Link"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Invitations Table */}
        <div className="rounded-3xl bg-[#11131e] border border-white/10 p-6">
          <h2 className="text-base font-bold mb-4">
            Invitation Ledger ({invitations.length})
          </h2>

          {loading ? (
            <div className="text-xs text-slate-400 py-6">Loading invitations...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Expires</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invitations.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-3.5 pr-4 font-mono text-white">{inv.email}</td>
                      <td className="py-3.5 pr-4">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                          {inv.role}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold ${
                            inv.status === "PENDING"
                              ? "bg-amber-500/15 text-amber-300"
                              : inv.status === "ACCEPTED"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-400">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {inv.status !== "ACCEPTED" && (
                          <button
                            type="button"
                            onClick={() => void handleInvitationAction(inv.id, "rotate")}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Rotate</span>
                          </button>
                        )}
                        {inv.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => void handleInvitationAction(inv.id, "revoke")}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Registered Users & RBAC Table */}
        <div className="rounded-3xl bg-[#11131e] border border-white/10 p-6">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#ff6b4a]" />
            <span>Registered Accounts & RBAC ({users.length})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3.5 pr-4 font-semibold text-white">
                      {u.name ?? "—"}
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-slate-300">{u.email}</td>
                    <td className="py-3.5 pr-4">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          void handleUserUpdate(u.id, {
                            role: e.target.value as "USER" | "ADMIN",
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#0b0d15] border border-white/10 text-white"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          void handleUserUpdate(u.id, {
                            status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
                          })
                        }
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 cursor-pointer"
                      >
                        {u.status === "ACTIVE" ? "Disable & Revoke Sessions" : "Re-Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
