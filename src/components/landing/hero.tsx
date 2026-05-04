"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { Aurora } from "@/components/ui/aurora";
import { GridPattern } from "@/components/ui/grid-pattern";
import { TextReveal } from "@/components/ui/text-reveal";
import { NumberTicker } from "@/components/ui/number-ticker";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { FadeIn } from "@/components/animations";

const STATS = [
  { label: "Avg Waste Found", value: 32, suffix: "%" },
  { label: "Audits Run", value: 1240, suffix: "+" },
  { label: "Budget Saved", value: 47, prefix: "₹", suffix: "L" },
];

export function Hero() {
  return (
    <section className="relative pt-16 bg-white overflow-hidden">
      <Aurora size="lg" />
      <GridPattern
        width={60}
        height={60}
        className="text-[#E2E8F0] opacity-40"
        squares={[[2, 3], [5, 7], [8, 1], [11, 4], [14, 8], [3, 12], [7, 15]]}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12">
        <div
          className="grid items-center gap-16"
          style={{ gridTemplateColumns: "55% 45%", minHeight: "calc(100vh - 64px)" }}
        >
          <div className="flex flex-col gap-8">
            <FadeIn>
              <span className="inline-flex w-fit items-center rounded-full bg-[#F3E8FF] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6D28D9]">
                Deterministic Meta Ads Audit
              </span>
            </FadeIn>

            <TextReveal
              text="You Might Be Wasting 20–40% of Your Meta Budget"
              delay={0.2}
              wordDelay={0.04}
              className="text-[56px] font-medium leading-[1.08] tracking-[-0.03em] text-[#0F172A]"
            />

            <FadeIn delay={0.5}>
              <p className="max-w-[520px] text-[18px] leading-[1.6] font-normal text-[#475569]">
                Upload your Meta Ads CSV. AdFix analyzes your data, calculates a fixed Target CPA, and classifies every ad into{" "}
                <span className="font-medium text-[#0F172A]">Kill</span>,{" "}
                <span className="font-medium text-[#0F172A]">Fix</span>,{" "}
                <span className="font-medium text-[#0F172A]">Scale</span>, or{" "}
                <span className="font-medium text-[#0F172A]">No Action</span>{" "}
                using deterministic rules.
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="flex flex-wrap items-center gap-4">
                <MagneticButton className="inline-flex">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-[#6D28D9] text-white px-6 py-3 rounded-lg text-[16px] font-semibold hover:bg-[#5b21b6] transition-all press-scale"
                  >
                    Run Free Preview <ArrowRight className="h-4 w-4" />
                  </Link>
                </MagneticButton>
                <Link
                  href="#report"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#0F172A] border border-[#E2E8F0] px-6 py-3 rounded-lg text-[16px] font-medium hover:bg-[#F8FAFC] transition-all press-scale"
                >
                  View Sample Report
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.7}>
              <p className="text-[14px] font-medium leading-[1.5] text-[#94A3B8]">
                CSV-based analysis <span className="mx-2">•</span> Rule-based logic <span className="mx-2">•</span> No guesswork
              </p>
            </FadeIn>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <FadeIn delay={0.3}>
              <div className="w-full max-w-[400px] rounded-2xl border border-[#E2E8F0]/60 bg-white/80 backdrop-blur-xl p-6 shadow-elevated">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[14px] font-medium text-[#94A3B8]">Health Score</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#FEF2F2] px-2 py-1 text-[12px] font-semibold text-[#DC2626]">
                    Average
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[72px] font-semibold text-[#0F172A] leading-none">
                    <NumberTicker value={42} duration={1.5} />
                  </span>
                  <span className="text-[24px] text-[#94A3B8]">/100</span>
                </div>

                <div className="mb-6 h-2 w-full rounded-full bg-[#F1F5F9]">
                  <div
                    className="h-full rounded-full bg-[#DC2626] transition-all duration-1000 ease-out"
                    style={{ width: "42%" }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="rounded-lg bg-[#FEF2F2] p-3 text-center">
                    <p className="text-[32px] font-semibold text-[#DC2626] leading-none">
                      <NumberTicker value={6} />
                    </p>
                    <p className="mt-1 text-[14px] font-medium text-[#94A3B8]">Kill</p>
                  </div>
                  <div className="rounded-lg bg-[#FFFBEB] p-3 text-center">
                    <p className="text-[32px] font-semibold text-[#D97706] leading-none">
                      <NumberTicker value={4} />
                    </p>
                    <p className="mt-1 text-[14px] font-medium text-[#94A3B8]">Fix</p>
                  </div>
                  <div className="rounded-lg bg-[#ECFDF5] p-3 text-center">
                    <p className="text-[32px] font-semibold text-[#059669] leading-none">
                      <NumberTicker value={2} />
                    </p>
                    <p className="mt-1 text-[14px] font-medium text-[#94A3B8]">Scale</p>
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#94A3B8]">Wasted Budget</span>
                    <span className="text-[14px] font-semibold text-[#0F172A]">₹1,27,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#94A3B8]">Waste %</span>
                    <span className="text-[14px] font-semibold text-[#DC2626]">38.5%</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={0.8}>
          <div className="flex items-center justify-center gap-12 py-8 border-t border-[#F1F5F9] mt-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-[28px] font-semibold text-[#0F172A]">
                  {stat.prefix && <span className="text-[#6D28D9]">{stat.prefix}</span>}
                  <NumberTicker value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[13px] text-[#94A3B8] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
