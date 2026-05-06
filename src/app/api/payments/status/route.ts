import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in to view booking status." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const auditId = searchParams.get("auditId");

    const booking = await prisma.consultationBooking.findFirst({
      where: {
        userId: user.id,
        ...(auditId ? { auditId } : {}),
        paymentStatus: "paid",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      hasPaid: !!booking,
      booking: booking || null,
    });
  } catch (error) {
    console.error("Get booking status error:", error);
    return NextResponse.json({ error: "We could not load your booking status. Please try again." }, { status: 500 });
  }
}
