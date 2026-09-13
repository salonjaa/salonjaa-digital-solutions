import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Called from the browser immediately after Razorpay Checkout's success
 * handler fires — gives the client instant "paid" feedback. This is NOT
 * the authoritative record of payment: api/payments/webhook is, since a
 * closed tab or dropped network request would otherwise leave a real
 * payment unrecorded. Both paths write through the same idempotent update.
 */
export async function POST(req: NextRequest) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  if (!checkRateLimit(`verify-payment:${user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Missing or invalid payment details." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  // RLS (orders_select_own_or_admin) already scopes this to the caller's
  // own order — a lookup that returns nothing means either the order
  // doesn't exist or isn't the caller's, and either way "not found" is the
  // right response.
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("razorpay_order_id", razorpay_order_id)
    .single();

  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error("RAZORPAY_KEY_SECRET is not set");
    return NextResponse.json({ ok: false, error: "Payment verification is not configured." }, { status: 500 });
  }

  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(razorpay_signature, "hex");
  const signatureValid =
    expectedBuf.length === actualBuf.length && timingSafeEqual(expectedBuf, actualBuf);

  if (!signatureValid) {
    console.error("Payment signature mismatch", { razorpay_order_id, razorpay_payment_id });
    return NextResponse.json({ ok: false, error: "Payment signature could not be verified." }, { status: 400 });
  }

  const admin = getAdminClient();

  // Idempotent: only actually flips status the first time this order is
  // marked paid — a second call (retry, or the webhook landing after this
  // does) is a harmless no-op on the orders row.
  if (order.status !== "paid") {
    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id,
        razorpay_signature,
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .neq("status", "paid");

    if (updateError) {
      console.error("Failed to update order after verify", updateError);
      return NextResponse.json({ ok: false, error: "Failed to record payment." }, { status: 500 });
    }
  }

  // Best-effort audit row — a duplicate call hits the unique dedupe_key
  // constraint, which is expected and fine to ignore.
  await admin.from("payment_events").insert({
    order_id: order.id,
    dedupe_key: `client_verify:${razorpay_payment_id}`,
    event_type: "client_verify",
    raw_payload: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
