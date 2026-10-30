"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, ExternalLink } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { PEACH_TEMPLATES_CATALOG } from "@/lib/templates-catalog";

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = ["ALL", "SAAS", "AI Tools", "Agency", "E-Commerce", "Finance", "Storytelling"];
  const filtered =
    selectedCategory === "ALL"
      ? PEACH_TEMPLATES_CATALOG
      : PEACH_TEMPLATES_CATALOG.filter((t) => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#08090f] text-white">
      <MarketingNavbar />
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a] text-xs font-bold mb-3">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Made in PeachWeb Showcase</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
            Interactive 3D Websites Built With PeachWeb
          </h1>
          <p className="text-base text-slate-300">
            Explore spatial landing pages, 3D product configurators, and scroll-choreographed experiences created in PeachWorlds Studio.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#ff6b4a] text-white"
                  : "bg-[#11131e] text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-[#11131e] border border-white/10 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div
                  style={{ background: item.thumbnailGradient }}
                  className="h-52 p-6 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/50 text-xs font-bold border border-white/15">
                      {item.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold">
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-white/80">
                    By {item.author}
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-lg font-bold mb-2">{item.name}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-md bg-white/5 text-[11px] text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-white/5 flex items-center justify-between">
                <Link
                  href={`/templates/${item.id}`}
                  className="text-xs font-bold text-[#ff6b4a] hover:underline flex items-center gap-1.5"
                >
                  <span>Inspect 3D Scene</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/remix"
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Remix with AI →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
