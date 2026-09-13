import { formatPaise } from "@/lib/money";
import { cn } from "@/lib/cn";

const STATUS_META: Record<string, { label: string; barClass: string; textClass: string }> = {
  paid: { label: "Paid", barClass: "bg-emerald", textClass: "text-emerald" },
  created: { label: "Pending", barClass: "bg-amber-400", textClass: "text-amber-300" },
  attempted: { label: "Attempted", barClass: "bg-amber-400", textClass: "text-amber-300" },
  failed: { label: "Failed", barClass: "bg-red-500", textClass: "text-red-400" },
  cancelled: { label: "Cancelled", barClass: "bg-white/30", textClass: "text-text-muted" },
};

/**
 * Horizontal bars, one per order status — reuses the same status-color
 * convention as StatusBadge (positive/warning/negative/neutral) rather
 * than a generic categorical palette, since status is exactly the "state"
 * job those colors are reserved for. Every bar carries a text label and
 * count directly, not color alone.
 */
export function StatusBreakdownChart({
  data,
}: {
  data: { status: string; count: number; totalPaise: number }[];
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return <p className="text-sm text-text-secondary">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const meta = STATUS_META[d.status] ?? { label: d.status, barClass: "bg-white/30", textClass: "text-text-muted" };
        const widthPct = (d.count / maxCount) * 100;
        return (
          <div key={d.status}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className={cn("font-medium", meta.textClass)}>
                {meta.label} <span className="text-text-muted">({d.count})</span>
              </span>
              <span className="text-text-secondary">{formatPaise(d.totalPaise)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className={cn("h-full rounded-full", meta.barClass)} style={{ width: `${Math.max(widthPct, 4)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
