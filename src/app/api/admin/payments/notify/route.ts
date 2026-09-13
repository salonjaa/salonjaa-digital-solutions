import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { sendPaymentRequestEmail } from "@/lib/resend";
import { notifyPaymentSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { site } from "@/content/site";

/**
 * Emails a client about a payment request already sitting on their
 * account. WhatsApp notification doesn't need a route at all — it's just a
 * `wa.me` link built client-side (see components/forms/NotifyClientButtons.tsx).
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

  if (!checkRateLimit(`admin-notify-payment:${user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = notifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Missing or invalid order id." }, { status: 400 });
  }

  // is_admin() RLS lets this session read any order + the client's profile,
  // not just its own.
  const { data: order } = await supabase
    .from("orders")
    .select("description, amount_paise, client_id")
    .eq("id", parsed.data.orderId)
    .single();

  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }

  const { data: client } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", order.client_id)
    .single();

  if (!client?.email) {
    return NextResponse.json({ ok: false, error: "This client has no email on file." }, { status: 400 });
  }

  try {
    await sendPaymentRequestEmail({
      to: client.email,
      clientName: client.full_name || "there",
      description: order.description,
      amountPaise: order.amount_paise,
      loginUrl: `${site.url}/login?next=/account/payments`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send payment request email", err);
    return NextResponse.json({ ok: false, error: "Failed to send email." }, { status: 502 });
  }
}
