"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

interface ScaleTeaserProps {
  variant?: "card" | "banner";
}

export function ScaleTeaser({ variant = "card" }: ScaleTeaserProps) {
  if (variant === "banner") {
    return (
      <div className="rounded-xl bg-[#0f0a1a] border border-primary/20 p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Stuck at ₹20L/month?
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              We scale D2C brands to ₹1CR/month. See our full system →
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary gap-1.5 text-xs h-9"
            onClick={() => window.open("https://scale.theurbanmedia.in/?utm_source=adfix&utm_medium=app&utm_campaign=scale_teaser", "_blank")}
          >
            Learn More <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#0f0a1a] to-[#1a0f2e] border-primary/20 overflow-hidden relative hover:shadow-glow transition-shadow duration-300">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-5 sm:p-6 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">Scale</span>
        </div>
        <h4 className="text-base font-semibold text-white leading-snug">
          Stuck at ₹20L/month?
        </h4>
        <p className="text-sm text-white/50 mt-1 leading-relaxed">
          Here's how I scale D2C brands to ₹1CR/month — without juggling 15 different agencies.
        </p>
        <Button
          size="sm"
          className="mt-4 w-full bg-primary text-white hover:bg-primary/90 gap-1.5 text-xs h-9"
          onClick={() => window.open("https://scale.theurbanmedia.in/?utm_source=adfix&utm_medium=app&utm_campaign=scale_card", "_blank")}
        >
          Show Me Your Full System <ArrowRight className="h-3 w-3" />
        </Button>
        <p className="mt-2 text-[10px] text-white/30 text-center">
          ⚡ Over 50+ D2C brands scaled • Just ₹499 • No spam, ever
        </p>
      </CardContent>
    </Card>
  );
}
