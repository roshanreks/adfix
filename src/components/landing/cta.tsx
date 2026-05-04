"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Aurora } from "@/components/ui/aurora";
import { FadeIn } from "@/components/animations";

export function CTA() {
  return (
    <section className="relative bg-[#0F172A] py-[120px] overflow-hidden">
      <Aurora size="lg" blendMode="normal" className="opacity-20" />

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12 text-center">
        <FadeIn>
          <h2 className="text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-white">
            Structured clarity — or continued guesswork?
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-[520px] text-[18px] leading-[1.6] text-[#94A3B8]">
            Stop guessing which ads to kill, fix, or scale. Upload your CSV and get deterministic answers in seconds.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#0F172A] px-8 py-4 rounded-lg text-[16px] font-semibold hover:bg-[#F1F5F9] transition-all press-scale"
            >
              Start Your Audit — From ₹499 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="mt-6 text-[12px] text-[#64748B]">
            CSV-based analysis <span className="mx-2">•</span> One-time payment <span className="mx-2">•</span> Instant delivery
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
