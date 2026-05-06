import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in to view your profile." }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        phone: true,
        whatsapp: true,
        companyName: true,
        website: true,
        niche: true,
        monthlySpend: true,
        role: true,
        challenge: true,
        onboardingComplete: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "We could not find this account." }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "We could not load your profile. Please try again." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in to update your profile." }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: name?.trim() },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "We could not update your profile. Please try again." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in to delete your account." }, { status: 401 });
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "We could not delete your account. Please try again." }, { status: 500 });
  }
}
