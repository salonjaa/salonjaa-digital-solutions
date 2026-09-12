"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { MobileMenu } from "./MobileMenu";
import { navLinks } from "@/content/nav";
import { site } from "@/content/site";
import { GradientButton } from "@/components/ui/GradientButton";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <nav data-scrolled={scrolled} className="glass-nav">
        <div className="container-app flex items-center justify-between py-3">
          <Link href="#top" data-cursor-hover className="flex items-center gap-2.5">
            <BrandMark size={34} priority />
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-white">{site.shortName}</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.15em] text-text-muted">
                Digital Solutions
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-cursor-hover
                className="text-sm font-medium text-text-secondary transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <GradientButton href="#contact" size="md">
              Book A Free Call
            </GradientButton>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            data-cursor-hover
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] md:hidden"
          >
            <span className={`h-0.5 w-5 bg-white transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span
              className={`h-0.5 w-5 bg-white transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
