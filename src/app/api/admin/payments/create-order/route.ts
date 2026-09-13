import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay";
import { createPaymentRequestSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Admin generates a Razorpay payment request for a specific client. Two
 * writes: our own `orders` row (source of truth for the client's
 * dashboard), then the actual Razorpay Order — in that order, so a
 * Razorpay API failure still leaves a traceable `failed` row instead of a
 * silently-lost request.
 */
export async function POST(req: NextRequest) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  }

  if (!checkRateLimit(`admin-create-order:${user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createPaymentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the details and try again." },
      { status: 400 }
    );
  }

  const { clientId, clientPlanId, description, lineItems, amountPaise } = parsed.data;
  const receipt = randomUUID();

  // Written with the admin's own RLS-scoped session — the orders_insert_admin_only
  // policy covers this, no service-role client needed for our own row.
  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      client_id: clientId,
      client_plan_id: clientPlanId ?? null,
      description,
      line_items: lineItems,
      amount_paise: amountPaise,
      receipt,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !order) {
    console.error("Failed to create order row", insertError);
    return NextResponse.json({ ok: false, error: "Failed to create payment request." }, { status: 500 });
  }

  try {
    const razorpayOrder = await getRazorpayClient().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { orderId: order.id, clientId },
    });

    // Service-role update here (not the admin's own session) purely so this
    // one write is consistent with how every other order status change
    // happens (verify/webhook, which have no admin session at all) — the
    // admin session could equally do this one via its own RLS policy.
    const { error: updateError } = await getAdminClient()
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to attach razorpay_order_id", updateError);
      return NextResponse.json({ ok: false, error: "Payment request created but not fully saved. Try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orderId: order.id, razorpayOrderId: razorpayOrder.id });
  } catch (err) {
    console.error("Razorpay order creation failed", err);
    await getAdminClient().from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ ok: false, error: "Failed to create Razorpay order." }, { status: 502 });
  }
}
