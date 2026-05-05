import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getToken } from "@auth/core/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Try auth() first (NextAuth v5 standard)
    let session = await auth();
    
    // Fallback: manually verify JWT from cookie if auth() returns null
    if (!session?.user?.id) {
      const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!,
      });
      if (token?.sub) {
        session = { user: { id: token.sub, email: token.email, name: token.name } } as any;
      }
    }

    if (!session?.user?.id) {
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
      where: { id: session.user.id },
      data: {
        name: name?.trim() || session.user.name,
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
