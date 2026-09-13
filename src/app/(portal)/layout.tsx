import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";

// Bare wrapper for /login and /account/* — no marketing chrome (Navbar,
// Footer, custom cursor, Lenis smooth-scroll). Just enough shell that the
// brand still reads as the same studio, not a bare unstyled page.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void">
      <header className="border-b border-white/[0.06] px-6 py-4">
        <Link href="/" data-cursor-hover className="inline-flex items-center gap-2">
          <BrandMark size={28} />
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
