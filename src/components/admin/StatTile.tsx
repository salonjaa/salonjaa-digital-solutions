import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "positive" | "warning";
}) {
  const iconToneClass = {
    default: "bg-white/5 text-cyan",
    positive: "bg-emerald/10 text-emerald",
    warning: "bg-amber-400/10 text-amber-300",
  }[tone];

  return (
    <GlassCard className="flex items-center gap-4" hover={false}>
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", iconToneClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
        <p className="mt-0.5 truncate font-display text-xl font-semibold text-white">{value}</p>
      </div>
    </GlassCard>
  );
}
