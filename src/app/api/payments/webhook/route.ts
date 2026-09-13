import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { TablesUpdate } from "@/lib/supabase/types";

// Only these three event types actually change an order's status — and
// payment_events.event_type has a CHECK constraint limited to exactly
// these plus 'client_verify' (see supabase/migrations/0001), so anything
// else must be acknowledged and ignored *before* it ever reaches an insert,
// not filtered out after.
const STATUS_BY_EVENT: Record<string, "paid" | "failed"> = {
  "payment.captured": "paid",
  "order.paid": "paid",
  "payment.failed": "failed",
};

/**
 * Razorpay's server-to-server webhook — the source of truth for payment
 * status, unlike api/payments/verify (which only gives the browser instant
 * feedback and can never fire at all if the tab closes mid-payment).
 * Configure this URL + a webhook secret under Razorpay Dashboard ->
 * Settings -> Webhooks once RAZORPAY_WEBHOOK_SECRET is set.
 */
export async function POST(req: NextRequest) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set — webhook cannot be verified");
    return NextResponse.json({ ok: false, error: "Webhook not configured." }, { status: 500 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing signature." }, { status: 400 });
  }

  // The signature is computed over the exact raw request bytes — this MUST
  // be read as text before any JSON parsing, or it will never match.
  const rawBody = await req.text();

  const expected = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  const signatureValid = expectedBuf.length === actualBuf.length && timingSafeEqual(expectedBuf, actualBuf);

  if (!signatureValid) {
    console.error("Webhook signature mismatch");
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 400 });
  }

  let payload: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string } };
      order?: { entity?: { id?: string } };
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const eventType = payload.event ?? "";
  const nextStatus = STATUS_BY_EVENT[eventType];
  if (!nextStatus) {
    // An event type we don't act on (e.g. payment.authorized, refund.*) —
    // acknowledge so Razorpay doesn't keep retrying it.
    return NextResponse.json({ ok: true });
  }

  const paymentEntity = payload.payload?.payment?.entity;
  const orderEntity = payload.payload?.order?.entity;
  const razorpayOrderId = paymentEntity?.order_id ?? orderEntity?.id;
  const razorpayPaymentId = paymentEntity?.id;

  if (!razorpayOrderId) {
    return NextResponse.json({ ok: true });
  }

  const dedupeKey = `${eventType}:${razorpayPaymentId ?? razorpayOrderId}`;
  const admin = getAdminClient();

  try {
    // Razorpay retries on anything but a 2xx, so a previously-seen event
    // must be a no-op, not an error.
    const { data: existing } = await admin
      .from("payment_events")
      .select("id")
      .eq("dedupe_key", dedupeKey)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true });
    }

    const { data: order } = await admin
      .from("orders")
      .select("id, status")
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    if (!order) {
      console.error("Webhook referenced an order we don't have", razorpayOrderId);
      return NextResponse.json({ ok: true }); // nothing to retry into existence
    }

    if (order.status !== "paid") {
      const update: TablesUpdate<"orders"> = { status: nextStatus };
      if (nextStatus === "paid") {
        update.paid_at = new Date().toISOString();
        if (razorpayPaymentId) update.razorpay_payment_id = razorpayPaymentId;
      }
      await admin.from("orders").update(update).eq("id", order.id).neq("status", "paid");
    }

    await admin.from("payment_events").insert({
      order_id: order.id,
      dedupe_key: dedupeKey,
      event_type: eventType,
      raw_payload: payload,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to process Razorpay webhook", err);
    // A real 500 here is intentional — it tells Razorpay to retry.
    return NextResponse.json({ ok: false, error: "Failed to process webhook." }, { status: 500 });
  }
}
