import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { PeachThreeCanvas } from "@/components/studio/PeachThreeCanvas";
import { createDefaultSceneState } from "@/lib/templates-catalog";

const STORY_SCENE = createDefaultSceneState({
  primaryColor: "#ec4899",
  secondaryColor: "#8b5cf6",
  accentColor: "#f472b6",
  preset: "peach-aurora",
  heroPrimitive: "sphere",
});

export default function StorytellingPage() {
  return (
    <div className="min-h-screen bg-[#08090f] text-white">
      <MarketingNavbar />
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/15 text-pink-400 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Immersive Spatial Storytelling</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Guide Visitors Through Living 3D Chapters.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Choreograph camera flight paths, atmospheric fog transitions, and typographic reveals that unfold seamlessly as your audience scrolls.
            </p>
            <div className="flex gap-4">
              <Link
                href="/templates/126"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold flex items-center gap-2"
              >
                <span>Open Odyssey Storytelling Template</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="h-[420px] rounded-3xl overflow-hidden border border-white/15 bg-[#11131e]">
            <PeachThreeCanvas sceneState={STORY_SCENE} interactiveOrbit={true} />
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
