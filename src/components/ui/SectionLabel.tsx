import { cn } from "@/lib/cn";

/** Small uppercase, letter-spaced micro-label used above section headings, preceded by a few gradient dot icons. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-[0.2em] text-cyan", className)}>
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-1 w-1 rounded-full bg-gradient-accent" />
        <span className="h-1 w-1 rounded-full bg-gradient-accent" />
        <span className="h-1 w-1 rounded-full bg-gradient-accent" />
      </span>
      {children}
    </span>
  );
}
