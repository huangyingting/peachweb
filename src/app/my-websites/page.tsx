"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Copy,
  Archive,
  ExternalLink,
  Pencil,
  Globe,
  MoreHorizontal,
  Users,
  X,
} from "lucide-react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

interface WebsiteRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailGradient: string;
  isPublished: boolean;
  updatedAt: string;
  createdAt?: string;
}

interface WorkspaceOption {
  id: string;
  name: string;
  plan: string;
}

export default function MyWebsitesPage() {
  const [websites, setWebsites] = useState<WebsiteRecord[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "created">("recent");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [moveModalSite, setMoveModalSite] = useState<WebsiteRecord | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  async function loadWebsites(query = search) {
    const res = await fetch(
      `/api/websites?archived=false&search=${encodeURIComponent(query)}`,
    );
    if (res.ok) {
      const data = (await res.json()) as { websites: WebsiteRecord[] };
      setWebsites(data.websites);
    }
  }

  useEffect(() => {
    void loadWebsites(search);
    fetch("/api/workspaces")
      .then((r) => r.json() as Promise<{ workspaces?: WorkspaceOption[] }>)
      .then((d) => {
        if (d.workspaces && d.workspaces.length > 0) {
          setWorkspaces(d.workspaces);
          setSelectedTeamId(d.workspaces[0].id);
        }
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const sortedWebsites = [...websites].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "created") {
      return (
        new Date(b.createdAt ?? b.updatedAt).getTime() -
        new Date(a.createdAt ?? a.updatedAt).getTime()
      );
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  async function handleDuplicate(id: string) {
    const res = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceWebsiteId: id }),
    });
    if (res.ok) {
      await loadWebsites();
    }
  }

  async function handleArchive(id: string) {
    await fetch(`/api/websites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    await loadWebsites();
  }

  async function handleRenameSubmit(id: string) {
    if (!renameText.trim()) return;
    await fetch(`/api/websites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameText.trim() }),
    });
    setRenamingId(null);
    await loadWebsites();
  }

  async function handleMoveToTeamSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!moveModalSite || !selectedTeamId) return;
    await fetch(`/api/websites/${moveModalSite.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: selectedTeamId }),
    });
    setMoveModalSite(null);
    await loadWebsites();
  }

  return (
    <WorkspaceShell>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#ff6b4a]" />
              <span>My Websites ({sortedWebsites.length})</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage, duplicate, rename, move to team, archive, and launch your 3D websites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Sort Websites"
              data-testid="my-websites-sort-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "recent" | "name" | "created")
              }
              className="px-3.5 py-2.5 rounded-xl bg-[#11131e] border border-white/10 text-xs text-white font-semibold"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="name">Sort: Name</option>
              <option value="created">Sort: Created</option>
            </select>

            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search websites by name or slug..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11131e] border border-white/10 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {sortedWebsites.length === 0 ? (
          <div className="rounded-3xl bg-[#11131e] border border-white/10 p-12 text-center space-y-3">
            <div className="text-sm font-bold">No active 3D websites found</div>
            <p className="text-xs text-slate-400">
              Create a new website from AI (/remix) or from a 3D template to get started.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWebsites.map((site) => (
              <div
                key={site.id}
                className="rounded-3xl bg-[#11131e] border border-white/10 overflow-hidden flex flex-col justify-between relative"
              >
                <div
                  style={{ background: site.thumbnailGradient }}
                  className="h-40 p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/50 text-[10px] font-bold">
                      {site.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {site.isPublished && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          PUBLISHED
                        </span>
                      )}
                      <button
                        type="button"
                        title="More options"
                        data-testid={`project-card-menu-${site.id}`}
                        onClick={() =>
                          setOpenMenuId(openMenuId === site.id ? null : site.id)
                        }
                        className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white cursor-pointer"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-white/85">
                    {site.slug}.peachweb.site
                  </div>
                </div>

                {openMenuId === site.id && (
                  <div className="absolute right-4 top-14 w-48 rounded-2xl bg-[#141726] border border-white/15 shadow-2xl p-1.5 z-30 text-xs space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(null);
                        void handleDuplicate(site.id);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/10 cursor-pointer"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(null);
                        setRenamingId(site.id);
                        setRenameText(site.name);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/10 cursor-pointer"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(null);
                        setMoveModalSite(site);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/10 cursor-pointer"
                    >
                      Move to team...
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(null);
                        void handleArchive(site.id);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-500/20 text-rose-300 cursor-pointer"
                    >
                      Archive
                    </button>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {renamingId === site.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={renameText}
                        onChange={(e) => setRenameText(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#090b12] border border-white/15 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => void handleRenameSubmit(site.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#ff6b4a] text-xs font-bold text-white cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-base text-white">
                        {site.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Last edited {new Date(site.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Rename Website"
                        onClick={() => {
                          setRenamingId(site.id);
                          setRenameText(site.name);
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Duplicate Website"
                        onClick={() => void handleDuplicate(site.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Move to Team"
                        onClick={() => setMoveModalSite(site)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Move to Archive"
                        onClick={() => void handleArchive(site.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      {site.isPublished && (
                        <Link
                          href={`/site/${site.slug}`}
                          title="Open Published Live Site"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    <Link
                      href={`/builder/${site.id}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold"
                    >
                      Open Builder
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Move to Team Modal (69_2d_workspace_move_to_team_modal.png) */}
        {moveModalSite && (
          <div
            data-testid="move-to-team-modal"
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="max-w-md w-full rounded-3xl bg-[#121422] border border-white/15 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  Move &ldquo;{moveModalSite.name}&rdquo;
                </h2>
                <button
                  type="button"
                  onClick={() => setMoveModalSite(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleMoveToTeamSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Select Destination Team Workspace
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name} ({ws.plan})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMoveModalSite(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#ff6b4a] text-white text-xs font-bold cursor-pointer"
                  >
                    Move Website
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
