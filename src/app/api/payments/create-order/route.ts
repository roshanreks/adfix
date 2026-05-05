import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { getRazorpay, FUNNEL_AUDIT_AMOUNT } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { auditId } = body;

    // Check if user already has a paid booking
    const existingPaid = await prisma.consultationBooking.findFirst({
      where: { userId: user.id, paymentStatus: "paid" },
    });

    if (existingPaid) {
      return NextResponse.json(
        { error: "You already have a paid booking", booking: existingPaid },
        { status: 409 }
      );
    }

    // Create Razorpay order
    const order = await getRazorpay().orders.create({
      amount: FUNNEL_AUDIT_AMOUNT,
      currency: "INR",
      receipt: `booking_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        userEmail: user.email,
        auditId: auditId || "",
        service: "AI + Human Full Funnel Audit",
      },
    });

    // Create pending booking record
    const booking = await prisma.consultationBooking.create({
      data: {
        userId: user.id,
        auditId: auditId || null,
        amount: FUNNEL_AUDIT_AMOUNT,
        paymentStatus: "pending",
        status: "pending_payment",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
