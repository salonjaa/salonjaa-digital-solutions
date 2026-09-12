import { cn } from "@/lib/cn";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `deep` swaps the surface for the slightly-raised tone used on "featured" cards (e.g. the popular plan). */
  variant?: "default" | "deep";
  hover?: boolean;
}

const variantClass: Record<NonNullable<GlassCardProps["variant"]>, string> = {
  default: "bg-surface",
  deep: "bg-surface-raised",
};

/** The dark, gradient-hairline-border card atom used throughout the site (services, work, team, plans, etc). */
export function GlassCard({ variant = "default", hover = true, className, children, ...rest }: GlassCardProps) {
  return (
    <div
      data-cursor-hover
      className={cn(
        "gradient-border rounded-2xl p-6 transition-all duration-300",
        variantClass[variant],
        hover && "card-glass-hover",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
