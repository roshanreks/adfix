"use client";

import { useRouter } from "next/navigation";
import { Check, Calendar } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FadeIn } from "@/components/animations";

export function Pricing() {
  const router = useRouter();

  return (
    <section id="pricing" className="relative bg-muted py-16 sm:py-[120px] overflow-hidden">
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <FadeIn className="mb-12 sm:mb-16 text-center">
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
            Start Free. Upgrade When You Want Expert Eyes.
          </h2>
          <p className="mx-auto mt-4 sm:mt-6 max-w-[600px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-muted-foreground">
            Run the free CSV audit first. If you want a human strategist to review your full funnel, book the ₹999 expert audit.
          </p>
        </FadeIn>

        <div className="mx-auto grid max-w-[800px] grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Free Audit */}
          <FadeIn delay={0}>
            <SpotlightCard
              className="border-border"
              spotlightColor="rgba(109, 40, 217, 0.05)"
            >
              <div className="relative p-4 sm:p-8">
                <div>
                  <h3 className="text-[18px] sm:text-[20px] font-medium leading-[1.4] text-foreground">Free CSV Audit</h3>
                  <p className="mt-1 text-[13px] sm:text-[14px] leading-[1.5] text-muted-foreground">A fast diagnostic for your Meta Ads data</p>
                </div>

                <div className="mt-4 sm:mt-6 flex items-baseline gap-1">
                  <span className="text-[32px] sm:text-[40px] font-semibold text-foreground">Free</span>
                </div>

                <ul className="mt-6 sm:mt-8 flex flex-col gap-2 sm:gap-3">
                  {[
                    "Health Score & Verdict",
                    "Kill / Fix / Scale Classification",
                    "Waste Analysis & Benchmarks",
                    "Top 3 Priority Actions",
                    "Top Waste Contributors",
                    "Charts & Visual Breakdown",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 sm:gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-[13px] sm:text-[14px] text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push("/dashboard/login")}
                  className="mt-6 sm:mt-8 w-full rounded-lg py-3 text-[15px] sm:text-[16px] font-semibold transition-all press-scale border border-border bg-card text-foreground hover:bg-muted min-h-[48px] touch-manipulation"
                >
                  Start Free Audit
                </button>
              </div>
            </SpotlightCard>
          </FadeIn>

          {/* Expert Review */}
          <FadeIn delay={0.1}>
            <SpotlightCard
              className="border-2 border-primary"
              spotlightColor="rgba(109, 40, 217, 0.1)"
            >
              <div className="relative p-4 sm:p-8">
                <span className="absolute -top-3 right-6 inline-block rounded-full bg-primary px-3 py-1 text-[11px] sm:text-[12px] font-semibold text-primary-foreground">
                  Best Value
                </span>

                <div>
                  <h3 className="text-[18px] sm:text-[20px] font-medium leading-[1.4] text-foreground">₹999 Expert Audit</h3>
                  <p className="mt-1 text-[13px] sm:text-[14px] leading-[1.5] text-muted-foreground">A full-funnel review by Urban Media</p>
                </div>

                <div className="mt-4 sm:mt-6 flex items-baseline gap-1">
                  <span className="text-[32px] sm:text-[40px] font-semibold text-foreground">₹999</span>
                  <span className="text-[13px] sm:text-[14px] text-muted-foreground">/one-time</span>
                </div>

                <ul className="mt-6 sm:mt-8 flex flex-col gap-2 sm:gap-3">
                  {[
                    "Everything in the Free Audit",
                    "Complete Kill / Fix / Scale Lists",
                    "Campaign Structure Audit",
                    "Creative Fatigue Analysis",
                    "Funnel & Tracking Audit",
                    "Per-Ad Optimization Roadmap",
                    "30-minute Strategy Call with Urban Media",
                    "Custom Scaling Plan for Your Niche",
                    "7-Day WhatsApp Support",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 sm:gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-[13px] sm:text-[14px] text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push("/dashboard/login")}
                  className="mt-6 sm:mt-8 w-full rounded-lg py-3 text-[15px] sm:text-[16px] font-semibold transition-all press-scale bg-primary text-primary-foreground hover:bg-primary/90 min-h-[48px] touch-manipulation"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" /> Book Expert Audit
                  </span>
                </button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  One-time payment. Our team contacts you on WhatsApp after booking.
                </p>
              </div>
            </SpotlightCard>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
