import type { AuditReport, PricingPlan, UserPreferences } from "@/lib/types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Free CSV Audit",
    price: 0,
    description: "A fast diagnostic for your Meta Ads data",
    features: [
      "Health Score & Verdict",
      "Kill / Fix / Scale classification",
      "Waste analysis and benchmarks",
      "Top 3 priority actions",
      "Web report view",
    ],
  },
  {
    id: "detailed",
    name: "₹999 Expert Audit",
    price: 999,
    description: "A full-funnel review by Urban Media",
    features: [
      "Everything in the Free CSV Audit",
      "Complete Kill / Fix / Scale lists",
      "Full benchmarking analysis",
      "Per-ad optimization roadmap",
      "PDF export",
      "Campaign structure audit",
      "Creative & funnel analysis",
      "Tracking audit",
      "30-minute strategy call",
    ],
    popular: true,
  },
];

export const FAQ_ITEMS = [
  {
    question: "Does AdFix change anything in my ad account?",
    answer: "No. AdFix works from a CSV export. It does not connect to your Meta account, change campaigns, or make decisions for you.",
  },
  {
    question: "What is AdFix benchmarking against?",
    answer: "AdFix compares ads against your own account averages, including CPA, ROAS, CTR, CPM, and spend. You can add target CPA or ROAS for sharper recommendations.",
  },
  {
    question: "Will this disrupt the learning phase?",
    answer: "No. AdFix is read-only. You get the recommendation, and you decide what to do inside Meta Ads Manager.",
  },
  {
    question: "What if I disagree with a K/F/S decision?",
    answer: "You stay in control. Every classification includes reasoning, so you can accept it, ignore it, or use it as a starting point for your own judgment.",
  },
  {
    question: "Is this AI-based?",
    answer: "The audit engine is rule-based. That means the same CSV produces the same report, without black-box guesses.",
  },
  {
    question: "Is this useful for small accounts?",
    answer: "Yes. Even small accounts benefit from structured clarity. We explicitly flag 'Insufficient Data' when metrics are too low for reliable conclusions.",
  },
  {
    question: "Can I do this manually?",
    answer: "You could, but AdFix automates the tedious cross-referencing of 15+ metrics across hundreds of ads, saving hours and reducing human error.",
  },
  {
    question: "What do I receive after running the audit?",
    answer: "You get a web report with health score, waste analysis, ad-level classifications, benchmarks, funnel signals, creative signals, and priority actions. The ₹999 expert audit adds Urban Media's human review and strategy call.",
  },
];

export function getStoredAudits(): AuditReport[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("adfix_audits");
  if (!raw) return [];
  try {
    const audits = JSON.parse(raw);
    return audits.filter((a: AuditReport) => a.account_summary && a.ad_level_audit);
  } catch {
    return [];
  }
}

export function saveAudit(report: AuditReport) {
  const audits = getStoredAudits();
  audits.unshift(report);
  localStorage.setItem("adfix_audits", JSON.stringify(audits));
}

export function getAuditById(id: string): AuditReport | null {
  return getStoredAudits().find((a) => a.id === id) || null;
}

export function deleteAudit(id: string) {
  const audits = getStoredAudits().filter((a) => a.id !== id);
  localStorage.setItem("adfix_audits", JSON.stringify(audits));
}

export function renameAudit(id: string, name: string) {
  const audits = getStoredAudits().map((a) => (a.id === id ? { ...a, name } : a));
  localStorage.setItem("adfix_audits", JSON.stringify(audits));
}

export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") return { defaultTimeWindow: 90, defaultMinSpend: 1000 };
  const raw = localStorage.getItem("adfix_preferences");
  if (!raw) return { defaultTimeWindow: 90, defaultMinSpend: 1000 };
  try {
    return JSON.parse(raw);
  } catch {
    return { defaultTimeWindow: 90, defaultMinSpend: 1000 };
  }
}

export function savePreferences(prefs: UserPreferences) {
  localStorage.setItem("adfix_preferences", JSON.stringify(prefs));
}
