import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-score";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const audits = await prisma.audit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ audits });
  } catch (error) {
    console.error("Get audits error:", error);
    return NextResponse.json({ error: "Failed to fetch audits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, reportJson, csvUrl, healthScore, wastePercentage } = body;

    const audit = await prisma.audit.create({
      data: {
        userId: user.id,
        name: name || "Untitled Audit",
        reportJson: JSON.stringify(reportJson),
        csvUrl: csvUrl || null,
        healthScore: healthScore || 0,
        wastePercentage: wastePercentage || 0,
      },
    });

    // Update lead record
    const lead = await prisma.lead.findUnique({ where: { userId: user.id } });
    if (lead) {
      const auditCount = lead.auditCount + 1;
      const { score, priority } = calculateLeadScore({
        onboardingStep: lead.onboardingStep,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        companyName: lead.companyName,
        website: lead.website,
        challenge: lead.challenge,
        hasAudit: true,
        auditCount,
        hasClickedExpertAudit: lead.hasClickedExpertAudit,
        source: lead.source,
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          hasAudit: true,
          auditCount,
          leadScore: score,
          priority,
        },
      });
    }

    return NextResponse.json({ audit }, { status: 201 });
  } catch (error) {
    console.error("Create audit error:", error);
    return NextResponse.json({ error: "Failed to create audit" }, { status: 500 });
  }
}
