import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-score";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      phone,
      whatsapp,
      companyName,
      website,
      niche,
      monthlySpend,
      role,
      challenge,
    } = body;

    // Validate required fields
    if (!phone || !companyName || !niche || !monthlySpend || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name?.trim() || user.name,
        phone: phone.trim(),
        whatsapp: whatsapp?.trim() || phone.trim(),
        companyName: companyName.trim(),
        website: website?.trim() || null,
        niche,
        monthlySpend,
        role,
        challenge: challenge?.trim() || null,
        onboardingComplete: true,
      },
    });

    // Update or create lead record
    const lead = await prisma.lead.findUnique({ where: { userId: user.id } });
    const leadData = {
      name: name?.trim() || user.name,
      phone: phone.trim(),
      whatsapp: whatsapp?.trim() || phone.trim(),
      companyName: companyName.trim(),
      website: website?.trim() || null,
      niche,
      monthlySpend,
      role,
      challenge: challenge?.trim() || null,
      onboardingStep: 4,
      onboardingComplete: true,
    };

    const { score, priority } = calculateLeadScore({
      onboardingStep: 4,
      phone: leadData.phone,
      whatsapp: leadData.whatsapp,
      companyName: leadData.companyName,
      website: leadData.website,
      challenge: leadData.challenge,
      hasAudit: lead?.hasAudit ?? false,
      auditCount: lead?.auditCount ?? 0,
      hasClickedExpertAudit: lead?.hasClickedExpertAudit ?? false,
      source: lead?.source || "organic",
    });

    await prisma.lead.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email: updated.email,
        ...leadData,
        leadScore: score,
        priority,
      },
      update: {
        ...leadData,
        leadScore: score,
        priority,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        onboardingComplete: updated.onboardingComplete,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
