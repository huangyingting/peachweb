import Link from "next/link";
import { Layers, Box, Gauge, Sparkles, Globe, MessageSquare, History, Smartphone } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";

export default function FeaturesPage() {
  const features = [
    {
      icon: Layers,
      badge: "UI Mode",
      title: "Visual Flexbox & Box-Model Inspector",
      desc: "Craft pixel-accurate sections, containers, headings, buttons, cards, and forms with live padding/margin controls and interactive Hover/Pressed state styling.",
    },
    {
      icon: Box,
      badge: "3D Mode",
      title: "Real-Time Three.js Scene & PBR Material Studio",
      desc: "Insert 3D primitives (Torus Knot, Icosahedron, Cylinder, Sphere, Ring, Box), adjust directional/point lights, and dial in metallic, roughness, emissive, and wireframe properties.",
    },
    {
      icon: Gauge,
      badge: "Animate Mode",
      title: "Scroll-Bound Keyframe Timeline Scrubber",
      desc: "Scrub from 0% to 100% scroll progress and record camera bookmarks and 3D object transforms that interpolate smoothly as visitors scroll.",
    },
    {
      icon: Sparkles,
      badge: "AI Copilot (/remix)",
      title: "5-Step AI 3D Website Synthesis",
      desc: "Select your industry category, describe your brand, pick a visual style collection and 3D scene blueprint, and customize live brand colors in under 60 seconds.",
    },
    {
      icon: Smartphone,
      badge: "Responsive",
      title: "Desktop, Tablet & Mobile Breakpoint Switcher",
      desc: "Preview and fine-tune how your UI overlay and 3D camera framing adapt across Desktop (1280px), Tablet (768px), and Mobile (390px) viewports.",
    },
    {
      icon: History,
      badge: "Version Control",
      title: "Named Version History Snapshots & Instant Restore",
      desc: "Capture immutable snapshots of both your UI tree and 3D scene state before major changes and restore any version in a single click.",
    },
    {
      icon: MessageSquare,
      badge: "Collaboration",
      title: "Spatial Canvas Comments & Team Workspaces",
      desc: "Pin contextual review comments directly onto the 3D viewport, organize projects across team workspaces, and resolve feedback threads.",
    },
    {
      icon: Globe,
      badge: "One-Click Publish",
      title: "Instant Live 3D Site Publishing (/site/[slug])",
      desc: "Publish your 3D website to a dedicated live URL with immutable published snapshots and audit-logged deployment history.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090f] text-white">
      <MarketingNavbar />
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#ff6b4a] mb-3">
            Platform Capabilities
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
            Every Tool Required to Build Spatial 3D Websites.
          </h1>
          <p className="text-lg text-slate-300">
            PeachWeb unites a responsive DOM layout engine, a real-time WebGL 3D viewport, and a scroll keyframe timeline inside one cohesive browser studio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-8 rounded-3xl bg-[#11131e] border border-white/10 hover:border-[#ff6b4a]/40 transition"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a] text-xs font-bold mb-4">
                <f.icon className="w-4 h-4" />
                <span>{f.badge}</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{f.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-10 rounded-3xl bg-gradient-to-r from-[#ff6b4a]/20 to-[#9333ea]/20 border border-white/15 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-1">Experience the 3D Studio Firsthand</h3>
            <p className="text-sm text-slate-300">
              Generate a site with AI or start from a curated 3D template.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/remix"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-sm font-bold"
            >
              Start with AI (/remix)
            </Link>
            <Link
              href="/workspace"
              className="px-6 py-3 rounded-full bg-white/10 text-white text-sm font-semibold"
            >
              Open Workspace
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
