"use client";

import { FileText, ShieldCheck, Lock } from "lucide-react";
import { FadeIn } from "@/components/animations";

export function Trust() {
  const pills = [
    { icon: FileText, label: "CSV-Only" },
    { icon: ShieldCheck, label: "Rule-Based" },
    { icon: Lock, label: "No Account Access" },
  ];

  const objections = [
    {
      quote: "I can do this manually.",
      answer:
        "You can. But you must: export reports, calculate account-level CPA, compare ads against fixed baseline, apply consistent thresholds, benchmark within your own account. AdFix executes the same evaluation using deterministic rules.",
    },
    {
      quote: "Will this disrupt learning?",
      answer:
        "AdFix does not modify ads or trigger resets. It evaluates across fixed windows. What disrupts stability: frequent manual edits, reactive decision-making, inconsistent criteria. AdFix applies the same rules every time.",
    },
    {
      quote: "Is this useful for smaller accounts?",
      answer:
        "Requires: purchase conversion data, non-zero spend, valid time window. If insufficient data, returns explicit 'Insufficient Data' result. No partial conclusions.",
    },
  ];

  return (
    <section className="bg-[#F8FAFC] py-16 sm:py-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <FadeIn>
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0F172A]">
            CSV-Based Audit. Deterministic Evaluation.
          </h2>
          <p className="mt-4 sm:mt-6 max-w-[600px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-[#475569]">
            AdFix evaluates. It does not execute.
          </p>
        </FadeIn>

        {/* Trust pills */}
        <FadeIn delay={0.1} className="mt-8 sm:mt-10">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {pills.map((p) => (
              <div
                key={p.label}
                className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-medium text-[#475569]"
              >
                <p.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#6D28D9]" />
                {p.label}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Objection cards */}
        <div className="mt-8 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {objections.map((o) => (
            <FadeIn key={o.quote} delay={0.15}>
              <div className="flex h-full flex-col rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-8 transition-all duration-200 hover:border-[#C4B5FD] hover:shadow-ambient-hover hover:-translate-y-0.5">
                <span className="font-serif text-[32px] sm:text-[48px] leading-none text-[#F3E8FF]">&ldquo;</span>
                <h3 className="text-[16px] sm:text-[18px] font-medium text-[#0F172A]">{o.quote}</h3>
                <p className="mt-2 sm:mt-3 text-[14px] sm:text-[16px] leading-[1.6] text-[#475569]">{o.answer}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
