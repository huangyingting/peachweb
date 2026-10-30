"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  ExternalLink,
  ArrowRight,
  Globe,
  Layers,
} from "lucide-react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { PEACH_TEMPLATES_CATALOG } from "@/lib/templates-catalog";

interface WebsiteSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailGradient: string;
  isPublished: boolean;
  updatedAt: string;
}

export default function WorkspaceDashboardPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<WebsiteSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/websites")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json() as Promise<{ websites: WebsiteSummary[] }>;
      })
      .then((data) => {
        if (data?.websites) {
          setWebsites(data.websites);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleQuickCreateFromTemplate(templateId: string) {
    const res = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });
    if (res.ok) {
      const data = (await res.json()) as { website: { id: string } };
      router.push(`/builder/${data.website.id}`);
    }
  }

  return (
    <WorkspaceShell>
      <div className="p-8 max-w-6xl mx-auto space-y-10">
        {/* Top Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1c1226] via-[#131528] to-[#0f172a] border border-white/10 p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PEACHWORLDS 3D WORKSPACE</span>
            </div>
            <h1 className="text-3xl font-extrabold">
              Create a 3D Site in Seconds
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use the 5-step AI Site Generator Wizard to synthesize a custom 3D website with your brand colors, or jump directly into the 3D WebGL Studio.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/remix"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#ff6b4a]/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start with AI (/remix)</span>
            </Link>
            <button
              type="button"
              onClick={() => void handleQuickCreateFromTemplate("121")}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Blank 3D Studio</span>
            </button>
          </div>
        </div>

        {/* Recent Websites Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#ff6b4a]" />
              <span>Recent 3D Websites ({websites.length})</span>
            </h2>
            <Link
              href="/my-websites"
              className="text-xs text-[#ff6b4a] hover:underline font-semibold"
            >
              View All Websites →
            </Link>
          </div>

          {loading ? (
            <div className="text-xs text-slate-400 py-8">Loading workspace projects...</div>
          ) : websites.length === 0 ? (
            <div className="rounded-3xl bg-[#11131e] border border-white/10 p-10 text-center space-y-3">
              <Layers className="w-8 h-8 text-[#ff6b4a] mx-auto" />
              <div className="text-sm font-bold">No 3D websites in this workspace yet</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click &ldquo;Start with AI (/remix)&rdquo; or choose one of the curated 3D templates below to launch your first spatial project.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {websites.slice(0, 6).map((site) => (
                <div
                  key={site.id}
                  className="rounded-2xl bg-[#11131e] border border-white/10 overflow-hidden hover:border-[#ff6b4a]/50 transition flex flex-col justify-between"
                >
                  <div
                    style={{ background: site.thumbnailGradient }}
                    className="h-36 p-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/50 text-[10px] font-bold">
                        {site.category}
                      </span>
                      {site.isPublished && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-white/80">
                      {site.slug}.peachweb.site
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="font-bold text-sm text-white truncate">
                        {site.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Updated {new Date(site.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {site.isPublished && (
                        <Link
                          href={`/site/${site.slug}`}
                          title="View Published Live Site"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <Link
                        href={`/builder/${site.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-[#ff6b4a] text-white text-xs font-bold"
                      >
                        Edit in 3D
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Featured 3D Templates */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Featured 3D Templates</h2>
            <Link
              href="/templates"
              className="text-xs text-[#ff6b4a] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore All Templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PEACH_TEMPLATES_CATALOG.slice(0, 3).map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-2xl bg-[#11131e] border border-white/10 overflow-hidden flex flex-col justify-between"
              >
                <div
                  style={{ background: tpl.thumbnailGradient }}
                  className="h-36 p-4 flex flex-col justify-between"
                >
                  <span className="self-start px-2.5 py-0.5 rounded-full bg-black/50 text-[10px] font-bold">
                    {tpl.category}
                  </span>
                  <span className="text-xs font-semibold text-white/90">
                    {tpl.styleCollection}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="font-bold text-sm">{tpl.name}</div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {tpl.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <Link
                      href={`/templates/${tpl.id}`}
                      className="text-xs text-slate-300 hover:text-white"
                    >
                      Preview 3D
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleQuickCreateFromTemplate(tpl.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#ff6b4a] text-white text-xs font-bold transition cursor-pointer"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
