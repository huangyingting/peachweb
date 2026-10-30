"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Monitor,
  Tablet,
  Smartphone,
  Check,
} from "lucide-react";
import { PeachThreeCanvas } from "@/components/studio/PeachThreeCanvas";
import { PeachUiOverlay } from "@/components/studio/PeachUiOverlay";
import {
  REMIX_CATEGORIES,
  REMIX_STYLE_COLLECTIONS,
  synthesizeRemixDocument,
} from "@/lib/remix-generator";
import { PEACH_TEMPLATES_CATALOG } from "@/lib/templates-catalog";

export default function RemixAiWizardPage() {
  const router = useRouter();
  // Step 0: Category, Step 1: Business Name, Step 2: Business Description, Step 3: Style Collection, Step 4: 3D Design + Live Preview, Step 5: Brand Color Customizer + Generate
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string>("SAAS");
  const [businessName, setBusinessName] = useState("PeachWeb 3D Studio");
  const [businessDescription, setBusinessDescription] = useState(
    "Next-generation interactive 3D SaaS platform with scroll-choreographed WebGL product storytelling.",
  );
  const [collectionId, setCollectionId] = useState<string>(
    REMIX_STYLE_COLLECTIONS[0].id,
  );
  const [templateId, setTemplateId] = useState<string>(
    PEACH_TEMPLATES_CATALOG[0].id,
  );
  const [palette, setPalette] = useState<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  }>({ ...REMIX_STYLE_COLLECTIONS[0].palette });
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [generating, setGenerating] = useState(false);

  const liveDocument = useMemo(
    () =>
      synthesizeRemixDocument({
        category,
        businessName,
        businessDescription,
        collectionId,
        templateId,
        palette,
      }),
    [
      category,
      businessName,
      businessDescription,
      collectionId,
      templateId,
      palette,
    ],
  );

  function handleSelectCollection(colId: string) {
    setCollectionId(colId);
    const col = REMIX_STYLE_COLLECTIONS.find((c) => c.id === colId);
    if (col) {
      setPalette({ ...col.palette });
    }
  }

  async function handleGenerateWebsite() {
    setGenerating(true);
    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remix: {
            category,
            businessName,
            businessDescription,
            collectionId,
            templateId,
            palette,
          },
        }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = (await res.json()) as { website: { id: string } };
        router.push(`/builder/${data.website.id}`);
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#08090f] text-white relative overflow-hidden flex flex-col">
      {/* Background Animated Three.js WebGL Orb Canvas */}
      {step < 4 && (
        <div className="fixed inset-0 z-0 opacity-45 pointer-events-none">
          <PeachThreeCanvas
            sceneState={liveDocument.sceneState}
            scrollProgress={step * 0.2}
            interactiveOrbit={false}
          />
        </div>
      )}

      {/* Top Wizard Header */}
      <header className="relative z-20 px-8 h-20 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#9333ea] flex items-center justify-center font-bold text-xs">
              P
            </div>
            <span className="font-bold text-sm">
              Peach<span className="text-[#ff6b4a]">Worlds</span> AI Site Generator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span
            data-testid="remix-step-indicator"
            className="px-3.5 py-1.5 rounded-full bg-white/10 font-mono font-semibold text-white"
          >
            {step === 0 ? "Category Selection" : `Step ${step} of 5`}
          </span>
        </div>
      </header>

      {/* Wizard Content Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-10">
        {step < 4 ? (
          <div className="max-w-2xl w-full rounded-3xl bg-[#11131e]/90 backdrop-blur-2xl border border-white/15 p-8 sm:p-10 shadow-2xl">
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#ff6b4a] mb-2">
                    Create a Site in Seconds
                  </div>
                  <h1 className="text-3xl font-extrabold">
                    What kind of site do you want to generate?
                  </h1>
                </div>

                <div className="flex flex-wrap gap-3">
                  {REMIX_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                        category === cat
                          ? "bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white border-transparent shadow-lg shadow-[#ff6b4a]/25"
                          : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#ff6b4a] mb-2">
                    Start with Basics • Step 1 of 5
                  </div>
                  <h1 className="text-3xl font-extrabold">
                    What&apos;s the name of your business/project?
                  </h1>
                </div>

                <input
                  data-testid="remix-business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Nebula Cloud 3D"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#090b12] border border-white/15 text-base text-white focus:outline-none focus:border-[#ff6b4a]"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#ff6b4a] mb-2">
                    Start with Basics • Step 2 of 5
                  </div>
                  <h1 className="text-3xl font-extrabold">
                    That&apos;s a cool name. What is the business about?
                  </h1>
                </div>

                <textarea
                  data-testid="remix-business-desc"
                  rows={4}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe your product, audience, and value proposition..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#090b12] border border-white/15 text-sm text-white focus:outline-none focus:border-[#ff6b4a]"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#ff6b4a] mb-2">
                    Pick Your Style • Step 3 of 5
                  </div>
                  <h1 className="text-3xl font-extrabold">
                    Select the style that fits your site.
                  </h1>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {REMIX_STYLE_COLLECTIONS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleSelectCollection(col.id)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        collectionId === col.id
                          ? "border-[#ff6b4a] bg-[#ff6b4a]/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div
                        style={{ background: col.previewGradient }}
                        className="h-20 rounded-xl mb-3"
                      />
                      <div className="font-bold text-sm flex items-center justify-between">
                        <span>{col.name}</span>
                        {collectionId === col.id && (
                          <Check className="w-4 h-4 text-[#ff6b4a]" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {col.tagline}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep(Math.max(0, step - 1))}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                data-testid="remix-continue-btn"
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Steps 4 & 5: Split Layout with Live Interactive 3D Preview */
          <div className="max-w-7xl w-full grid lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 rounded-3xl bg-[#11131e]/95 backdrop-blur-2xl border border-white/15 p-7 flex flex-col justify-between">
              {step === 4 ? (
                <div className="space-y-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#ff6b4a] mb-1">
                      Select 3D Design • Step 4 of 5
                    </div>
                    <h1 className="text-2xl font-extrabold">
                      Choose the 3D design that you like most.
                    </h1>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {PEACH_TEMPLATES_CATALOG.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setTemplateId(tpl.id)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                          templateId === tpl.id
                            ? "border-[#ff6b4a] bg-[#ff6b4a]/15"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div
                          style={{ background: tpl.thumbnailGradient }}
                          className="h-20 rounded-xl mb-2"
                        />
                        <div className="font-bold text-xs text-white truncate">
                          {tpl.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tpl.category}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#ff6b4a] mb-1">
                      Color Styles • Step 5 of 5
                    </div>
                    <h1 className="text-2xl font-extrabold">
                      Customize the colors to fit your brand.
                    </h1>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        { key: "primary", label: "Primary Brand" },
                        { key: "secondary", label: "Secondary Glow" },
                        { key: "accent", label: "3D Rim Accent" },
                        { key: "background", label: "Scene Background" },
                        { key: "surface", label: "Card Surface" },
                        { key: "text", label: "Typography" },
                      ] as const
                    ).map((item) => (
                      <div
                        key={item.key}
                        className="p-3 rounded-xl bg-[#090b12] border border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {item.label}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {palette[item.key]}
                          </div>
                        </div>
                        <input
                          type="color"
                          value={palette[item.key]}
                          onChange={(e) =>
                            setPalette({ ...palette, [item.key]: e.target.value })
                          }
                          className="w-8 h-8 rounded cursor-pointer bg-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>

                {step === 4 ? (
                  <button
                    type="button"
                    data-testid="remix-continue-btn"
                    onClick={() => setStep(5)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Customize Colors</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="remix-generate-btn"
                    disabled={generating}
                    onClick={() => void handleGenerateWebsite()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#ff6b4a]/30 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {generating ? "Generating 3D Website..." : "Generate & Continue in Builder"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Live Interactive 3D + UI Preview */}
            <div className="lg:col-span-7 rounded-3xl bg-[#0b0d16] border border-white/15 overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-black/40">
                <span className="text-xs font-bold text-slate-300">
                  Live 3D Preview — {businessName}
                </span>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                  {(
                    [
                      { id: "desktop", icon: Monitor },
                      { id: "tablet", icon: Tablet },
                      { id: "mobile", icon: Smartphone },
                    ] as const
                  ).map((vp) => (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => setViewport(vp.id)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        viewport === vp.id
                          ? "bg-[#ff6b4a] text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <vp.icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex justify-center bg-[#07080d] overflow-hidden">
                <div
                  style={{
                    width:
                      viewport === "desktop"
                        ? "100%"
                        : viewport === "tablet"
                          ? "768px"
                          : "390px",
                  }}
                  className="h-[520px] relative overflow-y-auto"
                >
                  <div className="sticky top-0 h-[520px] -mb-[520px] inset-x-0 z-0">
                    <PeachThreeCanvas
                      sceneState={liveDocument.sceneState}
                      interactiveOrbit={true}
                    />
                  </div>
                  <div className="relative z-10 p-6">
                    <PeachUiOverlay
                      uiState={liveDocument.uiState}
                      viewport={viewport}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
