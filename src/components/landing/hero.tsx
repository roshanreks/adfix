"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Aurora } from "@/components/ui/aurora";
import { GridPattern } from "@/components/ui/grid-pattern";
import { TextReveal } from "@/components/ui/text-reveal";
import { NumberTicker } from "@/components/ui/number-ticker";
import { FadeIn } from "@/components/animations";
import { motion } from "framer-motion";

const STATS = [
  { label: "Average Waste Found", value: 32, suffix: "%" },
  { label: "Audits Run", value: 1240, suffix: "+" },
  { label: "Media Spend Reviewed", value: 47, prefix: "₹", suffix: "L" },
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
        <div className="flex flex-col lg:grid lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center min-h-[calc(100dvh-80px)] lg:min-h-[calc(100vh-80px)]">
          {/* Left: Copy */}
          <div className="flex flex-col gap-6 sm:gap-8 w-full pt-8 lg:pt-0">
            <FadeIn>
              <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-primary">
                Free Meta Ads CSV Audit
              </span>
            </FadeIn>

            <TextReveal
              text="Find the Ads Quietly Draining Your Meta Budget"
              delay={0.2}
              wordDelay={0.04}
              className="text-[28px] sm:text-[40px] lg:text-[56px] font-medium leading-[1.1] sm:leading-[1.08] tracking-[-0.03em] text-foreground text-balance"
            />

            <FadeIn delay={0.5}>
              <p className="max-w-[520px] text-[15px] sm:text-[17px] leading-[1.6] font-normal text-muted-foreground">
                Upload your Meta Ads CSV and get a clear, rule-based report that shows which ads to{" "}
                <span className="font-medium text-foreground">Kill</span>,{" "}
                <span className="font-medium text-foreground">Fix</span>,{" "}
                <span className="font-medium text-foreground">Scale</span>, or leave running. No ad account access required.
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                <Link
                  href="/dashboard/login"
                  className="group relative inline-flex items-center justify-center gap-2 bg-[#6D28D9] text-white px-5 py-3.5 sm:py-3.5 rounded-xl text-base font-semibold hover:bg-[#5b21b6] transition-all press-scale w-full sm:w-auto min-h-[48px] touch-manipulation overflow-hidden"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Audit <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="#report"
                  className="inline-flex items-center justify-center gap-2 bg-card text-foreground border border-border px-5 py-3.5 sm:py-3.5 rounded-xl text-base font-medium hover:bg-muted transition-all press-scale w-full sm:w-auto min-h-[48px] touch-manipulation"
                >
                  View Sample Report
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.7}>
              <p className="text-[13px] sm:text-[14px] font-medium leading-[1.5] text-muted-foreground">
                CSV-only upload <span className="mx-2">•</span> Rule-based decisions <span className="mx-2">•</span> No ad account access
              </p>
            </FadeIn>
            <FadeIn delay={0.75}>
              <p className="text-[12px] sm:text-[13px] text-muted-foreground/70">
                Built for D2C founders and performance teams <span className="mx-1.5">|</span> Powered by Urban Media
              </p>
            </FadeIn>
          </div>

          {/* Right: Score Card */}
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[400px] mx-auto lg:mx-0">
            <FadeIn delay={0.3}>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="relative w-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-5 sm:p-6 shadow-depth overflow-hidden">
                  {/* Subtle gradient glow at top */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                      <p className="text-[14px] font-medium text-muted-foreground">Health Score</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-[12px] font-semibold text-destructive">
                      Average
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[42px] sm:text-[56px] lg:text-[72px] font-semibold text-foreground leading-none">
                      <NumberTicker value={42} duration={1.5} />
                    </span>
                    <span className="text-[18px] sm:text-[22px] lg:text-[24px] text-muted-foreground">/100</span>
                  </div>

                  <div className="mb-4 sm:mb-6 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#DC2626] via-[#f59e0b] to-[#DC2626]"
                      initial={{ width: "0%" }}
                      animate={{ width: "42%" }}
                      transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="rounded-lg bg-destructive/10 p-2 sm:p-3 text-center">
                      <p className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-destructive leading-none">
                        <NumberTicker value={6} />
                      </p>
                      <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-muted-foreground">Kill</p>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-2 sm:p-3 text-center">
                      <p className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-amber-500 leading-none">
                        <NumberTicker value={4} />
                      </p>
                      <p className="mt-1 text-[12px] sm:text-[14px] font-medium text-muted-foreground">Fix</p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 p-2 sm:p-3 text-center">
                      <p className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-emerald-500 leading-none">
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
                      <span className="text-[13px] sm:text-[14px] font-semibold text-destructive">38.5%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>

        {/* Stats Section */}
        <FadeIn delay={0.8}>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 py-6 sm:py-8 border-t border-border mt-8 sm:mt-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center min-w-[80px]">
                <p className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-foreground">
                  {stat.prefix && <span className="text-primary">{stat.prefix}</span>}
                  <NumberTicker value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[12px] sm:text-[13px] text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Scroll down indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <span className="text-[11px] text-muted-foreground/50 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
