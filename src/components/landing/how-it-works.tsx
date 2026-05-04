"use client";

import { ScanLine, SlidersHorizontal, FileText } from "lucide-react";
import { FadeIn } from "@/components/animations";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: ScanLine,
      title: "Scan Performance Data",
      desc: "Upload your Meta Ads Manager CSV. AdFix reads performance data across all key metrics for your selected time window.",
    },
    {
      step: "02",
      icon: SlidersHorizontal,
      title: "Apply Decision Thresholds",
      desc: "Deterministic rules evaluate CPA, ROAS, CTR, and spend against account-level benchmarks. No black box.",
    },
    {
      step: "03",
      icon: FileText,
      title: "Generate Action Report",
      desc: "Every ad gets a classification: Kill, Fix, Scale, or No Action — with clear reasoning.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <FadeIn className="mb-12 sm:mb-16 text-center">
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0F172A]">
            What AdFix Does
          </h2>
          <p className="mx-auto mt-4 sm:mt-6 max-w-[600px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-[#475569]">
            A deterministic 3-step process. Same data → same output. Every single time.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((s) => (
            <FadeIn key={s.step} delay={parseInt(s.step) * 0.05}>
              <div className="relative rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-8 transition-all duration-200 hover:border-[#C4B5FD] hover:shadow-ambient-hover hover:-translate-y-0.5">
                <span className="absolute right-4 sm:right-6 top-4 sm:top-6 text-[32px] sm:text-[48px] font-bold leading-none text-[#F1F5F9]">
                  {s.step}
                </span>
                <div className="mb-4 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#F3E8FF]">
                  <s.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#6D28D9]" />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-medium leading-[1.4] text-[#0F172A]">{s.title}</h3>
                <p className="mt-2 text-[14px] sm:text-[16px] leading-[1.6] text-[#475569]">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-12 sm:mt-16 text-center">
          <p className="font-mono text-[12px] sm:text-[14px] text-[#94A3B8]">
            Same data → same output. Every single time.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
