"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { PEACH_TEMPLATES_CATALOG } from "@/lib/templates-catalog";

export default function TemplatesLibraryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const categories = [
    "ALL",
    "SAAS",
    "AI Tools",
    "Agency",
    "E-Commerce",
    "Finance",
    "Storytelling",
  ];

  const filtered = PEACH_TEMPLATES_CATALOG.filter((tpl) => {
    const matchesCat = category === "ALL" || tpl.category === category;
    const matchesSearch =
      !search.trim() ||
      tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  async function handleUseTemplate(templateId: string) {
    setCreatingId(templateId);
    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { website: { id: string } };
        router.push(`/builder/${data.website.id}`);
      }
    } finally {
      setCreatingId(null);
    }
  }

  return (
    <WorkspaceShell>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">3D Website Templates</h1>
            <p className="text-xs text-slate-400 mt-1">
              Every template includes a real-time Three.js 3D scene, scroll keyframes, and responsive UI sections.
            </p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 3D templates..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11131e] border border-white/10 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                category === cat
                  ? "bg-[#ff6b4a] text-white"
                  : "bg-[#11131e] text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-3xl bg-[#11131e] border border-white/10 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div
                  style={{ background: tpl.thumbnailGradient }}
                  className="h-44 p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/50 text-[10px] font-bold">
                      {tpl.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold">
                      {tpl.badge}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-white/85">
                    {tpl.styleCollection}
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="text-base font-bold">{tpl.name}</h2>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <Link
                  href={`/templates/${tpl.id}`}
                  className="text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Inspect 3D Scene →
                </Link>
                <button
                  type="button"
                  disabled={creatingId === tpl.id}
                  onClick={() => void handleUseTemplate(tpl.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {creatingId === tpl.id ? "Cloning..." : "Use Template"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
