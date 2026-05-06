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

    const body = await req.json();
    const { step } = body;

    if (typeof step !== "number" || step < 1 || step > 3) {
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { userId: user.id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Only update if this step is further than current
    if (step > lead.onboardingStep) {
      const { score, priority } = calculateLeadScore({
        onboardingStep: step,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        companyName: lead.companyName,
        website: lead.website,
        challenge: lead.challenge,
        hasAudit: lead.hasAudit,
        auditCount: lead.auditCount,
        hasClickedExpertAudit: lead.hasClickedExpertAudit,
        source: lead.source,
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: { onboardingStep: step, leadScore: score, priority },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track step error:", error);
    return NextResponse.json({ error: "Failed to track step" }, { status: 500 });
  }
}
