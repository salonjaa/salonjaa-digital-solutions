"use client";

import { useState } from "react";
import { testimonials } from "@/content/testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionReveal } from "@/components/ui/SectionReveal";

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d={direction === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// NOTE: testimonials content is placeholder — see docs/CONTENT.md.
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const count = testimonials.items.length;
  const current = testimonials.items[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  return (
    <section id="testimonials" className="bg-void py-20 sm:py-28">
      <div className="container-app">
        <SectionHeading eyebrow={testimonials.eyebrow} title={testimonials.title} />

        <SectionReveal className="relative mx-auto mt-14 max-w-3xl text-center">
          <p aria-hidden="true" className="font-display text-6xl text-violet/50">
            &ldquo;
          </p>
          <p className="-mt-6 text-xl leading-relaxed text-white sm:text-2xl">
            <em className="not-italic">{current.quote}</em>
          </p>
          <p className="mt-6 font-display text-sm font-semibold text-white">{current.name}</p>
          <p className="text-xs text-text-muted">{current.role}</p>

          <div className="mt-10 flex items-center justify-center gap-3 sm:absolute sm:bottom-0 sm:right-0 sm:mt-0">
            <button
              type="button"
              aria-label="Previous testimonial"
              data-cursor-hover
              onClick={() => go(-1)}
              className="gradient-border flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-secondary transition-colors hover:text-white"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              data-cursor-hover
              onClick={() => go(1)}
              className="gradient-border flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-secondary transition-colors hover:text-white"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </SectionReveal>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-white/[0.06] pt-10">
          {testimonials.wordmarks.map((mark) => (
            <span
              key={mark}
              className="font-display text-lg font-bold tracking-wide text-text-muted/70 grayscale transition-all duration-300 hover:text-white hover:grayscale-0"
            >
              {mark}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
