import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-score";
import { sendCapiCompleteRegistration } from "@/lib/meta-capi";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json(
        { error: "Please sign in to save your audit details." },
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
        { error: "Phone, brand name, category, monthly spend, and role are required." },
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

    // Send CAPI CompleteRegistration event
    sendCapiCompleteRegistration({
      email: updated.email,
      phone: leadData.phone,
      name: leadData.name,
      eventSourceUrl: "https://audit.theurbanmedia.in/onboarding",
      customData: {
        niche: leadData.niche,
        monthly_spend: leadData.monthlySpend,
        role: leadData.role,
      },
    }).catch(() => {});

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
      { error: "We could not save your audit details. Please try again." },
      { status: 500 }
    );
  }
}
