"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Box,
  Layers,
  Cpu,
  ShoppingBag,
  Briefcase,
  BookOpen,
  LayoutGrid,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

export function MarketingNavbar() {
  const [openMenu, setOpenMenu] = useState<"product" | "uses" | "resources" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      onMouseLeave={() => setOpenMenu(null)}
      className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#08090f]/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b4a] via-[#ec4899] to-[#9333ea] flex items-center justify-center font-extrabold text-white shadow-lg shadow-[#ff6b4a]/30">
            P
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Peach<span className="text-[#ff6b4a]">Web</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-200">
          <div
            onMouseEnter={() => setOpenMenu("product")}
            className="relative py-2"
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "product" ? null : "product")}
              className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
            >
              <span>Product</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div
            onMouseEnter={() => setOpenMenu("uses")}
            className="relative py-2"
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "uses" ? null : "uses")}
              className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
            >
              <span>Uses</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div
            onMouseEnter={() => setOpenMenu("resources")}
            className="relative py-2"
          >
            <button
              type="button"
              onClick={() =>
                setOpenMenu(openMenu === "resources" ? null : "resources")
              }
              className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
            >
              <span>Resources</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <Link href="/pricing" className="hover:text-white transition">
            Pricing
          </Link>
          <Link href="/gallery" className="hover:text-white transition">
            Showcase
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2.5 rounded-full text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition"
          >
            Log in
          </Link>
          <Link
            href="/workspace"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-sm font-bold shadow-lg shadow-[#ff6b4a]/25 hover:opacity-95 transition flex items-center gap-1.5"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Mega-Menus */}
      {openMenu === "product" && (
        <div className="hidden md:block border-t border-white/10 bg-[#0d0f1a]/95 backdrop-blur-2xl py-8">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-6">
            <Link
              href="/features"
              onClick={() => setOpenMenu(null)}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ff6b4a]/15 text-[#ff6b4a] flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <div className="font-bold text-white group-hover:text-[#ff6b4a] transition">
                Visual 3D + UI Builder
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Compose responsive Flexbox UI overlays atop real-time WebGL 3D scenes.
              </p>
            </Link>

            <Link
              href="/technology"
              onClick={() => setOpenMenu(null)}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="font-bold text-white group-hover:text-purple-400 transition">
                3D Engine & Shaders
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Three.js WebGL 2.0 pipeline with PBR materials, bloom, and scroll keyframes.
              </p>
            </Link>

            <Link
              href="/remix"
              onClick={() => setOpenMenu(null)}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="font-bold text-white group-hover:text-sky-400 transition">
                AI 3D Site Generator
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generate tailored 3D websites in 5 guided steps with live brand palette preview.
              </p>
            </Link>
          </div>
        </div>
      )}

      {openMenu === "uses" && (
        <div className="hidden md:block border-t border-white/10 bg-[#0d0f1a]/95 backdrop-blur-2xl py-8">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-6">
            <Link
              href="/ecommerce"
              onClick={() => setOpenMenu(null)}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="font-bold text-white">3D E-Commerce</div>
              <p className="text-xs text-slate-400 mt-1">
                Interactive 360° product configurators and spatial luxury storefronts.
              </p>
            </Link>

            <Link
              href="/portfolio"
              onClick={() => setOpenMenu(null)}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="font-bold text-white">Portfolios & Agencies</div>
              <p className="text-xs text-slate-400 mt-1">
                Stand out with kinetic 3D case studies and interactive agency showcases.
              </p>
            </Link>

            <Link
              href="/storytelling"
              onClick={() => setOpenMenu(null)}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="font-bold text-white">Spatial Storytelling</div>
              <p className="text-xs text-slate-400 mt-1">
                Choreograph multi-chapter camera paths driven by visitor scroll progress.
              </p>
            </Link>
          </div>
        </div>
      )}

      {openMenu === "resources" && (
        <div className="hidden md:block border-t border-white/10 bg-[#0d0f1a]/95 backdrop-blur-2xl py-8">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 gap-6">
            <Link
              href="/gallery"
              onClick={() => setOpenMenu(null)}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ff6b4a]/15 text-[#ff6b4a] flex items-center justify-center shrink-0">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">Made in PeachWeb Showcase</div>
                <p className="text-xs text-slate-400 mt-1">
                  Explore live 3D websites built and published by the PeachWorlds community.
                </p>
              </div>
            </Link>

            <Link
              href="/templates"
              onClick={() => setOpenMenu(null)}
              className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">3D Template Library</div>
                <p className="text-xs text-slate-400 mt-1">
                  Clone production-ready 3D SaaS, AI, Agency, and E-Commerce templates.
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0b0d17] px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/features" className="p-2.5 rounded-xl bg-white/5 text-white">
              Features
            </Link>
            <Link href="/pricing" className="p-2.5 rounded-xl bg-white/5 text-white">
              Pricing
            </Link>
            <Link href="/ecommerce" className="p-2.5 rounded-xl bg-white/5 text-white">
              3D E-Commerce
            </Link>
            <Link href="/portfolio" className="p-2.5 rounded-xl bg-white/5 text-white">
              Portfolios
            </Link>
            <Link href="/technology" className="p-2.5 rounded-xl bg-white/5 text-white">
              Technology
            </Link>
            <Link href="/storytelling" className="p-2.5 rounded-xl bg-white/5 text-white">
              Storytelling
            </Link>
            <Link href="/gallery" className="p-2.5 rounded-xl bg-white/5 text-white">
              Gallery
            </Link>
            <Link href="/login" className="p-2.5 rounded-xl bg-[#ff6b4a] text-white font-bold">
              Log in / Studio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
