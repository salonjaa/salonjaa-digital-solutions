"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";

/**
 * A custom animated cursor: a small dot that tracks the pointer almost
 * instantly, and a larger ring that trails slightly behind and grows on
 * hoverable elements (anything with a `data-cursor-hover` attribute, which
 * `Button` and `GlassCard` apply by default).
 *
 * Renders nothing on touch devices, and nothing until the touch check has
 * resolved (avoids a hydration flash).
 */
export function CustomCursor() {
  const isTouch = useIsTouchDevice();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouch !== false) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

    function onMove(e: MouseEvent) {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    }

    function onOver(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest("[data-cursor-hover]")) {
        gsap.to(ring, { scale: 1.7, opacity: 0.55, duration: 0.25 });
        gsap.to(dot, { scale: 0.5, duration: 0.25 });
      }
    }
    function onOut(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest("[data-cursor-hover]")) {
        gsap.to(ring, { scale: 1, opacity: 0.9, duration: 0.25 });
        gsap.to(dot, { scale: 1, duration: 0.25 });
      }
    }

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [isTouch]);

  if (isTouch !== false) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[999] hidden md:block">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/70 opacity-90"
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-accent"
      />
    </div>
  );
}
