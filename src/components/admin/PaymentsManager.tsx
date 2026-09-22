"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge, orderStatusTone } from "@/components/ui/StatusBadge";
import { BanIcon, CloseIcon } from "@/components/icons/AdminIcons";
import { formatPaise } from "@/lib/money";

type OrderRow = {
  id: string;
  description: string;
  amount_paise: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  receipt: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function PaymentDetailModal({
  clientId,
  order,
  onClose,
}: {
  clientId: string;
  order: OrderRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancellable = order.status !== "paid" && order.status !== "cancelled";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !cancelling) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelling, onClose]);

  async function handleCancel() {
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/payments/${order.id}`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to cancel payment request.");
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-detail-title"
        onClick={(e) => e.stopPropagation()}
        className="card-glass relative w-full max-w-md space-y-4 bg-surface p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor-hover
          className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="pr-8">
          <p id="payment-detail-title" className="font-display text-lg font-semibold text-white">
            {order.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-xl font-semibold text-white">{formatPaise(order.amount_paise)}</span>
            <StatusBadge label={order.status} tone={orderStatusTone[order.status]} />
          </div>
        </div>

        <dl className="space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-muted">Requested</dt>
            <dd className="text-white">{formatDate(order.created_at)}</dd>
          </div>
          {order.status === "paid" && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-muted">Paid</dt>
              <dd className="text-white">{formatDate(order.paid_at)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-muted">Receipt</dt>
            <dd className="truncate font-mono text-xs text-text-secondary">{order.receipt}</dd>
          </div>
          {order.razorpay_order_id && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-muted">Razorpay order</dt>
              <dd className="truncate font-mono text-xs text-text-secondary">{order.razorpay_order_id}</dd>
            </div>
          )}
          {order.razorpay_payment_id && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-muted">Razorpay payment</dt>
              <dd className="truncate font-mono text-xs text-text-secondary">{order.razorpay_payment_id}</dd>
            </div>
          )}
        </dl>

        <div className="border-t border-white/10 pt-4">
          {order.status === "paid" ? (
            <p className="text-xs text-text-muted">Paid payment requests can&apos;t be cancelled.</p>
          ) : order.status === "cancelled" ? (
            <p className="text-xs text-text-muted">This payment request has been cancelled.</p>
          ) : confirming ? (
            <div className="space-y-3">
              <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-300">
                Cancel this payment request? The client won&apos;t be able to pay it anymore — it stays on record as
                cancelled.
              </p>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  data-cursor-hover
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelling ? "Cancelling…" : "Yes, cancel it"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={cancelling}
                  data-cursor-hover
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5"
                >
                  Go back
                </button>
              </div>
            </div>
          ) : (
            cancellable && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                data-cursor-hover
                className="flex items-center gap-1.5 text-sm font-medium text-red-400 transition-colors hover:text-red-300"
              >
                <BanIcon className="h-4 w-4" />
                Cancel payment request
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentsManager({ clientId, orders }: { clientId: string; orders: OrderRow[] }) {
  const [selected, setSelected] = useState<OrderRow | null>(null);

  return (
    <GlassCard hover={false}>
      <p className="text-xs uppercase tracking-wide text-text-muted">Payments</p>
      {orders.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {orders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => setSelected(order)}
                data-cursor-hover
                className="flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-left text-sm transition-colors hover:bg-white/5"
              >
                <span className="truncate text-white">{formatPaise(order.amount_paise)}</span>
                <StatusBadge label={order.status} tone={orderStatusTone[order.status]} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-text-secondary">No payment requests yet.</p>
      )}

      {selected && <PaymentDetailModal clientId={clientId} order={selected} onClose={() => setSelected(null)} />}
    </GlassCard>
  );
}
