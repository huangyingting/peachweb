"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Sparkles, Monitor, Tablet, Smartphone } from "lucide-react";
import { PeachThreeCanvas } from "@/components/studio/PeachThreeCanvas";
import { PeachUiOverlay } from "@/components/studio/PeachUiOverlay";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { PEACH_TEMPLATES_CATALOG, getTemplateById } from "@/lib/templates-catalog";

export default function TemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const template = getTemplateById(params.id) ?? PEACH_TEMPLATES_CATALOG[0];

  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cloning, setCloning] = useState(false);

  async function handleUseTemplate() {
    setCloning(true);
    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      if (res.ok) {
        const data = (await res.json()) as { website: { id: string } };
        router.push(`/builder/${data.website.id}`);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } finally {
      setCloning(false);
    }
  }

  return (
    <WorkspaceShell>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/templates"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold">{template.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a] text-xs font-bold">
                  {template.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#11131e] border border-white/10 rounded-xl p-1">
              {(
                [
                  { id: "desktop", icon: Monitor, label: "Desktop" },
                  { id: "tablet", icon: Tablet, label: "Tablet" },
                  { id: "mobile", icon: Smartphone, label: "Mobile" },
                ] as const
              ).map((vp) => (
                <button
                  key={vp.id}
                  type="button"
                  onClick={() => setViewport(vp.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    viewport === vp.id
                      ? "bg-[#ff6b4a] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <vp.icon className="w-3.5 h-3.5" />
                  <span>{vp.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={cloning}
              onClick={() => void handleUseTemplate()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{cloning ? "Opening Studio..." : "Use This 3D Template"}</span>
            </button>
          </div>
        </div>

        {/* Interactive 3D + UI Preview Frame */}
        <div className="flex justify-center">
          <div
            style={{
              width:
                viewport === "desktop"
                  ? "100%"
                  : viewport === "tablet"
                    ? "768px"
                    : "390px",
            }}
            className="h-[600px] rounded-3xl border border-white/15 bg-[#090a10] overflow-hidden relative flex flex-col transition-all"
          >
            <div className="absolute inset-0 z-0">
              <PeachThreeCanvas
                sceneState={template.sceneState}
                scrollProgress={scrollProgress}
                interactiveOrbit={true}
              />
            </div>

            <div
              onScroll={(e) => {
                const el = e.currentTarget;
                const max = Math.max(1, el.scrollHeight - el.clientHeight);
                setScrollProgress(el.scrollTop / max);
              }}
              className="relative z-10 flex-1 overflow-y-auto p-6"
            >
              <PeachUiOverlay uiState={template.uiState} viewport={viewport} />
            </div>

            <div className="relative z-20 px-4 py-2.5 bg-black/70 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-xs">
              <span>Scroll inside frame or drag to orbit 3D scene</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#ff6b4a]">
                  Keyframe: {Math.round(scrollProgress * 100)}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={scrollProgress}
                  onChange={(e) => setScrollProgress(Number(e.target.value))}
                  className="w-28 accent-[#ff6b4a]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
