"use client";

import { useEffect, useRef, useState } from "react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { work } from "@/content/work";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { getLenisInstance } from "@/lib/lenisInstance";
import { WorkMockup } from "./WorkMockup";

const PANEL_COUNT = work.projects.length;

/**
 * THE SIGNATURE INTERACTION: on desktop, with motion allowed, this section
 * pins in the viewport while GSAP ScrollTrigger translates vertical scroll
 * into horizontal movement across the project panels (the classic
 * `gsap.to(track.children, { xPercent: -100 * (n - 1) })` trick — tweening
 * every panel by the same xPercent shifts the whole row by a fixed pixel
 * distance, since each panel shares the same width).
 *
 * On mobile/tablet or under `prefers-reduced-motion`, none of this JS runs
 * at all — `gsap.matchMedia` only registers the pin/scrub inside the
 * `isDesktop` query, so the panels stay in their natural, CSS-driven
 * vertical stack with no scroll-jacking.
 */
export function Work() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [pinned, setPinned] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const pinEl = pinRef.current;
    const track = trackRef.current;
    if (!pinEl || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      setPinned(true);
      const distance = (PANEL_COUNT - 1) * window.innerWidth;

      const tween = gsap.to(track.children, {
        xPercent: -100 * (PANEL_COUNT - 1),
        ease: "none",
        scrollTrigger: {
          trigger: pinEl,
          // Pin just below the sticky navbar (not flush to the viewport top),
          // so the tab-strip chrome inside the pinned section isn't hidden
          // underneath it.
          start: "top 64px",
          end: () => `+=${distance}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            setProgress(self.progress);
            setActiveIndex(Math.round(self.progress * (PANEL_COUNT - 1)));
            if (self.progress > 0.02) setHasScrolled(true);
          },
        },
      });
      scrollTriggerRef.current = tween.scrollTrigger ?? null;

      return () => {
        tween.kill();
        setPinned(false);
        setActiveIndex(0);
        setProgress(0);
      };
    });

    return () => mm.revert();
  }, []);

  function goToPanel(index: number) {
    const st = scrollTriggerRef.current;
    if (!st) {
      // Fallback (shouldn't happen once pinned) — scroll the tab into view normally.
      document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const target = st.start + (st.end - st.start) * (index / (PANEL_COUNT - 1));
    // Drive the jump through Lenis when it's running — a raw `window.scrollTo`
    // would get overridden on Lenis's next tick (see LenisProvider). Falls
    // back to native smooth-scroll when Lenis isn't active.
    const lenis = getLenisInstance();
    if (lenis) {
      lenis.scrollTo(target);
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  }

  return (
    <section id="work" className="bg-charcoal py-20 sm:py-28 lg:py-0">
      <div className="container-app pb-10 pt-0 lg:hidden">
        <SectionLabel>{work.eyebrow}</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">{work.title}</h2>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">{work.lede}</p>
      </div>

      <div ref={pinRef} className="relative lg:h-[calc(100vh-64px)] lg:overflow-hidden">
        {/* Tab-strip + progress chrome — only meaningfully "pinned" on desktop; on
            mobile it just scrolls with the intro block above. */}
        <div className="absolute inset-x-0 top-0 z-10 hidden border-b border-white/[0.06] bg-charcoal/80 backdrop-blur-sm lg:block">
          <div className="container-app flex items-center gap-8 py-5">
            <SectionLabel className="shrink-0">{work.eyebrow}</SectionLabel>
            <div className="flex flex-1 items-center gap-8 overflow-x-auto">
              {work.projects.map((project, i) => (
                <button
                  key={project.name}
                  type="button"
                  data-cursor-hover
                  onClick={() => goToPanel(i)}
                  className={`relative shrink-0 whitespace-nowrap pb-1 text-sm font-medium transition-colors ${
                    i === activeIndex ? "text-white" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {project.name}
                  {i === activeIndex && (
                    <span className="absolute -bottom-[1px] left-0 flex h-[2px] w-full items-center">
                      <span className="h-[2px] w-full bg-gradient-accent" />
                      <span className="absolute -right-1 h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={trackRef} className="flex flex-col gap-14 pt-6 lg:h-full lg:flex-row lg:flex-nowrap lg:gap-0 lg:pt-0">
          {work.projects.map((project, i) => (
            <article
              key={project.name}
              className="w-full shrink-0 lg:flex lg:h-full lg:w-screen lg:items-center lg:pb-16 lg:pt-20"
            >
              {/* `container-app` (which sets `max-width`) lives on this inner
                  wrapper, not the `<article>` itself — the article must stay
                  a true full-viewport-width flex item for the GSAP xPercent
                  horizontal-scroll math (each panel is exactly 100vw) to add
                  up; capping the article's own width breaks that. */}
              <div className="container-app grid w-full gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">{project.category}</p>
                  <h3 className="mt-3 font-display text-3xl font-bold text-gradient-accent sm:text-4xl">
                    {project.name}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
                    {project.description}
                  </p>
                  <p className="mt-3 max-w-md text-sm italic text-emerald">{project.outcome}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span key={tech} className="chip px-2.5 py-1 text-xs text-text-secondary">
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.link !== "#" ? (
                    <Button href={project.link} size="md" className="mt-6">
                      Explore
                    </Button>
                  ) : (
                    <p className="mt-6 text-xs text-text-muted">Live link coming soon</p>
                  )}
                </div>
                <WorkMockup variant={i} />
              </div>
            </article>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 hidden border-t border-white/[0.06] bg-charcoal/80 backdrop-blur-sm lg:block">
          <div className="container-app flex items-center justify-between gap-6 py-4">
            <p className="font-display text-sm font-semibold text-white">
              {String(activeIndex + 1).padStart(2, "0")} / {String(PANEL_COUNT).padStart(2, "0")}
            </p>
            <div className="relative h-1 flex-1 max-w-xs overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-accent transition-[width] duration-100"
                style={{ width: `${Math.max(4, progress * 100)}%` }}
              />
            </div>
            <p
              className={`whitespace-nowrap text-xs uppercase tracking-[0.15em] text-text-muted transition-opacity duration-500 ${
                hasScrolled && pinned ? "opacity-0" : "opacity-100"
              }`}
            >
              ↔ Scroll to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
