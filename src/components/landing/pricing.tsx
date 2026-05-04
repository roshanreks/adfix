"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/data";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FadeIn } from "@/components/animations";

export function Pricing() {
  const router = useRouter();

  return (
    <section id="pricing" className="relative bg-[#F8FAFC] py-16 sm:py-[120px] overflow-hidden">
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <FadeIn className="mb-12 sm:mb-16 text-center">
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0F172A]">
            Simple. Deterministic. One-Time.
          </h2>
          <p className="mx-auto mt-4 sm:mt-6 max-w-[600px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-[#475569]">
            No subscriptions. No hidden tiers. Pay once, get your audit.
          </p>
        </FadeIn>

        <div className="mx-auto grid max-w-[800px] grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          {PRICING_PLANS.map((plan) => (
            <FadeIn key={plan.id} delay={plan.popular ? 0.1 : 0}>
              <SpotlightCard
                className={plan.popular ? "border-2 border-[#6D28D9]" : ""}
                spotlightColor={plan.popular ? "rgba(109, 40, 217, 0.1)" : "rgba(109, 40, 217, 0.05)"}
              >
                <div className="relative p-4 sm:p-8">
                  {plan.popular && (
                    <span className="absolute -top-3 right-6 inline-block rounded-full bg-[#6D28D9] px-3 py-1 text-[11px] sm:text-[12px] font-semibold text-white">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <h3 className="text-[18px] sm:text-[20px] font-medium leading-[1.4] text-[#0F172A]">{plan.name}</h3>
                    <p className="mt-1 text-[13px] sm:text-[14px] leading-[1.5] text-[#94A3B8]">{plan.description}</p>
                  </div>

                  <div className="mt-4 sm:mt-6 flex items-baseline gap-1">
                    <span className="text-[32px] sm:text-[40px] font-semibold text-[#0F172A]">₹{plan.price}</span>
                    <span className="text-[13px] sm:text-[14px] text-[#94A3B8]">/one-time</span>
                  </div>

                  <ul className="mt-6 sm:mt-8 flex flex-col gap-2 sm:gap-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 sm:gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6D28D9]" />
                        <span className="text-[13px] sm:text-[14px] text-[#475569]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => router.push("/dashboard")}
                    className={`mt-6 sm:mt-8 w-full rounded-lg py-3 text-[15px] sm:text-[16px] font-semibold transition-all press-scale ${
                      plan.popular
                        ? "bg-[#6D28D9] text-white hover:bg-[#5b21b6]"
                        : "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    Get {plan.name}
                  </button>
                </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
