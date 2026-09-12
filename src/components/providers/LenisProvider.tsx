"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { setLenisInstance } from "@/lib/lenisInstance";

/**
 * Wraps the app in Lenis smooth-scroll (desktop only — touch devices keep
 * native scrolling) and keeps it ticking in lockstep with GSAP's ticker so
 * ScrollTrigger (used by the pinned Works section, the custom cursor, and
 * count-up numbers) reads the same scroll position Lenis is animating
 * toward. Skips initialization entirely under `prefers-reduced-motion` or
 * on coarse-pointer devices, where the browser's native scroll is used.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reducedMotion || isTouch) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
    });

    setLenisInstance(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // With Lenis driving scroll, a plain `<a href="#section">` click still
    // jumps the *native* scroll position instantly, but Lenis's own virtual
    // scroll state doesn't know that happened — on its next tick it eases
    // back toward wherever it last was, which looks like the anchor jump
    // getting silently cancelled. Intercept in-page hash links ourselves and
    // drive them through `lenis.scrollTo` instead, offset to clear the
    // sticky navbar (matches the `scroll-margin-top` used for the
    // reduced-motion/touch fallback, where native scrolling is untouched).
    function onClick(e: MouseEvent) {
      const link = (e.target as Element).closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -96 });
    }
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      setLenisInstance(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
