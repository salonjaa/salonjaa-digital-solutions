import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single point of GSAP plugin registration, run at module-evaluation time
 * (not inside a `useEffect`) and guarded for SSR.
 *
 * Registering inside `GsapProvider`'s own `useEffect` (the previous
 * approach) raced against any descendant component that also uses
 * `ScrollTrigger` in its OWN mount-time effect — React fires effects
 * bottom-up (children before parents) on initial mount, so a child deep in
 * the tree (e.g. the Works section, or `StatNumber`) could construct its
 * `scrollTrigger` config *before* the provider's effect ever ran,
 * producing "Invalid property scrollTrigger... Missing plugin?" and
 * silently falling back to an unpinned, unscrubbed tween.
 *
 * Importing `gsap`/`ScrollTrigger` from *this* module instead — everywhere
 * in the app — guarantees registration has already happened by the time
 * any consumer's module code runs, since ES module evaluation completes
 * (including this top-level `registerPlugin` call) before any importer's
 * own code executes.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
export default gsap;
