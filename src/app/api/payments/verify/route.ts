import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update booking as paid
    const updated = await prisma.consultationBooking.update({
      where: { id: bookingId, userId: user.id },
      data: {
        paymentId: razorpay_payment_id,
        paymentStatus: "paid",
        status: "booked",
      },
    });

    return NextResponse.json({
      success: true,
      booking: updated,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
