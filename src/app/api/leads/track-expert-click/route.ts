import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-score";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lead = await prisma.lead.findUnique({ where: { userId: user.id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const { score, priority } = calculateLeadScore({
      onboardingStep: lead.onboardingStep,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      companyName: lead.companyName,
      website: lead.website,
      challenge: lead.challenge,
      hasAudit: lead.hasAudit,
      auditCount: lead.auditCount,
      hasClickedExpertAudit: true,
      source: lead.source,
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        hasClickedExpertAudit: true,
        leadScore: score,
        priority,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track expert click error:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
