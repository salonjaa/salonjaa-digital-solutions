import Script from "next/script";
import { getServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge, orderStatusTone } from "@/components/ui/StatusBadge";
import { PayButton } from "@/components/forms/PayButton";
import { InvoiceCard } from "@/components/portal/InvoiceCard";
import { formatPaise } from "@/lib/money";

export const metadata = { title: "Payments" };

const PAYABLE_STATUSES = new Set(["created", "attempted"]);

export default async function PaymentsPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: orders }, { data: profile }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, description, amount_paise, status, created_at, paid_at, razorpay_order_id, razorpay_payment_id, receipt")
      .eq("client_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
  ]);

  return (
    <div className="space-y-6">
      {/* Razorpay's own hosted Checkout script — PayButton opens the modal
          it defines (window.Razorpay), no payment UI of our own. */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Payments</h1>
        <p className="mt-1 text-sm text-text-secondary">Every payment request we&apos;ve raised on your account.</p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            if (order.status === "paid") {
              return (
                <InvoiceCard
                  key={order.id}
                  order={order}
                  clientName={profile?.full_name || "there"}
                  clientEmail={user?.email ?? ""}
                />
              );
            }

            const payable = PAYABLE_STATUSES.has(order.status) && !!order.razorpay_order_id;
            return (
              <GlassCard key={order.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-white">{order.description}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Requested {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-semibold text-white">{formatPaise(order.amount_paise)}</span>
                  {payable ? (
                    <PayButton
                      razorpayOrderId={order.razorpay_order_id!}
                      amountPaise={order.amount_paise}
                      description={order.description}
                      prefillName={profile?.full_name}
                      prefillEmail={user?.email}
                    />
                  ) : (
                    <StatusBadge label={order.status} tone={orderStatusTone[order.status]} />
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">No payment requests on your account yet.</p>
      )}
    </div>
  );
}
