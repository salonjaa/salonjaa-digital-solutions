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
