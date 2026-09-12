/**
 * A CSS-drawn browser-frame mockup with a placeholder dashboard graphic
 * inside (divs styled as chart bars / stat tiles / list rows) — never a
 * real client screenshot. One per Works panel, so each gets a slightly
 * different arrangement via `variant`.
 */
export function WorkMockup({ variant = 0 }: { variant?: number }) {
  // rotate the bar pattern per variant so panels don't look identical
  const barHeights = [
    [40, 70, 55, 90, 65, 80],
    [60, 45, 85, 50, 95, 60],
    [30, 80, 60, 75, 45, 90],
  ][variant % 3];

  return (
    <div className="gradient-border overflow-hidden rounded-2xl bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
      {/* Traffic-light header */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-3 h-4 flex-1 max-w-40 rounded-full bg-white/[0.05]" />
      </div>

      <div className="grid grid-cols-3 gap-3 p-5">
        {/* Stat tiles */}
        {["+24%", "1.2k", "98%"].map((stat) => (
          <div key={stat} className="gradient-border rounded-lg bg-white/[0.02] p-3">
            <p className="font-display text-lg font-bold text-gradient-accent">{stat}</p>
            <div className="mt-2 h-1.5 w-2/3 rounded-full bg-white/10" />
          </div>
        ))}

        {/* Chart bars */}
        <div className="col-span-3 flex items-end gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4" style={{ height: 120 }}>
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-accent opacity-80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* List rows */}
        <div className="col-span-3 space-y-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="h-6 w-6 shrink-0 rounded-full bg-gradient-accent opacity-70" />
              <span className="h-2 flex-1 rounded-full bg-white/10" />
              <span className="h-2 w-8 shrink-0 rounded-full bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
