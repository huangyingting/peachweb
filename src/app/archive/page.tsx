"use client";

import { useEffect, useState } from "react";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

interface ArchivedWebsite {
  id: string;
  name: string;
  slug: string;
  category: string;
  updatedAt: string;
}

export default function ArchivePage() {
  const [archivedSites, setArchivedSites] = useState<ArchivedWebsite[]>([]);

  async function loadArchived() {
    const res = await fetch("/api/websites?archived=true");
    if (res.ok) {
      const data = (await res.json()) as { websites: ArchivedWebsite[] };
      setArchivedSites(data.websites);
    }
  }

  useEffect(() => {
    void loadArchived();
  }, []);

  async function handleRestore(id: string) {
    await fetch(`/api/websites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false }),
    });
    await loadArchived();
  }

  async function handlePermanentDelete(id: string) {
    await fetch(`/api/websites/${id}`, { method: "DELETE" });
    await loadArchived();
  }

  return (
    <WorkspaceShell>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Archive className="w-5 h-5 text-[#ff6b4a]" />
            <span>Archived Websites ({archivedSites.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Restore archived 3D websites back to your workspace or permanently delete them.
          </p>
        </div>

        {archivedSites.length === 0 ? (
          <div className="rounded-3xl bg-[#11131e] border border-white/10 p-12 text-center text-xs text-slate-400">
            Your archive is currently empty.
          </div>
        ) : (
          <div className="space-y-3">
            {archivedSites.map((site) => (
              <div
                key={site.id}
                className="p-5 rounded-2xl bg-[#11131e] border border-white/10 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-white">{site.name}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    {site.slug}.peachweb.site • {site.category}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleRestore(site.id)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handlePermanentDelete(site.id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
