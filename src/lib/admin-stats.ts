// Pure aggregation helpers for the admin dashboard — deliberately computed
// in JS over a plain row array rather than a SQL aggregate/RPC. At this
// studio's scale (a handful of clients, low order volume) fetching the
// raw rows in the dashboard Server Component and reducing them here is
// simpler to read and change than maintaining a Postgres function, and
// there's no performance case for the extra machinery yet.

export type OrderRow = {
  amount_paise: number;
  status: string;
  created_at: string;
  paid_at: string | null;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" });

/** Last `months` calendar months (oldest first), each with total paid revenue in that month. */
export function computeRevenueByMonth(orders: OrderRow[], months = 6) {
  const now = new Date();
  const buckets: { key: string; label: string; totalPaise: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    buckets.push({ key: d.toISOString().slice(0, 7), label: MONTH_FORMATTER.format(d), totalPaise: 0 });
  }

  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const order of orders) {
    if (order.status !== "paid" || !order.paid_at) continue;
    const key = order.paid_at.slice(0, 7);
    const bucket = byKey.get(key);
    if (bucket) bucket.totalPaise += order.amount_paise;
  }

  return buckets;
}

const STATUS_ORDER = ["paid", "created", "attempted", "failed", "cancelled"] as const;

/** Order counts + totals grouped by status, in a fixed display order (only statuses actually present). */
export function computeStatusBreakdown(orders: OrderRow[]) {
  const counts = new Map<string, { count: number; totalPaise: number }>();
  for (const order of orders) {
    const entry = counts.get(order.status) ?? { count: 0, totalPaise: 0 };
    entry.count += 1;
    entry.totalPaise += order.amount_paise;
    counts.set(order.status, entry);
  }
  return STATUS_ORDER.filter((s) => counts.has(s)).map((status) => ({ status, ...counts.get(status)! }));
}

export function computeTotals(orders: OrderRow[]) {
  let totalRevenuePaise = 0;
  let pendingAmountPaise = 0;
  let pendingCount = 0;

  for (const order of orders) {
    if (order.status === "paid") totalRevenuePaise += order.amount_paise;
    if (order.status === "created" || order.status === "attempted") {
      pendingAmountPaise += order.amount_paise;
      pendingCount += 1;
    }
  }

  return { totalRevenuePaise, pendingAmountPaise, pendingCount };
}
