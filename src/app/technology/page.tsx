import Link from "next/link";
import { Cpu, Layers, Gauge, ShieldCheck } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { PeachThreeCanvas } from "@/components/studio/PeachThreeCanvas";
import { createDefaultSceneState } from "@/lib/templates-catalog";

const TECH_SCENE = createDefaultSceneState({
  primaryColor: "#38bdf8",
  secondaryColor: "#6366f1",
  accentColor: "#f43f5e",
  preset: "cyber-obsidian",
  heroPrimitive: "icosahedron",
});

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-[#08090f] text-white">
      <MarketingNavbar />
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/15 text-sky-400 text-xs font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>PeachWeb WebGL 2.0 Architecture</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Engineered for 60 FPS Spatial Rendering.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Under the hood, PeachWeb pairs a declarative JSON scene graph (`sceneState` + `uiState`) with ACES Filmic tone mapping, physical materials, and deterministic scroll keyframe interpolation.
            </p>
            <div className="flex gap-4">
              <Link
                href="/workspace"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-bold"
              >
                Inspect inside 3D Studio
              </Link>
            </div>
          </div>

          <div className="h-[420px] rounded-3xl overflow-hidden border border-white/15 bg-[#11131e]">
            <PeachThreeCanvas sceneState={TECH_SCENE} interactiveOrbit={true} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-[#11131e] border border-white/10">
            <Layers className="w-6 h-6 text-sky-400 mb-3" />
            <h2 className="text-lg font-bold mb-2">Dual-Layer DOM + WebGL Sync</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              DOM Flexbox overlays remain 100% accessible and SEO-indexable while driving underlying Three.js camera and mesh keyframes.
            </p>
          </div>
          <div className="p-7 rounded-3xl bg-[#11131e] border border-white/10">
            <Gauge className="w-6 h-6 text-indigo-400 mb-3" />
            <h2 className="text-lg font-bold mb-2">Linear & Spline Keyframes</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time interpolation across position, rotation, scale, and camera look-at targets along the [0, 1] scroll timeline.
            </p>
          </div>
          <div className="p-7 rounded-3xl bg-[#11131e] border border-white/10">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h2 className="text-lg font-bold mb-2">Immutable Version Snapshots</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every saved version and live publish stores a complete, self-contained snapshot of both UI and 3D scene state.
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
