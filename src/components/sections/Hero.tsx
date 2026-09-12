"use client";

import { motion } from "framer-motion";
import { hero } from "@/content/hero";
import { GradientButton } from "@/components/ui/GradientButton";
import { Button } from "@/components/ui/Button";
import { MarqueeStrip } from "@/components/ui/MarqueeStrip";
import { HeroBackground } from "./HeroBackground";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen flex-col overflow-hidden bg-void pt-28">
      <HeroBackground />

      <div className="container-app relative z-10 flex flex-1 flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-[0.2em] text-cyan"
        >
          <span aria-hidden="true">★ ★ ★</span>
          {hero.trustLabel}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-[5rem]"
        >
          {hero.title.line1}
          <br />
          <span className="text-gradient-accent">{hero.title.line2}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg"
        >
          {hero.lede}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <GradientButton href={hero.ctaPrimary.href} size="lg">
            {hero.ctaPrimary.label}
          </GradientButton>
          <Button href={hero.ctaSecondary.href} variant="ghost" size="lg" magnetic={false} className="normal-case tracking-normal">
            {hero.ctaSecondary.label}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {hero.badges.map((badge) => (
            <span key={badge} className="chip px-4 py-2 text-xs font-medium text-text-secondary">
              {badge}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 border-t border-white/[0.06] bg-white/[0.02] py-4">
        <MarqueeStrip items={hero.marquee} />
      </div>
    </section>
  );
}
