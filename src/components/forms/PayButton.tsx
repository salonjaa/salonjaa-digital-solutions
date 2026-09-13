"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/GradientButton";
import { site } from "@/content/site";

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayCheckout = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
  }
}

/**
 * Opens Razorpay's hosted Checkout for one pending order. Assumes
 * `https://checkout.razorpay.com/v1/checkout.js` is already loaded on the
 * page (see account/payments/page.tsx's <Script>) — that's the actual
 * payment UI (card/UPI/netbanking entry), not anything custom here, which
 * keeps this app out of PCI scope entirely.
 */
export function PayButton({
  razorpayOrderId,
  amountPaise,
  description,
  prefillName,
  prefillEmail,
}: {
  razorpayOrderId: string;
  amountPaise: number;
  description: string;
  prefillName?: string | null;
  prefillEmail?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "opening" | "verifying" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);

    if (typeof window === "undefined" || !window.Razorpay) {
      setStatus("error");
      setError("Payment window failed to load — please refresh and try again.");
      return;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      setStatus("error");
      setError("Payments aren't configured yet — please contact us directly.");
      return;
    }

    setStatus("opening");

    const razorpay = new window.Razorpay({
      key: keyId,
      amount: amountPaise,
      currency: "INR",
      order_id: razorpayOrderId,
      name: site.name,
      description,
      prefill: { name: prefillName ?? undefined, email: prefillEmail ?? undefined },
      theme: { color: "#22d3ee" },
      handler: async (response) => {
        setStatus("verifying");
        try {
          const res = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (!res.ok) throw new Error("verify failed");
          setStatus("idle");
          router.refresh();
        } catch {
          setStatus("error");
          setError(
            "Payment went through, but we couldn't confirm it here yet — refresh in a moment, or contact us if the status doesn't update."
          );
        }
      },
      modal: {
        ondismiss: () => setStatus((s) => (s === "opening" ? "idle" : s)),
      },
    });

    razorpay.on("payment.failed", () => {
      setStatus("error");
      setError("Payment failed — no amount was deducted. You can try again.");
    });

    razorpay.open();
  }

  return (
    <div>
      <GradientButton type="button" onClick={handleClick} size="md" disabled={status === "opening" || status === "verifying"}>
        {status === "verifying" ? "Confirming…" : status === "opening" ? "Opening…" : "Pay Now"}
      </GradientButton>
      {status === "error" && error && <p className="mt-2 max-w-xs text-sm text-red-400">{error}</p>}
    </div>
  );
}
