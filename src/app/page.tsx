"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Layers,
  Box,
  Wand2,
  Gauge,
  Globe,
  CheckCircle2,
  Play,
} from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { PeachThreeCanvas } from "@/components/studio/PeachThreeCanvas";
import { PEACH_TEMPLATES_CATALOG, createDefaultSceneState } from "@/lib/templates-catalog";

const HERO_SCENE = createDefaultSceneState({
  primaryColor: "#ff6b4a",
  secondaryColor: "#9333ea",
  accentColor: "#38bdf8",
  preset: "peach-aurora",
  heroPrimitive: "torus",
});

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    function onScroll() {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#08090f] text-white relative">
      <MarketingNavbar />

      {/* Fixed Interactive 3D WebGL Background Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-65">
        <PeachThreeCanvas
          sceneState={HERO_SCENE}
          scrollProgress={scrollProgress}
          interactiveOrbit={false}
        />
      </div>

      <main className="relative z-10 pt-28">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#ff6b4a]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI + 3D WebGL No-Code Website Builder</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06]">
              Build 3D Websites{" "}
              <span className="bg-gradient-to-r from-[#ff6b4a] via-[#ec4899] to-[#a855f7] bg-clip-text text-transparent">
                Beyond Dimensions.
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              Design responsive UI layouts, customize real-time 3D scenes & PBR shaders, choreograph scroll-triggered camera animations, and publish live in one click.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/remix"
                className="px-7 py-4 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white font-bold text-sm shadow-xl shadow-[#ff6b4a]/30 hover:opacity-95 transition flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>Create a 3D Site with AI</span>
              </Link>
              <Link
                href="/workspace"
                className="px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-[#ff6b4a]" />
                <span>Open 3D Builder Studio</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Real-Time Three.js WebGL 2.0
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Scroll Keyframe Timeline
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Instant Cloud Publishing
              </span>
            </div>
          </div>

          {/* Interactive 3D Studio Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/15 bg-[#10121e]/85 backdrop-blur-xl p-4 shadow-2xl">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 text-xs text-slate-400 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="font-mono text-[11px] text-slate-300">
                  builder.peachworlds.com • UI | 3D | Animate
                </span>
                <span className="text-[#ff6b4a] font-semibold">60 FPS</span>
              </div>
              <div className="h-[340px] rounded-2xl overflow-hidden border border-white/10 relative">
                <PeachThreeCanvas
                  sceneState={HERO_SCENE}
                  scrollProgress={scrollProgress}
                  interactiveOrbit={true}
                />
                <div className="absolute bottom-3 inset-x-3 px-3.5 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                  <span>Scroll Progress Keyframe</span>
                  <span className="font-mono text-[#ff6b4a]">
                    {Math.round(scrollProgress * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-[#ff6b4a] mb-2">
              Three Modes, One Unified Studio
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Everything You Need to Ship Spatial Web Experiences
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                mode: "UI Mode",
                title: "Responsive Flexbox & Grid Layout",
                description:
                  "Design crisp DOM sections, typography scales, buttons, cards, and forms with Desktop, Tablet, and Mobile breakpoint overrides.",
              },
              {
                icon: Box,
                mode: "3D Mode",
                title: "PBR Materials, Lighting & Post-FX",
                description:
                  "Add 3D primitives or models, fine-tune metallic/roughness/transmission shaders, and enable Bloom, Noise, and Vignette effects.",
              },
              {
                icon: Gauge,
                mode: "Animate Mode",
                title: "Scroll-Choreographed Keyframes",
                description:
                  "Bind camera positions and 3D object transforms directly to scroll percentage (0%–100%) without writing a single line of code.",
              },
            ].map((item) => (
              <div
                key={item.mode}
                className="p-8 rounded-3xl bg-[#10121e]/90 border border-white/10 hover:border-[#ff6b4a]/50 transition"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a] text-xs font-bold mb-5">
                  <item.icon className="w-4 h-4" />
                  <span>{item.mode}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured 3D Templates Showcase */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#ff6b4a] mb-2">
                Curated 3D Blueprints
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                Start From a Production-Ready 3D Template
              </h2>
            </div>
            <Link
              href="/templates"
              className="text-sm font-semibold text-[#ff6b4a] hover:underline flex items-center gap-1.5"
            >
              <span>Browse All 3D Templates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PEACH_TEMPLATES_CATALOG.map((tpl) => (
              <Link
                key={tpl.id}
                href={`/templates/${tpl.id}`}
                className="group rounded-3xl bg-[#10121e]/90 border border-white/10 overflow-hidden hover:border-[#ff6b4a]/50 transition flex flex-col"
              >
                <div
                  style={{ background: tpl.thumbnailGradient }}
                  className="h-48 p-6 flex flex-col justify-between relative"
                >
                  <span className="self-start px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold text-white border border-white/15">
                    {tpl.category}
                  </span>
                  <div className="text-xs font-mono text-white/80">
                    3D Scene + Scroll Keyframes
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#ff6b4a] transition">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span>{tpl.styleCollection}</span>
                    <span className="text-[#ff6b4a] font-semibold">
                      Inspect Template →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-extrabold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Do I need 3D modeling or WebGL coding experience to use PeachWeb?",
                a: "No. PeachWeb provides a visual 3-mode studio (UI, 3D, Animate) plus a 5-step AI Site Generator (/remix) that synthesizes complete 3D scenes, lighting, and responsive layouts automatically.",
              },
              {
                q: "How do scroll-triggered 3D animations work?",
                a: "Switch to Animate mode in the builder, scrub the timeline between 0% and 100% scroll progress, reposition your camera or 3D meshes, and click Add Keyframe. PeachWeb smoothly interpolates all transforms at 60 FPS.",
              },
              {
                q: "How does account admission and team security work?",
                a: "PeachWorlds enforces invite-only account admission with single-use SHA-256 hashed invitation links, role-based access control (USER / ADMIN), immediate session revocation, and an immutable security audit log.",
              },
            ].map((item, idx) => (
              <div
                key={item.q}
                className="rounded-2xl bg-[#10121e]/90 border border-white/10 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-semibold text-sm flex items-center justify-between cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span className="text-[#ff6b4a]">{openFaq === idx ? "−" : "+"}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-xs text-slate-300 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-3xl bg-gradient-to-r from-[#ff6b4a]/20 via-[#ec4899]/20 to-[#9333ea]/20 border border-white/15 p-12 text-center">
            <Globe className="w-10 h-10 text-[#ff6b4a] mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Ready to Launch Your First 3D Website?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8">
              Jump into the PeachWorlds 3D Builder Studio or generate a complete branded 3D website in seconds with AI.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/remix"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-sm font-bold"
              >
                Launch AI Site Generator
              </Link>
              <Link
                href="/pricing"
                className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-semibold"
              >
                Compare Pricing Plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
