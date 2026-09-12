"use client";

import Link from "next/link";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "whatsapp" | "ghost";

type ButtonOwnProps = {
  variant?: Variant;
  size?: "md" | "lg";
  magnetic?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type ButtonProps = ButtonOwnProps &
  (
    | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children">)
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
  );

// `primary` is the signature pill: transparent fill, 1.5px cyan->violet
// gradient border (via the `.gradient-border-btn` hairline utility), and a
// soft outer glow that brightens on hover — see globals.css.
const variantClass: Record<Variant, string> = {
  primary:
    "gradient-border gradient-border-btn bg-white/[0.03] text-white shadow-[0_0_0_0_rgba(34,211,238,0)] hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.55)]",
  outline:
    "border border-white/15 bg-transparent text-text-secondary hover:border-cyan/50 hover:text-white",
  whatsapp: "bg-[#22c35e] text-white hover:bg-[#1fb356]",
  ghost: "text-text-secondary hover:text-white",
};

const sizeClass = {
  md: "px-5 py-2.5 text-xs",
  lg: "px-7 py-3.5 text-sm",
};

/**
 * CTA button — renders a `<Link>`/`<a>` when given `href`, otherwise a real
 * `<button>` (e.g. `type="submit"` inside a form). Includes an optional
 * magnetic hover pull and is hover-reactive for the custom cursor.
 */
export function Button({ variant = "primary", size = "md", magnetic = true, className, ...rest }: ButtonProps) {
  const anchorRef = useMagneticHover<HTMLAnchorElement>(0.3);
  const buttonRef = useMagneticHover<HTMLButtonElement>(0.3);
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold uppercase tracking-wide transition-all duration-200",
    variantClass[variant],
    sizeClass[size],
    className
  );

  if ("href" in rest && rest.href) {
    const { href, children, ...anchorRest } = rest as { href: string; children?: React.ReactNode } & Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      "className" | "children"
    >;
    const isInternal = href.startsWith("#") || href.startsWith("/");

    if (isInternal) {
      return (
        <Link
          ref={magnetic ? anchorRef : undefined}
          href={href}
          data-cursor-hover
          className={classes}
          {...anchorRest}
        >
          {children}
        </Link>
      );
    }

    return (
      <a
        ref={magnetic ? anchorRef : undefined}
        href={href}
        data-cursor-hover
        className={classes}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        {...anchorRest}
      >
        {children}
      </a>
    );
  }

  const { children, ...buttonRest } = rest as { children?: React.ReactNode } & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  >;

  return (
    <button ref={magnetic ? buttonRef : undefined} data-cursor-hover className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
