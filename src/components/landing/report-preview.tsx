"use client";

import { Sparkles, PieChart, GitBranch, ListChecks, BarChart3, Scale } from "lucide-react";
import { FadeIn } from "@/components/animations";

export function ReportPreview() {
  const items = [
    { icon: Sparkles, title: "Executive Summary & Key Insights" },
    { icon: PieChart, title: "Waste Breakdown Analysis" },
    { icon: GitBranch, title: "Kill / Fix / Scale Classification" },
    { icon: ListChecks, title: "Per-Ad Action Items with Reasoning" },
    { icon: BarChart3, title: "Benchmark Comparison" },
    { icon: Scale, title: "Campaign Structure & Funnel Audit" },
  ];

  return (
    <section id="report" className="bg-white py-[120px]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          {/* LEFT — Feature list */}
          <div>
            <FadeIn>
              <h2 className="text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0F172A]">
                The AdFix Report
              </h2>
              <p className="mt-4 text-[18px] leading-[1.6] text-[#475569]">
                A structured, actionable report that tells you exactly what to do next.
              </p>
            </FadeIn>

            <div className="mt-10 flex max-w-[400px] flex-col gap-4">
              {items.map((item) => (
                <FadeIn key={item.title} delay={0.05}>
                  <div className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#6D28D9]" />
                    <div>
                      <p className="text-[16px] font-medium text-[#0F172A]">{item.title}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* RIGHT — Report mockup card */}
          <FadeIn delay={0.2}>
            <div className="w-full rounded-2xl border border-[#E2E8F0] bg-white shadow-elevated overflow-hidden">
              {/* Header bar */}
              <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#0F172A]">Acme Corp</p>
                  <p className="text-[12px] text-[#94A3B8]">May 2025</p>
                </div>
                <span className="rounded bg-[#F3E8FF] px-2 py-1 text-[12px] font-semibold text-[#6D28D9]">
                  Detailed
                </span>
              </div>

              {/* Executive Summary */}
              <div className="bg-[#F8FAFC] px-6 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6D28D9]">
                  Executive Summary
                </p>
                <p className="mt-2 text-[14px] leading-[1.6] text-[#475569]">
                  Your account shows high waste concentration with significant inefficiency. 8 ads are significantly underperforming, though 2 ads show strong efficiency signals. Immediate action could recover ₹89,215 in monthly budget.
                </p>
              </div>

              {/* Score row */}
              <div className="grid grid-cols-3 gap-4 border-b border-[#F1F5F9] px-6 py-4">
                <div className="text-center">
                  <p className="text-[12px] text-[#94A3B8]">Health Label</p>
                  <span className="mt-1 inline-block rounded-full bg-[#FEF2F2] px-3 py-1 text-[12px] font-bold text-[#DC2626]">
                    AVERAGE
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-[#94A3B8]">Health Score</p>
                  <p className="mt-1 text-[36px] font-semibold text-[#0F172A]">
                    64<span className="text-[16px] text-[#94A3B8]">/100</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-[#94A3B8]">Confidence</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#059669]">HIGH</p>
                </div>
              </div>

              {/* Waste Analysis */}
              <div className="px-6 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6D28D9]">
                  Waste Analysis
                </p>
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[12px] text-[#94A3B8]">Wasted Budget</p>
                    <p className="text-[20px] font-semibold text-[#0F172A]">₹1,27,450.00</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#94A3B8]">Efficiency Loss</p>
                    <p className="text-[20px] font-semibold text-[#DC2626]">38.50%</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#94A3B8]">Actions Required</p>
                    <p className="text-[20px] font-semibold text-[#6D28D9]">8</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
