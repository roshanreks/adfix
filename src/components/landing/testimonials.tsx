"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Found 34% waste in our ad spend within minutes. The Kill/Fix/Scale framework saved us months of guesswork.",
    name: "Rahul Sharma",
    role: "Performance Marketing Lead",
    company: "D2C Fashion Brand",
    metric: "34%",
    metricLabel: "waste identified",
  },
  {
    quote: "Finally, a tool that tells me exactly what to do with each ad. No more gut feelings—just data-driven decisions.",
    name: "Priya Menon",
    role: "Founder",
    company: "EdTech Startup",
    metric: "2.3x",
    metricLabel: "ROAS improvement",
  },
  {
    quote: "The CSV-only approach means no permissions needed. I got my audit done in 15 minutes.",
    name: "Vikram Singh",
    role: "Marketing Manager",
    company: "E-commerce Platform",
    metric: "15 min",
    metricLabel: "to complete",
  },
  {
    quote: "AdFix identified campaign structure issues we didn&apos;t know existed. Saved ₹4.2L in the first month.",
    name: "Ananya Gupta",
    role: "Head of Growth",
    company: "SaaS Company",
    metric: "₹4.2L",
    metricLabel: "saved first month",
  },
];

const AUTOPLAY_INTERVAL = 5000;

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % TESTIMONIALS.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const t = TESTIMONIALS[current];

  return (
    <section className="py-16 sm:py-24 bg-muted overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary mb-4">
              Testimonials
            </span>
            <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
              Trusted by Growth Teams
            </h2>
            <p className="mx-auto mt-4 sm:mt-6 max-w-[600px] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.6] text-muted-foreground">
              Real results from real marketers who&apos;ve optimized their Meta ad spend.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full px-4 sm:px-8"
                >
                  <div className="mx-auto max-w-[800px]">
                    <div className="relative bg-card rounded-2xl border border-border p-8 sm:p-12 shadow-depth overflow-hidden">
                      {/* Subtle top accent */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                      <Quote className="absolute top-6 left-6 h-10 w-10 text-primary/15" />
                      <blockquote className="relative">
                        <p className="text-[18px] sm:text-[22px] lg:text-[24px] leading-[1.5] text-foreground font-medium text-balance">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                        <footer className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#9333EA] flex items-center justify-center text-white font-semibold text-lg shadow-glow-sm">
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{t.name}</div>
                              <div className="text-[14px] text-muted-foreground">
                                {t.role}, {t.company}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-primary/5 rounded-xl px-4 py-2">
                            <span className="text-[18px] font-bold text-primary">{t.metric}</span>
                            <span className="text-[12px] text-muted-foreground font-medium">{t.metricLabel}</span>
                          </div>
                        </footer>
                      </blockquote>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-card border border-border rounded-full p-3 shadow-depth hover:shadow-ambient-hover hover:-translate-y-1/2 hover:scale-105 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-card border border-border rounded-full p-3 shadow-depth hover:shadow-ambient-hover hover:-translate-y-1/2 hover:scale-105 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
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
                className={`rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation ${
                  i === current ? "bg-primary/10" : "bg-transparent hover:bg-muted/50"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              >
                <span className={`block rounded-full transition-all ${
                  i === current ? "bg-primary w-6 h-2" : "bg-muted-foreground/30 w-2 h-2"
                }`} />
              </button>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
