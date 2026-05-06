"use client";

import { Flame, MousePointer, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { Aurora } from "@/components/ui/aurora";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FadeIn } from "@/components/animations";

const SIGNALS = [
  {
    icon: Flame,
    title: "Spend with zero purchases",
    desc: "Ads burning budget without a single conversion.",
    iconClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
  {
    icon: MousePointer,
    title: "High CTR, weak conversion",
    desc: "Great creative engagement, but the funnel is broken.",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
  {
    icon: TrendingUp,
    title: "Strong ads underfunded",
    desc: "Winning ads not getting enough budget to scale.",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
  },
  {
    icon: Target,
    title: "Budget concentrated in inefficient sets",
    desc: "Most spend going to underperforming ad sets.",
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
];

const RISKS = [
  {
    title: "Pause the wrong ad → performance drops",
    desc: "Without data, you might kill your best performer.",
  },
  {
    title: "Scale too early → CPA spikes",
    desc: "Scaling without signals leads to budget bleed.",
  },
];

export function Friction() {
  return (
    <section className="relative bg-muted py-16 sm:py-[120px] overflow-hidden">
      <Aurora size="sm" className="opacity-30" />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <FadeIn className="mb-12 sm:mb-16 text-center">
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
            The data exists. The decision framework doesn&apos;t.
          </h2>
          <p className="mx-auto mt-4 sm:mt-6 max-w-[600px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-muted-foreground">
            Every day you wait, inefficient ads drain your budget. Without a structured audit, you&apos;re guessing.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SIGNALS.map((s) => (
              <SpotlightCard key={s.title}>
                <div className="p-4 sm:p-8">
                  <div className={`mb-4 sm:mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-border ${s.bgClass}`}>
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
                <div className="flex items-start gap-4 sm:gap-6 p-4 sm:p-8">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
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
