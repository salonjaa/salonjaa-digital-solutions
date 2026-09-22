import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Soft-cancels a payment request — flips status to 'cancelled' rather than
 * deleting the row, so the client's payment history and the payment_events
 * audit trail are never lost to an admin-side mistake. A 'paid' order can't
 * be cancelled — enforced by the orders_update_admin_only RLS policy
 * (status <> 'paid'), not just here.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ clientId: string; orderId: string }> }) {
  const { clientId, orderId } = await params;
  const supabase = await getServerClient();
  const auth = await requireAdmin(supabase);
  if (!auth.user) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  if (!checkRateLimit(`admin-cancel-payment:${auth.user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("client_id", clientId)
    .single();

  if (!order) {
    return NextResponse.json({ ok: false, error: "Payment request not found." }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ ok: false, error: "Paid payment requests can't be cancelled." }, { status: 409 });
  }

  if (order.status === "cancelled") {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("client_id", clientId);

  if (error) {
    console.error("Failed to cancel payment request", error);
    return NextResponse.json({ ok: false, error: "Failed to cancel payment request." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
