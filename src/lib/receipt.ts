import type { Json } from "@/lib/supabase/types";
import type { ReceiptLineItem } from "@/components/portal/Receipt";

/**
 * Payment requests aren't itemized today, so `orders.line_items` is
 * usually empty — falls back to a single line so the receipt's total
 * always matches `amount_paise` exactly.
 */
export function toLineItems(lineItems: Json, fallback: { label: string; amountPaise: number }): ReceiptLineItem[] {
  if (Array.isArray(lineItems) && lineItems.length > 0) {
    const items = lineItems
      .map((raw) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
        const label = "label" in raw && typeof raw.label === "string" ? raw.label : null;
        const amount = "amount_paise" in raw && typeof raw.amount_paise === "number" ? raw.amount_paise : null;
        return label && amount !== null ? { label, amountPaise: amount } : null;
      })
      .filter((item): item is ReceiptLineItem => item !== null);
    if (items.length > 0) return items;
  }
  return [{ label: fallback.label, amountPaise: fallback.amountPaise }];
}
