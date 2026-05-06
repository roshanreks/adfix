import { Prisma } from "@prisma/client";

export interface LeadScoreInput {
  onboardingStep: number;
  phone: string | null;
  whatsapp: string | null;
  companyName: string | null;
  website: string | null;
  challenge: string | null;
  hasAudit: boolean;
  auditCount: number;
  hasClickedExpertAudit: boolean;
  source: string | null;
}

export function calculateLeadScore(lead: LeadScoreInput): { score: number; priority: string } {
  let score = 0;

  score += lead.onboardingStep * 10; // max 40
  if (lead.phone) score += 20;
  if (lead.whatsapp && lead.whatsapp !== lead.phone) score += 10;
  if (lead.companyName) score += 10;
  if (lead.website) score += 10;
  if (lead.challenge) score += 10;
  if (lead.hasAudit) score += 10;
  if (lead.auditCount > 1) score += 5;
  if (lead.hasClickedExpertAudit) score += 10;
  if (lead.source === "scale" || lead.source === "instagram") score += 5;

  const priority = score >= 80 ? "best" : score >= 50 ? "high" : "normal";
  return { score, priority };
}

export function buildLeadScoreData(lead: {
  onboardingStep: number;
  phone: string | null;
  whatsapp: string | null;
  companyName: string | null;
  website: string | null;
  challenge: string | null;
  hasAudit: boolean;
  auditCount: number;
  hasClickedExpertAudit: boolean;
  source: string | null;
}): Prisma.LeadUpdateInput {
  const { score, priority } = calculateLeadScore(lead);
  return { leadScore: score, priority };
}
