import { cn } from "@/lib/cn";

interface MarqueeStripProps {
  items: readonly string[];
  /** Character between repeated items, e.g. "◆" or "•". */
  separator?: string;
  className?: string;
}

/**
 * Infinite auto-scrolling horizontal marquee — two duplicated tracks so the
 * loop is seamless, animated via CSS `translateX` keyframes (`marquee-scroll`
 * in globals.css), paused on hover and disabled under `prefers-reduced-motion`.
 */
export function MarqueeStrip({ items, separator = "◆", className }: MarqueeStripProps) {
  const row = (
    <div className="marquee-row shrink-0 items-center gap-8 pr-8" aria-hidden="true">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-8 whitespace-nowrap">
          <span className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-text-secondary">
            {item}
          </span>
          <span className="text-cyan/60">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("marquee-viewport overflow-hidden", className)}>
      <div className="flex w-max">
        {row}
        {row}
      </div>
      <span className="sr-only">{items.join(", ")}</span>
    </div>
  );
}
