"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Aurora } from "@/components/ui/aurora";
import { GridPattern } from "@/components/ui/grid-pattern";
import { TextReveal } from "@/components/ui/text-reveal";
import { NumberTicker } from "@/components/ui/number-ticker";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { FadeIn } from "@/components/animations";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const STATS = [
  { label: "Avg Waste Found", value: 32, suffix: "%" },
  { label: "Audits Run", value: 1240, suffix: "+" },
  { label: "Budget Saved", value: 47, prefix: "₹", suffix: "L" },
];

export function Hero() {
  return (
    <section className="relative pt-16 sm:pt-20 bg-card overflow-hidden">
      <Aurora size="lg" />
      <GridPattern
        width={60}
        height={60}
        className="text-border opacity-40"
        squares={[[2, 3], [5, 7], [8, 1], [11, 4], [14, 8], [3, 12], [7, 15]]}
      />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col lg:grid lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center min-h-[calc(100vh-80px)]">
          {/* Left: Copy */}
          <div className="flex flex-col gap-6 sm:gap-8 w-full pt-8 lg:pt-0">
            <FadeIn>
              <span className="inline-flex w-fit items-center rounded-full bg-[#F3E8FF] px-3 py-1 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6D28D9]">
                Deterministic Meta Ads Audit
              </span>
            </FadeIn>

            <TextReveal
              text="You Might Be Wasting 20–40% of Your Meta Budget"
              delay={0.2}
              wordDelay={0.04}
              className="text-[28px] sm:text-[40px] lg:text-[56px] font-medium leading-[1.1] sm:leading-[1.08] tracking-[-0.03em] text-foreground"
            />

            <FadeIn delay={0.5}>
              <p className="max-w-[520px] text-[15px] sm:text-[17px] leading-[1.6] font-normal text-muted-foreground">
                Upload your Meta Ads CSV. AdFix analyzes your data, calculates a fixed Target CPA, and classifies every ad into{" "}
                <span className="font-medium text-foreground">Kill</span>,{" "}
                <span className="font-medium text-foreground">Fix</span>,{" "}
                <span className="font-medium text-foreground">Scale</span>, or{" "}
                <span className="font-medium text-foreground">No Action</span>{" "}
                using deterministic rules.
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-[#6D28D9] text-white px-5 py-3.5 sm:py-3.5 rounded-lg text-base font-semibold hover:bg-[#5b21b6] transition-all press-scale w-full sm:w-auto min-h-[48px] touch-manipulation"
                >
                  Run Free Preview <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#report"
                  className="inline-flex items-center justify-center gap-2 bg-card text-foreground border border-border px-5 py-3.5 sm:py-3.5 rounded-lg text-base font-medium hover:bg-muted transition-all press-scale w-full sm:w-auto min-h-[48px] touch-manipulation"
                >
                  View Sample Report
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.7}>
              <p className="text-[13px] sm:text-[14px] font-medium leading-[1.5] text-muted-foreground">
                CSV-based analysis <span className="mx-2">•</span> Rule-based logic <span className="mx-2">•</span> No guesswork
              </p>
            </FadeIn>
          </div>

          {/* Right: Score Card */}
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[400px] mx-auto lg:mx-0">
            <FadeIn delay={0.3}>
              <div className="w-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-5 sm:p-6 shadow-elevated">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <p className="text-[14px] font-medium text-muted-foreground">Health Score</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#FEF2F2] px-2 py-1 text-[12px] font-semibold text-[#DC2626]">
                    Average
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[42px] sm:text-[56px] lg:text-[72px] font-semibold text-foreground leading-none">
                    <NumberTicker value={42} duration={1.5} />
                  </span>
                  <span className="text-[18px] sm:text-[22px] lg:text-[24px] text-muted-foreground">/100</span>
                </div>

                <div className="mb-4 sm:mb-6 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[#DC2626] transition-all duration-1000 ease-out"
                    style={{ width: "42%" }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="rounded-lg bg-[#FEF2F2] p-2 sm:p-3 text-center">
                    <p className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-[#DC2626] leading-none">
                      <NumberTicker value={6} />
                    </p>
                    <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-muted-foreground">Kill</p>
                  </div>
                  <div className="rounded-lg bg-[#FFFBEB] p-2 sm:p-3 text-center">
                    <p className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-[#D97706] leading-none">
                      <NumberTicker value={4} />
                    </p>
                    <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-muted-foreground">Fix</p>
                  </div>
                  <div className="rounded-lg bg-[#ECFDF5] p-2 sm:p-3 text-center">
                    <p className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-[#059669] leading-none">
                      <NumberTicker value={2} />
                    </p>
                    <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-muted-foreground">Scale</p>
                  </div>
                </div>

                <div className="border-t border-border pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] sm:text-[14px] text-muted-foreground">Wasted Budget</span>
                    <span className="text-[13px] sm:text-[14px] font-semibold text-foreground">₹1,27,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] sm:text-[14px] text-muted-foreground">Waste %</span>
                    <span className="text-[13px] sm:text-[14px] font-semibold text-[#DC2626]">38.5%</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Stats Section */}
        <FadeIn delay={0.8}>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 py-6 sm:py-8 border-t border-border mt-8 sm:mt-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center min-w-[80px]">
                <p className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-foreground">
                  {stat.prefix && <span className="text-[#6D28D9]">{stat.prefix}</span>}
                  <NumberTicker value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[12px] sm:text-[13px] text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
