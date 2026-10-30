import Link from "next/link";
import { Briefcase, ArrowRight, Sparkles } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { PeachThreeCanvas } from "@/components/studio/PeachThreeCanvas";
import { createDefaultSceneState } from "@/lib/templates-catalog";

const PORTFOLIO_SCENE = createDefaultSceneState({
  primaryColor: "#f43f5e",
  secondaryColor: "#fb923c",
  accentColor: "#facc15",
  preset: "solar-studio",
  heroPrimitive: "cylinder",
});

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#08090f] text-white">
      <MarketingNavbar />
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>3D Portfolios & Creative Agencies</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Portfolios That Win Clients at First Scroll.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Present creative direction, 3D motion studies, and interactive case studies inside an unforgettable spatial stage built without writing WebGL boilerplate.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/templates/123"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold flex items-center gap-2"
              >
                <span>Clone Agency 3D Template</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/gallery"
                className="px-6 py-3.5 rounded-full bg-white/10 text-white text-sm font-semibold"
              >
                Browse Community Portfolios
              </Link>
            </div>
          </div>

          <div className="h-[420px] rounded-3xl overflow-hidden border border-white/15 bg-[#11131e] relative">
            <PeachThreeCanvas sceneState={PORTFOLIO_SCENE} interactiveOrbit={true} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Interactive 3D Hero Sculptures",
              desc: "Greet art directors and founders with custom 3D geometry that reacts to cursor movement and scroll velocity.",
            },
            {
              title: "Multi-Page Case Study Flows",
              desc: "Manage Home, About, and Project pages with shared brand palettes and typography tokens.",
            },
            {
              title: "Instant Shareable Client Previews",
              desc: "Share live interactive previews and collect spatial pin comments directly on the 3D canvas.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="p-7 rounded-3xl bg-[#11131e] border border-white/10"
            >
              <Sparkles className="w-5 h-5 text-rose-400 mb-3" />
              <h2 className="text-lg font-bold mb-2">{c.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
