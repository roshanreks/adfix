"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations";

export function CTA() {
  return (
    <section className="relative bg-[#0f0a1a] py-16 sm:py-[120px] overflow-hidden">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#a855f7]/10 blur-[100px] animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c084fc]/5 blur-[140px] animate-pulse-soft" style={{ animationDelay: "0.75s" }} />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.3) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 text-center">
        <FadeIn>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-primary mb-6">
            Ready When You Are
          </span>
        </FadeIn>
        <FadeIn>
          <h2 className="text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1.12] tracking-[-0.02em] text-white text-balance">
            Stop guessing. Run the free audit.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mx-auto mt-4 sm:mt-6 max-w-[540px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-white/50">
            Upload your Meta Ads CSV and see which campaigns need action before more budget gets wasted.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="mt-8 sm:mt-10">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 bg-white text-[#0f0a1a] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-[16px] font-semibold hover:bg-white/95 transition-all min-h-[48px] sm:min-h-[52px] touch-manipulation shadow-glow overflow-hidden"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <span className="relative z-10 flex items-center gap-2">
                Start Free Audit <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="mt-4 sm:mt-6 text-[11px] sm:text-[12px] text-white/30">
            Free CSV audit <span className="mx-2">•</span> No ad account access <span className="mx-2">•</span> Instant report
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
