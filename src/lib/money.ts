// Every amount in the DB is stored in paise (Razorpay's smallest unit) —
// always divide by 100 before formatting, never display a `_paise` value
// directly.
const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPaise(paise: number) {
  return formatter.format(paise / 100);
}

/**
 * Best-effort parse of a display price like "₹21,000" (from
 * src/content/plans.ts) into paise — strips everything but digits. Only
 * meant to prefill an admin form field, which stays editable; never used
 * as the actual charged amount without the admin confirming it.
 */
export function parsePriceToPaise(display: string): number {
  const digits = display.replace(/[^0-9]/g, "");
  return digits ? Number(digits) * 100 : 0;
}
