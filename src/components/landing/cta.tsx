"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Aurora } from "@/components/ui/aurora";
import { FadeIn } from "@/components/animations";

export function CTA() {
  return (
    <section className="relative bg-slate-900 py-16 sm:py-[120px] overflow-hidden">
      <Aurora size="lg" blendMode="normal" className="opacity-20" />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 text-center">
        <FadeIn>
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-white">
            Structured clarity — or continued guesswork?
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mx-auto mt-4 sm:mt-6 max-w-[520px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-muted-foreground">
            Stop guessing which ads to kill, fix, or scale. Upload your CSV and get deterministic answers in seconds.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="mt-6 sm:mt-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white text-foreground px-5 sm:px-8 py-3.5 sm:py-4 rounded-lg text-base sm:text-[16px] font-semibold hover:bg-white/10 transition-all press-scale min-h-[48px] sm:min-h-[52px] touch-manipulation"
            >
              Start Your Audit — From ₹499 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="mt-4 sm:mt-6 text-[11px] sm:text-[12px] text-muted">
            CSV-based analysis <span className="mx-2">•</span> One-time payment <span className="mx-2">•</span> Instant delivery
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
