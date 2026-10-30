"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PeachThreeCanvas } from "@/components/studio/PeachThreeCanvas";
import { PeachUiOverlay } from "@/components/studio/PeachUiOverlay";
import type { PeachSceneState, PeachUiState } from "@/lib/document-types";

interface PublishedSitePlayerProps {
  name: string;
  slug: string;
  uiState: PeachUiState;
  sceneState: PeachSceneState;
  isPreview?: boolean;
  websiteId?: string;
}

export function PublishedSitePlayer({
  name,
  slug,
  uiState,
  sceneState,
  isPreview = false,
  websiteId,
}: PublishedSitePlayerProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentUiState, setCurrentUiState] = useState<PeachUiState>(uiState);

  useEffect(() => {
    function handleScroll() {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{ backgroundColor: currentUiState.palette.background }}
      className="min-h-screen relative text-white"
    >
      {/* Fixed 3D WebGL Scene Layer */}
      <div className="fixed inset-0 z-0">
        <PeachThreeCanvas
          sceneState={sceneState}
          scrollProgress={scrollProgress}
          interactiveOrbit={true}
        />
      </div>

      {/* Top Navigation Bar for Published / Preview Site */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/50 backdrop-blur-xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: currentUiState.palette.primary }}
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
          >
            P
          </div>
          <span className="font-bold text-sm">{name}</span>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
            {isPreview ? "Live Studio Preview" : `${slug}.peachweb.site`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUiState.pages.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
              {currentUiState.pages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setCurrentUiState({ ...currentUiState, activePageId: p.id })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    currentUiState.activePageId === p.id
                      ? "bg-[#ff6b4a] text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          <div className="text-xs font-mono text-slate-400">
            Scroll 3D: {Math.round(scrollProgress * 100)}%
          </div>

          {isPreview && websiteId && (
            <Link
              href={`/builder/${websiteId}`}
              className="px-3.5 py-1.5 rounded-full bg-[#ff6b4a] text-white text-xs font-bold"
            >
              Back to Studio
            </Link>
          )}
        </div>
      </header>

      {/* Scrollable UI Overlay Layer */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <PeachUiOverlay
          uiState={currentUiState}
          onScrollSectionActivate={(target) => setScrollProgress(target)}
        />
      </main>

      {/* Made in PeachWeb Floating Badge */}
      <div className="fixed bottom-4 right-4 z-30">
        <Link
          href="/"
          className="px-3.5 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white flex items-center gap-2 shadow-xl hover:border-[#ff6b4a]"
        >
          <span className="w-2 h-2 rounded-full bg-[#ff6b4a]" />
          <span>Made in PeachWeb 3D</span>
        </Link>
      </div>
    </div>
  );
}
