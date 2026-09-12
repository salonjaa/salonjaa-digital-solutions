"use client";

import { useEffect, useRef } from "react";
import gsap, { ScrollTrigger } from "@/lib/gsap";

interface StatNumberProps {
  /** Numeric portion to count up to, e.g. 100 */
  value: number;
  /** Text rendered before/after the number, e.g. "%", "+" */
  prefix?: string;
  suffix?: string;
  className?: string;
}

/** Counts up to `value` when scrolled into view; jumps instantly under reduced motion. */
export function StatNumber({ value, prefix = "", suffix = "", className }: StatNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const counter = { val: 0 };
      const tween = gsap.to(counter, {
        val: value,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(counter.val)}${suffix}`;
        },
      });
      return () => tween.kill();
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      el.textContent = `${prefix}${value}${suffix}`;
    });

    return () => {
      mm.revert();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [value, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
