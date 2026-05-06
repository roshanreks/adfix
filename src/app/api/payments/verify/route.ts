import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { sendCapiPurchase } from "@/lib/meta-capi";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in to verify payment." }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json({ error: "Payment details are missing. Please contact support before paying again." }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment could not be verified. Please contact support before paying again." }, { status: 400 });
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

    // Fetch user details for CAPI
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true, phone: true },
    });

    // Send CAPI Purchase + Lead events
    sendCapiPurchase({
      email: dbUser?.email || undefined,
      phone: dbUser?.phone || undefined,
      name: dbUser?.name || undefined,
      value: 999,
      currency: "INR",
      orderId: razorpay_order_id,
      eventSourceUrl: "https://audit.theurbanmedia.in/dashboard/audits",
      requestHeaders: req.headers,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      booking: updated,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "We could not verify this payment. Please contact support before paying again." },
      { status: 500 }
    );
  }
}
