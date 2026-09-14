"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronDownIcon } from "@/components/icons/AdminIcons";
import { Receipt, type ReceiptData } from "@/components/portal/Receipt";
import { DownloadReceiptButton } from "@/components/portal/DownloadReceiptButton";
import { formatPaise } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { Json } from "@/lib/supabase/types";

type PaidOrder = {
  id: string;
  description: string;
  amount_paise: number;
  paid_at: string | null;
  razorpay_payment_id: string | null;
  receipt: string;
  line_items: Json;
};

function toLineItems(order: PaidOrder): ReceiptData["lineItems"] {
  if (Array.isArray(order.line_items) && order.line_items.length > 0) {
    const items = order.line_items
      .map((raw) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
        const label = "label" in raw && typeof raw.label === "string" ? raw.label : null;
        const amount = "amount_paise" in raw && typeof raw.amount_paise === "number" ? raw.amount_paise : null;
        return label && amount !== null ? { label, amountPaise: amount } : null;
      })
      .filter((item): item is { label: string; amountPaise: number } => item !== null);
    if (items.length > 0) return items;
  }
  // No itemized breakdown on file (the common case today — payment
  // requests aren't itemized yet) — fall back to a single line so the
  // receipt's total always matches amount_paise exactly.
  return [{ label: order.description, amountPaise: order.amount_paise }];
}

/** A paid order, expandable into the full downloadable Receipt. */
export function InvoiceCard({
  order,
  client,
}: {
  order: PaidOrder;
  client: { name: string; company?: string | null; email: string; phone?: string | null };
}) {
  const [open, setOpen] = useState(false);

  const receiptData: ReceiptData = {
    receiptNumber: order.receipt,
    paidAt: order.paid_at ?? new Date().toISOString(),
    paymentId: order.razorpay_payment_id,
    client,
    lineItems: toLineItems(order),
    amountPaise: order.amount_paise,
  };

  return (
    <GlassCard className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-cursor-hover
        className="no-print flex w-full flex-wrap items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="font-display text-base font-semibold text-white">{order.description}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {order.paid_at ? `Paid ${new Date(order.paid_at).toLocaleDateString("en-IN")}` : "Paid"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-semibold text-white">{formatPaise(order.amount_paise)}</span>
          <StatusBadge label="paid" tone="positive" />
          <ChevronDownIcon className={cn("h-4 w-4 text-text-muted transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
          <div className="no-print flex justify-end">
            <DownloadReceiptButton targetId={`receipt-${order.id}`} />
          </div>
          <div id={`receipt-${order.id}`} className="receipt-print-candidate -mx-6 -mb-6 rounded-b-2xl">
            <Receipt data={receiptData} />
          </div>
        </div>
      )}
    </GlassCard>
  );
}
