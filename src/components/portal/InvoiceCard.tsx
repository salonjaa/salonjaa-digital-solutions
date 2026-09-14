import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Receipt, type ReceiptData } from "@/components/portal/Receipt";
import { DownloadReceiptButton } from "@/components/portal/DownloadReceiptButton";
import { formatPaise } from "@/lib/money";
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

/**
 * A paid order — a compact summary row with a Download Receipt button.
 * The full Receipt is never shown inline on the page; it's rendered
 * off-screen (real layout, real fonts/images loaded, just positioned
 * outside the viewport) purely so DownloadReceiptButton's html2canvas
 * capture has a real DOM node to snapshot when clicked.
 */
export function InvoiceCard({
  order,
  client,
}: {
  order: PaidOrder;
  client: { name: string; company?: string | null; email: string; phone?: string | null };
}) {
  const receiptData: ReceiptData = {
    receiptNumber: order.receipt,
    paidAt: order.paid_at ?? new Date().toISOString(),
    paymentId: order.razorpay_payment_id,
    client,
    lineItems: toLineItems(order),
    amountPaise: order.amount_paise,
  };

  const elementId = `receipt-${order.id}`;

  return (
    <GlassCard className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-display text-base font-semibold text-white">{order.description}</p>
        <p className="mt-1 text-sm text-text-secondary">
          {order.paid_at ? `Paid ${new Date(order.paid_at).toLocaleDateString("en-IN")}` : "Paid"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-display text-lg font-semibold text-white">{formatPaise(order.amount_paise)}</span>
        <StatusBadge label="paid" tone="positive" />
        <DownloadReceiptButton targetId={elementId} fileName={`Salonjaa-Receipt-${order.receipt}`} />
      </div>

      {/* Off-screen, not display:none — needs to actually render (fonts,
          layout, the logo image) for html2canvas to capture it, just never
          visible to the user in normal page flow. */}
      <div aria-hidden="true" style={{ position: "fixed", top: 0, left: "-10000px", zIndex: -1 }}>
        <div id={elementId}>
          <Receipt data={receiptData} />
        </div>
      </div>
    </GlassCard>
  );
}
