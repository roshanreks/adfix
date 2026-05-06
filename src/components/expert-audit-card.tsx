"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Flame, ArrowRight, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface ExpertAuditCardProps {
  variant?: "default" | "compact" | "inline" | "dark";
  headline?: string;
  showBadge?: boolean;
}

const BULLETS = [
  "Full Meta Ads account deep-dive",
  "Google Ads performance review",
  "Shopify store CRO & UX audit",
  "Landing page & funnel analysis",
  "Creative strategy & fatigue review",
  "30-min strategy call with our team",
  "Custom action plan delivered in 48 hours",
];

export function ExpertAuditCard({
  variant = "default",
  headline = "Want a Deeper Audit?",
  showBadge = true,
}: ExpertAuditCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (variant === "compact") {
    return (
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-4 sm:p-5 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground">{headline}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI + Human experts audit your entire funnel
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-amber-600">₹999</p>
              <p className="text-[10px] text-muted-foreground">One-time</p>
            </div>
          </div>
          <Button
            size="sm"
            className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-1.5 text-xs h-9"
            onClick={() => window.open("https://wa.me/918088293455?text=Hi%20Urban%20Media%2C%20I%20want%20to%20book%20the%20₹999%20Expert%20Audit%20for%20my%20D2C%20brand", "_blank")}
          >
            Book My Expert Audit <ArrowRight className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-50/60 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              {headline}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Our team audits your Shopify, Meta Ads, Google Ads, landing pages, creatives & offer
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-1.5 text-xs h-9"
            onClick={() => window.open("https://wa.me/918088293455?text=Hi%20Urban%20Media%2C%20I%20want%20to%20book%20the%20₹999%20Expert%20Audit%20for%20my%20D2C%20brand", "_blank")}
          >
            Book Now — ₹999 <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <Card className="border-amber-500/30 bg-gradient-to-br from-[#1a0f00] to-[#0f0800] overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-5 sm:p-7 relative z-10">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              {showBadge && (
                <Badge className="mb-2 bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                  <Flame className="h-3 w-3 mr-1" /> Popular
                </Badge>
              )}
              <h3 className="text-lg font-semibold text-white">{headline}</h3>
              <p className="text-sm text-amber-200/60 mt-1">
                Our team of AI + Human experts will audit your entire funnel
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-amber-400">₹999</p>
              <p className="text-xs text-amber-200/40">One-time</p>
            </div>
          </div>

          <ul className="space-y-1.5 mb-5">
            {BULLETS.slice(0, expanded ? undefined : 4).map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-amber-100/70">
                <span className="h-4 w-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                </span>
                {b}
              </li>
            ))}
          </ul>
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-amber-400 hover:text-amber-300 mb-3 underline underline-offset-2"
            >
              Show all 7 items
            </button>
          )}

          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-2 h-11 font-semibold"
            onClick={() => window.open("https://wa.me/918088293455?text=Hi%20Urban%20Media%2C%20I%20want%20to%20book%20the%20₹999%20Expert%20Audit%20for%20my%20D2C%20brand", "_blank")}
          >
            Book My Expert Audit <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/80">
            <ShieldCheck className="h-3 w-3" />
            100% Refund Guarantee — Not satisfied? Full refund, no questions asked.
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-amber-200/40">
            <MessageSquare className="h-3 w-3" />
            Our team will contact you within 24 hours on your registered WhatsApp
          </div>
        </CardContent>
      </Card>
    );
  }

  // default
  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 overflow-hidden relative hover:shadow-glow transition-shadow duration-300">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-5 sm:p-7 relative z-10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {showBadge && (
              <Badge className="mb-2 bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                <Flame className="h-3 w-3 mr-1" /> Popular
              </Badge>
            )}
            <h3 className="text-lg font-semibold text-foreground">{headline}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Our team of AI + Human experts will audit your entire funnel — Shopify store, Facebook Ads, Google Ads, landing pages, creatives, and offer.
            </p>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-3xl font-bold text-amber-600">₹999</p>
            <p className="text-xs text-muted-foreground">One-time</p>
          </div>
        </div>

        <ul className="space-y-1.5 mb-5">
          {BULLETS.slice(0, expanded ? undefined : 4).map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="h-4 w-4 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              </span>
              {b}
            </li>
          ))}
        </ul>
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-amber-600 hover:text-amber-700 mb-3 underline underline-offset-2"
          >
            Show all 7 items
          </button>
        )}

        <div className="sm:hidden text-center mb-3">
          <p className="text-2xl font-bold text-amber-600">₹999 <span className="text-sm font-normal text-muted-foreground">One-time</span></p>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-2 h-11 font-semibold"
          onClick={() => window.open("https://wa.me/918088293455?text=Hi%20Urban%20Media%2C%20I%20want%20to%20book%20the%20₹999%20Expert%20Audit%20for%20my%20D2C%20brand", "_blank")}
        >
          Book My Expert Audit <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-600">
          <ShieldCheck className="h-3 w-3" />
          100% Refund Guarantee — Not satisfied? Full refund, no questions asked.
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          Our team will contact you within 24 hours on your registered WhatsApp
        </div>
      </CardContent>
    </Card>
  );
}
