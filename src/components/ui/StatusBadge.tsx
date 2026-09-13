import { cn } from "@/lib/cn";

type Tone = "positive" | "warning" | "negative" | "neutral";

const toneClass: Record<Tone, string> = {
  positive: "border-emerald/30 bg-emerald/10 text-emerald",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  negative: "border-red-500/30 bg-red-500/10 text-red-400",
  neutral: "border-white/15 bg-white/5 text-text-secondary",
};

/** Small pill used for plan/order/domain status across the client and admin dashboards. */
export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        toneClass[tone]
      )}
    >
      {label}
    </span>
  );
}

export const planStatusTone: Record<string, Tone> = {
  active: "positive",
  paused: "warning",
  ended: "neutral",
};

export const orderStatusTone: Record<string, Tone> = {
  paid: "positive",
  created: "warning",
  attempted: "warning",
  failed: "negative",
  cancelled: "neutral",
};

export const domainStatusTone: Record<string, Tone> = {
  live: "positive",
  registered: "positive",
  dns_pending: "warning",
  expired: "negative",
};
