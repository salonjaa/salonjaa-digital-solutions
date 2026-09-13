"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronDownIcon } from "@/components/icons/AdminIcons";
import { formatPaise } from "@/lib/money";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

type PaidOrder = {
  id: string;
  description: string;
  amount_paise: number;
  paid_at: string | null;
  razorpay_payment_id: string | null;
  receipt: string;
};

/**
 * A paid order, expandable into invoice-like detail. Deliberately simple —
 * a real invoice template is coming later (per the admin's note) and will
 * likely replace this card's expanded content, not the card/toggle
 * mechanism itself.
 */
export function InvoiceCard({ order, clientName, clientEmail }: { order: PaidOrder; clientName: string; clientEmail: string }) {
  const [open, setOpen] = useState(false);

  return (
    <GlassCard className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-cursor-hover
        className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Billed to</p>
              <p className="mt-1 text-sm text-white">{clientName}</p>
              <p className="text-sm text-text-secondary">{clientEmail}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-wide text-text-muted">From</p>
              <p className="mt-1 text-sm text-white">{site.name}</p>
              <p className="text-sm text-text-secondary">{site.address.full}</p>
            </div>
          </div>

          <dl className="space-y-1.5 border-t border-white/10 pt-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-muted">Invoice #</dt>
              <dd className="truncate font-mono text-white">{order.receipt}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-muted">Payment ID</dt>
              <dd className="truncate font-mono text-white">{order.razorpay_payment_id ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-muted">Date paid</dt>
              <dd className="text-white">{order.paid_at ? new Date(order.paid_at).toLocaleString("en-IN") : "—"}</dd>
            </div>
          </dl>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="font-display text-base font-semibold text-white">Total Paid</span>
            <span className="font-display text-lg font-semibold text-cyan">{formatPaise(order.amount_paise)}</span>
          </div>

          <p className="text-xs text-text-muted">A formal invoice template is coming soon — this is a summary of your payment.</p>
        </div>
      )}
    </GlassCard>
  );
}
