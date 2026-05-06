"use client";

import Link from "next/link";
import { ArrowRight, Star, TrendingUp, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const STATS = [
  { value: "₹127CR+", label: "Revenue Generated" },
  { value: "3.2x", label: "Avg ROAS Boost" },
  { value: "50+", label: "Brands Scaled" },
];

const BRANDS_ROW_1 = [
  "ADDYS", "Arth", "Avimee Herbal", "Bahurja", "Boyaak", "Cheesecake Digital",
  "Engage", "Flenc", "GC", "Habbits", "Just Rugs", "Lucid", "Metaman", "Mrucha",
  "Ristoss", "SF", "Sharingan", "Sleshe", "Swad", "Toothly", "Vitabella",
  "XLNC Perfumery", "Zeraki", "Ziro9",
];

export default function ScalePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#0a0514]">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#a855f7]/10 blur-[100px]" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 text-center">
            {/* Trust pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 mb-8">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-white/70">4.9/5 from 127+ founders</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[32px] sm:text-[44px] lg:text-[56px] font-medium leading-[1.1] tracking-[-0.02em] text-white max-w-[800px] mx-auto text-balance"
            >
              Stuck at ₹20L/month?
              <br />
              <span className="text-primary">Here's how I scale D2C brands to ₹1CR/month</span>
              <br />
              <span className="text-white/40 text-[24px] sm:text-[32px] lg:text-[40px]">
                —without juggling 15 different agencies.
              </span>
            </motion.h1>

            {/* Subheadline / Video CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 sm:mt-10 max-w-[560px] mx-auto"
            >
              <p className="text-[15px] sm:text-[17px] text-white/40 leading-[1.6]">
                Watch what happens when a D2C brand follows our system to the letter.
                Not a highlight reel. A raw, unfiltered case study of a real client who applied exactly what we teach.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-[600px] mx-auto"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] sm:text-[13px] text-white/40 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 sm:mt-14"
            >
              <a
                href="https://scale.theurbanmedia.in/?utm_source=adfix&utm_medium=app&utm_campaign=scale_hero_cta"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-primary/90 transition-all min-h-[52px] shadow-glow"
              >
                Show Me Your Full System
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <p className="mt-3 text-[12px] text-white/30">
                ⚡ Over 50+ D2C brands scaled • Just ₹499 • No spam, ever
              </p>
            </motion.div>

            {/* Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 flex items-center justify-center gap-4 text-[12px] text-white/30"
            >
              <span>Instant Access</span>
              <span>•</span>
              <span>100% Free</span>
              <span>•</span>
              <span>No Credit Card</span>
            </motion.div>
          </div>
        </section>

        {/* Logo Wall */}
        <section className="py-12 sm:py-16 border-t border-white/5">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
            <p className="text-center text-[12px] uppercase tracking-widest text-white/30 mb-8">
              Trusted by Leading D2C Brands
            </p>

            {/* Marquee row 1 */}
            <div className="relative overflow-hidden">
              <div className="flex gap-8 animate-marquee-left whitespace-nowrap">
                {[...BRANDS_ROW_1, ...BRANDS_ROW_1].map((brand, i) => (
                  <span
                    key={`r1-${i}`}
                    className="text-[14px] sm:text-[16px] font-medium text-white/20 hover:text-white/40 transition-colors"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Marquee row 2 — reverse */}
            <div className="relative overflow-hidden mt-4">
              <div className="flex gap-8 animate-marquee-right whitespace-nowrap">
                {[...BRANDS_ROW_1.slice().reverse(), ...BRANDS_ROW_1.slice().reverse()].map((brand, i) => (
                  <span
                    key={`r2-${i}`}
                    className="text-[14px] sm:text-[16px] font-medium text-white/15 hover:text-white/30 transition-colors"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 border-t border-white/5">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 text-center">
            <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-white text-balance">
              Ready to stop guessing and start scaling?
            </h2>
            <div className="mt-8">
              <a
                href="https://scale.theurbanmedia.in/?utm_source=adfix&utm_medium=app&utm_campaign=scale_bottom_cta"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#0a0514] px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/90 transition-all min-h-[52px]"
              >
                Show Me Your Full System
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">UrbanMedia</p>
                <p className="text-[11px] text-white/40">Scaling D2C brands to ₹1CR/month</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
