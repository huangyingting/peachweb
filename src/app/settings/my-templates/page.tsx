"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, Sparkles } from "lucide-react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

interface CustomTemplateSite {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailGradient: string;
}

export default function MyCustomTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CustomTemplateSite[]>([]);

  useEffect(() => {
    fetch("/api/websites?customTemplates=true")
      .then((r) => r.json())
      .then((data: { websites?: CustomTemplateSite[] }) => {
        if (data.websites) {
          setTemplates(data.websites);
        }
      })
      .catch(() => undefined);
  }, []);

  async function handleCloneCustom(id: string) {
    const res = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceWebsiteId: id }),
    });
    if (res.ok) {
      const data = (await res.json()) as { website: { id: string } };
      router.push(`/builder/${data.website.id}`);
    }
  }

  return (
    <WorkspaceShell>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#ff6b4a]" />
            <span>My Saved 3D Templates ({templates.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reusable 3D scene and UI blueprints saved from your workspace projects.
          </p>
        </div>

        {templates.length === 0 ? (
          <div className="rounded-3xl bg-[#11131e] border border-white/10 p-12 text-center space-y-3">
            <div className="text-sm font-bold">No saved custom templates yet</div>
            <p className="text-xs text-slate-400">
              In the 3D Builder Studio, open the File menu and click &ldquo;Save as Custom Template&rdquo; to add any project here.
            </p>
            <Link
              href="/templates"
              className="inline-block px-4 py-2 rounded-xl bg-[#ff6b4a] text-white text-xs font-bold"
            >
              Browse Curated Templates
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-3xl bg-[#11131e] border border-white/10 overflow-hidden"
              >
                <div
                  style={{ background: tpl.thumbnailGradient }}
                  className="h-36 p-4 flex items-end font-mono text-xs text-white/80"
                >
                  {tpl.category}
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="font-bold text-sm">{tpl.name}</div>
                  <button
                    type="button"
                    onClick={() => void handleCloneCustom(tpl.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#ff6b4a] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Use</span>
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
