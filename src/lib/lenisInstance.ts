import type Lenis from "lenis";

/**
 * Module-level handle to the active Lenis instance (set by `LenisProvider`,
 * cleared on unmount). Lets other client components — e.g. the Works
 * section's tab-strip, which needs to jump the scroll position to a raw
 * pixel offset — drive scroll through Lenis instead of a raw
 * `window.scrollTo`, which Lenis's own rAF loop would otherwise immediately
 * override. `null` whenever Lenis isn't running (reduced motion, touch,
 * or before mount) — callers should fall back to native scrolling then.
 */
let instance: Lenis | null = null;

export function setLenisInstance(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenisInstance() {
  return instance;
}
