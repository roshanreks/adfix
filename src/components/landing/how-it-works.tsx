"use client";

import { ScanLine, SlidersHorizontal, FileText } from "lucide-react";
import { FadeIn } from "@/components/animations";

const STEPS = [
  {
    step: "01",
    icon: ScanLine,
    title: "Upload Your CSV",
    desc: "Export your Meta Ads Manager report and upload the CSV. AdFix reads the key metrics for your selected time window.",
  },
  {
    step: "02",
    icon: SlidersHorizontal,
    title: "Compare Against Benchmarks",
    desc: "Rule-based logic evaluates CPA, ROAS, CTR, spend, and conversion quality against your account averages.",
  },
  {
    step: "03",
    icon: FileText,
    title: "Get Your Action Report",
    desc: "Every ad gets a clear next step: Kill, Fix, Scale, or No Action, with the reason behind the call.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-card py-16 sm:py-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <FadeIn className="mb-12 sm:mb-16 text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-4">
            How It Works
          </span>
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
            From CSV to Action Plan
          </h2>
          <p className="mx-auto mt-4 sm:mt-6 max-w-[600px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-muted-foreground">
            Upload once. Get a clear read on wasted spend, winning ads, and the next actions to take.
          </p>
        </FadeIn>

        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-[60px] left-[16.67%] right-[16.67%] h-px">
            <div className="h-full bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {STEPS.map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.1}>
                <div className="relative rounded-2xl border border-border bg-card p-5 sm:p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-depth hover:-translate-y-0.5 group overflow-hidden">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <span className="absolute right-4 sm:right-6 top-4 sm:top-6 text-[32px] sm:text-[48px] font-bold leading-none text-muted-foreground/15">
                    {s.step}
                  </span>

                  {/* Step dot on connecting line — desktop only */}
                  <div className="hidden lg:flex absolute -top-[60px] left-1/2 -translate-x-1/2 z-10">
                    <div className="h-3 w-3 rounded-full bg-border group-hover:bg-primary transition-colors duration-300 ring-4 ring-card" />
                  </div>

                  <div className="mb-4 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <s.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="text-[18px] sm:text-[20px] font-medium leading-[1.4] text-foreground">{s.title}</h3>
                  <p className="mt-2 text-[14px] sm:text-[16px] leading-[1.6] text-muted-foreground">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        <FadeIn delay={0.3} className="mt-12 sm:mt-16 text-center">
          <p className="font-mono text-[12px] sm:text-[14px] text-muted-foreground">
            Same data. Same rules. Clearer decisions.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
