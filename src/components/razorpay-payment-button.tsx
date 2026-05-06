"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Loader2, Calendar } from "lucide-react";
import { trackPixelEvent } from "@/lib/meta-pixel";

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayCheckoutResponse) => Promise<void>;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;
type WindowWithRazorpay = Window & { Razorpay?: RazorpayConstructor };

interface RazorpayPaymentButtonProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "compact";
  children?: React.ReactNode;
  onClick?: () => void;
  onSuccess?: () => void;
}

export function RazorpayPaymentButton({
  className = "",
  size = "default",
  variant = "default",
  children,
  onClick,
  onSuccess,
}: RazorpayPaymentButtonProps) {
  const { user } = useAuth();
  const [isPaying, setIsPaying] = useState(false);

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as WindowWithRazorpay).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const handlePay = useCallback(async () => {
    onClick?.();
    if (!user?.id) {
      toast.error("Please sign in to book");
      return;
    }
    // Track expert audit click for lead scoring
    fetch("/api/leads/track-expert-click", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
    setIsPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        if (orderRes.status === 409 && orderData.booking) {
          toast.info("You already have a paid booking");
          onSuccess?.();
          return;
        }
        toast.error(orderData.error || "Failed to create order");
        return;
      }

      const Razorpay = (window as WindowWithRazorpay).Razorpay;
      if (!Razorpay) {
        toast.error("Payment gateway is unavailable");
        return;
      }

      // Track Meta Pixel InitiateCheckout
      trackPixelEvent("InitiateCheckout", {
        content_name: "Expert Audit — ₹999",
        content_type: "product",
        value: 999,
        currency: "INR",
      });

      const rzp = new Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Urban Media — AdFix",
        description: "AI + Human Full Funnel Audit",
        order_id: orderData.orderId,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: { color: "#6D28D9" },
        handler: async function (response: RazorpayCheckoutResponse) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: orderData.bookingId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              toast.success("Payment successful! Our team will contact you within 24 hours.");
              // Track Meta Pixel Purchase + Lead
              trackPixelEvent("Purchase", {
                content_name: "Expert Audit — ₹999",
                content_type: "product",
                value: 999,
                currency: "INR",
                order_id: response.razorpay_order_id,
              });
              trackPixelEvent("Lead", {
                content_name: "Paid Expert Audit Lead",
                value: 999,
                currency: "INR",
                lead_type: "paid_expert_audit",
              });
              onSuccess?.();
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch {
            toast.error("Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled. You can try again anytime.");
          },
        },
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPaying(false);
    }
  }, [user, loadRazorpayScript, onSuccess]);

  if (variant === "compact") {
    return (
      <button
        onClick={handlePay}
        disabled={isPaying}
        className={`inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-60 ${className}`}
      >
        {isPaying ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> Processing...
          </>
        ) : (
          children || "Book Now — ₹999"
        )}
      </button>
    );
  }

  const sizeClasses =
    size === "sm"
      ? "h-9 px-3 text-xs"
      : size === "lg"
      ? "h-12 px-6 text-base"
      : "h-11 px-4 text-sm";

  return (
    <Button
      type="button"
      onClick={handlePay}
      disabled={isPaying}
      className={`gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 font-semibold ${sizeClasses} ${className}`}
    >
      {isPaying ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Processing...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4" />
          {children || "Pay ₹999 & Get Full Audit"}
        </>
      )}
    </Button>
  );
}
