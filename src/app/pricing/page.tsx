"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      name: "Free",
      tagline: "Explore 3D web creation and publish your first prototype.",
      monthlyPrice: 0,
      yearlyPrice: 0,
      cta: "Start for Free",
      highlighted: false,
      features: [
        "Unlimited 3D Studio sandboxes",
        "5-Step AI Site Generator (/remix)",
        "PeachWeb subdomain publishing",
        "Core 3D primitives & PBR materials",
        "Community showcase access",
      ],
    },
    {
      name: "Starter",
      tagline: "For creators and indie founders launching branded 3D sites.",
      monthlyPrice: 24,
      yearlyPrice: 18,
      cta: "Choose Starter",
      highlighted: false,
      features: [
        "Everything in Free",
        "Custom slug & SEO metadata",
        "Scroll keyframe timeline animations",
        "Post-processing Bloom & Noise shaders",
        "10 Version history snapshots",
      ],
    },
    {
      name: "Pro",
      tagline: "For agencies and product teams shipping high-converting 3D web apps.",
      monthlyPrice: 46,
      yearlyPrice: 35,
      cta: "Upgrade to Pro",
      highlighted: true,
      features: [
        "Everything in Starter",
        "Unlimited Version History & Restore",
        "Spatial Canvas Comments & Team Collaboration",
        "Custom 3D Template library saving",
        "Priority WebGL asset optimization",
      ],
    },
    {
      name: "Enterprise",
      tagline: "Invite-only governance, RBAC, and dedicated security audit logs.",
      monthlyPrice: 129,
      yearlyPrice: 99,
      cta: "Contact Enterprise",
      highlighted: false,
      features: [
        "Everything in Pro",
        "Invite-Only Account Admission & Single-Use Codes",
        "Admin RBAC & Immediate Session Revocation",
        "Immutable Security Audit Trail (/admin/audit-logs)",
        "Dedicated PostgreSQL production isolation",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090f] text-white">
      <MarketingNavbar />
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Spatial Web Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
            Scale Your 3D Web Presence
          </h1>
          <p className="text-base text-slate-300 mb-8">
            Start building for free and upgrade as your team, traffic, and 3D shader pipelines grow.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div
            role="group"
            aria-label="Billing Cycle Toggle"
            className="inline-flex items-center p-1.5 rounded-full bg-[#11131e] border border-white/10"
          >
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Yearly Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px]">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price =
              billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={`rounded-3xl p-7 flex flex-col justify-between border ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-[#1a1528] to-[#11131e] border-[#ff6b4a] shadow-2xl shadow-[#ff6b4a]/15"
                    : "bg-[#11131e] border-white/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                    {plan.highlighted && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ff6b4a] text-[10px] font-extrabold uppercase">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 min-h-[36px] mb-6">
                    {plan.tagline}
                  </p>

                  <div className="mb-6">
                    <span
                      data-testid={`price-${plan.name.toLowerCase()}`}
                      className="text-4xl font-extrabold"
                    >
                      ${price}
                    </span>
                    <span className="text-xs text-slate-400">
                      {" "}
                      / month {billingCycle === "yearly" && price > 0 ? "(billed yearly)" : ""}
                    </span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-200 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#ff6b4a] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/workspace"
                  className={`w-full py-3 rounded-xl text-center text-xs font-bold transition ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white"
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Pricing FAQ Accordion (68_2_marketing_pricing_faq_expanded.png) */}
        <section className="mt-24 max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Everything you need to know about PeachWeb plans, custom domains, and 3D bandwidth.
            </p>
          </div>
          {[
            {
              q: "Can I build and publish a 3D website for free?",
              a: "Yes. Every workspace includes unlimited 3D Studio sandboxes, the 5-step AI Site Generator (/remix), and instant publishing to a .peachweb.site subdomain.",
            },
            {
              q: "How do Custom Domains and Custom Code work?",
              a: "Paid site plans (Individual, Basic, and Pro) unlock custom domain routing with automatic SSL and custom head/body script injection directly inside Site Settings.",
            },
            {
              q: "Can I switch between Monthly and Yearly billing anytime?",
              a: "Yes. Yearly billing saves 25% across all workspace and site plans, and you can upgrade or switch billing cycles from your workspace settings at any time.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl bg-[#11131e] border border-white/10 p-5"
            >
              <summary className="font-bold text-sm text-white cursor-pointer flex items-center justify-between">
                <span>{faq.q}</span>
                <span className="text-[#ff6b4a] text-xs group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
