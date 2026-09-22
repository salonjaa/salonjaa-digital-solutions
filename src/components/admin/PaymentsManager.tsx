"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, orderStatusTone } from "@/components/ui/StatusBadge";
import { BanIcon, CloseIcon } from "@/components/icons/AdminIcons";
import { Receipt, type ReceiptData } from "@/components/portal/Receipt";
import { DownloadReceiptButton } from "@/components/portal/DownloadReceiptButton";
import { formatPaise } from "@/lib/money";
import { toLineItems } from "@/lib/receipt";
import type { Json } from "@/lib/supabase/types";

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
  line_items: Json;
};

type ClientInfo = { name: string; company?: string | null; email: string; phone?: string | null };

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function PaymentDetailModal({
  clientId,
  client,
  order,
  onClose,
}: {
  clientId: string;
  client: ClientInfo;
  order: OrderRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancellable = order.status !== "paid" && order.status !== "cancelled";
  const receiptElementId = `admin-receipt-${order.id}`;

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

  const receiptData: ReceiptData = {
    receiptNumber: order.receipt,
    paidAt: order.paid_at ?? new Date().toISOString(),
    paymentId: order.razorpay_payment_id,
    client,
    lineItems: toLineItems(order.line_items, { label: order.description, amountPaise: order.amount_paise }),
    amountPaise: order.amount_paise,
  };

  return (
    <Modal onClose={onClose} labelledBy="payment-detail-title" disableClose={cancelling}>
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
          <div className="space-y-3">
            <p className="text-xs text-text-muted">Paid payment requests can&apos;t be cancelled.</p>
            <DownloadReceiptButton
              targetId={receiptElementId}
              fileName={`Salonjaa-Receipt-${order.receipt}`}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-[#0f2942] transition-opacity hover:opacity-90 disabled:opacity-60"
            />
            {/* Off-screen — see InvoiceCard for why this needs to actually
                render (fonts/layout/logo) rather than display:none. */}
            <div aria-hidden="true" style={{ position: "fixed", top: 0, left: "-10000px", zIndex: -1 }}>
              <div id={receiptElementId}>
                <Receipt data={receiptData} />
              </div>
            </div>
          </div>
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
    </Modal>
  );
}

export function PaymentsManager({
  clientId,
  client,
  orders,
}: {
  clientId: string;
  client: ClientInfo;
  orders: OrderRow[];
}) {
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

      {selected && (
        <PaymentDetailModal clientId={clientId} client={client} order={selected} onClose={() => setSelected(null)} />
      )}
    </GlassCard>
  );
}
