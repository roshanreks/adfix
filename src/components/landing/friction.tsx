"use client";

import { Flame, MousePointer, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { Aurora } from "@/components/ui/aurora";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FadeIn } from "@/components/animations";

const SIGNALS = [
  {
    icon: Flame,
    title: "Spend with no purchases",
    desc: "See which ads are consuming budget without creating revenue.",
    iconClass: "text-destructive",
    bgClass: "bg-destructive/10",
    glowClass: "group-hover:shadow-[0_0_20px_-5px_rgba(220,38,38,0.3)]",
  },
  {
    icon: MousePointer,
    title: "Clicks that do not convert",
    desc: "Spot ads that attract attention but fail deeper in the funnel.",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    glowClass: "group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
  },
  {
    icon: TrendingUp,
    title: "Winners stuck on low spend",
    desc: "Find ads that deserve more budget before momentum fades.",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    glowClass: "group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
  },
  {
    icon: Target,
    title: "Budget trapped in weak ad sets",
    desc: "Identify where spend is concentrated without enough return.",
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted",
    glowClass: "group-hover:shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)]",
  },
];

const RISKS = [
  {
    title: "Pause the wrong ad",
    desc: "A rushed decision can remove the ad that was holding performance together.",
  },
  {
    title: "Scale before the signal is clear",
    desc: "More budget without proof can turn a promising ad into an expensive lesson.",
  },
];

export function Friction() {
  return (
    <section className="relative bg-muted py-16 sm:py-[120px] overflow-hidden">
      <Aurora size="sm" className="opacity-30" />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <FadeIn className="mb-12 sm:mb-16 text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-4">
            Why It Matters
          </span>
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
            Your ad account has the data. AdFix turns it into decisions.
          </h2>
          <p className="mx-auto mt-4 sm:mt-6 max-w-[600px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-muted-foreground">
            Instead of staring at columns and arguing over opinions, get a simple view of what to stop, fix, and scale next.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SIGNALS.map((s) => (
              <SpotlightCard key={s.title}>
                <div className={`group p-4 sm:p-8 rounded-2xl transition-shadow duration-300 ${s.glowClass}`}>
                  <div className={`mb-4 sm:mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-border ${s.bgClass} transition-transform duration-300 group-hover:scale-110`}>
                    <s.icon className={`h-5 w-5 ${s.iconClass}`} />
                  </div>
                  <h3 className="text-[18px] sm:text-[20px] font-medium leading-[1.4] text-foreground">{s.title}</h3>
                  <p className="mt-2 text-[14px] sm:text-[16px] leading-[1.6] text-muted-foreground">{s.desc}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="mt-8 sm:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {RISKS.map((r) => (
              <SpotlightCard key={r.title} spotlightColor="rgba(220, 38, 38, 0.08)">
                <div className="group flex items-start gap-4 sm:gap-6 p-4 sm:p-8 rounded-2xl transition-shadow duration-300 hover:shadow-[0_0_20px_-5px_rgba(220,38,38,0.15)]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 transition-transform duration-300 group-hover:scale-110">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-[15px] sm:text-[16px] font-medium text-foreground">{r.title}</p>
                    <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-[14px] leading-[1.5] text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
