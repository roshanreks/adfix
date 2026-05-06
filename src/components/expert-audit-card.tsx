"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Flame, MessageSquare } from "lucide-react";
import { RazorpayPaymentButton } from "@/components/razorpay-payment-button";

interface ExpertAuditCardProps {
  variant?: "default" | "compact" | "inline" | "dark";
  headline?: string;
  showBadge?: boolean;
}

const BULLETS = [
  "Full Meta Ads performance review",
  "Google Ads snapshot, if you run Google",
  "Shopify store CRO and UX review",
  "Landing page and funnel analysis",
  "Creative fatigue and offer review",
  "30-minute strategy call with Urban Media",
  "Custom action plan delivered within 48 hours",
];

export function ExpertAuditCard({
  variant = "default",
  headline = "Want Expert Eyes on This?",
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
                Urban Media reviews your ads, funnel, store, and offer
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-amber-600">₹999</p>
              <p className="text-[10px] text-muted-foreground">One-time</p>
            </div>
          </div>
          <RazorpayPaymentButton variant="compact" size="sm" className="mt-3 w-full">
            Book Expert Audit
          </RazorpayPaymentButton>
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
              Urban Media reviews your ads, store, funnel, creatives, and offer
            </p>
          </div>
          <RazorpayPaymentButton variant="compact" size="sm">
            Book Expert Audit — ₹999
          </RazorpayPaymentButton>
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
                  <Flame className="h-3 w-3 mr-1" /> One-time ₹999
                </Badge>
              )}
              <h3 className="text-lg font-semibold text-white">{headline}</h3>
              <p className="text-sm text-amber-200/60 mt-1">
                Urban Media reviews your full growth funnel and gives you the next moves
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
              Show everything included
            </button>
          )}

          <RazorpayPaymentButton size="default" className="w-full">
            Book Expert Audit
          </RazorpayPaymentButton>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/80">
            <ShieldCheck className="h-3 w-3" />
            Satisfaction guarantee: if the audit is not useful, ask for a refund.
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-amber-200/40">
            <MessageSquare className="h-3 w-3" />
            Our team contacts you within 24 hours on your registered WhatsApp
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
                <Flame className="h-3 w-3 mr-1" /> One-time ₹999
              </Badge>
            )}
            <h3 className="text-lg font-semibold text-foreground">{headline}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Urban Media reviews your ads, store, landing pages, creatives, and offer, then gives you a practical action plan.
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
            Show everything included
          </button>
        )}

        <div className="sm:hidden text-center mb-3">
          <p className="text-2xl font-bold text-amber-600">₹999 <span className="text-sm font-normal text-muted-foreground">One-time</span></p>
        </div>

        <RazorpayPaymentButton size="default" className="w-full">
          Book Expert Audit
        </RazorpayPaymentButton>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-600">
          <ShieldCheck className="h-3 w-3" />
          Satisfaction guarantee: if the audit is not useful, ask for a refund.
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          Our team contacts you within 24 hours on your registered WhatsApp
        </div>
      </CardContent>
    </Card>
  );
}
