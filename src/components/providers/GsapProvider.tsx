"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Plugin registration itself lives in `src/lib/gsap.ts` (module-evaluation
 * time, not a `useEffect` — see the comment there for why: an effect-based
 * registration here raced against descendant components' own mount-time
 * `ScrollTrigger` usage). This provider now only owns app-lifetime cleanup.
 */
export function GsapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
