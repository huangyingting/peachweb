"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, ArrowLeft, Shield } from "lucide-react";

interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  metadataJson: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actionFilter, setActionFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = actionFilter ? `?action=${encodeURIComponent(actionFilter)}` : "";
    fetch(`/api/admin/audit-logs${query}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(data.message ?? "Administrator privileges required.");
        }
        return res.json() as Promise<{ logs: AuditLogEntry[] }>;
      })
      .then((data) => setLogs(data.logs))
      .catch((err: Error) => setError(err.message));
  }, [actionFilter]);

  return (
    <div className="min-h-screen bg-[#08090f] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-[#ff6b4a] font-semibold mb-1">
              <Shield className="w-4 h-4" />
              <span>IMMUTABLE SECURITY LEDGER</span>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#ff6b4a]" />
              <span>Platform Audit Logs</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#11131e] border border-white/10 text-xs text-white"
            >
              <option value="">All Actions</option>
              <option value="ADMIN_BOOTSTRAP">ADMIN_BOOTSTRAP</option>
              <option value="INVITATION_CREATED">INVITATION_CREATED</option>
              <option value="INVITATION_ROTATED">INVITATION_ROTATED</option>
              <option value="INVITATION_REVOKED">INVITATION_REVOKED</option>
              <option value="INVITATION_ACCEPTED">INVITATION_ACCEPTED</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="USER_ROLE_UPDATED">USER_ROLE_UPDATED</option>
              <option value="USER_STATUS_UPDATED">USER_STATUS_UPDATED</option>
              <option value="WEBSITE_CREATED">WEBSITE_CREATED</option>
              <option value="WEBSITE_CREATED_VIA_AI_REMIX">WEBSITE_CREATED_VIA_AI_REMIX</option>
              <option value="WEBSITE_PUBLISHED">WEBSITE_PUBLISHED</option>
            </select>

            <Link
              href="/admin/invitations"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Invitations & RBAC</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="rounded-3xl bg-[#11131e] border border-white/10 p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3 pr-4">Timestamp</th>
                <th className="py-3 pr-4">Action</th>
                <th className="py-3 pr-4">Actor</th>
                <th className="py-3 pr-4">Target</th>
                <th className="py-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 pr-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a] font-mono font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-slate-200">
                    {log.actorEmail ?? "system"}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {log.targetType} {log.targetId ? `(${log.targetId.slice(0, 8)})` : ""}
                  </td>
                  <td className="py-3 font-mono text-slate-400 max-w-md truncate">
                    {log.metadataJson}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
