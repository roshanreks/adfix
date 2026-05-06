import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, COOKIE_NAME } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-score";

async function getLeadWithActivities(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const authenticated = token ? await verifyAdminSession(token) : false;
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const lead = await getLeadWithActivities(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Get lead error:", error);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const authenticated = token ? await verifyAdminSession(token) : false;
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const updateData: any = {};
    const activityEntries: any[] = [];

    const editableFields = [
      "name", "email", "phone", "whatsapp", "companyName", "website",
      "niche", "monthlySpend", "role", "challenge", "status", "adminNotes", "priority",
    ];

    for (const field of editableFields) {
      if (body[field] !== undefined && body[field] !== existing[field as keyof typeof existing]) {
        const oldValue = String(existing[field as keyof typeof existing] ?? "");
        const newValue = String(body[field] ?? "");
        updateData[field] = body[field];
        activityEntries.push({
          leadId: id,
          action: "updated",
          field,
          oldValue,
          newValue,
          performedBy: "admin",
        });
      }
    }

    // Recalculate score if relevant fields changed
    if (
      updateData.phone !== undefined ||
      updateData.whatsapp !== undefined ||
      updateData.companyName !== undefined ||
      updateData.website !== undefined ||
      updateData.challenge !== undefined
    ) {
      const { score, priority } = calculateLeadScore({
        onboardingStep: existing.onboardingStep,
        phone: updateData.phone ?? existing.phone,
        whatsapp: updateData.whatsapp ?? existing.whatsapp,
        companyName: updateData.companyName ?? existing.companyName,
        website: updateData.website ?? existing.website,
        challenge: updateData.challenge ?? existing.challenge,
        hasAudit: existing.hasAudit,
        auditCount: existing.auditCount,
        hasClickedExpertAudit: existing.hasClickedExpertAudit,
        source: existing.source,
      });
      updateData.leadScore = score;
      updateData.priority = priority;
    }

    // If admin manually sets priority, override auto-calculation
    if (body.priority !== undefined) {
      updateData.priority = body.priority;
    }

    // If notes changed, log as note_added
    if (updateData.adminNotes !== undefined) {
      activityEntries.push({
        leadId: id,
        action: "note_added",
        field: "adminNotes",
        newValue: updateData.adminNotes,
        performedBy: "admin",
      });
    }

    const [updated] = await prisma.$transaction([
      prisma.lead.update({ where: { id }, data: updateData }),
      ...(activityEntries.length > 0
        ? [prisma.leadActivity.createMany({ data: activityEntries })]
        : []),
    ]);

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const authenticated = token ? await verifyAdminSession(token) : false;
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
