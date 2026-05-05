"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const TESTIMONIALS = [
  {
    quote: "Found 34% waste in our ad spend within minutes. The Kill/Fix/Scale framework saved us months of guesswork.",
    name: "Rahul Sharma",
    role: "Performance Marketing Lead",
    company: "D2C Fashion Brand",
  },
  {
    quote: "Finally, a tool that tells me exactly what to do with each ad. No more gut feelings—just data-driven decisions.",
    name: "Priya Menon",
    role: "Founder",
    company: "EdTech Startup",
  },
  {
    quote: "The CSV-only approach means no permissions needed. I got my audit done in 15 minutes.",
    name: "Vikram Singh",
    role: "Marketing Manager",
    company: "E-commerce Platform",
  },
  {
    quote: "AdFix identified campaign structure issues we didn't know existed. Saved ₹4.2L in the first month.",
    name: "Ananya Gupta",
    role: "Head of Growth",
    company: "SaaS Company",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="py-16 sm:py-24 bg-muted overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
              Trusted by Growth Teams
            </h2>
            <p className="mx-auto mt-4 sm:mt-6 max-w-[600px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-muted-foreground">
              Real results from real marketers who've optimized their Meta ad spend.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4 sm:px-8">
                    <div className="mx-auto max-w-[800px]">
                      <div className="relative bg-card rounded-2xl border border-border p-8 sm:p-12 shadow-elevated">
                        <Quote className="absolute top-6 left-6 h-10 w-10 text-[#6D28D9]/20" />
                        <blockquote className="relative">
                          <p className="text-[18px] sm:text-[22px] lg:text-[24px] leading-[1.5] text-foreground font-medium">
                            "{t.quote}"
                          </p>
                          <footer className="mt-8 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#9333EA] flex items-center justify-center text-white font-semibold text-lg">
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{t.name}</div>
                              <div className="text-[14px] text-muted-foreground">
                                {t.role}, {t.company}
                              </div>
                            </div>
                          </footer>
                        </blockquote>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:translate-x-0 bg-card border border-border rounded-full p-3 shadow-lg hover:bg-muted transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-0 bg-card border border-border rounded-full p-3 shadow-lg hover:bg-muted transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "bg-[#6D28D9] w-6" : "bg-muted"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}