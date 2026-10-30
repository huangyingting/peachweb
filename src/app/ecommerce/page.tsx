import Link from "next/link";
import { ShoppingBag, Rotate3d, Sparkles, ArrowRight } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { PeachThreeCanvas } from "@/components/studio/PeachThreeCanvas";
import { createDefaultSceneState } from "@/lib/templates-catalog";

const ECOMMERCE_SCENE = createDefaultSceneState({
  primaryColor: "#f59e0b",
  secondaryColor: "#ea580c",
  accentColor: "#fde047",
  preset: "cyber-obsidian",
  heroPrimitive: "ring",
});

export default function EcommercePage() {
  return (
    <div className="min-h-screen bg-[#08090f] text-white">
      <MarketingNavbar />
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>3D Spatial E-Commerce</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Turn Static Product Pages Into 360° Luxury Showrooms.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Let shoppers rotate, zoom, and customize PBR materials in real time. Boost conversion rates with scroll-choreographed product exploded views and interactive hotspots.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/templates/124"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-[#ff6b4a] text-white text-sm font-bold flex items-center gap-2"
              >
                <span>Launch 3D Storefront Template</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/remix"
                className="px-6 py-3.5 rounded-full bg-white/10 text-white text-sm font-semibold"
              >
                Generate Store with AI
              </Link>
            </div>
          </div>

          <div className="h-[420px] rounded-3xl overflow-hidden border border-white/15 bg-[#11131e] relative">
            <PeachThreeCanvas sceneState={ECOMMERCE_SCENE} interactiveOrbit={true} />
            <div className="absolute bottom-4 left-4 right-4 px-4 py-3 rounded-2xl bg-black/65 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-semibold">
                <Rotate3d className="w-4 h-4 text-amber-400" />
                Drag to Orbit 360° Luxury Showcase
              </span>
              <span className="text-amber-400 font-mono">PBR Metallic 0.9</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Interactive Material Variants",
              desc: "Switch between brushed titanium, rose gold, matte obsidian, and sapphire glass finishes with zero page reloads.",
            },
            {
              title: "Scroll-Driven Exploded Views",
              desc: "Reveal internal engineering and craftsmanship step by step as customers scroll down your product page.",
            },
            {
              title: "60 FPS Mobile WebGL",
              desc: "Adaptive pixel ratio and lightweight shader pipelines keep mobile shoppers engaged without battery drain.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="p-7 rounded-3xl bg-[#11131e] border border-white/10"
            >
              <Sparkles className="w-5 h-5 text-amber-400 mb-3" />
              <h2 className="text-lg font-bold mb-2">{card.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
