"use client";

import { useState } from "react";
import { formatPaise } from "@/lib/money";

/**
 * Single-series bar chart (paid revenue per month, last 6 months) — one
 * hue (cyan, the site's primary accent), thin rounded-top bars anchored to
 * the baseline, hover tooltip. A single series needs no legend — the
 * section heading above this component names it.
 */
export function RevenueChart({ data }: { data: { label: string; totalPaise: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.totalPaise), 1);

  const width = 560;
  const height = 200;
  const padding = { top: 28, right: 8, bottom: 28, left: 8 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const barGap = 16;
  const barWidth = (plotWidth - barGap * (data.length - 1)) / data.length;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Paid revenue by month">
        {/* Baseline */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="rgba(245,247,251,0.1)"
        />
        {data.map((d, i) => {
          const barHeight = max > 0 ? (d.totalPaise / max) * plotHeight : 0;
          const x = padding.left + i * (barWidth + barGap);
          const y = height - padding.bottom - barHeight;
          const isHovered = hovered === i;
          return (
            <g
              key={d.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-default"
            >
              {/* Wider invisible hit target than the (possibly thin) bar itself */}
              <rect x={x} y={padding.top} width={barWidth} height={plotHeight} fill="transparent" />
              {isHovered && (
                <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="fill-white text-[11px] font-semibold">
                  {formatPaise(d.totalPaise)}
                </text>
              )}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={4}
                className={isHovered ? "fill-cyan" : "fill-cyan/70"}
              />
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 16}
                textAnchor="middle"
                className="fill-text-muted text-[10px]"
              >
                {d.label}
              </text>
              <title>{`${d.label}: ${formatPaise(d.totalPaise)}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
