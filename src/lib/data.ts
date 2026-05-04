import type { AuditReport, PricingPlan, User, UserPreferences } from "@/lib/types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 499,
    description: "Core diagnostic for quick decisions",
    features: [
      "Health Score & Verdict",
      "Kill / Fix / Scale classification",
      "First 3 items per category",
      "Strategic overview",
      "Web report view",
    ],
  },
  {
    id: "detailed",
    name: "Detailed",
    price: 999,
    description: "Complete audit with full breakdown",
    features: [
      "Everything in Basic",
      "Unlimited items per category",
      "Full benchmarking analysis",
      "Complete metric breakdown per ad",
      "PDF export",
      "Historical trend view",
      "Campaign structure audit",
      "Creative & funnel analysis",
      "Tracking audit",
    ],
    popular: true,
  },
];

export const FAQ_ITEMS = [
  {
    question: "Does AdFix change anything in my ad account?",
    answer: "No. AdFix is a read-only CSV analyzer. It does not connect to Meta APIs, modify ads, or execute any actions in your account.",
  },
  {
    question: "What is AdFix benchmarking against?",
    answer: "AdFix benchmarks ads against your own account averages (account-level CPA, ROAS, CTR, CPM). You can also provide target CPA/ROAS for more precise analysis.",
  },
  {
    question: "Will this disrupt the learning phase?",
    answer: "No. AdFix does not touch your ad account. You decide whether to act on the recommendations.",
  },
  {
    question: "What if I disagree with a K/F/S decision?",
    answer: "You have full control. AdFix provides reasoning for every classification. You can override any recommendation based on your business context.",
  },
  {
    question: "Is this AI-based?",
    answer: "AdFix uses deterministic rules based on your CSV data. Same data always produces the same output, ensuring consistency and transparency.",
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
    answer: "A structured web report with executive summary, waste analysis, per-ad classifications, benchmarks, funnel audit, creative audit, tracking audit, and methodology. Detailed tier includes PDF export.",
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
