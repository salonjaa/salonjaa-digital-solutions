"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Vertical offset (px) animated from. */
  y?: number;
  /** Delay between each direct child's entrance. Wrap direct children in `<SectionRevealItem>` to pick this up. */
  stagger?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Wraps content so it (or, with `stagger`, each `<SectionRevealItem>` child)
 * fades/slides up into view on scroll, per the site-wide Framer Motion
 * convention: `initial={{opacity:0, y:40}}`, `whileInView={{opacity:1, y:0}}`,
 * `viewport={{once:true, amount:0.2}}`. Falls back to an instant, static
 * render under `prefers-reduced-motion`.
 */
export function SectionReveal({ children, className, y = 40, stagger, as = "div" }: SectionRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const MotionComp = motion[as as "div"];

  if (reducedMotion) {
    const Comp = as as React.ElementType;
    return <Comp className={cn(className)}>{children}</Comp>;
  }

  if (stagger) {
    return (
      <MotionComp
        className={cn(className)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger } },
        }}
      >
        {children}
      </MotionComp>
    );
  }

  return (
    <MotionComp
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </MotionComp>
  );
}

/** A direct child of a staggered `<SectionReveal stagger={...}>` — picks up the parent's fade/slide-up variant. */
export function SectionRevealItem({
  children,
  className,
  y = 40,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  if (reducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
    >
      {children}
    </motion.div>
  );
}
