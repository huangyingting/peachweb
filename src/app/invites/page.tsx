"use client";

import { useEffect, useState } from "react";
import { MailPlus, Check, Plus } from "lucide-react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

interface WorkspaceInviteRecord {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  workspace?: { id: string; name: string; plan: string };
}

interface WorkspaceRecord {
  id: string;
  name: string;
  invites: WorkspaceInviteRecord[];
}

export default function WorkspaceInvitesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<WorkspaceInviteRecord[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"EDITOR" | "ADMIN" | "VIEWER">("EDITOR");
  const [message, setMessage] = useState<string | null>(null);

  async function loadInvites() {
    const res = await fetch("/api/workspaces");
    if (res.ok) {
      const data = (await res.json()) as {
        workspaces: WorkspaceRecord[];
        receivedInvites: WorkspaceInviteRecord[];
      };
      setWorkspaces(data.workspaces);
      setReceivedInvites(data.receivedInvites);
    }
  }

  useEffect(() => {
    void loadInvites();
  }, []);

  async function handleSendWorkspaceInvite(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const wsId = workspaces[0]?.id;
    if (!wsId || !inviteEmail.trim()) return;

    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "invite_member",
        workspaceId: wsId,
        email: inviteEmail,
        role: inviteRole,
      }),
    });

    if (res.ok) {
      setInviteEmail("");
      setMessage("Workspace collaboration invite sent.");
      await loadInvites();
    }
  }

  async function handleAcceptInvite(inviteId: string) {
    await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "accept_workspace_invite",
        inviteId,
      }),
    });
    await loadInvites();
  }

  return (
    <WorkspaceShell>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <MailPlus className="w-5 h-5 text-[#ff6b4a]" />
            <span>Team & Workspace Invites</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Invite collaborators to your 3D workspace or accept incoming team invitations.
          </p>
        </div>

        {/* Invite Collaborator Form */}
        <div className="rounded-3xl bg-[#11131e] border border-white/10 p-6">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#ff6b4a]" />
            <span>Invite Collaborator to {workspaces[0]?.name ?? "Workspace"}</span>
          </h2>
          <form
            onSubmit={handleSendWorkspaceInvite}
            className="grid sm:grid-cols-4 gap-3"
          >
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@studio.io"
              className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white"
            />
            <select
              value={inviteRole}
              onChange={(e) =>
                setInviteRole(e.target.value as "EDITOR" | "ADMIN" | "VIEWER")
              }
              className="px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white"
            >
              <option value="EDITOR">EDITOR</option>
              <option value="ADMIN">ADMIN</option>
              <option value="VIEWER">VIEWER</option>
            </select>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-[#ff6b4a] text-white text-xs font-bold cursor-pointer"
            >
              Send Invite
            </button>
          </form>
          {message && (
            <div className="mt-3 text-xs text-emerald-400">{message}</div>
          )}
        </div>

        {/* Incoming Invites */}
        <div className="rounded-3xl bg-[#11131e] border border-white/10 p-6">
          <h2 className="text-sm font-bold mb-4">
            Received Team Invitations ({receivedInvites.length})
          </h2>
          {receivedInvites.length === 0 ? (
            <p className="text-xs text-slate-400">
              You have no pending incoming workspace invitations.
            </p>
          ) : (
            <div className="space-y-2">
              {receivedInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-2xl bg-[#090b12] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">
                      {inv.workspace?.name ?? "Team Workspace"}
                    </div>
                    <div className="text-slate-400">
                      Role: {inv.role} • Status: {inv.status}
                    </div>
                  </div>
                  {inv.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => void handleAcceptInvite(inv.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Invites */}
        <div className="rounded-3xl bg-[#11131e] border border-white/10 p-6">
          <h2 className="text-sm font-bold mb-4">
            Sent Workspace Invitations ({workspaces[0]?.invites?.length ?? 0})
          </h2>
          {!workspaces[0]?.invites?.length ? (
            <p className="text-xs text-slate-400">
              No outgoing workspace invites sent yet.
            </p>
          ) : (
            <div className="space-y-2">
              {workspaces[0].invites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-[#090b12] border border-white/10 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-white">{inv.email}</span>
                  <span className="text-slate-400">
                    {inv.role} • {inv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
